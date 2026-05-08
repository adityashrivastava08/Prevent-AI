import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { Activity, Mail, Lock, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { signIn, signInWithGoogle, resendConfirmation } = useAuth()
  const navigate = useNavigate()

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn({ email, password })
    if (error) setError(error.message)
    else navigate('/')
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex bg-dark overflow-hidden">
      {/* Left Side: Branding Hero (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#10B98120_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,#3B82F620_0%,transparent_50%)]" />
        
        <div className="relative z-10 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
              <Activity className="text-white w-7 h-7" />
            </div>
            <span className="text-3xl font-heading font-bold tracking-tight text-white">PreventAI</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-heading font-bold text-white leading-tight mb-6"
          >
            Predict. Protect. <br />
            <span className="text-primary">Preempt.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 mb-10 leading-relaxed"
          >
            Clinical-grade disease risk analysis and real-time biomechanical tracking powered by advanced neural networks.
          </motion.p>

          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: ShieldCheck, title: '94% Accuracy', desc: 'Validated ML models' },
              { icon: Zap, title: 'Real-time', desc: 'Biomechanical capture' },
              { icon: Globe, title: 'Universal', desc: 'Cross-device assessment' },
              { icon: Lock, title: 'Secure', desc: 'Enterprise encryption' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm"
              >
                <item.icon className="w-6 h-6 text-primary mb-2" />
                <h4 className="text-white font-medium text-sm">{item.title}</h4>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Animated Background Decoration */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-heading font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400">Sign in to your health dashboard</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-6">
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm"
              >
                <p className="font-medium mb-2">{error}</p>
                {error.includes('confirmed') && (
                  <button 
                    type="button"
                    onClick={async () => {
                      const { error: resendErr } = await resendConfirmation(email)
                      if (resendErr) alert(resendErr.message)
                      else alert('New confirmation email sent!')
                    }}
                    className="text-xs bg-rose-500 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 transition-colors font-bold"
                  >
                    Resend Confirmation Link
                  </button>
                )}
              </motion.div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12" 
              isLoading={loading}
              icon={ArrowRight}
            >
              Sign In to Portal
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-dark px-4 text-slate-500 font-medium">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="secondary" 
              className="w-full h-12 flex items-center gap-3"
              onClick={handleGoogleLogin}
            >
              <Globe className="w-5 h-5" />
              <span>Continue with Google</span>
            </Button>
          </div>

          <p className="mt-10 text-center text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary-dark font-medium transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
