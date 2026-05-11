import { useState, useEffect, useCallback } from "react"
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
import { apiFetch } from "../utils/api"

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
  const { role } = useAuthStore()
  const isStudent = role?.toLowerCase() === 'student'
  const [resources, setResources] = useState<Room[]>([])
  const [selectedBlock, setSelectedBlock] = useState<BlockData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)

  // Booking Modal States
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null)
  const [bookingDate, setBookingDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const blocks: Omit<BlockData, 'rooms' | 'status'>[] = [
    { id: "A", name: "A Block", x: 5, y: 5, w: 28, h: 15 },
    { id: "B", name: "B Block", x: 36, y: 5, w: 28, h: 15 },
    { id: "C", name: "C Block", x: 67, y: 5, w: 28, h: 15 },
    { id: "M", name: "M Block", x: 5, y: 25, w: 90, h: 15 },
    { id: "SPORTS", name: "Sports Complex", x: 5, y: 45, w: 90, h: 12 },
    { id: "H", name: "H Block", x: 5, y: 62, w: 43, h: 15 },
    { id: "G", name: "G Block", x: 52, y: 62, w: 43, h: 15 },
    { id: "D", name: "D Block", x: 5, y: 82, w: 43, h: 15 },
  ]

  const fetchResources = useCallback(async () => {
    const result = await apiFetch('/api/bookings/resources');
    if (result.status === 'success') {
      setResources(result.data.resources);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchResources();
    const interval = setInterval(fetchResources, 30000);
    return () => clearInterval(interval);
  }, [fetchResources]);

  const getBlockData = (block: Omit<BlockData, 'rooms' | 'status'>): BlockData => {
    const blockRooms = resources.filter(r => {
      const locationMatch = r.location.toLowerCase().includes(block.name.toLowerCase());
      const idMatch = r.location.toLowerCase() === block.id.toLowerCase();
      const sportsMatch = block.id === 'SPORTS' && r.location.toLowerCase().includes('sports');
      return locationMatch || idMatch || sportsMatch;
    })
    
    const now = new Date();
    const occupiedCount = blockRooms.filter(r => 
      r.bookings?.some((b: any) => 
        new Date(b.startTime) <= now && 
        new Date(b.endTime) >= now && 
        ['CONFIRMED', 'ACTIVE'].includes(b.status)
      )
    ).length;

    const totalRooms = blockRooms.length;
    let status: 'available' | 'partial' | 'full' = 'available';
    if (totalRooms > 0) {
      if (occupiedCount === totalRooms) status = 'full';
      else if (occupiedCount > 0) status = 'partial';
    }

    return { ...block, rooms: blockRooms, status } as BlockData;
  }

  const handleBooking = async () => {
    setSubmitting(true);
    setError("");
    if (!bookingRoom || !bookingDate || !startTime || !endTime) {
      setError("Please fill in all fields");
      setSubmitting(false);
      return;
    }

    const start = new Date(`${bookingDate}T${startTime}:00`);
    const end = new Date(`${bookingDate}T${endTime}:00`);

    if (end <= start) {
      setError("End time must be after start time");
      setSubmitting(false);
      return;
    }

    const result = await apiFetch('/api/bookings', {
      method: "POST",
      body: { resourceId: bookingRoom.id, startTime: start.toISOString(), endTime: end.toISOString() }
    });

    if (result.status === 'success') {
      setShowBookingModal(false);
      setBookingRoom(null);
      setBookingDate("");
      setStartTime("");
      setEndTime("");
      fetchResources();
    } else {
      setError(result.message || "Booking failed");
    }
    setSubmitting(false);
  }

  const getStatusStyles = (status: 'available' | 'partial' | 'full') => {
    switch(status) {
      case 'available': return "bg-success/10 border-success/30 text-success shadow-[0_0_15px_rgba(34,197,94,0.05)] hover:bg-success/20"
      case 'partial': return "bg-warning/10 border-warning/30 text-warning shadow-[0_0_15px_rgba(245,158,11,0.05)] hover:bg-warning/20"
      case 'full': return "bg-danger/10 border-danger/30 text-danger shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:bg-danger/20"
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campus Spatial View</h1>
          <p className="text-muted-foreground text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
            <Clock className="w-3.5 h-3.5 text-primary" />
            Live Sync • {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest bg-card/50 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span> Free
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span> Busy
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span> Full
          </div>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-2xl border border-border/50 overflow-hidden relative flex bg-[#020617] min-h-[500px]">
        {/* Map Area */}
        <div className="flex-1 relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
          
          {loading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-50">
               <LayoutGrid className="w-12 h-12 text-primary animate-spin mb-4" />
               <p className="font-black uppercase tracking-[0.2em] text-xs">Calibrating Map...</p>
             </div>
          ) : (
            <>
              {/* Spatial Grid Lines */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`absolute rounded-xl border backdrop-blur-xl transition-all flex flex-col items-center justify-center gap-1 p-2 group cursor-pointer ${getStatusStyles(data.status)}`}
                    style={{
                      left: `${block.x}%`,
                      top: `${block.y}%`,
                      width: `${block.w}%`,
                      height: `${block.h}%`,
                    }}
                    onClick={() => setSelectedBlock(data)}
                    whileHover={{ scale: 1.02, zIndex: 10, borderColor: 'rgba(255,255,255,0.2)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black text-foreground text-[11px] uppercase tracking-wider">{block.name}</span>
                    </div>
                    <div className="text-[9px] opacity-60 font-black bg-black/40 px-2.5 py-0.5 rounded-full border border-white/5 uppercase tracking-tighter">
                      {data.rooms.length} Units
                    </div>
                  </motion.div>
                )
              })}
            </>
          )}
          
          <div className="absolute left-[50%] top-0 bottom-0 w-8 bg-white/5 -translate-x-1/2 pointer-events-none flex flex-col items-center justify-center gap-40 opacity-10">
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
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-card/95 backdrop-blur-2xl border-l border-border/50 z-30 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border/50 flex justify-between items-start bg-secondary/20">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                    <MapPin className="w-5 h-5 text-primary" />
                    {selectedBlock.name}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground mt-1 flex items-center gap-1 uppercase tracking-widest">
                    <LayoutGrid className="w-3 h-3" />
                    {selectedBlock.rooms.length} Resources Online
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedBlock(null)}
                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors border border-border/50 shadow-inner"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {selectedBlock.rooms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                    <AlertCircle className="w-12 h-12 mb-3" />
                    <p className="text-xs font-black uppercase tracking-widest">Zone Inactive</p>
                  </div>
                ) : (
                  selectedBlock.rooms.map((room) => {
                    const now = new Date();
                    const isBooked = room.bookings?.some((b: any) => 
                      new Date(b.startTime) <= now && 
                      new Date(b.endTime) >= now && 
                      ['CONFIRMED', 'ACTIVE'].includes(b.status)
                    );
                    const activeBooking = isBooked ? room.bookings.find((b: any) => 
                      new Date(b.startTime) <= now && 
                      new Date(b.endTime) >= now && 
                      ['CONFIRMED', 'ACTIVE'].includes(b.status)
                    ) : null;

                    return (
                      <div 
                        key={room.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isBooked 
                            ? 'bg-danger/5 border-danger/20' 
                            : 'bg-success/5 border-success/20'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">
                            <h4 className="font-bold text-sm tracking-tight">{room.name}</h4>
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{room.type}</span>
                          </div>
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${
                            isBooked ? 'bg-danger/20 text-danger border-danger/30' : 'bg-success/20 text-success border-success/30'
                          }`}>
                            {isBooked ? 'Occupied' : 'Vacant'}
                          </span>
                        </div>

                        {isBooked && activeBooking ? (
                          <div className="space-y-2 mt-2 pt-3 border-t border-danger/10">
                            <div className="flex items-center gap-2 text-[10px] text-foreground/80">
                              <User className="w-3.5 h-3.5 text-danger" />
                              <span className="font-bold uppercase tracking-tight">{activeBooking.user?.name || "Faculty Member"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                              <Clock className="w-3.5 h-3.5 text-danger" />
                              <span className="bg-danger/10 px-2 py-0.5 rounded border border-danger/10">
                                {new Date(activeBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                                {" - "}
                                {new Date(activeBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 mt-2">
                            <div className="flex items-center gap-2 text-[9px] text-success font-black uppercase tracking-widest">
                              <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" />
                              Available
                            </div>
                            {!isStudent && (
                              <button 
                                onClick={() => {
                                  setBookingRoom(room)
                                  setShowBookingModal(true)
                                }}
                                className="w-full py-2 bg-success text-white rounded-lg text-[10px] font-black uppercase tracking-[0.1em] hover:bg-success/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-success/10"
                              >
                                <Calendar className="w-3 h-3" />
                                Reserve
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              <div className="p-4 bg-secondary/10 border-t border-border/50 flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Info className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[9px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tighter italic">
                  Spatial data is synchronized with the central server every 30 seconds.
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
                <div className="p-6 border-b border-border bg-secondary/30">
                  <h3 className="font-black text-lg uppercase tracking-tight">Confirm Reservation</h3>
                  <p className="text-sm text-muted-foreground">Booking for: <span className="font-bold text-foreground">{bookingRoom.name}</span></p>
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
                      <p className="text-xs text-danger font-bold">{error}</p>
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-border flex justify-end gap-3 bg-secondary/20">
                  <button 
                    onClick={() => {
                      setShowBookingModal(false)
                      setBookingRoom(null)
                    }}
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
      </div>
    </div>
  )
}
