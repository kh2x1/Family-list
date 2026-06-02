-- ============================================================================
--  قائمة مشتريات العائلة — مخطط قاعدة البيانات الكامل لـ Supabase
-- ----------------------------------------------------------------------------
--  شغّل هذا الملف بالكامل في:  Supabase Dashboard → SQL Editor → New query
--  وهو يقوم بإنشاء:
--    1) جدول الملفات الشخصية (profiles) لإدارة الأدوار.
--    2) جدول قائمة المشتريات (shopping_items).
--    3) دالة مساعدة للتحقق من صلاحية المشرف.
--    4) سياسات الأمان على مستوى الصف (Row Level Security).
--    5) المُشغّلات (Triggers) لإنشاء الملف الشخصي وتحديث الطوابع الزمنية.
--    6) تفعيل التحديثات الفورية (Realtime).
-- ============================================================================

-- إضافة مولّد المعرّفات الفريدة (متوفر افتراضياً في Supabase)
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1) جدول الملفات الشخصية — يربط كل مستخدم بدوره
-- ============================================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  role       text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'الملفات الشخصية للمستخدمين مع أدوارهم';

-- ============================================================================
-- 2) جدول قائمة المشتريات
-- ============================================================================
create table if not exists public.shopping_items (
  id              uuid primary key default gen_random_uuid(),
  item_name       text not null,
  quantity        integer not null default 1 check (quantity > 0),
  notes           text,
  status          text not null default 'needed'
                    check (status in ('needed', 'purchased', 'cancelled')),
  created_by      uuid not null references auth.users (id) on delete cascade,
  created_by_name text,                         -- اسم المُضيف (للعرض في الإشعار)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.shopping_items is 'عناصر قائمة المشتريات المشتركة';

-- فهارس لتسريع البحث والترتيب
create index if not exists shopping_items_created_at_idx on public.shopping_items (created_at desc);
create index if not exists shopping_items_status_idx     on public.shopping_items (status);
create index if not exists shopping_items_created_by_idx on public.shopping_items (created_by);

-- ============================================================================
-- 3) دالة مساعدة: هل المستخدم الحالي مشرف؟
--    تُستخدم داخل السياسات. وُسمت SECURITY DEFINER لتفادي العودية اللانهائية
--    عند قراءة جدول profiles من داخل سياساته.
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================================
-- 4) مُشغّل: إنشاء ملف شخصي تلقائياً عند تسجيل مستخدم جديد
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'member'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 5) مُشغّل: تحديث الطابع الزمني updated_at تلقائياً عند أي تعديل
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shopping_items_set_updated_at on public.shopping_items;
create trigger shopping_items_set_updated_at
  before update on public.shopping_items
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 6) تفعيل سياسات الأمان على مستوى الصف (RLS)
-- ============================================================================
alter table public.profiles       enable row level security;
alter table public.shopping_items enable row level security;

-- ---------------------------------------------------------------------------
-- سياسات جدول profiles
-- ---------------------------------------------------------------------------
-- يرى المستخدم ملفه الشخصي، والمشرف يرى الجميع
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- يعدّل المستخدم ملفه فقط (لا يستطيع المستخدم العادي ترقية نفسه عبر الواجهة)
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- سياسات جدول shopping_items
-- ---------------------------------------------------------------------------
-- القراءة: كل مستخدم مُسجّل يرى جميع العناصر
drop policy if exists "items_select_all" on public.shopping_items;
create policy "items_select_all" on public.shopping_items
  for select to authenticated
  using (true);

-- الإضافة: يضيف المستخدم عناصر باسمه فقط
drop policy if exists "items_insert_own" on public.shopping_items;
create policy "items_insert_own" on public.shopping_items
  for insert to authenticated
  with check (created_by = auth.uid());

-- التعديل: صاحب العنصر أو المشرف
drop policy if exists "items_update_own_or_admin" on public.shopping_items;
create policy "items_update_own_or_admin" on public.shopping_items
  for update to authenticated
  using (created_by = auth.uid() or public.is_admin())
  with check (created_by = auth.uid() or public.is_admin());

-- الحذف: صاحب العنصر أو المشرف
drop policy if exists "items_delete_own_or_admin" on public.shopping_items;
create policy "items_delete_own_or_admin" on public.shopping_items
  for delete to authenticated
  using (created_by = auth.uid() or public.is_admin());

-- ============================================================================
-- 7) تفعيل التحديثات الفورية (Realtime) على جدول العناصر
-- ============================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'shopping_items'
  ) then
    alter publication supabase_realtime add table public.shopping_items;
  end if;
end $$;

-- لضمان وصول بيانات الصف الكاملة في أحداث التحديث/الحذف
alter table public.shopping_items replica identity full;

-- ============================================================================
--  ملاحظة: لترقية مستخدم إلى مشرف، شغّل بعد تسجيله (استبدل البريد):
--
--    update public.profiles set role = 'admin'
--    where email = 'admin@example.com';
--
-- ============================================================================
