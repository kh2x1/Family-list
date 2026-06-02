-- ============================================================================
--  إشعارات واتساب عبر CallMeBot — مباشرة من قاعدة البيانات (بدون CLI)
-- ----------------------------------------------------------------------------
--  يرسل رسالة واتساب إلى رقم المشرف عند إضافة أي عنصر جديد.
--
--  المتطلبات (مرة واحدة):
--    1) أضف الرقم +34 644 51 95 23 لجهات اتصالك.
--    2) أرسل له على واتساب: I allow callmebot to send me messages
--    3) استلم مفتاح الـ apikey في الرد.
--
--  طريقة الاستخدام:
--    استبدل القيمتين أدناه (الرقم والمفتاح) ثم شغّل الملف في SQL Editor.
-- ============================================================================

create extension if not exists pg_net with schema extensions;

-- دالة ترميز URL (لازمة لأن نص الرسالة عربي وفيه مسافات)
create or replace function public.urlencode(input text)
returns text
language plpgsql
immutable
as $$
declare
  result text := '';
  ch     text;
  byte   int;
  bytes  bytea := convert_to(input, 'UTF8');
  i      int;
begin
  for i in 0 .. length(bytes) - 1 loop
    byte := get_byte(bytes, i);
    ch   := chr(byte);
    if ch ~ '[A-Za-z0-9_.~-]' then
      result := result || ch;            -- الأحرف الآمنة تبقى كما هي
    else
      result := result || '%' || upper(lpad(to_hex(byte), 2, '0'));
    end if;
  end loop;
  return result;
end;
$$;

create or replace function public.notify_whatsapp_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  -- ⚠️ استبدل هاتين القيمتين:
  phone   text := '9665XXXXXXXX';   -- رقمك بصيغة دولية بدون + (مثال السعودية: 9665xxxxxxxx)
  api_key text := 'APIKEY_HERE';    -- المفتاح الذي وصلك من CallMeBot

  status_ar text;
  notes_txt text;
  message   text;
begin
  status_ar := case new.status
                 when 'needed'    then 'مطلوب 🛒'
                 when 'purchased' then 'تم الشراء ✅'
                 when 'cancelled' then 'ملغى 🚫'
                 else new.status
               end;

  notes_txt := case
                 when new.notes is not null and new.notes <> ''
                 then ' | ملاحظات: ' || new.notes
                 else ''
               end;

  message := '🛒 غرض جديد: ' || new.item_name || ' (×' || new.quantity || ') | ' ||
             'أضافه: ' || coalesce(new.created_by_name, 'فرد العائلة') || ' | ' ||
             status_ar || notes_txt;

  -- CallMeBot يستقبل الرسالة عبر معامل text في رابط GET (نُرسلها كـ POST بلا جسم)
  perform net.http_get(
    url := 'https://api.callmebot.com/whatsapp.php'
        || '?phone=' || phone
        || '&apikey=' || api_key
        || '&text=' || public.urlencode(message)
  );

  return new;
end;
$$;

drop trigger if exists shopping_items_whatsapp_notify on public.shopping_items;
create trigger shopping_items_whatsapp_notify
  after insert on public.shopping_items
  for each row execute function public.notify_whatsapp_on_insert();
