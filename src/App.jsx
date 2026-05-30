import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

/**
 * الجذر — يقرر عرض صفحة الدخول أو لوحة التطبيق حسب حالة المصادقة.
 * المستخدم غير المُسجّل لا يصل إطلاقاً إلى لوحة التطبيق.
 */
export default function App() {
  const { session, loading } = useAuth()

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
