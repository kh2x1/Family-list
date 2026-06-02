import { useAuth } from '../context/AuthContext'

/**
 * شريط علوي يحوي الشعار، اسم المستخدم ودوره، زر الوضع الليلي، وزر الخروج.
 */
export default function Header({ theme, onToggleTheme, notifEnabled, onEnableNotif }) {
  const { displayName, isAdmin, signOut } = useAuth()

  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__logo">🛒</span>
        <div>
          <h1 className="header__title">قائمة المشتريات</h1>
          <p className="header__user">
            {displayName}
            <span className={`badge ${isAdmin ? 'badge--admin' : 'badge--member'}`}>
              {isAdmin ? 'مشرف' : 'فرد العائلة'}
            </span>
          </p>
        </div>
      </div>

      <div className="header__actions">
        {!notifEnabled && (
          <button
            className="icon-btn"
            onClick={onEnableNotif}
            title="تفعيل إشعارات المتصفح"
            aria-label="تفعيل الإشعارات"
          >
            🔔
          </button>
        )}
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title="تبديل الوضع الليلي"
          aria-label="تبديل الوضع الليلي"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="btn btn--ghost" onClick={signOut}>
          خروج
        </button>
      </div>
    </header>
  )
}
