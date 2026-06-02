import { useAuth } from './context/AuthContext'
import { isSupabaseConfigured } from './lib/supabase'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

/**
 * الجذر — يقرر عرض صفحة الدخول أو لوحة التطبيق حسب حالة المصادقة.
 * المستخدم غير المُسجّل لا يصل إطلاقاً إلى لوحة التطبيق.
 */
export default function App() {
  const { session, loading } = useAuth()

  // إذا لم تُضبط مفاتيح Supabase نعرض شاشة إعداد واضحة بدل شاشة بيضاء/تحميل لا ينتهي
  if (!isSupabaseConfigured) {
    return (
      <div className="auth">
        <div className="auth__card">
          <div className="auth__brand">
            <span className="auth__logo">🛠️</span>
            <h1>التطبيق يحتاج إعداداً</h1>
            <p className="auth__subtitle">لم تُضبط مفاتيح Supabase بعد</p>
          </div>
          <p className="auth__warning">
            ⚠️ أضف المتغيّرين <code>VITE_SUPABASE_URL</code> و{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> ثم أعد البناء.
            <br />
            <br />
            عند النشر على GitHub Pages: أضفهما في{' '}
            <strong>Settings → Secrets and variables → Actions</strong> ثم أعد
            تشغيل Workflow النشر.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="state state--loading state--fullscreen">
        <span className="spinner" />
        <p>...جارٍ التحميل</p>
      </div>
    )
  }

  return session ? <Dashboard /> : <Login />
}
