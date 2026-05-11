import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { ArrowRight, GraduationCap, Users } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import type { Role } from "../store/authStore"
import { motion, AnimatePresence } from "framer-motion"

export default function Login() {
  const [searchParams] = useSearchParams()
  const initialRole = (searchParams.get("role") as Role) || "student"
  const [activeTab, setActiveTab] = useState<Role>(initialRole)
  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  useEffect(() => {
    if (searchParams.get("role")) {
      setActiveTab(searchParams.get("role") as Role)
    }
  }, [searchParams])

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password })
      });
      const result = await res.json();
      
      if (result.status === 'success') {
        login(activeTab, result.data.accessToken);
        navigate("/dashboard");
      } else {
        // Fallback: auto-register for demo purposes
        const regRes = await fetch("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: activeTab === 'faculty' ? "Faculty User" : "Student User", email: data.email, password: data.password })
        });
        const regResult = await regRes.json();
        
        if (regResult.status === 'success') {
          login(activeTab, regResult.data.accessToken);
          navigate("/dashboard");
        } else {
          alert(regResult.message || "Login failed");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Is the backend running?");
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Role Selection Tabs */}
      <div className="flex bg-secondary p-1 rounded-xl mb-6 border border-border">
        <button
          onClick={() => setActiveTab("faculty")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === "faculty"
              ? "bg-card shadow-sm border border-border text-primary neon-glow"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Faculty
        </button>
        <button
          onClick={() => setActiveTab("student")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === "student"
              ? "bg-card shadow-sm border border-border text-accent ai-glow"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          }`}
        >
          <Users className="w-4 h-4" /> Student
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`glass-card p-8 sm:p-10 rounded-2xl border shadow-2xl relative overflow-hidden ${
            activeTab === "faculty" ? "border-primary/20" : "border-accent/20"
          }`}
        >
          {/* Decorative Blur */}
          <div
            className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none ${
              activeTab === "faculty" ? "bg-primary/10" : "bg-accent/10"
            }`}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-3xl font-bold">Welcome</h2>
              <span
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  activeTab === "faculty"
                    ? "bg-primary/20 text-primary"
                    : "bg-accent/20 text-accent"
                }`}
              >
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
                  {...register("email")}
                  type="email"
                  placeholder={
                    activeTab === "faculty" ? "faculty@university.edu" : "student@university.edu"
                  }
                  className={`w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground ${
                    activeTab === "faculty" ? "focus:border-primary/50" : "focus:border-accent/50"
                  }`}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <a href="#" className={`text-xs hover:underline ${activeTab === 'faculty' ? 'text-primary' : 'text-accent'}`}>
                    Forgot password?
                  </a>
                </div>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground ${
                    activeTab === "faculty" ? "focus:border-primary/50" : "focus:border-accent/50"
                  }`}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2 pb-2">
                <input type="checkbox" id="remember" className="rounded border-border bg-secondary accent-primary" />
                <label htmlFor="remember" className="text-sm text-muted-foreground">Remember me for 30 days</label>
              </div>

              <button
                type="submit"
                className={`w-full font-medium rounded-lg px-4 py-3 transition-all flex items-center justify-center gap-2 mt-2 text-white ${
                  activeTab === "faculty"
                    ? "bg-primary hover:bg-primary/90 neon-glow"
                    : "bg-accent hover:bg-accent/90 ai-glow"
                }`}
              >
                Sign In to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
