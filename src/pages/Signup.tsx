import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { ArrowRight, AlertCircle } from "lucide-react"
import { useAuthStore } from "../store/authStore"

export default function Signup() {
  const [activeTab, setActiveTab] = useState<'student' | 'faculty'>('student')
  const { register, handleSubmit } = useForm()
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
          role: data.role, // Will be 'FACULTY' or 'STUDENT'
          college: "VVCE",
          course: data.course || "General",
          year: parseInt(data.year) || 1
        })
      });

      const result = await res.json();

      if (result.status === 'success') {
        // Normalize role to lowercase for store
        login(data.role.toLowerCase(), result.data.accessToken, result.data.user);
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
      <div className="glass-card p-8 sm:p-10 rounded-2xl border border-border/50 shadow-2xl relative overflow-hidden">
        <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full blur-[50px] ${activeTab === 'student' ? 'bg-accent/10' : 'bg-primary/10'}`} />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Create Account</h2>
          <p className="text-muted-foreground mb-8 text-sm">Join CampusBook to start booking resources instantly.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Role</label>
              <select
                {...register("role", { required: true })}
                onChange={(e) => setActiveTab(e.target.value === 'FACULTY' ? 'faculty' : 'student')}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-colors"
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
              </select>
            </div>

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
              className={`w-full font-medium rounded-lg px-4 py-3 transition-all flex items-center justify-center gap-2 mt-2 text-white ${isLoading ? 'opacity-50 cursor-not-allowed' :
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
