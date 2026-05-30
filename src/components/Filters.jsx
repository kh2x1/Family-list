import { STATUS_LIST } from '../constants'

/**
 * شريط البحث والتصفية والترتيب.
 */
export default function Filters({
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
  sortOrder,
  onSortOrder,
}) {
  return (
    <div className="filters card">
      <div className="filters__search">
        <span className="filters__search-icon">🔍</span>
        <input
          className="field__input"
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="ابحث بالاسم..."
        />
      </div>

      <div className="filters__row">
        <select
          className="field__input"
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value)}
          aria-label="تصفية حسب الحالة"
        >
          <option value="all">كل الحالات</option>
          {STATUS_LIST.map((s) => (
            <option key={s.value} value={s.value}>
              {s.icon} {s.label}
            </option>
          ))}
        </select>

        <select
          className="field__input"
          value={sortOrder}
          onChange={(e) => onSortOrder(e.target.value)}
          aria-label="ترتيب"
        >
          <option value="newest">الأحدث أولاً</option>
          <option value="oldest">الأقدم أولاً</option>
        </select>
      </div>
    </div>
  )
}
