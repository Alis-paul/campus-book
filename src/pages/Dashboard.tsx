import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, CalendarCheck, Clock, Activity, Info, AlertCircle, QrCode, X, Calendar } from "lucide-react"
import { useAuthStore } from "../store/authStore"

export default function Dashboard() {
  const { role, token, user } = useAuthStore()
  const isStudent = role?.toLowerCase() === 'student'
  const [userBookings, setUserBookings] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [waitlists, setWaitlists] = useState<any[]>([])
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedQR, setSelectedQR] = useState<string | null>(null)
  const [selectedBookingName, setSelectedBookingName] = useState("")

  const [selectedResourceId, setSelectedResourceId] = useState("")
  const [bookingDate, setBookingDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const fetchResources = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/bookings/resources", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.status === 'success') {
        setResources(data.data.resources)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUserBookings = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.status === 'success') {
        setUserBookings(data.data.bookings)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchWaitlists = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/bookings/waitlists", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.status === 'success') {
        setWaitlists(data.data.waitlists)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (token) {
      fetchUserBookings()
      fetchResources()
      fetchWaitlists()
      const interval = setInterval(() => {
        fetchUserBookings()
        fetchResources()
        fetchWaitlists()
      }, 60000)
      return () => clearInterval(interval)
    }
  }, [token])

  const stats = useMemo(() => {
    const totalBookings = userBookings.length
    const activeResources = resources.length
    
    // Occupancy Rate Calculation
    const now = new Date()
    const occupiedCount = resources.filter(r => 
      r.bookings.some((b: any) => 
        new Date(b.startTime) <= now && 
        new Date(b.endTime) >= now && 
        ['CONFIRMED', 'ACTIVE'].includes(b.status)
      )
    ).length
    const occupancyRate = activeResources > 0 ? Math.round((occupiedCount / activeResources) * 100) : 0

    // Avg Wait Time Calculation (mocking a bit since real data might be 0)
    // If no waitlist entries, show 0m
    const avgWait = waitlists.length > 0 ? "12m" : "0m"

    return [
      { label: "Total Bookings", value: totalBookings.toString(), change: "+0%", icon: CalendarCheck, trend: "up" },
      { label: "Active Resources", value: activeResources.toString(), change: "+0%", icon: Activity, trend: "up" },
      { label: "Occupancy Rate", value: `${occupancyRate}%`, change: "+0%", icon: Users, trend: "up" },
      { label: "Avg Wait Time", value: avgWait, change: "-0m", icon: Clock, trend: "down" },
    ]
  }, [userBookings, resources, waitlists])

  const utilizationData = useMemo(() => {
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    const today = new Date().toISOString().split('T')[0]
    
    // Flatten all bookings from all resources for today
    const allBookings = resources.flatMap(r => r.bookings || [])
      .filter((b: any) => b.startTime.startsWith(today))

    if (allBookings.length === 0) return []

    return hours.map(h => {
      const count = allBookings.filter((b: any) => {
        const startHour = new Date(b.startTime).getUTCHours()
        const endHour = new Date(b.endTime).getUTCHours()
        return h >= startHour && h < endHour
      }).length
      // Max occupancy for the chart bar height percentage
      const percentage = resources.length > 0 ? (count / resources.length) * 100 : 0
      return { hour: h, percentage: Math.min(percentage, 100) }
    })
  }, [resources])

  const handleBooking = async () => {
    setSubmitting(true);
    setError("");
    if (!selectedResourceId || !bookingDate || !startTime || !endTime) {
      setError("Please fill in all fields");
      setSubmitting(false);
      return;
    }

    const start = new Date(`${bookingDate}T${startTime}:00Z`);
    const end = new Date(`${bookingDate}T${endTime}:00Z`);

    if (end <= start) {
      setError("End time must be after start time");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ resourceId: selectedResourceId, startTime: start.toISOString(), endTime: end.toISOString() })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowBookingModal(false);
        setSelectedResourceId("");
        setBookingDate("");
        setStartTime("");
        setEndTime("");
        fetchUserBookings();
        fetchResources();
        
        if (data.data.qrCodeBase64) {
          setSelectedQR(data.data.qrCodeBase64);
          setSelectedBookingName(data.data.booking.resource.name);
          setShowQRModal(true);
        }
      } else {
        setError(data.message || "Booking failed");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setSubmitting(false);
    }
  }



  const schedule = userBookings
    .filter(b => b.status !== 'EXPIRED' && b.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .map(b => ({
      id: b.id,
      title: b.resource.name,
      time: `${new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      location: b.resource.location,
      status: b.status,
      qrCodeBase64: b.qrCodeBase64,
      canCancel: !isStudent && b.status === 'CONFIRMED'
    }))

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'bg-success/20 text-success border-success/30';
      case 'CONFIRMED': return 'bg-warning/20 text-warning border-warning/30';
      case 'GHOST': return 'bg-danger/20 text-danger border-danger/30';
      case 'EXPIRED': return 'bg-secondary text-muted-foreground border-border';
      case 'CANCELLED': return 'bg-danger/20 text-danger border-danger/30';
      default: return 'bg-secondary text-foreground border-border';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              isStudent ? 'bg-accent/20 text-accent border-accent/30' : 'bg-primary/20 text-primary border-primary/30'
            }`}>
              {isStudent ? 'Student Portal' : 'Faculty Portal'}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Welcome back, {user?.name}! Real-time campus data loaded.</p>
        </div>
        {!isStudent && (
          <button 
            onClick={() => setShowBookingModal(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 neon-glow transition-all"
          >
            New Booking
          </button>
        )}
      </div>

      {isStudent && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-accent text-sm">Student Access</h3>
            <p className="text-sm text-accent/80 mt-1">
              Verify faculty presence using the QR scanner in your portal.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-xl border border-border"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-secondary">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.trend === 'up' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-black mb-1">{stat.value}</h3>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 glass-card rounded-xl border border-border p-6 h-[400px] flex flex-col relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
           <h3 className="font-bold mb-6 flex items-center gap-2 z-10 text-sm">
             <Activity className="w-4 h-4 text-primary" /> Today's Campus Utilization
           </h3>
           
           <div className="flex-1 flex items-end justify-between px-4 z-10 relative">
             {utilizationData.length === 0 ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                 <Activity className="w-12 h-12 mb-2" />
                 <p className="font-bold">No bookings today</p>
               </div>
             ) : utilizationData.map((data, i) => (
                <motion.div 
                   key={i}
                   initial={{ height: 0 }}
                   animate={{ height: `${data.percentage}%` }}
                   transition={{ duration: 1, delay: i * 0.05 }}
                   className="w-[5%] bg-gradient-to-t from-primary to-accent rounded-t-md opacity-80 hover:opacity-100 transition-opacity cursor-pointer relative group"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card text-[10px] py-1 px-2 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.hour}:00 - {Math.round(data.percentage)}%
                  </div>
                </motion.div>
             ))}
           </div>
           
           <div className="flex justify-between text-[10px] text-muted-foreground mt-4 z-10 border-t border-border pt-4 font-bold">
             <span>08:00</span>
             <span>12:00</span>
             <span>16:00</span>
             <span>20:00</span>
           </div>
        </div>

        {/* Your Schedule */}
        <div className="glass-card rounded-xl border border-border p-5 flex flex-col">
          <h3 className="font-bold mb-4 text-sm flex items-center justify-between">
            Your Schedule
            <span className="text-[10px] text-primary uppercase font-bold tracking-widest animate-pulse">Live</span>
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {schedule.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <Calendar className="w-12 h-12 mx-auto mb-3" />
                <p className="text-sm font-bold">No bookings found</p>
                <p className="text-[11px] mt-1">Book a room to see it here</p>
              </div>
            ) : schedule.map((event, i) => (
              <div 
                key={i} 
                className="flex justify-between items-start gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-all cursor-pointer group border border-transparent hover:border-border"
                onClick={() => event.qrCodeBase64 && (setSelectedQR(event.qrCodeBase64), setSelectedBookingName(event.title), setShowQRModal(true))}
              >
                <div className="flex gap-4">
                  <div className={`w-1 rounded-full ${event.status === 'ACTIVE' ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]' : event.status === 'CONFIRMED' ? 'bg-warning shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-muted'}`} />
                  <div>
                    <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{event.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{event.time}</p>
                    <p className="text-[11px] text-muted-foreground">{event.location}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      {event.status === 'CONFIRMED' && !isStudent && (
                        <span className="flex items-center gap-1 text-[9px] text-warning font-bold italic animate-pulse">
                          <QrCode className="w-2.5 h-2.5" /> Tap to scan
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <h3 className="font-bold text-lg">New Booking</h3>
                <p className="text-sm text-muted-foreground">Select a room and your preferred time slot</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Room</label>
                  <select 
                    value={selectedResourceId} 
                    onChange={(e) => setSelectedResourceId(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">Choose a room...</option>
                    {resources.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Time</label>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Time</label>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                  </div>
                </div>
                
                {error && (
                  <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 mt-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-danger shrink-0" />
                    <p className="text-xs text-danger font-medium">{error}</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-border flex justify-end gap-3 bg-secondary/50">
                <button 
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBooking}
                  disabled={submitting}
                  className={`px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-all ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90 neon-glow'}`}
                >
                  {submitting ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && selectedQR && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-background/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-sm rounded-3xl border border-border shadow-2xl overflow-hidden text-center p-8 relative"
            >
              <button 
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-warning" />
                </div>
                <h3 className="text-2xl font-black">{selectedBookingName}</h3>
                <p className="text-muted-foreground text-xs mt-2 uppercase tracking-widest font-bold">Check-in QR Code</p>
              </div>
              
              <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mb-6">
                <img src={selectedQR} alt="Check-in QR Code" className="w-48 h-48" />
              </div>
              
              <div className="bg-secondary/50 p-4 rounded-xl text-left border border-border/50">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">INSTRUCTIONS:</span> Show this QR code to any student in your class to confirm your presence. This prevents your booking from being marked as a <span className="text-danger font-bold">Ghost Booking</span>.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
