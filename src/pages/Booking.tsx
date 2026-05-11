import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Users, MapPin, AlertCircle, Info, Clock, CheckCircle2 } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { apiFetch } from "../utils/api"

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
  const { role } = useAuthStore()
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
  
  const fetchResources = useCallback(async () => {
    const result = await apiFetch('/api/bookings/resources');
    if (result.status === 'success') {
      setResources(result.data.resources);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchResources();
    const interval = setInterval(fetchResources, 30000);
    return () => clearInterval(interval);
  }, [fetchResources]);

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
      body: { resourceId: selectedResource, startTime: start.toISOString(), endTime: end.toISOString() }
    });

    if (result.status === 'success') {
      setQrCodeData(result.data.qrCodeBase64);
      setShowQrModal(true);
      setSelectedResource(null);
      setBookingDate("");
      setStartTime("");
      setEndTime("");
      fetchResources();
    } else {
      setError(result.message || "Booking failed");
    }
    setSubmitting(false);
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
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-start gap-3 shadow-sm shadow-accent/5">
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
            className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select 
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground outline-none transition-all"
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
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground outline-none transition-all"
          >
            <option>All Types</option>
            <option>Seminar Hall</option>
            <option>Lab</option>
            <option>Classroom</option>
            <option>Auditorium</option>
          </select>
          <button 
            onClick={() => {setSearchTerm(""); setTypeFilter("All Types"); setCapacityFilter("Any Capacity"); setBlockFilter("All Blocks");}}
            className="bg-secondary border border-border p-2 rounded-lg hover:bg-secondary/80 transition-colors"
            title="Reset Filters"
          >
            <Filter className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3,4,5,6].map(i => (
            <div key={i} className="glass-card h-[400px] rounded-xl border border-border animate-pulse bg-secondary/20" />
          ))
        ) : filteredResources.length > 0 ? (
          filteredResources.map((resource, i) => {
          const now = new Date();
          const activeBookings = (resource.bookings || [])
            .filter(b => new Date(b.startTime) <= now && new Date(b.endTime) >= now)
            .sort((a, b) => {
              const p: Record<string, number> = { 'ACTIVE': 0, 'CONFIRMED': 1, 'GHOST': 2, 'CANCELLED': 3 };
              return (p[a.status as keyof typeof p] ?? 4) - (p[b.status as keyof typeof p] ?? 4);
            });

          const currentBooking = activeBookings[0];
          
          let displayStatus = 'Free';
          let badgeStyle = 'bg-secondary/20 text-muted-foreground border-border/30';
          let statusText = 'No class scheduled right now';

          if (currentBooking) {
            const timeStr = `${new Date(currentBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(currentBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            
            if (currentBooking.status === 'ACTIVE') {
              displayStatus = 'Active';
              badgeStyle = 'bg-success/20 text-success border-success/30';
              statusText = `${currentBooking.user.name} | ${timeStr} — Verified Presence`;
            } else if (currentBooking.status === 'CONFIRMED') {
              displayStatus = 'Confirmed';
              badgeStyle = 'bg-warning/20 text-warning border-warning/30';
              statusText = `${currentBooking.user.name} | ${timeStr} — Pending Check-in`;
            } else if (currentBooking.status === 'GHOST') {
              displayStatus = 'Ghost';
              badgeStyle = 'bg-danger/20 text-danger border-danger/30';
              statusText = `Room is Free — Faculty did not check in within 15 mins`;
            }
          }
          
          const canBook = !isStudent && (displayStatus === 'Free' || displayStatus === 'Ghost');
          
          return (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl border border-border overflow-hidden flex flex-col group relative hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5"
            >
              <div className="h-40 overflow-hidden relative">
                <img 
                  src={resource.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000"} 
                  alt={resource.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase shadow-lg backdrop-blur-md flex items-center gap-1.5 border ${badgeStyle}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      displayStatus === 'Active' ? 'bg-success animate-pulse' : 
                      displayStatus === 'Confirmed' ? 'bg-yellow-500 animate-bounce' :
                      displayStatus === 'Ghost' ? 'bg-danger' : 'bg-muted-foreground'
                    }`} />
                    {displayStatus}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col relative z-10 -mt-10">
                <div className="mb-4 bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-sm">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Status</p>
                  <p className="text-xs font-medium text-foreground/90 leading-relaxed truncate">
                    {statusText}
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors">{resource.name}</h3>
                  <div className="flex flex-wrap items-center text-[11px] text-muted-foreground mt-2 gap-3">
                    <span className="bg-secondary/80 px-2 py-0.5 rounded font-bold border border-border/50 text-foreground/70">{resource.type}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" /> {resource.location}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-muted-foreground" /> {resource.capacity} Seats</span>
                  </div>
                </div>
                
                <div className="space-y-2 flex-1 bg-secondary/10 rounded-lg p-3 border border-border/10 mt-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-black mb-2 opacity-50">Today's Schedule</p>
                  {(resource.bookings || []).filter(b => new Date(b.startTime).toDateString() === now.toDateString()).length > 0 ? (
                    (resource.bookings || [])
                      .filter(b => new Date(b.startTime).toDateString() === now.toDateString())
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                      .map((b, idx) => (
                        <div key={idx} className={`flex items-center justify-between text-[11px] p-2 rounded-lg ${new Date(b.startTime) <= now && new Date(b.endTime) >= now ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-secondary/30 opacity-60'}`}>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span className="font-bold">
                              {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className="font-black uppercase tracking-tighter opacity-70">{b.user.name.split(' ')[0]}</span>
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 opacity-30">
                       <CheckCircle2 className="w-5 h-5 mb-1" />
                       <p className="text-[10px] font-bold">Open Access Available</p>
                    </div>
                  )}
                </div>

                {canBook && (
                  <div className="mt-5 pt-4 border-t border-border/30 flex justify-end items-center">
                    <button 
                      onClick={() => setSelectedResource(resource.id)}
                      className="px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all bg-primary text-primary-foreground hover:bg-primary/90 neon-glow"
                    >
                      Book Resource
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })
        ) : (
          <div className="col-span-full py-32 text-center glass-card rounded-2xl border border-border/50">
            <Info className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
            <h3 className="text-xl font-bold text-foreground">No resources found</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">We couldn't find any resources matching your current search and filters.</p>
            <button 
               onClick={() => {setSearchTerm(""); setTypeFilter("All Types");}}
               className="mt-6 text-primary font-bold text-xs hover:underline uppercase tracking-widest"
            >
              Clear All Filters
            </button>
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
              <div className="p-6 border-b border-border bg-secondary/30">
                <h3 className="font-bold text-lg">Confirm Reservation</h3>
                <p className="text-sm text-muted-foreground">Booking for: <span className="text-foreground font-bold">{resources.find(r => r.id === selectedResource)?.name}</span></p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Date</label>
                  <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Start Time</label>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">End Time</label>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
                
                {error && (
                  <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    <p className="text-xs text-danger font-bold leading-relaxed">{error}</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-border flex justify-end gap-3 bg-secondary/20">
                <button 
                  onClick={() => setSelectedResource(null)}
                  className="px-5 py-2 rounded-lg text-xs font-bold hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBooking}
                  disabled={submitting}
                  className={`px-6 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-black uppercase tracking-widest transition-all ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90 neon-glow'}`}
                >
                  {submitting ? 'Processing...' : 'Confirm'}
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
              className="bg-card w-full max-w-sm rounded-3xl border border-border shadow-2xl overflow-hidden text-center p-8 relative"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-success/30 shadow-lg shadow-success/10">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-2xl font-black">Success!</h3>
                <p className="text-muted-foreground text-xs mt-3 uppercase tracking-widest font-bold">Booking Confirmed</p>
              </div>
              
              <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl border border-border mb-6">
                <img src={qrCodeData} alt="Check-in QR Code" className="w-48 h-48" />
              </div>
              
              <div className="bg-secondary/50 p-4 rounded-2xl text-left border border-border/50 mb-8">
                 <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                   Your resource is reserved. Please scan this code at the entrance within **15 minutes** of the start time to confirm your presence.
                 </p>
              </div>
              
              <button 
                onClick={() => setShowQrModal(false)}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
              >
                Close Receipt
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
