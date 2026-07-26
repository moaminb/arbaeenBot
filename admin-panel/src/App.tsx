import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import AdminLayout from './components/AdminLayout'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import UsersList from './pages/UsersList'
import ManualUpload from './pages/ManualUpload'
import BatchUpload from './pages/BatchUpload'
import UserPortal from './pages/UserPortal'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<UserPortal />} />
        
        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UsersList />} />
          <Route path="manual" element={<ManualUpload />} />
          <Route path="batch" element={<BatchUpload />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
