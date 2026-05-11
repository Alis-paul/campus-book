import { useState, useEffect, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Users, Calendar, Activity, Info, Download, ShieldCheck } from "lucide-react"
import { apiFetch } from "../utils/api"

export default function Analytics() {
  const [stats, setStats] = useState<any>(null)
  const [activityData, setActivityData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [statsRes, activityRes] = await Promise.all([
      apiFetch('/api/analytics/stats'),
      apiFetch('/api/analytics/activity')
    ]);

    if (statsRes.status === 'success') setStats(statsRes.data.summary);
    if (activityRes.status === 'success') setActivityData(activityRes.data.chartData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const cards = useMemo(() => [
    { label: "Total Bookings", value: stats?.bookings || 0, icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
    { label: "Check-in Rate", value: `${stats?.checkInRate || 0}%`, icon: ShieldCheck, color: "text-success", bg: "bg-success/10" },
    { label: "Active Sessions", value: stats?.activeSessions || 0, icon: Activity, color: "text-warning", bg: "bg-warning/10" },
    { label: "Unique Users", value: stats?.uniqueUsers || 0, icon: Users, color: "text-accent", bg: "bg-accent/10" },
  ], [stats]);

  const chartPoints = useMemo(() => {
    if (activityData.length === 0) return [];
    const max = Math.max(...activityData.map(d => d.bookings), 1);
    return activityData.map(d => ({
      ...d,
      height: (d.bookings / max) * 100
    }));
  }, [activityData]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase italic">Intelligence Hub</h1>
          <p className="text-muted-foreground text-sm font-medium">Real-time resource utilization and efficiency metrics.</p>
        </div>
        <button className="flex items-center gap-2 bg-secondary border border-border/50 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-secondary/80 transition-all">
          <Download className="w-3.5 h-3.5" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl border border-border/50 relative overflow-hidden group"
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-br from-transparent to-${card.color.split('-')[1]}/5`} />
            <div className={`p-3 rounded-xl ${card.bg} ${card.color} w-fit mb-4 border border-current/10`}>
              <card.icon className="w-5 h-5" />
            </div>
            <h3 className="text-3xl font-black tracking-tighter mb-1">{loading ? '...' : card.value}</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-border/50 h-[450px] flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
          <div className="flex justify-between items-start mb-10 z-10">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Demand Velocity
              </h3>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Rolling 7-Day Frequency</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-black uppercase tracking-widest">
              <TrendingUp className="w-3 h-3" /> +12% Growth
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 px-4 z-10 pb-6 relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : chartPoints.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                <BarChart3 className="w-12 h-12 mb-2" />
                <p className="text-sm font-black uppercase tracking-widest">Zero Data Points</p>
              </div>
            ) : chartPoints.map((point, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(point.height, 5)}%` }}
                  transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                  className="w-full bg-gradient-to-t from-primary/80 to-accent rounded-t-lg relative shadow-[0_0_15px_rgba(56,189,248,0.1)] group-hover:opacity-100 opacity-80 transition-all cursor-pointer"
                >
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card border border-border px-2 py-1 rounded text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                     {point.bookings}
                   </div>
                </motion.div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  {point.date.split('-').slice(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-border/50 h-[450px] flex flex-col">
          <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 mb-8">
            <TrendingUp className="w-5 h-5 text-accent" /> Insights
          </h3>
          
          <div className="space-y-6 flex-1">
            {[
              { label: "Peak Efficiency", detail: "M-Block labs reaching 92% occupancy during peak hours.", color: "text-success", icon: ShieldCheck },
              { label: "Demand Shift", detail: "Waitlist volume moved from 2 PM to 10 AM this week.", color: "text-primary", icon: Activity },
              { label: "Resource Gap", detail: "Classroom availability is critical in C-Block (Blockage).", color: "text-warning", icon: Info },
            ].map((insight, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50 group hover:border-primary/30 transition-colors">
                <div className={`p-2 rounded-lg bg-background border border-border group-hover:border-primary/20 ${insight.color}`}>
                  <insight.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest mb-1">{insight.label}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{insight.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-border/50">
             <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] text-center italic opacity-40">
               Intelligence engine: Active
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
