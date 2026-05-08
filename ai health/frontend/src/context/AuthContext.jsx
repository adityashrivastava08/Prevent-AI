import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google' }),
    signOut: () => supabase.auth.signOut(),
    resendConfirmation: (email) => supabase.auth.resend({
      type: 'signup',
      email: email,
    }),
    user,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-dark flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium">Connecting to Health Core...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
