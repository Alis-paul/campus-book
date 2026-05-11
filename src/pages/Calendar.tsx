import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"

export default function CalendarView() {
  const [view, setView] = useState("week")
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const hours = Array.from({ length: 11 }, (_, i) => i + 8) // 8 AM to 6 PM

  // Mock events
  const events = [
    { id: 1, title: "Robotics Lab", day: 0, startHr: 10, duration: 2, type: "lab" },
    { id: 2, title: "CS101 Lecture", day: 1, startHr: 9, duration: 1.5, type: "class" },
    { id: 3, title: "AI Study Group", day: 2, startHr: 14, duration: 2, type: "study" },
    { id: 4, title: "Faculty Meeting", day: 3, startHr: 11, duration: 1, type: "meeting" },
    { id: 5, title: "Physics Lab 2", day: 4, startHr: 13, duration: 3, type: "lab" },
  ]

  const getEventStyle = (type: string) => {
    switch(type) {
      case 'lab': return 'bg-accent/20 border-accent text-accent'
      case 'class': return 'bg-primary/20 border-primary text-primary'
      case 'study': return 'bg-success/20 border-success text-success'
      default: return 'bg-warning/20 border-warning text-warning'
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scheduling Calendar</h1>
          <p className="text-muted-foreground text-sm">Manage your personal and group bookings.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex bg-secondary rounded-lg border border-border p-1">
            {['day', 'week', 'month'].map((v) => (
              <button 
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded text-sm font-medium capitalize transition-colors ${view === v ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 neon-glow transition-all">
            New Event
          </button>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-xl border border-border overflow-hidden flex flex-col">
        {/* Header toolbar */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-card">
          <div className="flex items-center gap-4">
            <button className="p-1 hover:bg-secondary rounded transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="font-semibold text-lg">October 12 - 18, 2026</h2>
            <button className="p-1 hover:bg-secondary rounded transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <button className="text-sm border border-border px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors">Today</button>
        </div>

        {/* Calendar Grid (Week View) */}
        <div className="flex-1 flex overflow-auto relative">
          {/* Time column */}
          <div className="w-16 flex-shrink-0 border-r border-border bg-card">
            <div className="h-12 border-b border-border"></div>
            {hours.map((hour) => (
              <div key={hour} className="h-20 border-b border-border/50 text-xs text-muted-foreground text-right pr-2 py-2 font-medium">
                {hour > 12 ? `${hour-12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="flex-1 min-w-[700px] flex">
            {days.map((day, dIdx) => (
              <div key={day} className="flex-1 border-r border-border relative">
                {/* Day Header */}
                <div className="h-12 border-b border-border flex flex-col items-center justify-center bg-card sticky top-0 z-10">
                  <span className="text-xs text-muted-foreground font-medium uppercase">{day}</span>
                  <span className={`text-lg font-bold ${dIdx === 2 ? 'text-primary' : ''}`}>{12 + dIdx}</span>
                </div>
                
                {/* Time Slots */}
                <div className="relative">
                  {hours.map((hour) => (
                    <div key={hour} className="h-20 border-b border-border/50 transition-colors hover:bg-secondary/30 cursor-pointer"></div>
                  ))}

                  {/* Render Events */}
                  {events.filter(e => e.day === dIdx).map(event => (
                    <motion.div 
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`absolute left-1 right-1 rounded-md border p-2 overflow-hidden shadow-lg cursor-pointer ${getEventStyle(event.type)}`}
                      style={{ 
                        top: `${(event.startHr - 8) * 5}rem`,
                        height: `${event.duration * 5}rem`,
                        zIndex: 5
                      }}
                    >
                      <h4 className="text-xs font-bold truncate">{event.title}</h4>
                      <p className="text-[10px] opacity-80 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.startHr > 12 ? event.startHr-12 : event.startHr}:00 - {event.startHr+event.duration > 12 ? event.startHr+event.duration-12 : event.startHr+event.duration}:00
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
