import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import DiabetesAssessment from './pages/DiabetesAssessment'
import FitnessAI from './pages/FitnessAI'
import BPAssessment from './pages/BPAssessment'
import ObesityAssessment from './pages/ObesityAssessment'
import Contact from './pages/Contact'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={
            <ProtectedRoute>
              <Layout>
                <Contact />
              </Layout>
            </ProtectedRoute>
          } />

          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/diabetes" element={
            <ProtectedRoute>
              <Layout>
                <DiabetesAssessment />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/bp" element={
            <ProtectedRoute>
              <Layout>
                <BPAssessment />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/obesity" element={
            <ProtectedRoute>
              <Layout>
                <ObesityAssessment />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/fitness" element={
            <ProtectedRoute>
              <Layout>
                <FitnessAI />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
