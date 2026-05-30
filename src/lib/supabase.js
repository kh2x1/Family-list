import { createClient } from '@supabase/supabase-js'

// قراءة بيانات الاتصال من متغيرات البيئة (انظر ملف ‎.env.example‎)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// تحذير واضح أثناء التطوير إذا لم تُضبط المتغيرات
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️  متغيرات Supabase غير مضبوطة. انسخ ‎.env.example‎ إلى ‎.env‎ واملأ القيم.'
  )
}

// عميل Supabase المُشترك في كامل التطبيق
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// التحقق من اكتمال الإعداد (يُستخدم لعرض رسالة إرشادية في الواجهة)
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
