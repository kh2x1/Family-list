# 🛒 قائمة مشتريات العائلة (Family Shopping List)

تطبيق ويب كامل لإدارة قائمة مشتريات مشتركة بين أفراد العائلة، مبني بـ **React + Vite**
ومربوط بـ **Supabase** (قاعدة بيانات + مصادقة + تحديثات فورية). عند إضافة أي غرض جديد
يصل إشعار فوري لبقية المستخدمين (وخصوصاً المشرف) عبر **Supabase Realtime** مع تنبيه
منبثق وصوت وإشعار متصفح.

> الواجهة عربية بالكامل (RTL)، تصميم Mobile-First، يدعم الوضع الليلي.

---

## ✨ الميزات

- 🔐 **مصادقة كاملة**: تسجيل دخول وإنشاء حساب بالبريد وكلمة المرور. لا وصول بدون تسجيل.
- 👥 **أدوار**: مشرف (Admin) يدير كل العناصر، وفرد العائلة (Member) يدير عناصره فقط.
- ➕ **إضافة أغراض**: اسم، كمية، ملاحظات — تُخزّن في Supabase وتظهر للجميع فوراً.
- ⚡ **تحديثات فورية**: بدون إعادة تحميل الصفحة عبر Supabase Realtime.
- 🔔 **إشعارات**: Toast + صوت تنبيه + إشعار المتصفح («أضاف أحمد: حليب»).
- 📊 **لوحة إحصائيات**: مطلوب / تم الشراء / ملغى / الإجمالي.
- 🔍 **بحث وتصفية وترتيب**: بالاسم، حسب الحالة، وحسب التاريخ.
- 🌙 **وضع ليلي** + تصميم متجاوب عصري.
- 🛡️ **أمان**: سياسات Row Level Security على مستوى قاعدة البيانات.

---

## 🧱 هيكل المشروع

```
Family-list/
├── index.html                  # صفحة HTML الجذر (RTL + lang=ar)
├── package.json
├── vite.config.js
├── .env.example                # نموذج متغيرات البيئة
├── netlify.toml                # إعداد نشر Netlify
├── vercel.json                 # إعداد نشر Vercel
├── public/
│   └── cart.svg                # أيقونة التطبيق
├── supabase/
│   └── schema.sql              # سكربت SQL كامل (جداول + RLS + Realtime + Triggers)
└── src/
    ├── main.jsx                # نقطة الدخول + المزوّدات
    ├── App.jsx                 # توجيه الدخول / لوحة التطبيق
    ├── index.css               # كل التنسيقات (RTL + Dark Mode)
    ├── constants.js            # تعريف الحالات
    ├── lib/
    │   └── supabase.js         # عميل Supabase
    ├── context/
    │   ├── AuthContext.jsx     # إدارة الجلسة والدور
    │   └── ToastContext.jsx    # نظام التنبيهات المنبثقة
    ├── hooks/
    │   ├── useShoppingItems.js # CRUD + اشتراك Realtime
    │   ├── useNotifications.js # إشعار المتصفح + الصوت
    │   └── useTheme.js         # الوضع الليلي/النهاري
    └── components/
        ├── Login.jsx
        ├── Dashboard.jsx
        ├── Header.jsx
        ├── Stats.jsx
        ├── AddItemForm.jsx
        ├── Filters.jsx
        ├── ItemList.jsx
        └── ItemCard.jsx
```

---

## 🚀 إعداد Supabase خطوة بخطوة

### 1) إنشاء المشروع
1. ادخل إلى [supabase.com](https://supabase.com) وأنشئ حساباً.
2. اضغط **New Project**، اختر اسماً وكلمة مرور لقاعدة البيانات والمنطقة الأقرب.

### 2) تنفيذ سكربت قاعدة البيانات
1. من القائمة الجانبية افتح **SQL Editor → New query**.
2. انسخ كامل محتوى الملف [`supabase/schema.sql`](./supabase/schema.sql) والصقه.
3. اضغط **Run**. سيُنشئ هذا:
   - جدول `profiles` (الأدوار) وجدول `shopping_items`.
   - دالة `is_admin()` والمُشغّلات (إنشاء ملف شخصي تلقائي + تحديث `updated_at`).
   - سياسات **RLS** كاملة.
   - تفعيل **Realtime** على جدول العناصر.

### 3) إعداد المصادقة (Auth)
1. افتح **Authentication → Providers** وتأكد أن **Email** مفعّل.
2. للتجربة السريعة محلياً: من **Authentication → Sign In / Providers → Email**
   يمكنك إيقاف **Confirm email** كي تدخل مباشرة بعد التسجيل.
   (في الإنتاج يُفضّل إبقاء تأكيد البريد مفعّلاً.)

### 4) الحصول على مفاتيح API
1. افتح **Project Settings → API**.
2. انسخ **Project URL** و **anon public key** — ستضعهما في ملف `.env`.

### 5) ترقية مستخدم إلى مشرف
بعد تسجيل المستخدم الأول، نفّذ في **SQL Editor** (مع استبدال البريد):

```sql
update public.profiles set role = 'admin'
where email = 'admin@example.com';
```

---

## 💻 التشغيل محلياً

> المتطلبات: Node.js نسخة 18 أو أحدث.

```bash
# 1) تثبيت الاعتمادات
npm install

# 2) إعداد متغيرات البيئة
cp .env.example .env
# ثم افتح .env وضع رابط المشروع والمفتاح من Supabase

# 3) تشغيل بيئة التطوير
npm run dev
```

افتح المتصفح على العنوان الظاهر (عادة `http://localhost:5173`).

أوامر أخرى:

```bash
npm run build     # بناء نسخة الإنتاج إلى مجلد dist/
npm run preview   # معاينة نسخة الإنتاج محلياً
```

### ملف `.env`

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

---

## ☁️ النشر

> في كلا المنصتين أضف متغيّري البيئة `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY`.

### النشر على Vercel
1. ادفع المشروع إلى مستودع GitHub.
2. من [vercel.com](https://vercel.com) اختر **Add New → Project** واستورد المستودع.
3. سيكتشف Vercel إعداد Vite تلقائياً (موجود أيضاً في `vercel.json`):
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. في **Settings → Environment Variables** أضف المتغيّرين أعلاه.
5. اضغط **Deploy**.

### النشر على Netlify
1. ادفع المشروع إلى GitHub.
2. من [netlify.com](https://netlify.com) اختر **Add new site → Import an existing project**.
3. الإعدادات مضبوطة مسبقاً في `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. في **Site settings → Environment variables** أضف المتغيّرين.
5. اضغط **Deploy site**.

> بعد النشر، أضف رابط الموقع المنشور في
> **Supabase → Authentication → URL Configuration → Site URL / Redirect URLs**.

### النشر على GitHub Pages

الرابط بعد النشر: **https://kh2x1.github.io/Family-list/**

يوجد Workflow جاهز في `.github/workflows/deploy.yml` يبني المشروع ويدفع مخرجاته
(مجلد `dist`) تلقائياً إلى فرع `gh-pages` عند كل دفعة. لتفعيله مرة واحدة:

1. **أضف مفاتيح Supabase** كأسرار:
   افتح **Settings → Secrets and variables → Actions → New repository secret**
   وأضف:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   > المفتاح `anon` عام وآمن للظهور في كود الواجهة، لكن وضعه كسرّ يبقي الإعداد
   > منظّماً وسهل التغيير.

2. **شغّل النشر أول مرة** لإنشاء فرع `gh-pages`: ادفع أي تغيير، أو افتح تبويب
   **Actions** وشغّل *Deploy to GitHub Pages* يدوياً (Run workflow).

3. **فعّل GitHub Pages**:
   افتح **Settings → Pages → Build and deployment** واختر
   **Source = Deploy from a branch**، ثم **Branch = `gh-pages`** والمجلد
   **`/ (root)`** واضغط **Save**. بعد دقيقة سيظهر الرابط أعلاه.

> ملاحظة: مسار `base` مضبوط على `/Family-list/` في `vite.config.js` ليطابق اسم
> المستودع على GitHub Pages. إن غيّرت اسم المستودع، حدّث هذه القيمة (أو مرّر
> `VITE_BASE`).

---

## 🗃️ مخطط قاعدة البيانات

جدول `shopping_items`:

| العمود            | النوع         | الوصف                                  |
| ----------------- | ------------- | -------------------------------------- |
| `id`              | uuid          | المعرّف الأساسي                        |
| `item_name`       | text          | اسم الغرض                              |
| `quantity`        | integer       | الكمية (> 0)                           |
| `notes`           | text          | ملاحظات (اختياري)                      |
| `status`          | text          | `needed` / `purchased` / `cancelled`   |
| `created_by`      | uuid          | معرّف المستخدم المُنشئ                  |
| `created_by_name` | text          | اسم المُنشئ (للعرض في الإشعار)         |
| `created_at`      | timestamptz   | تاريخ الإنشاء                          |
| `updated_at`      | timestamptz   | تاريخ آخر تعديل (يُحدّث تلقائياً)       |

### سياسات الأمان (RLS) — ملخّص
- **القراءة**: كل مستخدم مُسجّل يرى جميع العناصر.
- **الإضافة**: المستخدم يضيف عناصر باسمه فقط (`created_by = auth.uid()`).
- **التعديل/الحذف**: صاحب العنصر **أو** المشرف فقط.

---

## 🔮 إضافة Telegram Bot لاحقاً (اختياري)

البنية جاهزة للتوسّع: يمكن إنشاء **Supabase Edge Function** أو **Database Webhook**
يُستدعى عند `INSERT` على `shopping_items` ليرسل رسالة إلى بوت تيليجرام عبر
`https://api.telegram.org/bot<TOKEN>/sendMessage`. بهذا يصل الإشعار للمشرف حتى لو
كانت الصفحة مغلقة.

---

## 🧰 التقنيات المستخدمة

| الطبقة            | التقنية                           |
| ----------------- | --------------------------------- |
| الواجهة الأمامية   | React 18 + Vite 5                 |
| التنسيق           | CSS خام (متغيرات السمة + RTL)     |
| الخلفية والبيانات | Supabase (PostgreSQL)             |
| المصادقة          | Supabase Auth                     |
| الفوري            | Supabase Realtime                 |
| الإشعارات         | Web Notifications + Web Audio API |

---

تم البناء كمنتج جاهز للإنتاج مع تنظيم واضح للملفات وتعليقات عربية. بالتوفيق! 🎉
