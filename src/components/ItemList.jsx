import ItemCard from './ItemCard'

/**
 * قائمة العناصر — تعرض البطاقات أو حالة فارغة/تحميل.
 */
export default function ItemList({
  items,
  loading,
  emptyMessage = 'لا توجد عناصر مطابقة',
  emptyHint = 'أضف غرضاً جديداً ليظهر هنا',
  onUpdate,
  onSetStatus,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="state state--loading">
        <span className="spinner" />
        <p>...جارٍ تحميل القائمة</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="state state--empty">
        <span className="state__icon">🗒️</span>
        <p>{emptyMessage}</p>
        <span className="state__hint">{emptyHint}</span>
      </div>
    )
  }

  return (
    <div className="item-list">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onUpdate={onUpdate}
          onSetStatus={onSetStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
