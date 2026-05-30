import { createClient } from '@supabase/supabase-js'

// قراءة بيانات الاتصال من متغيرات البيئة (انظر ملف ‎.env.example‎)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// التحقق من اكتمال الإعداد (يُستخدم لعرض رسالة إرشادية في الواجهة)
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// تحذير واضح إذا لم تُضبط المتغيرات
if (!isSupabaseConfigured) {
  console.error(
    '⚠️  متغيرات Supabase غير مضبوطة. أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY.'
  )
}

// قيم بديلة صالحة شكلياً لتفادي رمي createClient خطأً يُحوّل الصفحة إلى شاشة بيضاء.
// عند غياب الإعداد لا يُستخدم العميل فعلياً (تعرض الواجهة رسالة الإعداد).
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseAnonKey || 'placeholder-anon-key'

// عميل Supabase المُشترك في كامل التطبيق
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
