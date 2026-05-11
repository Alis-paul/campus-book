import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { ArrowRight, GraduationCap, Users, AlertCircle } from "lucide-react"
import { useAuthStore } from "../store/authStore"

export default function Signup() {
  const [activeTab, setActiveTab] = useState<'student' | 'faculty'>('student')
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError("");
    
    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: data.password,
          role: activeTab,
          college: "VVCE",
          course: data.course || "General",
          year: parseInt(data.year) || 1
        })
      });

      const result = await res.json();

      if (result.status === 'success') {
        login(activeTab, result.data.accessToken);
        navigate("/dashboard");
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Role Selection */}
      <div className="flex bg-secondary p-1 rounded-xl mb-6 border border-border">
        <button
          onClick={() => setActiveTab("student")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === "student"
              ? "bg-card shadow-sm border border-border text-accent ai-glow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" /> Student
        </button>
        <button
          onClick={() => setActiveTab("faculty")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === "faculty"
              ? "bg-card shadow-sm border border-border text-primary neon-glow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Faculty
        </button>
      </div>

      <div className="glass-card p-8 sm:p-10 rounded-2xl border border-border/50 shadow-2xl relative overflow-hidden">
        <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full blur-[50px] ${activeTab === 'student' ? 'bg-accent/10' : 'bg-primary/10'}`} />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Create {activeTab === 'faculty' ? 'Faculty' : 'Student'} Account</h2>
          <p className="text-muted-foreground mb-8 text-sm">Join CampusBook to start booking resources instantly.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">First Name</label>
                <input 
                  {...register("firstName", { required: true })}
                  type="text" 
                  placeholder="John"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Last Name</label>
                <input 
                  {...register("lastName", { required: true })}
                  type="text" 
                  placeholder="Doe"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">University Email</label>
              <input 
                {...register("email", { required: true })}
                type="email" 
                placeholder="name@university.edu"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Department/Course</label>
                <input 
                  {...register("course")}
                  type="text" 
                  placeholder="Computer Science"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Year/Experience</label>
                <input 
                  {...register("year")}
                  type="number" 
                  placeholder="3"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input 
                {...register("password", { required: true, minLength: 6 })}
                type="password" 
                placeholder="••••••••"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-colors"
              />
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 flex gap-3">
                <AlertCircle className="w-5 h-5 text-danger shrink-0" />
                <p className="text-xs text-danger font-medium">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full font-medium rounded-lg px-4 py-3 transition-all flex items-center justify-center gap-2 mt-2 text-white ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 
                activeTab === 'faculty' ? 'bg-primary hover:bg-primary/90 neon-glow' : 'bg-accent hover:bg-accent/90 ai-glow'
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
