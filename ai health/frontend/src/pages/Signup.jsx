import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Activity, Mail, Lock, User, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { signUp, signIn } = useAuth()
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // 1. Sign Up
    const { data: signUpData, error: signUpError } = await signUp({ email, password })
    
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // 2. Try to Sign In immediately
    const { error: signInError } = await signIn({ email, password })
    
    if (signInError) {
      if (signInError.message.includes('confirmed')) {
        setError("Account created! But you MUST disable 'Confirm Email' in your Supabase Dashboard -> Auth -> Providers to enter without a link.")
      } else {
        setError(signInError.message)
      }
    } else {
      navigate('/')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-dark overflow-hidden">
      {/* Left Side: Branding Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#10B98120_0%,transparent_50%)]" />
        
        <div className="relative z-10 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <Activity className="text-white w-7 h-7" />
            </div>
            <span className="text-3xl font-heading font-bold tracking-tight text-white">PreventAI</span>
          </motion.div>

          <h1 className="text-5xl font-heading font-bold text-white leading-tight mb-6">
            Join the Future of <br />
            <span className="text-primary">Proactive Care.</span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 leading-relaxed">
            Create an account to start tracking your health metrics with clinical precision.
          </p>
          
          <div className="space-y-4">
             <div className="flex items-center gap-4 text-slate-300">
                <ShieldCheck className="text-primary w-6 h-6" />
                <span>HIPAA-compliant data security</span>
             </div>
             <div className="flex items-center gap-4 text-slate-300">
                <Zap className="text-primary w-6 h-6" />
                <span>Instant risk stratification</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-heading font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-400">Join 10,000+ users tracking their health.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <Input 
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input 
              label="Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm font-medium">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12" 
              isLoading={loading}
              icon={ArrowRight}
            >
              Get Started Free
            </Button>
          </form>

          <p className="mt-10 text-center text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
