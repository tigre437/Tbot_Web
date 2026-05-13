import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ServerConfig from './pages/ServerConfig'
import AdminStats from './pages/AdminStats'
import AuthCallback from './pages/AuthCallback'
import PaymentStatus from './pages/PaymentStatus'
import PaymentRedirectModal from './components/PaymentRedirectModal'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!user) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      // Clean query and move to hash route
      window.history.replaceState({}, document.title, window.location.pathname)
      navigate(`/auth/callback?code=${code}`, { replace: true })
    }
  }, [navigate])

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/:serverId" element={
          <ProtectedRoute>
            <ServerConfig />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminStats />
          </ProtectedRoute>
        } />
        <Route path="/payment/success" element={<PaymentStatus status="success" />} />
        <Route path="/payment/cancel" element={<PaymentStatus status="cancel" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

import { LanguageProvider } from './context/LanguageContext'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppRoutes />
        <PaymentRedirectModalWrapper />
      </AuthProvider>
    </LanguageProvider>
  )
}

function PaymentRedirectModalWrapper() {
  const { paymentLoading } = useAuth()
  
  if (paymentLoading) {
    return <PaymentRedirectModal />
  }
  
  return null
}

export default App
