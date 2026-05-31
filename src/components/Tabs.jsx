/**
 * تبويبات التنقّل بين القائمة النشطة والأرشيف، مع عدّاد لكل تبويب.
 */
export default function Tabs({ view, onChange, activeCount, archiveCount }) {
  const tabs = [
    { key: 'active', label: 'القائمة', icon: '🛒', count: activeCount },
    { key: 'archive', label: 'الأرشيف', icon: '🗄️', count: archiveCount },
  ]

  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={view === t.key}
          className={`tab ${view === t.key ? 'tab--active' : ''}`}
          onClick={() => onChange(t.key)}
        >
          <span className="tab__icon">{t.icon}</span>
          <span className="tab__label">{t.label}</span>
          <span className="tab__count">{t.count}</span>
        </button>
      ))}
    </div>
  )
}
