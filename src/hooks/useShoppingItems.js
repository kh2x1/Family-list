import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * خطّاف إدارة عناصر قائمة المشتريات:
 *   - جلب العناصر الأولي.
 *   - الاشتراك في التحديثات الفورية (Realtime) للإضافة/التعديل/الحذف.
 *   - دوال CRUD (إضافة، تعديل، تغيير الحالة، حذف).
 *
 * @param {object}   options
 * @param {function} options.onInsertByOther  يُستدعى عند إضافة عنصر من مستخدم آخر.
 * @param {string}   options.currentUserId     معرّف المستخدم الحالي (لتمييز الإضافات).
 */
export function useShoppingItems({ onInsertByOther, currentUserId } = {}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // نحتفظ بأحدث ردّ النداء في مرجع لتفادي إعادة الاشتراك عند تغيّره
  const onInsertRef = useRef(onInsertByOther)
  const userIdRef = useRef(currentUserId)
  useEffect(() => {
    onInsertRef.current = onInsertByOther
    userIdRef.current = currentUserId
  }, [onInsertByOther, currentUserId])

  // الجلب الأولي لكل العناصر
  const fetchItems = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setItems(data ?? [])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchItems()

    // الاشتراك في قناة التحديثات الفورية لجدول shopping_items
    const channel = supabase
      .channel('shopping_items_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'shopping_items' },
        (payload) => {
          const newItem = payload.new
          setItems((prev) => {
            if (prev.some((i) => i.id === newItem.id)) return prev
            return [newItem, ...prev]
          })
          // إشعار فقط إذا كانت الإضافة من مستخدم آخر
          if (newItem.created_by !== userIdRef.current) {
            onInsertRef.current?.(newItem)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'shopping_items' },
        (payload) => {
          setItems((prev) =>
            prev.map((i) => (i.id === payload.new.id ? payload.new : i))
          )
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'shopping_items' },
        (payload) => {
          setItems((prev) => prev.filter((i) => i.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchItems])

  // إضافة عنصر جديد
  const addItem = useCallback(async ({ itemName, quantity, notes }, user, displayName) => {
    const payload = {
      item_name: itemName.trim(),
      quantity: Number(quantity) || 1,
      notes: notes?.trim() || null,
      status: 'needed',
      created_by: user.id,
      created_by_name: displayName,
    }
    const { data, error } = await supabase
      .from('shopping_items')
      .insert(payload)
      .select()
      .single()

    if (error) throw error

    // تحديث متفائل في حال تأخّر حدث Realtime
    setItems((prev) => (prev.some((i) => i.id === data.id) ? prev : [data, ...prev]))
    return data
  }, [])

  // تعديل عنصر
  const updateItem = useCallback(async (id, fields) => {
    const { data, error } = await supabase
      .from('shopping_items')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setItems((prev) => prev.map((i) => (i.id === id ? data : i)))
    return data
  }, [])

  // تغيير حالة عنصر
  const setStatus = useCallback((id, status) => updateItem(id, { status }), [updateItem])

  // حذف عنصر
  const deleteItem = useCallback(async (id) => {
    const { error } = await supabase.from('shopping_items').delete().eq('id', id)
    if (error) throw error
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    setStatus,
    deleteItem,
    refetch: fetchItems,
  }
}
