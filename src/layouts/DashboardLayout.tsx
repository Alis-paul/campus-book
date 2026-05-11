import { useState, useEffect } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  LayoutDashboard, CalendarCheck, Map as MapIcon, 
  BarChart3, Bot, Users, Clock, QrCode, LogOut, Bell, Search, User, GraduationCap
} from "lucide-react"
import AIAssistant from "../components/AIAssistant"
import { useAuthStore } from "../store/authStore"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ['faculty', 'student'] },
  { icon: CalendarCheck, label: "Bookings", href: "/booking", roles: ['faculty', 'student'] },
  { icon: MapIcon, label: "Campus Map", href: "/map", roles: ['faculty', 'student'] },
  { icon: Clock, label: "Waitlists", href: "/waitlists", roles: ['faculty'] },
  { icon: QrCode, label: "QR Check-in", href: "/qr-checkin", roles: ['faculty', 'student'] },
  { icon: BarChart3, label: "Analytics", href: "/analytics", roles: ['faculty'] },
  { icon: Users, label: "Admin Panel", href: "/admin", roles: ['faculty'] },
]

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { role, token, logout } = useAuthStore()

  useEffect(() => {
    if (!token && location.pathname !== '/login' && location.pathname !== '/signup') {
      navigate('/login')
    }
  }, [token, navigate, location])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Filter nav items based on user role. Default to student if null for safe rendering.
  const currentRole = role || 'student'
  const filteredNavItems = navItems.filter(item => item.roles.includes(currentRole))

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass border-r border-border md:h-screen flex flex-col relative z-20">
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-card p-1.5 rounded-lg border border-border">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              CampusBook AI
            </span>
          </div>
          
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold self-start border ${
            currentRole === 'faculty' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-accent/10 border-accent/20 text-accent'
          }`}>
            {currentRole === 'faculty' ? <GraduationCap className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            <span className="capitalize">{currentRole} Portal</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link key={item.href} to={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20 neon-glow" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
        {/* Navbar */}
        <header className="h-16 glass border-b border-border flex items-center justify-between px-6 z-10">
          <div className="flex items-center bg-secondary rounded-full px-3 py-1.5 border border-border w-64 focus-within:ring-1 focus-within:ring-primary transition-all">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input 
              type="text" 
              placeholder="Search resources..." 
              className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent p-[2px] cursor-pointer">
              <div className="h-full w-full rounded-full bg-card flex items-center justify-center">
                <User className="w-4 h-4 text-foreground" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Floating AI Assistant */}
      <AIAssistant />
    </div>
  )
}
