import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useShoppingItems } from '../hooks/useShoppingItems'
import { useNotifications } from '../hooks/useNotifications'
import { useTheme } from '../hooks/useTheme'
import Header from './Header'
import Stats from './Stats'
import AddItemForm from './AddItemForm'
import Filters from './Filters'
import ItemList from './ItemList'

/**
 * الشاشة الرئيسية بعد تسجيل الدخول.
 * تجمع: الترويسة، الإحصائيات، نموذج الإضافة، التصفية، والقائمة.
 * كما تتولّى تشغيل الإشعارات الفورية عند إضافة عنصر من مستخدم آخر.
 */
export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()
  const { theme, toggleTheme } = useTheme()
  const { permission, requestPermission, playSound, showBrowserNotification } =
    useNotifications()

  // حالة البحث والتصفية والترتيب
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  // يُستدعى عند وصول عنصر جديد من مستخدم آخر عبر Realtime
  const handleInsertByOther = useCallback(
    (item) => {
      const message = `أضاف ${item.created_by_name || 'أحدهم'}: ${item.item_name}`
      // إشعار toast للجميع، أما الصوت وإشعار المتصفح فيُبرزان التنبيه خصوصاً للمشرف
      showToast(message, { type: 'info' })
      playSound()
      showBrowserNotification('غرض جديد في القائمة', message)
    },
    [showToast, playSound, showBrowserNotification]
  )

  const { items, loading, addItem, updateItem, setStatus, deleteItem } = useShoppingItems({
    onInsertByOther: handleInsertByOther,
    currentUserId: user?.id,
  })

  // تطبيق البحث + التصفية + الترتيب على العناصر
  const visibleItems = useMemo(() => {
    let result = items
    if (statusFilter !== 'all') {
      result = result.filter((i) => i.status === statusFilter)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter((i) => i.item_name.toLowerCase().includes(q))
    }
    result = [...result].sort((a, b) => {
      const da = new Date(a.created_at).getTime()
      const db = new Date(b.created_at).getTime()
      return sortOrder === 'newest' ? db - da : da - db
    })
    return result
  }, [items, search, statusFilter, sortOrder])

  // تفعيل إشعارات المتصفح بناءً على طلب المستخدم
  const enableNotifications = useCallback(async () => {
    const result = await requestPermission()
    if (result === 'granted') {
      showToast('تم تفعيل إشعارات المتصفح 🔔', { type: 'success' })
    } else {
      showToast('لم يتم منح إذن الإشعارات', { type: 'error' })
    }
  }, [requestPermission, showToast])

  return (
    <div className="dashboard">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        notifEnabled={permission === 'granted'}
        onEnableNotif={enableNotifications}
      />

      <main className="container">
        <Stats items={items} />

        <AddItemForm onAdd={addItem} />

        <Filters
          search={search}
          onSearch={setSearch}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          sortOrder={sortOrder}
          onSortOrder={setSortOrder}
        />

        <ItemList
          items={visibleItems}
          loading={loading}
          onUpdate={updateItem}
          onSetStatus={setStatus}
          onDelete={deleteItem}
        />
      </main>

      <footer className="footer">
        قائمة مشتريات العائلة · {isAdmin ? 'لوحة المشرف' : 'وضع فرد العائلة'}
      </footer>
    </div>
  )
}
