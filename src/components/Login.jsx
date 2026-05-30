import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { isSupabaseConfigured } from '../lib/supabase'

/**
 * صفحة تسجيل الدخول / إنشاء الحساب.
 * المستخدم غير المُسجّل لا يمكنه تجاوز هذه الصفحة.
 */
export default function Login() {
  const { signIn, signUp } = useAuth()
  const { showToast } = useToast()

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const isSignup = mode === 'signup'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      showToast('لم يتم إعداد Supabase بعد. راجع ملف ‎.env‎', { type: 'error' })
      return
    }
    setBusy(true)
    try {
      if (isSignup) {
        const { error } = await signUp({ email, password, fullName })
        if (error) throw error
        showToast('تم إنشاء الحساب! إذا طُلب تأكيد البريد، تحقق من بريدك.', {
          type: 'success',
        })
      } else {
        const { error } = await signIn({ email, password })
        if (error) throw error
      }
    } catch (err) {
      showToast(translateError(err.message), { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__brand">
          <span className="auth__logo">🛒</span>
          <h1>قائمة مشتريات العائلة</h1>
          <p className="auth__subtitle">
            {isSignup ? 'أنشئ حساباً جديداً للانضمام' : 'سجّل دخولك للمتابعة'}
          </p>
        </div>

        <form className="auth__form" onSubmit={handleSubmit}>
          {isSignup && (
            <label className="field">
              <span className="field__label">الاسم</span>
              <input
                className="field__input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: أحمد"
                required
                autoComplete="name"
              />
            </label>
          )}

          <label className="field">
            <span className="field__label">البريد الإلكتروني</span>
            <input
              className="field__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              dir="ltr"
            />
          </label>

          <label className="field">
            <span className="field__label">كلمة المرور</span>
            <input
              className="field__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              dir="ltr"
            />
          </label>

          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? '...جارٍ المعالجة' : isSignup ? 'إنشاء حساب' : 'تسجيل الدخول'}
          </button>
        </form>

        <p className="auth__switch">
          {isSignup ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}{' '}
          <button
            type="button"
            className="link"
            onClick={() => setMode(isSignup ? 'login' : 'signup')}
          >
            {isSignup ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </button>
        </p>

        {!isSupabaseConfigured && (
          <p className="auth__warning">
            ⚠️ لم تُضبط متغيرات Supabase. انسخ <code>.env.example</code> إلى{' '}
            <code>.env</code> واملأ القيم.
          </p>
        )}
      </div>
    </div>
  )
}

// ترجمة رسائل أخطاء Supabase الشائعة إلى العربية
function translateError(msg = '') {
  const m = msg.toLowerCase()
  if (m.includes('invalid login')) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
  if (m.includes('already registered')) return 'هذا البريد مُسجّل بالفعل'
  if (m.includes('password')) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
  if (m.includes('email')) return 'يرجى إدخال بريد إلكتروني صحيح'
  return msg || 'حدث خطأ ما، حاول مرة أخرى'
}
