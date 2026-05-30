const sharp = require('sharp')
const path = require('path')

// تصميم أيقونة التطبيق: خلفية بتدرّج أزرق + عربة تسوّق بيضاء + لمسة "+"
// SVG قابل للتحجيم نحوّله إلى PNG بمقاسات الآيفون والأندرويد.
const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#38bdf8"/>
      <stop offset="0.55" stop-color="#0ea5e9"/>
      <stop offset="1" stop-color="#0369a1"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#0c4a6e" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- خلفية بزوايا دائرية على طريقة iOS -->
  <rect x="0" y="0" width="512" height="512" rx="112" ry="112" fill="url(#bg)"/>

  <!-- توهّج علوي خفيف -->
  <ellipse cx="256" cy="120" rx="280" ry="150" fill="#ffffff" opacity="0.10"/>

  <!-- عربة التسوّق -->
  <g fill="none" stroke="#ffffff" stroke-width="26"
     stroke-linecap="round" stroke-linejoin="round" filter="url(#shadow)">
    <!-- المقبض وجسم العربة -->
    <path d="M104 132 h54 l52 210 h150 a18 18 0 0 0 17.5 -13.6 L408 200 H190"/>
  </g>
  <!-- العجلتان -->
  <circle cx="214" cy="396" r="30" fill="#ffffff" filter="url(#shadow)"/>
  <circle cx="368" cy="396" r="30" fill="#ffffff" filter="url(#shadow)"/>

  <!-- علامة + داخل دائرة (إضافة غرض) -->
  <circle cx="356" cy="150" r="58" fill="#ffffff"/>
  <g stroke="#0ea5e9" stroke-width="22" stroke-linecap="round">
    <line x1="356" y1="124" x2="356" y2="176"/>
    <line x1="330" y1="150" x2="382" y2="150"/>
  </g>
</svg>
`

const out = path.join(__dirname, '..', 'public')

async function run() {
  const buf = Buffer.from(svg)
  // أيقونة عامة عالية الدقة
  await sharp(buf).resize(512, 512).png().toFile(path.join(out, 'icon-512.png'))
  await sharp(buf).resize(192, 192).png().toFile(path.join(out, 'icon-192.png'))
  // أيقونة آيفون (Apple Touch Icon) — 180×180
  await sharp(buf).resize(180, 180).png().toFile(path.join(out, 'apple-touch-icon.png'))
  console.log('✅ تم توليد الأيقونات: icon-512, icon-192, apple-touch-icon')
}

run()
