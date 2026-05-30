-- ============================================================================
--  إشعارات تيليجرام مباشرة من قاعدة البيانات (بدون Edge Function / CLI)
-- ----------------------------------------------------------------------------
--  يعتمد على إضافة pg_net المتوفرة في Supabase لإرسال طلب HTTP إلى تيليجرام
--  عند إضافة أي عنصر جديد إلى جدول shopping_items.
--
--  طريقة الاستخدام:
--    1) استبدل القيمتين أدناه بتوكن البوت ومعرّف المحادثة.
--    2) شغّل كامل هذا الملف في:  Supabase → SQL Editor → New query → Run
-- ============================================================================

-- تفعيل إضافة pg_net (آمنة، تتيح طلبات HTTP من قاعدة البيانات)
create extension if not exists pg_net with schema extensions;

-- ----------------------------------------------------------------------------
-- دالة المُشغّل: تُرسل رسالة تيليجرام عند إضافة عنصر
--  ⚠️ استبدل القيمتين التاليتين بقيمك الحقيقية:
--     BOT_TOKEN_HERE   →  توكن البوت من BotFather
--     CHAT_ID_HERE     →  معرّف المحادثة (chat id)
-- ----------------------------------------------------------------------------
create or replace function public.notify_telegram_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  bot_token text := 'BOT_TOKEN_HERE';
  chat_id   text := 'CHAT_ID_HERE';
  status_ar text;
  notes_txt text;
  message   text;
begin
  -- ترجمة الحالة للعربية
  status_ar := case new.status
                 when 'needed'    then 'مطلوب 🛒'
                 when 'purchased' then 'تم الشراء ✅'
                 when 'cancelled' then 'ملغى 🚫'
                 else new.status
               end;

  notes_txt := case
                 when new.notes is not null and new.notes <> ''
                 then E'\n📝 ملاحظات: ' || new.notes
                 else ''
               end;

  message := '🛒 غرض جديد في قائمة المشتريات' || E'\n\n' ||
             new.item_name || ' (×' || new.quantity || ')' || E'\n' ||
             '👤 أضافه: ' || coalesce(new.created_by_name, 'أحد أفراد العائلة') || E'\n' ||
             '📌 الحالة: ' || status_ar ||
             notes_txt;

  -- إرسال الرسالة عبر pg_net (غير متزامن، لا يُبطئ عملية الإضافة)
  perform net.http_post(
    url     := 'https://api.telegram.org/bot' || bot_token || '/sendMessage',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body    := jsonb_build_object('chat_id', chat_id, 'text', message)
  );

  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- ربط المُشغّل بجدول العناصر (بعد كل إضافة)
-- ----------------------------------------------------------------------------
drop trigger if exists shopping_items_telegram_notify on public.shopping_items;
create trigger shopping_items_telegram_notify
  after insert on public.shopping_items
  for each row execute function public.notify_telegram_on_insert();

-- ============================================================================
--  للاختبار اليدوي (اختياري) — يرسل رسالة تجريبية فوراً:
--    select net.http_post(
--      url     := 'https://api.telegram.org/bot<TOKEN>/sendMessage',
--      headers := '{"Content-Type": "application/json"}'::jsonb,
--      body    := jsonb_build_object('chat_id', '<CHAT_ID>', 'text', 'تجربة ✅')
--    );
-- ============================================================================
