// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff";
import Customers from "./pages/Customers";
import Pricing from "./pages/Pricing";
import Insights from "./pages/Insights";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import Search from "./pages/Search";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Console Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Navigate to="/app" replace />} />
            <Route path="customers" element={<Customers />} />
            <Route path="plans" element={<Pricing />} />
            <Route path="pricing" element={<Navigate to="/app/plans" replace />} />
            <Route path="team" element={<Staff />} />
            <Route path="users" element={<Navigate to="/app/team" replace />} />
            <Route path="analytics" element={<Insights />} />
            <Route path="insights" element={<Navigate to="/app/analytics" replace />} />
            <Route path="activity" element={<Activity />} />
            <Route path="settings" element={<Settings />} />
            <Route path="search" element={<Search />} />
          </Route>
        </Route>

        {/* Legacy redirect routes */}
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />
        <Route path="/customers" element={<Navigate to="/app/customers" replace />} />
        <Route path="/pricing" element={<Navigate to="/app/plans" replace />} />
        <Route path="/users" element={<Navigate to="/app/team" replace />} />
        <Route path="/insights" element={<Navigate to="/app/analytics" replace />} />
        <Route path="/search" element={<Navigate to="/app/search" replace />} />

        {/* Fallback to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
