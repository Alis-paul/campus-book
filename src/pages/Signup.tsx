import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { ArrowRight } from "lucide-react"

export default function Signup() {
  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()

  const onSubmit = () => {
    navigate("/dashboard")
  }

  return (
    <div className="glass-card p-8 sm:p-10 rounded-2xl border border-border/50 shadow-2xl relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-[50px]" />
      
      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
        <p className="text-muted-foreground mb-8 text-sm">Join CampusBook to start booking resources instantly.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">First Name</label>
              <input 
                {...register("firstName")}
                type="text" 
                placeholder="John"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Last Name</label>
              <input 
                {...register("lastName")}
                type="text" 
                placeholder="Doe"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">University Email</label>
            <input 
              {...register("email")}
              type="email" 
              placeholder="name@university.edu"
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-colors"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <input 
              {...register("password")}
              type="password" 
              placeholder="••••••••"
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-colors"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-primary-foreground font-medium rounded-lg px-4 py-3 hover:bg-primary/90 neon-glow transition-all flex items-center justify-center gap-2 mt-2"
          >
            Create Account <ArrowRight className="w-4 h-4" />
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
  )
}
