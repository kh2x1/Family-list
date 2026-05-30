import { useMemo } from 'react'

/**
 * لوحة الإحصائيات — تعرض عدد العناصر حسب الحالة والإجمالي.
 */
export default function Stats({ items }) {
  const stats = useMemo(() => {
    const counts = { needed: 0, purchased: 0, cancelled: 0 }
    for (const it of items) {
      if (counts[it.status] !== undefined) counts[it.status]++
    }
    return { ...counts, total: items.length }
  }, [items])

  const cards = [
    { key: 'needed', label: 'مطلوب', value: stats.needed, icon: '🛒', tone: 'amber' },
    { key: 'purchased', label: 'تم الشراء', value: stats.purchased, icon: '✅', tone: 'green' },
    { key: 'cancelled', label: 'ملغى', value: stats.cancelled, icon: '🚫', tone: 'red' },
    { key: 'total', label: 'الإجمالي', value: stats.total, icon: '📦', tone: 'blue' },
  ]

  return (
    <section className="stats">
      {cards.map((c) => (
        <div key={c.key} className={`stat-card stat-card--${c.tone}`}>
          <span className="stat-card__icon">{c.icon}</span>
          <span className="stat-card__value">{c.value}</span>
          <span className="stat-card__label">{c.label}</span>
        </div>
      ))}
    </section>
  )
}
