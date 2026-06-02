// ============================================================================
//  Supabase Edge Function: notify-telegram
//  يستقبل حدث إضافة عنصر جديد (عبر Database Webhook) ويرسل إشعاراً إلى تيليجرام.
// ----------------------------------------------------------------------------
//  النشر:
//    supabase functions deploy notify-telegram --no-verify-jwt
//  الأسرار المطلوبة (تُضبط بـ supabase secrets set):
//    TELEGRAM_BOT_TOKEN   توكن البوت من BotFather
//    TELEGRAM_CHAT_ID     معرّف المحادثة التي تصلها الإشعارات
// ============================================================================

// تنسيق نوع الحالة لعرض ودّي بالعربية
const STATUS_LABEL: Record<string, string> = {
  needed: 'مطلوب 🛒',
  purchased: 'تم الشراء ✅',
  cancelled: 'ملغى 🚫',
}

Deno.serve(async (req) => {
  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID')

    if (!botToken || !chatId) {
      return new Response('Missing Telegram secrets', { status: 500 })
    }

    // جسم الـ Database Webhook يحوي السجل الجديد تحت المفتاح record
    const payload = await req.json()
    const item = payload?.record ?? payload

    if (!item?.item_name) {
      return new Response('No item in payload', { status: 200 })
    }

    const by = item.created_by_name || 'أحد أفراد العائلة'
    const qty = item.quantity ?? 1
    const notes = item.notes ? `\n📝 ملاحظات: ${item.notes}` : ''
    const status = STATUS_LABEL[item.status] ?? item.status ?? ''

    const text =
      `🛒 *غرض جديد في قائمة المشتريات*\n\n` +
      `*${item.item_name}* (×${qty})\n` +
      `👤 أضافه: ${by}\n` +
      `📌 الحالة: ${status}` +
      notes

    // إرسال الرسالة إلى تيليجرام
    const tgRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
        }),
      }
    )

    if (!tgRes.ok) {
      const err = await tgRes.text()
      console.error('Telegram error:', err)
      return new Response(`Telegram error: ${err}`, { status: 502 })
    }

    return new Response('OK', { status: 200 })
  } catch (e) {
    console.error(e)
    return new Response(`Error: ${e}`, { status: 500 })
  }
})
