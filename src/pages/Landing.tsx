import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Bot, GraduationCap, Users, CalendarCheck, Map, Activity } from "lucide-react"

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 group">
          <div className="bg-card p-2 rounded-xl border border-border shadow-lg group-hover:neon-glow transition-all">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            CampusBook AI
          </span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#analytics" className="hover:text-primary transition-colors">Analytics</a>
          <a href="#about" className="hover:text-primary transition-colors">About</a>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
            Login Portal
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 pb-32 relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border mb-8 text-sm text-muted-foreground"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Smart Campus Resource Management
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mb-6"
          >
            VVCE Campus Connected{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondaryAccent">
              Powered by AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
          >
            A secure, role-based platform for managing campus facilities. Faculty can book classrooms and labs, while students have real-time access to availability and schedules.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-xl mx-auto"
          >
            <Link to="/login?role=faculty" className="flex-1 px-8 py-4 bg-card border border-border text-foreground rounded-xl font-medium text-lg hover:bg-primary/10 hover:border-primary/50 transition-all flex items-center justify-center gap-3 group">
              <GraduationCap className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              Faculty Login
            </Link>
            <Link to="/login?role=student" className="flex-1 px-8 py-4 bg-card border border-border text-foreground rounded-xl font-medium text-lg hover:bg-accent/10 hover:border-accent/50 transition-all flex items-center justify-center gap-3 group">
              <Users className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
              Student Login
            </Link>
          </motion.div>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="mt-32 grid md:grid-cols-3 gap-6 relative z-10">
          {[
            { icon: CalendarCheck, title: "Role-Based Access", desc: "Secure permissions ensure faculty have booking controls while students get read-only schedule access." },
            { icon: Map, title: "Live Heatmaps", desc: "Real-time occupancy visualization across all campus buildings." },
            { icon: Activity, title: "Advanced Analytics", desc: "Peak hour graphs and resource utilization trends." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-8 rounded-2xl border border-border group hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
