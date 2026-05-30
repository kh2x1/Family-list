import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * خطّاف الإشعارات — يدير:
 *   - إذن إشعارات المتصفح (Browser Notifications).
 *   - تشغيل صوت تنبيه عبر Web Audio API (لا حاجة لملف صوتي خارجي).
 */
export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )
  const audioCtxRef = useRef(null)

  // طلب إذن الإشعارات من المستخدم
  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'denied'
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [])

  // تشغيل نغمة تنبيه قصيرة (نقرتان) باستخدام Web Audio API
  const playSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext
        audioCtxRef.current = new Ctx()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()

      const beep = (startTime, freq) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        osc.connect(gain)
        gain.connect(ctx.destination)
        gain.gain.setValueAtTime(0.0001, startTime)
        gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.18)
        osc.start(startTime)
        osc.stop(startTime + 0.2)
      }

      const now = ctx.currentTime
      beep(now, 880)
      beep(now + 0.2, 1100)
    } catch (e) {
      // تجاهل بصمت إذا لم يدعم المتصفح الصوت
    }
  }, [])

  // إظهار إشعار متصفح إن سُمح به
  const showBrowserNotification = useCallback(
    (title, body) => {
      if (typeof Notification === 'undefined' || permission !== 'granted') return
      try {
        new Notification(title, {
          body,
          icon: `${import.meta.env.BASE_URL}cart.svg`,
          tag: 'family-shopping',
        })
      } catch (e) {
        // بعض المتصفحات تتطلب Service Worker — نتجاهل الخطأ بهدوء
      }
    },
    [permission]
  )

  // طلب الإذن تلقائياً مرة واحدة عند التحميل إن لم يُحسم بعد
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      // لا نطلب فوراً لتجنب الإزعاج — يُترك للمستخدم عبر الزر، لكن نحدّث الحالة
      setPermission('default')
    }
  }, [])

  return { permission, requestPermission, playSound, showBrowserNotification }
}
