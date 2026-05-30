import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// إعدادات Vite — https://vitejs.dev/config/
// عند النشر على GitHub Pages يكون الموقع تحت مسار فرعي باسم المستودع،
// لذا نضبط base على اسم المستودع في وضع الإنتاج فقط.
// يمكن تجاوزه عبر المتغير VITE_BASE (مثلاً عند النشر على نطاق مخصص = '/').
export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE ?? (command === 'build' ? '/Family-list/' : '/'),
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
}))
