import { Outlet, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Bot } from "lucide-react"

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto z-10 flex flex-col items-center">
        <Link to="/" className="flex items-center gap-2 mb-8 group">
          <div className="bg-card p-2 rounded-xl border border-border shadow-lg group-hover:neon-glow transition-all">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            CampusBook AI
          </span>
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}
