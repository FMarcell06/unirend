import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error) setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signUp = (email, password) => supabase.auth.signUp({ email, password })
  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })

  const signInWithGoogle = () => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  const signOut = () => supabase.auth.signOut()

  const refreshProfile = () => {
    if (session?.user) fetchProfile(session.user.id)
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)