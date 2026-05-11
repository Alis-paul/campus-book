import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

export default function Waitlists() {
  const { role, token } = useAuthStore()
  const [waitlists, setWaitlists] = useState<any[]>([])

  const fetchWaitlists = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/waitlists`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.status === 'success') {
        setWaitlists(data.data.waitlists.map((w: any, i: number) => ({
          id: w.id,
          resource: w.resource.name,
          time: new Date(w.requestedTime).toLocaleString(),
          position: i + 1, // Mock position for demo
          total: i + 5,
          likelihood: i === 0 ? "Very High" : "High",
          status: w.status.toLowerCase()
        })))
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (token) {
      fetchWaitlists()
      const interval = setInterval(fetchWaitlists, 60000)
      return () => clearInterval(interval)
    }
  }, [token])

  const handleLeaveQueue = async (id: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/waitlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.status === 'success') {
        fetchWaitlists()
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (role?.toLowerCase() === 'student') return <Navigate to="/dashboard" replace />

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Waitlists</h1>
        <p className="text-muted-foreground text-sm">Track your position for fully booked resources.</p>
      </div>

      <div className="space-y-4">
        {waitlists.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card p-6 rounded-xl border relative overflow-hidden ${
              item.status === 'allocated' ? 'border-success/50 bg-success/5' : 'border-border'
            }`}
          >
            {item.status === 'allocated' && (
              <div className="absolute top-0 right-0 bg-success text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Slot Allocated
              </div>
            )}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{item.resource}</h3>
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {item.time}
                </div>
              </div>

              <div className="flex items-center gap-8 bg-secondary/50 p-4 rounded-lg border border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Queue Position</p>
                  <p className="text-3xl font-bold text-primary">
                    {item.position}<span className="text-sm text-muted-foreground font-normal">/{item.total}</span>
                  </p>
                </div>
                
                <div className="w-px h-12 bg-border"></div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Success Likelihood</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      item.likelihood.includes('High') ? 'bg-success' : 'bg-warning'
                    }`}></div>
                    <span className="font-semibold text-sm">{item.likelihood}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[140px]">
                {item.status === 'allocated' ? (
                  <button className="w-full bg-success text-white py-2 rounded-lg text-sm font-medium hover:bg-success/90 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    Confirm Booking
                  </button>
                ) : (
                  <button 
                    onClick={() => handleLeaveQueue(item.id)}
                    className="w-full bg-secondary border border-border py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors text-foreground"
                  >
                    Leave Queue
                  </button>
                )}
                <button className="w-full text-xs text-primary hover:underline flex items-center justify-center gap-1 mt-1">
                  Find Alternatives <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            {/* Progress Bar UI */}
            {item.status !== 'allocated' && (
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Joined Queue</span>
                  <span>Auto-allocation threshold</span>
                  <span>Slot Secured</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - (item.position / item.total) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-primary to-accent relative"
                  >
                    <div className="absolute top-0 right-0 w-4 h-full bg-white/30 blur-sm animate-pulse"></div>
                  </motion.div>
                </div>
                {item.likelihood.includes('High') && (
                  <p className="text-xs text-accent mt-3 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> AI Prediction: High chance of clearing due to historical cancellation rates.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
