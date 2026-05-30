import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

/**
 * مزوّد المصادقة — يدير جلسة المستخدم وملفه الشخصي (الدور).
 * يوفّر دوال تسجيل الدخول/الخروج وإنشاء الحساب لبقية التطبيق.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // جلب الملف الشخصي (يحوي الدور role) من قاعدة البيانات
  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', userId)
      .single()

    if (error) {
      console.warn('تعذّر تحميل الملف الشخصي:', error.message)
      setProfile(null)
    } else {
      setProfile(data)
    }
  }, [])

  useEffect(() => {
    // الجلسة الحالية عند الإقلاع — نُنهي شاشة التحميل فوراً بمجرد معرفة الجلسة،
    // ثم نحمّل الملف الشخصي في الخلفية (دون انتظار) حتى لا تعلق الواجهة.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      loadProfile(session?.user?.id)
    })

    // الاستماع لتغيّرات حالة المصادقة (دخول/خروج/تحديث رمز).
    // مهم: لا نستخدم await داخل هذا الردّ لأن استدعاء استعلام Supabase معه
    // يسبب قفلاً (deadlock) يُجمّد التطبيق. نؤجّل التحميل عبر setTimeout.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
      setTimeout(() => loadProfile(session?.user?.id), 0)
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  // إنشاء حساب جديد
  const signUp = useCallback(async ({ email, password, fullName }) => {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
  }, [])

  // تسجيل الدخول
  const signIn = useCallback(async ({ email, password }) => {
    return supabase.auth.signInWithPassword({ email, password })
  }, [])

  // تسجيل الخروج
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isAdmin: profile?.role === 'admin',
    displayName: profile?.full_name || session?.user?.email || 'مستخدم',
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// خطّاف الوصول لسياق المصادقة
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth يجب استخدامه داخل AuthProvider')
  return ctx
}
