import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { Activity, Users, Clock, TrendingUp } from 'lucide-react'
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

const peakHoursData = [
  { time: '8 AM', value: 20 },
  { time: '10 AM', value: 80 },
  { time: '12 PM', value: 95 },
  { time: '2 PM', value: 85 },
  { time: '4 PM', value: 60 },
  { time: '6 PM', value: 30 },
]

const COLORS = ['#38BDF8', '#8B5CF6', '#10B981', '#F59E0B']

export default function Analytics() {
  const { role, token } = useAuthStore()
  const [activityData, setActivityData] = useState<any[]>([])
  const [summary, setSummary] = useState({ bookings: 0, activeSessions: 0, waitlisted: 0 })
  const [resourceAllocation, setResourceAllocation] = useState<any[]>([])
  const [buildingStatus, setBuildingStatus] = useState<any[]>([])

  const fetchData = async () => {
    try {
      const [activityRes, statsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/activity`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      
      const activityJson = await activityRes.json()
      const statsJson = await statsRes.json()

      if (activityJson.status === 'success') {
        setActivityData(activityJson.data.chartData)
      }
      if (statsJson.status === 'success') {
        setSummary(statsJson.data.summary)
        setResourceAllocation(statsJson.data.resourceAllocation)
        setBuildingStatus(statsJson.data.buildingStatus)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (token) fetchData()
  }, [token])

  if (role?.toLowerCase() === 'student') return <Navigate to="/dashboard" replace />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground text-sm">Comprehensive view of campus resource utilization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-xl border border-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm">Total Bookings</h3>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold">{summary.bookings}</p>
          <p className="text-xs text-success flex items-center mt-2"><TrendingUp className="w-3 h-3 mr-1" /> Overall usage</p>
        </div>
        <div className="glass-card p-6 rounded-xl border border-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm">Active Sessions</h3>
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <p className="text-3xl font-bold">{summary.activeSessions}</p>
          <p className="text-xs text-muted-foreground mt-2">Real-time occupancy</p>
        </div>
        <div className="glass-card p-6 rounded-xl border border-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm">Waitlisted</h3>
            <Users className="w-4 h-4 text-success" />
          </div>
          <p className="text-3xl font-bold">{summary.waitlisted}</p>
          <p className="text-xs text-success flex items-center mt-2"><TrendingUp className="w-3 h-3 mr-1" /> Demand metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="glass-card p-6 rounded-xl border border-border h-[400px] flex flex-col">
          <h3 className="font-semibold mb-6">Booking Trends (Last 7 Days)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#38BDF8" fillOpacity={1} fill="url(#colorUtil)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="glass-card p-6 rounded-xl border border-border h-[400px] flex flex-col">
          <h3 className="font-semibold mb-6">Peak Hour Distribution</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="glass-card p-6 rounded-xl border border-border h-[400px] flex flex-col">
          <h3 className="font-semibold mb-6">Resource Allocation</h3>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resourceAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {resourceAllocation.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px]">
            {resourceAllocation.map((entry, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
        
        {/* Live Heatmap Summary */}
        <div className="glass-card p-6 rounded-xl border border-border h-[400px] flex flex-col overflow-y-auto">
          <h3 className="font-semibold mb-6">Live Building Status</h3>
          <div className="space-y-4 flex-1">
             {buildingStatus.map((b, i) => (
               <div key={i} className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span>{b.name}</span>
                   <span className="font-bold">{b.val}%</span>
                 </div>
                 <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                   <div 
                     className={`h-full rounded-full ${b.status === 'danger' ? 'bg-danger' : b.status === 'warning' ? 'bg-warning' : 'bg-success'}`} 
                     style={{ width: `${b.val}%` }} 
                   />
                 </div>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  )
}
