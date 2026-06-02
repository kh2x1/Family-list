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
import Tabs from './Tabs'

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

  // العرض الحالي: 'active' (المطلوب) أو 'archive' (تم الشراء + الملغى)
  const [view, setView] = useState('active')
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

  // فصل العناصر: النشطة (مطلوب) مقابل الأرشيف (تم الشراء + الملغى)
  const activeCount = useMemo(
    () => items.filter((i) => i.status === 'needed').length,
    [items]
  )
  const archiveCount = useMemo(
    () => items.filter((i) => i.status === 'purchased' || i.status === 'cancelled').length,
    [items]
  )

  // تطبيق العرض (تبويب) + البحث + التصفية + الترتيب على العناصر
  const visibleItems = useMemo(() => {
    // أولاً نحصر العناصر حسب التبويب الحالي
    let result =
      view === 'active'
        ? items.filter((i) => i.status === 'needed')
        : items.filter((i) => i.status === 'purchased' || i.status === 'cancelled')

    // التصفية الإضافية حسب الحالة تُطبّق في الأرشيف فقط (تم الشراء/ملغى)
    if (view === 'archive' && statusFilter !== 'all') {
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
  }, [items, view, search, statusFilter, sortOrder])

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

        <Tabs
          view={view}
          onChange={setView}
          activeCount={activeCount}
          archiveCount={archiveCount}
        />

        {/* الإضافة متاحة في القائمة النشطة فقط */}
        {view === 'active' && <AddItemForm onAdd={addItem} />}

        <Filters
          search={search}
          onSearch={setSearch}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          sortOrder={sortOrder}
          onSortOrder={setSortOrder}
          showStatusFilter={view === 'archive'}
        />

        <ItemList
          items={visibleItems}
          loading={loading}
          emptyMessage={
            view === 'active' ? 'لا توجد أغراض مطلوبة حالياً' : 'الأرشيف فارغ'
          }
          emptyHint={
            view === 'active'
              ? 'أضف غرضاً جديداً ليظهر هنا'
              : 'العناصر المشتراة أو الملغاة ستظهر هنا'
          }
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
