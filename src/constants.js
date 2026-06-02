// الحالات الممكنة لعنصر المشتريات مع تسمياتها العربية وألوانها
export const STATUS = {
  needed: { value: 'needed', label: 'مطلوب', icon: '🛒', color: 'amber' },
  purchased: { value: 'purchased', label: 'تم الشراء', icon: '✅', color: 'green' },
  cancelled: { value: 'cancelled', label: 'ملغى', icon: '🚫', color: 'red' },
}

// قائمة مرتّبة للاستخدام في عناصر الاختيار والتصفية
export const STATUS_LIST = Object.values(STATUS)
