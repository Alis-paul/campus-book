import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { DashboardLayout } from "./layouts/DashboardLayout"
import { AuthLayout } from "./layouts/AuthLayout"

// Pages
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Booking from "./pages/Booking"
import CampusMap from "./pages/CampusMap"
import Analytics from "./pages/Analytics"
import CalendarView from "./pages/Calendar"
import Admin from "./pages/Admin"
import Waitlists from "./pages/Waitlists"
import QRCheckIn from "./pages/QRCheckIn"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/map" element={<CampusMap />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/waitlists" element={<Waitlists />} />
          <Route path="/qr-checkin" element={<QRCheckIn />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
