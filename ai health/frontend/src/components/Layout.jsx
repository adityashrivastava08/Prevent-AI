import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sun, Moon, LayoutDashboard, Droplets, Activity, Weight, Dumbbell, LogOut, User, MessageSquare } from 'lucide-react'
import Chatbot from './Chatbot'

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  const [isDark, setIsDark] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [isDark])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/' },
    { name: 'Diabetes', icon: Droplets, path: '/diabetes' },
    { name: 'BP', icon: Activity, path: '/bp' },
    { name: 'Obesity', icon: Weight, path: '/obesity' },
    { name: 'Fitness AI', icon: Dumbbell, path: '/fitness' },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-dark md:min-h-screen flex flex-col p-4 z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-heading font-bold tracking-tight">PreventAI</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white/5 text-slate-400'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-1 pt-6 border-t border-white/5">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-slate-400"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <div className="p-4 flex items-center gap-3 bg-white/5 rounded-2xl mt-4">
             <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-5 h-5" />
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <button 
                  onClick={handleSignOut}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" /> Logout
                </button>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
      <Chatbot />
    </div>
  )
}
