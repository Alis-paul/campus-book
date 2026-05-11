import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, AlertTriangle, Trash2, Edit, Plus, Users, LayoutGrid, Info, ShieldCheck } from "lucide-react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { apiFetch } from "../utils/api"

export default function Admin() {
  const { role } = useAuthStore()
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [usersRes, resourcesRes] = await Promise.all([
      apiFetch('/api/users'),
      apiFetch('/api/bookings/resources')
    ]);

    if (usersRes.status === 'success') setUsers(usersRes.data.users);
    if (resourcesRes.status === 'success') setResources(resourcesRes.data.resources);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData])

  if (role?.toLowerCase() === 'student') return <Navigate to="/dashboard" replace />

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase italic">Control Center</h1>
          <p className="text-muted-foreground text-sm font-medium">System oversight, user auditing, and infrastructure management.</p>
        </div>
      </div>

      <div className="flex gap-8 border-b border-border/50">
        {[
          { id: 'users', label: 'Identity', icon: Users },
          { id: 'resources', label: 'Facilities', icon: LayoutGrid },
          { id: 'alerts', label: 'Status', icon: AlertTriangle }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 border-b-2 ${
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-lg uppercase tracking-tight">Identity Directory</h2>
              <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Provision User
              </button>
            </div>
            <div className="glass-card rounded-2xl border border-border/50 overflow-hidden shadow-2xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">User Profile</th>
                    <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">System Access</th>
                    <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Status</th>
                    <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-right">Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1,2,3].map(i => (
                       <tr key={i} className="border-b border-border/20 animate-pulse">
                         <td colSpan={4} className="px-6 py-8"><div className="h-4 bg-secondary rounded w-3/4"></div></td>
                       </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center opacity-30">
                        <Users className="w-12 h-12 mx-auto mb-4" />
                        <p className="font-black uppercase tracking-widest text-xs">No Records Synchronized</p>
                      </td>
                    </tr>
                  ) : users.map((user, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-bold text-foreground">{user.name}</div>
                        <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-tight">{user.email}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                          user.role === 'FACULTY' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary text-muted-foreground border-border/50'
                        }`}>
                          {user.role || 'MEMBER'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-success">
                          <div className={`w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]`}></div>
                          Authorized
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                        <button className="p-2 text-muted-foreground hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'resources' && (
          <motion.div 
            key="resources"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-lg uppercase tracking-tight">Facilities Management</h2>
              <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Register Resource
              </button>
            </div>
            <div className="glass-card rounded-2xl border border-border/50 overflow-hidden shadow-2xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Resource Unit</th>
                    <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Geographic Location</th>
                    <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Operational State</th>
                    <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-right">Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1,2,3].map(i => (
                       <tr key={i} className="border-b border-border/20 animate-pulse">
                         <td colSpan={4} className="px-6 py-8"><div className="h-4 bg-secondary rounded w-3/4"></div></td>
                       </tr>
                    ))
                  ) : resources.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center opacity-30">
                        <LayoutGrid className="w-12 h-12 mx-auto mb-4" />
                        <p className="font-black uppercase tracking-widest text-xs">No Assets Detected</p>
                      </td>
                    </tr>
                  ) : resources.map((resource, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-bold text-foreground">{resource.name}</div>
                        <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-tight">{resource.type}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-foreground font-medium text-[11px] uppercase tracking-wider">{resource.location}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${resource.status === 'Available' ? 'text-success' : 'text-danger'}`}>
                          <div className={`w-2 h-2 rounded-full ${resource.status === 'Available' ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                          {resource.status}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                        <button className="p-2 text-muted-foreground hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'alerts' && (
          <motion.div 
            key="alerts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <h2 className="font-black text-lg uppercase tracking-tight mb-6">Security & Resilience Alerts</h2>
            <div className="grid gap-6">
              <div className="glass-card p-6 rounded-2xl border border-danger/30 bg-danger/5 flex gap-6 shadow-xl shadow-danger/5">
                <div className="w-12 h-12 rounded-xl bg-danger/20 flex items-center justify-center shrink-0 border border-danger/20">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-danger mb-1">Infrastructure Load Warning</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">Database IOPS reached 85% utilization during high-frequency booking cycles. Performance may degrade for student users.</p>
                  <button className="mt-4 text-[10px] font-black uppercase tracking-widest bg-danger text-white px-4 py-2 rounded-lg hover:bg-danger/80 shadow-lg shadow-danger/20">Scale Infrastructure</button>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl border border-success/30 bg-success/5 flex gap-6 shadow-xl shadow-success/5">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center shrink-0 border border-success/20">
                  <ShieldCheck className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-success mb-1">Security Systems Nominal</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">RBAC enforcement and demo-mode session security are active. Zero unauthorized attempts detected in the last 24 hours.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 p-6 glass-card rounded-2xl border border-border/50 bg-secondary/10 flex items-center gap-4">
        <Info className="w-5 h-5 text-primary shrink-0" />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
          Admin sessions are monitored for system stability. Direct database mutations are recorded in the audit log.
        </p>
      </div>
    </div>
  )
}
