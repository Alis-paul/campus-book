import { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { ArrowRight, GraduationCap, Users, AlertCircle, ShieldAlert } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import type { Role } from "../store/authStore"
import { motion, AnimatePresence } from "framer-motion"

export default function Login() {
  const [searchParams] = useSearchParams()
  const initialRole = (searchParams.get("role") as Role) || "student"
  const [activeTab, setActiveTab] = useState<Role>(initialRole)
  const { register, handleSubmit } = useForm()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setError("")
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      const json = await res.json()

      if (json.status === 'success') {
        const dbRole = (json.data.user.role || '').toLowerCase()
        const selectedTab = (activeTab || 'student').toLowerCase()

        // Enforce: the tab you selected MUST match your actual DB role
        if (dbRole !== selectedTab) {
          const correctPortal = dbRole === 'faculty' ? 'Faculty' : 'Student'
          setError(
            `This account is registered as a ${correctPortal}. Please switch to the ${correctPortal} tab to log in.`
          )
          setIsLoading(false)
          return
        }

        login(dbRole as Role, json.data.accessToken, json.data.user)
        navigate("/dashboard")
      } else {
        setError(json.message || "Invalid email or password")
      }
    } catch (err) {
      setError("Connection error. Please check your internet and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex bg-secondary p-1 rounded-xl mb-6 border border-border">
        <button
          type="button"
          onClick={() => { setActiveTab("faculty"); setError("") }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "faculty" ? "bg-card shadow-sm border border-border text-primary neon-glow" : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"}`}
        >
          <GraduationCap className="w-4 h-4" /> Faculty
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("student"); setError("") }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "student" ? "bg-card shadow-sm border border-border text-accent ai-glow" : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"}`}
        >
          <Users className="w-4 h-4" /> Student
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab as string}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`glass-card p-8 sm:p-10 rounded-2xl border shadow-2xl relative overflow-hidden ${activeTab === "faculty" ? "border-primary/20" : "border-accent/20"}`}
        >
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none ${activeTab === "faculty" ? "bg-primary/10" : "bg-accent/10"}`} />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-3xl font-bold">Welcome</h2>
              <span className={`px-2.5 py-1 rounded text-xs font-semibold ${activeTab === "faculty" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                {activeTab === "faculty" ? "Faculty Access" : "Student Access"}
              </span>
            </div>
            <p className="text-muted-foreground mb-8 text-sm">
              {activeTab === "faculty"
                ? "Log in to manage your classroom and resource bookings."
                : "Log in to view campus schedules and real-time availability."}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">University Email</label>
                <input
                  {...register("email", { required: true })}
                  type="email"
                  placeholder={activeTab === "faculty" ? "faculty@university.edu" : "student@university.edu"}
                  className={`w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground ${activeTab === "faculty" ? "focus:border-primary/50" : "focus:border-accent/50"}`}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <a href="#" className={`text-xs hover:underline ${activeTab === 'faculty' ? 'text-primary' : 'text-accent'}`}>Forgot password?</a>
                </div>
                <input
                  {...register("password", { required: true })}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground ${activeTab === "faculty" ? "focus:border-primary/50" : "focus:border-accent/50"}`}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2 pb-2">
                <input type="checkbox" id="remember" className="rounded border-border bg-secondary accent-primary" />
                <label htmlFor="remember" className="text-sm text-muted-foreground">Remember me for 30 days</label>
              </div>

              {error && (
                <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  <p className="text-xs text-danger font-medium leading-relaxed">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-medium rounded-lg px-4 py-3 transition-all flex items-center justify-center gap-2 mt-2 text-white ${isLoading ? 'opacity-50 cursor-not-allowed' : activeTab === "faculty" ? "bg-primary hover:bg-primary/90 neon-glow" : "bg-accent hover:bg-accent/90 ai-glow"}`}
              >
                {isLoading ? 'Signing In...' : 'Sign In to Dashboard'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}