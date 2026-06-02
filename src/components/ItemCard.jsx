import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { STATUS, STATUS_LIST } from '../constants'

/**
 * بطاقة عنصر واحد — تعرض التفاصيل وأزرار التحكم وفق صلاحيات المستخدم.
 *   - المالك أو المشرف: يعدّل، يحذف، ويغيّر الحالة.
 *   - غيرهم: عرض فقط.
 */
export default function ItemCard({ item, onUpdate, onSetStatus, onDelete }) {
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()

  const canManage = isAdmin || item.created_by === user?.id
  const status = STATUS[item.status] ?? STATUS.needed

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(item.item_name)
  const [qty, setQty] = useState(item.quantity)
  const [notes, setNotes] = useState(item.notes ?? '')
  const [busy, setBusy] = useState(false)

  async function saveEdit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await onUpdate(item.id, {
        item_name: name.trim(),
        quantity: Number(qty) || 1,
        notes: notes.trim() || null,
      })
      showToast('تم تحديث الغرض', { type: 'success' })
      setEditing(false)
    } catch (err) {
      showToast(err.message || 'تعذّر التحديث', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  async function changeStatus(newStatus) {
    try {
      await onSetStatus(item.id, newStatus)
    } catch (err) {
      showToast(err.message || 'تعذّر تغيير الحالة', { type: 'error' })
    }
  }

  async function handleDelete() {
    if (!window.confirm(`حذف "${item.item_name}"؟`)) return
    try {
      await onDelete(item.id)
      showToast('تم حذف الغرض', { type: 'success' })
    } catch (err) {
      showToast(err.message || 'تعذّر الحذف', { type: 'error' })
    }
  }

  if (editing) {
    return (
      <form className="item-card item-card--editing card" onSubmit={saveEdit}>
        <label className="field">
          <span className="field__label">اسم الغرض</span>
          <input
            className="field__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span className="field__label">الكمية</span>
          <input
            className="field__input"
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            dir="ltr"
          />
        </label>
        <label className="field">
          <span className="field__label">ملاحظات</span>
          <textarea
            className="field__input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </label>
        <div className="add-form__actions">
          <button type="button" className="btn btn--ghost" onClick={() => setEditing(false)}>
            إلغاء
          </button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? '...حفظ' : 'حفظ'}
          </button>
        </div>
      </form>
    )
  }

  return (
    <article className={`item-card card item-card--${status.color}`}>
      <div className="item-card__main">
        <div className="item-card__title-row">
          <h3 className="item-card__name">{item.item_name}</h3>
          <span className="item-card__qty">×{item.quantity}</span>
        </div>

        {item.notes && <p className="item-card__notes">{item.notes}</p>}

        <div className="item-card__meta">
          <span className={`status-pill status-pill--${status.color}`}>
            {status.icon} {status.label}
          </span>
          <span className="item-card__by">
            بواسطة {item.created_by_name || 'مستخدم'} · {formatDate(item.created_at)}
          </span>
        </div>
      </div>

      {canManage && (
        <div className="item-card__actions">
          <select
            className="item-card__status-select"
            value={item.status}
            onChange={(e) => changeStatus(e.target.value)}
            aria-label="تغيير الحالة"
          >
            {STATUS_LIST.map((s) => (
              <option key={s.value} value={s.value}>
                {s.icon} {s.label}
              </option>
            ))}
          </select>
          <button className="icon-btn" onClick={() => setEditing(true)} title="تعديل">
            ✏️
          </button>
          <button className="icon-btn icon-btn--danger" onClick={handleDelete} title="حذف">
            🗑️
          </button>
        </div>
      )}
    </article>
  )
}

// تنسيق التاريخ بصيغة عربية مختصرة
function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat('ar', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}
