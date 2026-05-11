import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, CalendarCheck, Clock, Activity, Info, ShieldAlert, QrCode, X, Calendar as CalendarIcon } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { apiFetch } from "../utils/api"

export default function Dashboard() {
  const { role, user } = useAuthStore()
  const isStudent = role?.toLowerCase() === 'student'
  
  // Data States
  const [userBookings, setUserBookings] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [waitlists, setWaitlists] = useState<any[]>([])
  const [campusStats, setCampusStats] = useState<any>(null)
  const [activityStats, setActivityStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // UI States
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedQR, setSelectedQR] = useState<string | null>(null)
  const [selectedBookingName, setSelectedBookingName] = useState("")

  // Form States
  const [selectedResourceId, setSelectedResourceId] = useState("")
  const [bookingDate, setBookingDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    const [bookingsRes, resourcesRes, waitlistsRes, statsRes, activityRes] = await Promise.all([
      apiFetch('/api/bookings'),
      apiFetch('/api/bookings/resources'),
      apiFetch('/api/bookings/waitlists'),
      apiFetch('/api/analytics/stats'),
      apiFetch('/api/analytics/activity')
    ]);

    if (bookingsRes.status === 'success') setUserBookings(bookingsRes.data.bookings);
    if (resourcesRes.status === 'success') setResources(resourcesRes.data.resources);
    if (waitlistsRes.status === 'success') setWaitlists(waitlistsRes.data.waitlists);
    if (statsRes.status === 'success') setCampusStats(statsRes.data.summary);
    if (activityRes.status === 'success') setActivityStats(activityRes.data.chartData);
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const stats = useMemo(() => {
    const totalCampusBookings = campusStats?.bookings || 0;
    const activeResCount = resources.length;
    
    const now = new Date();
    const occupiedCount = resources.filter(r => 
      r.bookings?.some((b: any) => 
        new Date(b.startTime) <= now && 
        new Date(b.endTime) >= now && 
        ['CONFIRMED', 'ACTIVE'].includes(b.status)
      )
    ).length;
    
    const occupancyRate = activeResCount > 0 ? Math.round((occupiedCount / activeResCount) * 100) : 0;
    const activeWaitlist = waitlists.filter(w => w.status === 'WAITING').length;
    const avgWaitMinutes = activeWaitlist * 15;

    return [
      { label: "Campus Bookings", value: totalCampusBookings.toString(), change: "Today", icon: CalendarCheck, trend: "up" },
      { label: "Active Resources", value: activeResCount.toString(), change: "Live", icon: Activity, trend: "up" },
      { label: "Occupancy Rate", value: `${occupancyRate}%`, change: occupancyRate > 70 ? "High" : "Optimal", icon: Users, trend: occupancyRate > 70 ? "up" : "down" },
      { label: "Est. Wait Time", value: `${avgWaitMinutes}m`, change: activeWaitlist > 0 ? "Queued" : "None", icon: Clock, trend: activeWaitlist > 0 ? "up" : "down" },
    ]
  }, [campusStats, resources, waitlists]);

  const utilizationData = useMemo(() => {
    if (activityStats.length > 0) {
      const maxBookings = Math.max(...activityStats.map(d => d.bookings), 1);
      return activityStats.map((d, i) => ({
        hour: i,
        percentage: (d.bookings / maxBookings) * 100,
        label: d.date.split('-').slice(1).join('/')
      }));
    }
    return [];
  }, [activityStats]);

  const handleBooking = async () => {
    setSubmitting(true);
    setError("");
    
    if (!selectedResourceId || !bookingDate || !startTime || !endTime) {
      setError("Please fill in all fields");
      setSubmitting(false);
      return;
    }

    const start = new Date(`${bookingDate}T${startTime}:00`);
    const end = new Date(`${bookingDate}T${endTime}:00`);

    if (start < new Date()) {
      setError("Start time must be in the future");
      setSubmitting(false);
      return;
    }

    if (end <= start) {
      setError("End time must be after start time");
      setSubmitting(false);
      return;
    }

    const result = await apiFetch('/api/bookings', {
      method: "POST",
      body: { resourceId: selectedResourceId, startTime: start.toISOString(), endTime: end.toISOString() }
    });

    if (result.status === 'success') {
      setShowBookingModal(false);
      fetchData();
      if (result.data.qrCodeBase64) {
        setSelectedQR(result.data.qrCodeBase64);
        setSelectedBookingName(result.data.booking.resource.name);
        setShowQRModal(true);
      }
    } else {
      setError(result.message || "Booking failed");
    }
    setSubmitting(false);
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
      qrCodeBase64: b.qrCodeBase64
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
            <h1 className="text-2xl font-bold tracking-tight">Campus Overview</h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              isStudent ? 'bg-accent/20 text-accent border-accent/30' : 'bg-primary/20 text-primary border-primary/30'
            }`}>
              {isStudent ? 'Student View' : 'Faculty View'}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Welcome back, {user?.name}! Live campus data loaded.</p>
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
              Verify faculty presence using the QR scanner to prevent "Ghost Bookings" and keep resource data accurate.
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
        {/* Utilization Chart */}
        <div className="lg:col-span-2 glass-card rounded-xl border border-border p-6 h-[400px] flex flex-col relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
           <h3 className="font-bold mb-6 flex items-center gap-2 z-10 text-sm">
             <Activity className="w-4 h-4 text-primary" /> Campus Activity (7-Day Trend)
           </h3>
           
           <div className="flex-1 flex items-end justify-between px-4 z-10 relative">
             {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                  <Activity className="w-12 h-12 mb-2 animate-pulse" />
                  <p className="font-bold">Syncing data...</p>
                </div>
             ) : utilizationData.length === 0 ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                 <CalendarIcon className="w-12 h-12 mb-2" />
                 <p className="font-bold">No activity recorded</p>
                 <p className="text-xs">Data will appear as bookings are made</p>
               </div>
             ) : utilizationData.map((data, i) => (
                <motion.div 
                   key={i}
                   initial={{ height: 0 }}
                   animate={{ height: `${Math.max(data.percentage, 10)}%` }}
                   transition={{ duration: 1, delay: i * 0.05 }}
                   className="w-[10%] bg-gradient-to-t from-primary to-accent rounded-t-md opacity-80 hover:opacity-100 transition-opacity cursor-pointer relative group"
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card text-[10px] py-1 px-2 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {data.label}: {Math.round(data.percentage)}%
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-muted-foreground">
                    {data.label}
                  </div>
                </motion.div>
             ))}
           </div>
        </div>

        {/* Your Schedule */}
        <div className="glass-card rounded-xl border border-border p-5 flex flex-col h-[400px]">
          <h3 className="font-bold mb-4 text-sm flex items-center justify-between">
            Your Schedule
            <span className="text-[10px] text-primary uppercase font-bold tracking-widest animate-pulse">Live</span>
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {loading ? (
               <div className="space-y-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />
                 ))}
               </div>
            ) : schedule.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3" />
                <p className="text-sm font-bold">No bookings found</p>
                <p className="text-[11px] mt-1">Personal bookings will appear here</p>
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
                      {event.status === 'CONFIRMED' && (
                        <span className="flex items-center gap-1 text-[9px] text-warning font-bold italic animate-pulse">
                          <QrCode className="w-2.5 h-2.5" /> View QR
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

      {/* Booking Modal (Faculty Only) */}
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
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="">Choose a room...</option>
                    {resources.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Time</label>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Time</label>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" />
                  </div>
                </div>
                
                {error && (
                  <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 mt-4 flex gap-3">
                    <ShieldAlert className="w-5 h-5 text-danger shrink-0" />
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
                <p className="text-muted-foreground text-xs mt-2 uppercase tracking-widest font-bold">Booking QR Code</p>
              </div>
              
              <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mb-6">
                <img src={selectedQR} alt="QR Code" className="w-48 h-48" />
              </div>
              
              <div className="bg-secondary/50 p-4 rounded-xl text-left border border-border/50">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground uppercase tracking-wider">Note:</span> Show this code to students to verify your presence. This prevents your booking from becoming a <span className="text-danger font-bold">Ghost Booking</span>.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
