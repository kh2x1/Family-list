import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

/**
 * نموذج إضافة غرض جديد إلى القائمة.
 * يظهر/يختفي عبر زر، ويحتوي حقول: الاسم، الكمية، الملاحظات.
 */
export default function AddItemForm({ onAdd }) {
  const { user, displayName } = useAuth()
  const { showToast } = useToast()

  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  function reset() {
    setItemName('')
    setQuantity(1)
    setNotes('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!itemName.trim()) return
    setBusy(true)
    try {
      await onAdd({ itemName, quantity, notes }, user, displayName)
      showToast('تمت إضافة الغرض ✅', { type: 'success' })
      reset()
      setOpen(false)
    } catch (err) {
      showToast(err.message || 'تعذّر إضافة الغرض', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button className="btn btn--primary btn--add" onClick={() => setOpen(true)}>
        ＋ إضافة غرض
      </button>
    )
  }

  return (
    <form className="add-form card" onSubmit={handleSubmit}>
      <div className="add-form__header">
        <h2>إضافة غرض جديد</h2>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setOpen(false)}
          aria-label="إغلاق"
        >
          ✕
        </button>
      </div>

      <label className="field">
        <span className="field__label">اسم الغرض</span>
        <input
          className="field__input"
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="مثال: حليب"
          required
          autoFocus
        />
      </label>

      <label className="field">
        <span className="field__label">الكمية</span>
        <input
          className="field__input"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          dir="ltr"
        />
      </label>

      <label className="field">
        <span className="field__label">ملاحظات (اختياري)</span>
        <textarea
          className="field__input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="مثال: قليل الدسم"
          rows={2}
        />
      </label>

      <div className="add-form__actions">
        <button className="btn btn--ghost" type="button" onClick={() => setOpen(false)}>
          إلغاء
        </button>
        <button className="btn btn--primary" type="submit" disabled={busy}>
          {busy ? '...جارٍ الحفظ' : 'حفظ'}
        </button>
      </div>
    </form>
  )
}
