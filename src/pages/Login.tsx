import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GraduationCap, Users, ShieldCheck, Sparkles, ArrowRight } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { motion } from "framer-motion"

export default function Login() {
  const navigate = useNavigate()
  const setDemoSession = useAuthStore((state) => state.setDemoSession)
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleDemoLogin = (role: 'faculty' | 'student') => {
    setIsLoading(role)
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setDemoSession(role)
      navigate("/dashboard")
    }, 800)
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles className="w-3 h-3" /> Hackathon Demo Mode
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          Welcome to <span className="text-primary">CampusBook</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Simplifying campus resource management. Select your role to explore the platform.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Faculty Option */}
        <motion.button
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleDemoLogin('faculty')}
          disabled={!!isLoading}
          className="relative group overflow-hidden glass-card p-8 rounded-3xl border-2 border-primary/20 text-left transition-all hover:border-primary/50"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 border border-primary/30">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Faculty Portal</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Manage classroom bookings, monitor resource occupancy, and access advanced campus analytics.
            </p>
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              {isLoading === 'faculty' ? 'Initializing...' : 'Continue as Faculty'} <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </motion.button>

        {/* Student Option */}
        <motion.button
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleDemoLogin('student')}
          disabled={!!isLoading}
          className="relative group overflow-hidden glass-card p-8 rounded-3xl border-2 border-accent/20 text-left transition-all hover:border-accent/50"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/20 transition-colors" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mb-6 border border-accent/30">
              <Users className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Student Portal</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              View real-time room availability, check-in with QR codes, and see campus utilization at a glance.
            </p>
            <div className="flex items-center gap-2 text-accent font-bold text-sm">
              {isLoading === 'student' ? 'Initializing...' : 'Continue as Student'} <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </motion.button>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4" /> Secure Sandbox Environment • No Password Required
        </div>
      </motion.div>
    </div>
  )
}