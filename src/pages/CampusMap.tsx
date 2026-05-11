import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  Info, 
  User, 
  Clock, 
  MapPin, 
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  Calendar
} from "lucide-react"
import { useAuthStore } from "../store/authStore"

interface Room {
  id: string
  name: string
  type: string
  status: string
  location: string
  bookings: any[]
}

interface BlockData {
  id: string
  name: string
  x: number
  y: number
  w: number
  h: number
  rooms: Room[]
  status: 'available' | 'partial' | 'full'
  isLabelOnly?: boolean
}

export default function CampusMap() {
  const { role, token } = useAuthStore()
  const isStudent = role?.toLowerCase() === 'student'
  const [resources, setResources] = useState<Room[]>([])
  const [selectedBlock, setSelectedBlock] = useState<BlockData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Booking Modal States
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null)
  const [bookingDate, setBookingDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const blocks: Omit<BlockData, 'rooms' | 'status'>[] = [
    // Row 1: Front/Entrance
    { id: "A", name: "A Block", x: 5, y: 5, w: 28, h: 15 },
    { id: "B", name: "B Block", x: 36, y: 5, w: 28, h: 15 },
    { id: "C", name: "C Block", x: 67, y: 5, w: 28, h: 15 },
    // Row 2: Middle
    { id: "M", name: "M Block", x: 5, y: 25, w: 90, h: 15 },
    // Row 3: Sports Complex
    { id: "SPORTS", name: "Sports Complex", x: 5, y: 45, w: 90, h: 12 },
    // Row 4: Back
    { id: "H", name: "H Block", x: 5, y: 62, w: 43, h: 15 },
    { id: "G", name: "G Block", x: 52, y: 62, w: 43, h: 15 },
    // Row 5: Deepest
    { id: "D", name: "D Block", x: 5, y: 82, w: 43, h: 15 },
  ]

  const fetchResources = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/resources`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.status === 'success') {
        setResources(data.data.resources)
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error("Failed to fetch resources:", err)
    }
  }

  useEffect(() => {
    if (token) {
      fetchResources()
      const interval = setInterval(fetchResources, 60000)
      return () => clearInterval(interval)
    }
  }, [token])

  const getBlockData = (block: Omit<BlockData, 'rooms' | 'status'>): BlockData => {
    // Robust mapping logic
    const blockRooms = resources.filter(r => {
      const locationMatch = r.location.toLowerCase().includes(block.name.toLowerCase());
      const idMatch = r.location.toLowerCase() === block.id.toLowerCase();
      // Special case for Sports Complex
      const sportsMatch = block.id === 'SPORTS' && r.location.toLowerCase().includes('sports');
      return locationMatch || idMatch || sportsMatch;
    })
    
    const occupiedCount = blockRooms.filter(r => r.bookings && r.bookings.length > 0).length
    const totalRooms = blockRooms.length

    let status: 'available' | 'partial' | 'full' = 'available'
    if (totalRooms > 0) {
      if (occupiedCount === totalRooms) status = 'full'
      else if (occupiedCount > 0) status = 'partial'
    }

    return {
      ...block,
      rooms: blockRooms,
      status
    } as BlockData
  }

  const handleBooking = async () => {
    setSubmitting(true);
    setError("");
    if (!bookingRoom || !bookingDate || !startTime || !endTime) {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ resourceId: bookingRoom.id, startTime: start.toISOString(), endTime: end.toISOString() })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowBookingModal(false);
        setBookingRoom(null);
        setBookingDate("");
        setStartTime("");
        setEndTime("");
        fetchResources();
      } else {
        setError(data.message || "Booking failed");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  const getStatusStyles = (status: 'available' | 'partial' | 'full') => {
    switch(status) {
      case 'available': return "bg-success/20 border-success text-success shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:bg-success/30"
      case 'partial': return "bg-warning/20 border-warning text-warning shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:bg-warning/30"
      case 'full': return "bg-danger/20 border-danger text-danger shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:bg-danger/30"
    }
  }

  const getStatusIcon = (status: 'available' | 'partial' | 'full') => {
    switch(status) {
      case 'available': return <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
      case 'partial': return <div className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse" />
      case 'full': return <div className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">VVCE Interactive Map</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-1">
            <Clock className="w-3.5 h-3.5" />
            Live Sync • Last updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-medium bg-card/50 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-success"></span> All Free
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-warning"></span> Partial
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-danger"></span> Occupied
          </div>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-2xl border border-border overflow-hidden relative flex bg-[#020617]">
        {/* Map Area */}
        <div className="flex-1 relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
          
          {/* Spatial Grid Lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             {[...Array(10)].map((_, i) => (
               <div key={i} className="absolute w-full h-px bg-white" style={{ top: `${i * 10}%` }} />
             ))}
             {[...Array(10)].map((_, i) => (
               <div key={i} className="absolute h-full w-px bg-white" style={{ left: `${i * 10}%` }} />
             ))}
          </div>

          {blocks.map((block) => {
            const data = getBlockData(block)
            return (
              <motion.div
                key={block.id}
                className={`absolute rounded-xl border-2 backdrop-blur-xl transition-all flex flex-col items-center justify-center gap-1 p-2 group cursor-pointer ${getStatusStyles(data.status)}`}
                style={{
                  left: `${block.x}%`,
                  top: `${block.y}%`,
                  width: `${block.w}%`,
                  height: `${block.h}%`,
                }}
                onClick={() => setSelectedBlock(data)}
                whileHover={{ scale: 1.02, zIndex: 10 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(data.status)}
                  <span className="font-bold text-foreground text-sm uppercase tracking-wide">{block.name}</span>
                </div>
                <div className="text-[10px] opacity-80 font-bold bg-black/30 px-2.5 py-0.5 rounded-full border border-white/5">
                  {data.rooms.length} ROOMS
                </div>
                
                {/* Decorative glow */}
                <div className="absolute inset-0 rounded-xl bg-current opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
              </motion.div>
            )
          })}
          
          {/* Road Indicators */}
          <div className="absolute left-[50%] top-0 bottom-0 w-8 bg-white/5 -translate-x-1/2 pointer-events-none flex flex-col items-center justify-center gap-40 opacity-20">
             <div className="w-1 h-8 bg-white" />
             <div className="w-1 h-8 bg-white" />
             <div className="w-1 h-8 bg-white" />
          </div>
        </div>

        {/* Sidebar Popup */}
        <AnimatePresence>
          {selectedBlock && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-card/95 backdrop-blur-xl border-l border-border z-30 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border flex justify-between items-start bg-secondary/10">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {selectedBlock.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <LayoutGrid className="w-3 h-3" />
                    {selectedBlock.rooms.length} Total Resources
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedBlock(null)}
                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors border border-border"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedBlock.rooms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <AlertCircle className="w-12 h-12 mb-3" />
                    <p className="text-sm font-medium">No live data for this block.</p>
                  </div>
                ) : (
                  selectedBlock.rooms.map((room) => {
                    const isBooked = room.bookings && room.bookings.length > 0
                    const activeBooking = isBooked ? room.bookings[0] : null

                    return (
                      <div 
                        key={room.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isBooked 
                            ? 'bg-danger/5 border-danger/20' 
                            : 'bg-success/5 border-success/20'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">
                            <h4 className="font-bold text-sm tracking-tight">{room.name}</h4>
                            <span className="text-[10px] text-muted-foreground uppercase">{room.type}</span>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                            isBooked ? 'bg-danger text-white' : 'bg-success text-white'
                          }`}>
                            {isBooked ? 'Engaged' : 'Free'}
                          </span>
                        </div>

                        {isBooked ? (
                          <div className="space-y-2.5 mt-2 pt-3 border-t border-danger/10">
                            <div className="flex items-center gap-2 text-xs text-foreground/80">
                              <User className="w-3.5 h-3.5 text-danger" />
                              <span className="font-semibold">{activeBooking.user?.name || "Faculty Member"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              <Clock className="w-3.5 h-3.5 text-danger" />
                              <span className="bg-danger/10 px-2 py-0.5 rounded">
                                {new Date(activeBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                                {" - "}
                                {new Date(activeBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 mt-2">
                            <div className="flex items-center gap-2 text-[11px] text-success font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" />
                              AVAILABLE NOW
                            </div>
                            {!isStudent && (
                              <button 
                                onClick={() => {
                                  setBookingRoom(room)
                                  setShowBookingModal(true)
                                }}
                                className="w-full py-2 bg-success text-white rounded-lg text-xs font-bold hover:bg-success/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-success/20"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                Book Now
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              <div className="p-4 bg-secondary/5 border-t border-border flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Info className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                  Live occupancy data is synchronized with the central server every 60 seconds. Booking status reflects real-time reservations.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Modal */}
        <AnimatePresence>
          {showBookingModal && bookingRoom && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-background/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-border">
                  <h3 className="font-bold text-lg">Confirm Booking</h3>
                  <p className="text-sm text-muted-foreground">Select your time slot for {bookingRoom.name}</p>
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
                </div>
                <div className="p-6 border-t border-border flex justify-end gap-3 bg-secondary/50">
                  <button 
                    onClick={() => {
                      setShowBookingModal(false)
                      setBookingRoom(null)
                    }}
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
      </div>
    </div>
  )
}
