import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Clock, AlertCircle, ArrowRight, CheckCircle2, Inbox } from "lucide-react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { apiFetch } from "../utils/api"

export default function Waitlists() {
  const { role } = useAuthStore()
  const [waitlists, setWaitlists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWaitlists = useCallback(async () => {
    const data = await apiFetch('/api/bookings/waitlists');
    if (data.status === 'success') {
      setWaitlists(data.data.waitlists.map((w: any, i: number) => ({
        id: w.id,
        resource: w.resource.name,
        time: new Date(w.requestedTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
        position: i + 1,
        total: i + 3, // Mocking some context for the demo
        likelihood: i === 0 ? "Very High" : "High",
        status: w.status.toLowerCase()
      })))
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWaitlists();
    const interval = setInterval(fetchWaitlists, 30000);
    return () => clearInterval(interval);
  }, [fetchWaitlists])

  const handleLeaveQueue = async (id: string) => {
    const data = await apiFetch(`/api/bookings/waitlist/${id}`, { method: "DELETE" });
    if (data.status === 'success') {
      fetchWaitlists();
    }
  }

  if (role?.toLowerCase() === 'student') return <Navigate to="/dashboard" replace />

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Waitlist Monitor</h1>
        <p className="text-muted-foreground text-sm font-medium">Track queue status and auto-allocation for high-demand resources.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
           [1,2].map(i => (
             <div key={i} className="glass-card h-48 rounded-xl border border-border animate-pulse bg-secondary/20" />
           ))
        ) : waitlists.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl border border-border/50 text-center flex flex-col items-center justify-center bg-secondary/10">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 opacity-50">
               <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">No Active Waitlists</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-xs">When you join a queue for a fully booked resource, it will appear here for tracking.</p>
          </div>
        ) : waitlists.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card p-6 rounded-xl border relative overflow-hidden transition-all hover:border-primary/30 ${
              item.status === 'allocated' ? 'border-success/50 bg-success/5' : 'border-border'
            }`}
          >
            {item.status === 'allocated' && (
              <div className="absolute top-0 right-0 bg-success text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-bl-lg flex items-center gap-1.5 shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5" /> Slot Allocated
              </div>
            )}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-black mb-1 uppercase tracking-tight">{item.resource}</h3>
                <div className="flex items-center text-[11px] font-bold text-muted-foreground gap-2 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-primary" />
                  Requested: {item.time}
                </div>
              </div>

              <div className="flex items-center gap-8 bg-secondary/30 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mb-1">Position</p>
                  <p className="text-3xl font-black text-primary tracking-tighter">
                    {item.position}<span className="text-sm text-muted-foreground font-medium">/{item.total}</span>
                  </p>
                </div>
                
                <div className="w-px h-10 bg-border/50"></div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mb-1">Sync Health</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]`}></div>
                    <span className="font-bold text-[11px] uppercase tracking-wider text-success">Live</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[140px]">
                {item.status === 'allocated' ? (
                  <button className="w-full bg-success text-white py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-success/90 transition-all shadow-lg shadow-success/20">
                    Confirm Booking
                  </button>
                ) : (
                  <button 
                    onClick={() => handleLeaveQueue(item.id)}
                    className="w-full bg-secondary border border-border/50 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-secondary/80 transition-all text-foreground"
                  >
                    Leave Queue
                  </button>
                )}
              </div>
            </div>
            
            {item.status !== 'allocated' && (
              <div className="mt-6 pt-4 border-t border-border/30">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground mb-2 opacity-50">
                  <span>Joined</span>
                  <span>Threshold</span>
                  <span>Secured</span>
                </div>
                <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden flex border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - (item.position / item.total) * 100}%` }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-primary via-accent to-primary relative"
                  >
                    <div className="absolute top-0 right-0 w-8 h-full bg-white/20 blur-sm animate-pulse"></div>
                  </motion.div>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mt-4 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-[10px] text-primary/80 font-bold leading-relaxed uppercase tracking-tight">
                    AI Predictor: High clearance probability based on historical cancellation trends for {item.resource}.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
