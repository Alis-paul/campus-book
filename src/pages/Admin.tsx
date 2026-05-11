import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Settings, AlertTriangle, Trash2, Edit, Plus } from "lucide-react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

export default function Admin() {
  const { role, token } = useAuthStore()
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.status === 'success') {
        setUsers(data.data.users)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchResources = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/resources`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.status === 'success') {
        setResources(data.data.resources)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (token) {
      fetchUsers()
      fetchResources()
    }
  }, [token])

  if (role?.toLowerCase() === 'student') return <Navigate to="/dashboard" replace />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">System oversight, user management, and platform settings.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border">
        {['users', 'resources', 'alerts', 'reports'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-medium capitalize transition-colors border-b-2 ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">User Management</h2>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all neon-glow">
              Invite User
            </button>
          </div>
          <div className="glass-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{user.name}</div>
                      <div className="text-muted-foreground text-xs">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium bg-secondary text-foreground`}>
                        {user.role || 'Member'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-success`}></div>
                        Active
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-muted-foreground hover:text-foreground"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 text-muted-foreground hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'resources' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Resource Management</h2>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all neon-glow flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Resource
            </button>
          </div>
          <div className="glass-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Resource Name</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{resource.name}</div>
                      <div className="text-muted-foreground text-xs">{resource.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground">{resource.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${resource.status === 'Available' ? 'bg-success' : 'bg-danger'}`}></div>
                        {resource.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-muted-foreground hover:text-foreground"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 text-muted-foreground hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'alerts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="font-semibold mb-4">System Alerts & Maintenance</h2>
          <div className="grid gap-4">
            <div className="glass-card p-4 rounded-xl border border-danger/50 bg-danger/5 flex gap-4">
              <AlertTriangle className="w-6 h-6 text-danger shrink-0" />
              <div>
                <h3 className="font-semibold text-danger">Server Overload Warning</h3>
                <p className="text-sm text-muted-foreground mt-1">Database CPU usage is above 85% during peak hours (12:00 PM - 2:00 PM).</p>
                <button className="mt-3 text-xs bg-danger text-white px-3 py-1.5 rounded hover:bg-danger/80">Scale Resources</button>
              </div>
            </div>
            <div className="glass-card p-4 rounded-xl border border-warning/50 bg-warning/5 flex gap-4">
              <Settings className="w-6 h-6 text-warning shrink-0" />
              <div>
                <h3 className="font-semibold text-warning">Scheduled Maintenance</h3>
                <p className="text-sm text-muted-foreground mt-1">Booking system will be down for 30 minutes on Sunday at 3:00 AM.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
