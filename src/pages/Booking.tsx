import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Users, MapPin, AlertCircle, Info, Clock } from "lucide-react"
import { useAuthStore } from "../store/authStore"

interface Resource {
  id: string;
  name: string;
  type: string;
  capacity: number;
  location: string;
  status: string;
  imageUrl?: string;
  bookings?: { startTime: string; endTime: string; status: string; user: { name: string } }[];
}

export default function Booking() {
  const { role, token } = useAuthStore()
  const isStudent = role?.toLowerCase() === 'student'
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedResource, setSelectedResource] = useState<string | null>(null)
  const [bookingDate, setBookingDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)

  // Filter States
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("All Types")
  const [capacityFilter, setCapacityFilter] = useState("Any Capacity")
  const [blockFilter, setBlockFilter] = useState("All Blocks")
  
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchResources()
      const interval = setInterval(fetchResources, 60000)
      return () => clearInterval(interval)
    }
  }, [token])

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "All Types" || r.type.toLowerCase().includes(typeFilter.toLowerCase());
    const matchesBlock = blockFilter === "All Blocks" || r.location.toLowerCase().includes(blockFilter.toLowerCase());
    
    let matchesCapacity = true;
    if (capacityFilter === "1-10") matchesCapacity = r.capacity <= 10;
    else if (capacityFilter === "11-50") matchesCapacity = r.capacity > 10 && r.capacity <= 50;
    else if (capacityFilter === "50+") matchesCapacity = r.capacity > 50;

    return matchesSearch && matchesType && matchesBlock && matchesCapacity;
  });

  const handleBooking = async () => {
    setSubmitting(true);
    setError("");
    if (!selectedResource || !bookingDate || !startTime || !endTime) {
      setError("Please fill in all fields");
      setSubmitting(false);
      return;
    }

    const now = new Date();
    const start = new Date(`${bookingDate}T${startTime}:00Z`);
    const end = new Date(`${bookingDate}T${endTime}:00Z`);
    
    // Convert current time to UTC for comparison
    const nowUTC = new Date(now.toISOString());
    const selectedDate = new Date(bookingDate);
    const today = new Date(now.toISOString().split('T')[0]);

    if (selectedDate < today) {
      setError("Cannot book for a past date");
      return;
    }

    if (selectedDate.toDateString() === today.toDateString()) {
      const fifteenMinsFromNow = new Date(nowUTC.getTime() + 15 * 60000);
      if (start < fifteenMinsFromNow) {
        setError("Start time must be at least 15 minutes from now");
        return;
      }
    }

    if (end <= start) {
      setError("End time must be after start time");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ resourceId: selectedResource, startTime: start.toISOString(), endTime: end.toISOString() })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setQrCodeData(data.data.qrCodeBase64);
        setShowQrModal(true);
        setSelectedResource(null);
        setBookingDate("");
        setStartTime("");
        setEndTime("");
        fetchResources();
      } else {
        setError(data.message || "Booking failed");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resource Booking</h1>
          <p className="text-muted-foreground text-sm">Find and monitor campus facilities in real-time.</p>
        </div>
      </div>

      {isStudent && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-accent text-sm">Viewing Only Mode</h3>
            <p className="text-sm text-accent/80 mt-1">
              Students can only view classroom availability. Booking permissions are reserved for faculty.
            </p>
          </div>
        </div>
      )}

      {/* Filters Area */}
      <div className="glass-card p-4 rounded-xl border border-border flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by name or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select 
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground"
          >
            <option>All Blocks</option>
            <option>A Block</option>
            <option>B Block</option>
            <option>C Block</option>
            <option>D Block</option>
            <option>G Block</option>
            <option>H Block</option>
            <option>M Block</option>
            <option>Sports Complex</option>
          </select>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground"
          >
            <option>All Types</option>
            <option>Seminar Hall</option>
            <option>Lab</option>
            <option>Classroom</option>
            <option>Auditorium</option>
          </select>
          <select 
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground"
          >
            <option>Any Capacity</option>
            <option>1-10</option>
            <option>11-50</option>
            <option>50+</option>
          </select>
          <button 
            onClick={() => {setSearchTerm(""); setTypeFilter("All Types"); setCapacityFilter("Any Capacity"); setBlockFilter("All Blocks");}}
            className="bg-secondary border border-border p-2 rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Filter className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="glass-card h-[400px] rounded-xl border border-border animate-pulse bg-secondary/20" />
          ))
        ) : filteredResources.length > 0 ? (
          filteredResources.map((resource, i) => {
          const now = new Date();
          
          // Find if there's a booking happening RIGHT NOW
          // Filter out expired ones just in case, though backend should handle it
          const activeBookings = (resource.bookings || [])
            .filter(b => new Date(b.startTime) <= now && new Date(b.endTime) >= now)
            .sort((a, b) => {
              // Priority: CHECKED_IN > CONFIRMED > CANCELLED
              const p: Record<string, number> = { 'CHECKED_IN': 0, 'CONFIRMED': 1, 'CANCELLED': 2 };
              return (p[a.status as keyof typeof p] ?? 3) - (p[b.status as keyof typeof p] ?? 3);
            });

          const currentBooking = activeBookings[0];
          
          let displayStatus = 'Free';
          let badgeStyle = 'bg-secondary/20 text-muted-foreground border-border/30';
          let statusText = 'no class scheduled right now';

          if (currentBooking) {
            const timeStr = `${new Date(currentBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(currentBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            
            if (currentBooking.status === 'ACTIVE') {
              displayStatus = 'Active';
              badgeStyle = 'bg-success/20 text-success border-success/30';
              statusText = `${currentBooking.user.name} | ${timeStr} — student confirmed, class ongoing`;
            } else if (currentBooking.status === 'CONFIRMED') {
              displayStatus = 'Confirmed';
              badgeStyle = 'bg-warning/20 text-warning border-warning/30';
              statusText = `${currentBooking.user.name} | ${timeStr} — faculty booked, waiting for confirmation`;
            } else if (currentBooking.status === 'GHOST') {
              displayStatus = 'Ghost';
              badgeStyle = 'bg-danger/20 text-danger border-danger/30';
              statusText = `Room is Free — no confirmation within 15 mins (Ghost Booking)`;
            } else if (currentBooking.status === 'CANCELLED') {
              displayStatus = 'Free';
              badgeStyle = 'bg-secondary/20 text-muted-foreground border-border/30';
              statusText = 'Booking was cancelled';
            }
          }
          
          const canBook = !isStudent && (displayStatus === 'Free' || displayStatus === 'Ghost');
          
          return (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl border border-border overflow-hidden flex flex-col group relative"
            >
              {/* Image & Status Badge */}
              <div className="h-40 overflow-hidden relative">
                <img 
                  src={resource.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000"} 
                  alt={resource.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold shadow-lg backdrop-blur-md flex items-center gap-1.5 ${badgeStyle}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      displayStatus === 'Active' ? 'bg-success animate-pulse' : 
                      displayStatus === 'Confirmed' ? 'bg-yellow-500 animate-bounce' :
                      displayStatus === 'Ghost' ? 'bg-danger' : 'bg-muted-foreground'
                    }`} />
                    {displayStatus}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                {/* Status Text for Students/Faculty */}
                <div className="mb-4 bg-secondary/50 rounded-lg p-3 border border-border/30">
                  <p className="text-xs font-medium text-foreground leading-relaxed">
                    {statusText}
                  </p>
                </div>

                {/* Header Info */}
                <div className="mb-4">
                  <h3 className="font-bold text-xl leading-tight text-foreground">{resource.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1 gap-2">
                    <span className="bg-secondary/80 px-2 py-0.5 rounded text-xs font-medium border border-border/50">{resource.type}</span>
                    <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-primary" /> {resource.location}</span>
                    <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1 text-muted-foreground" /> {resource.capacity}</span>
                  </div>
                </div>
                
                <div className="space-y-2 flex-1 bg-secondary/10 rounded-lg p-3 border border-border/10 mt-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Today's Schedule</p>
                  {(resource.bookings || []).filter(b => new Date(b.startTime).toDateString() === now.toDateString()).length > 0 ? (
                    (resource.bookings || [])
                      .filter(b => new Date(b.startTime).toDateString() === now.toDateString())
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                      .map((b, idx) => (
                        <div key={idx} className={`flex items-center justify-between text-xs p-2 rounded ${new Date(b.startTime) <= now && new Date(b.endTime) >= now ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50 opacity-70'}`}>
                          <div className="flex items-center gap-2">
                            <Clock className={`w-3 h-3 ${new Date(b.startTime) <= now && new Date(b.endTime) >= now ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="font-medium text-foreground">
                              {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className="text-muted-foreground font-medium">{b.user.name}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-2">No bookings for today</p>
                  )}
                </div>

                {/* Action Buttons */}
                {canBook && (
                  <div className="mt-5 pt-4 border-t border-border flex justify-end items-center">
                    <button 
                      onClick={() => setSelectedResource(resource.id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 neon-glow"
                    >
                      Book Now
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })
        ) : (
          <div className="col-span-full py-20 text-center glass-card rounded-xl border border-border">
            <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground">No resources found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>

      {/* Booking Modal (Faculty Only) */}
      <AnimatePresence>
        {selectedResource && !isStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <h3 className="font-bold text-lg">Confirm Booking</h3>
                <p className="text-sm text-muted-foreground">Select your time slot for {resources.find(r => r.id === selectedResource)?.name}</p>
              </div>
              <div className="p-6 space-y-4">
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
                
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mt-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-accent shrink-0" />
                  <p className="text-xs text-muted-foreground">AI suggests booking 15 mins earlier to avoid the lunch rush at the adjacent cafeteria.</p>
                </div>
              </div>
              <div className="p-6 border-t border-border flex justify-end gap-3 bg-secondary/50">
                <button 
                  onClick={() => setSelectedResource(null)}
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
      
      {/* QR Code Modal (Success) */}
      <AnimatePresence>
        {showQrModal && qrCodeData && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-background/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-sm rounded-3xl border border-border shadow-2xl overflow-hidden text-center p-8"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold">Booking Confirmed!</h3>
                <p className="text-muted-foreground text-sm mt-2">Your spot is reserved. Please check in within 15 minutes of your start time.</p>
              </div>
              
              <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mb-6">
                <img src={qrCodeData} alt="Check-in QR Code" className="w-48 h-48" />
              </div>
              
              <p className="text-xs text-muted-foreground mb-8">
                Show this QR code at the room entrance to check in.
              </p>
              
              <button 
                onClick={() => setShowQrModal(false)}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
