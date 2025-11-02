"use client"

import moment from 'moment-hijri'

export default function DateBar() {
  const now = moment()
  const hijriNumeric = now.format('iD/iM/iYYYY')
  const hijriArabicMonth = now.locale('ar').format('iMMMM')
  const hijriEnglishMonth = now.clone().locale('en').format('iMMMM')

  return (
    <div style={styles.wrap}>
      <div style={styles.gregorianDate}>{now.format('dddd, D MMMM YYYY')}</div>
      <div style={styles.hijriDate}>
        {hijriNumeric} {hijriArabicMonth} <span style={styles.hijriTranslit}>({hijriEnglishMonth})</span>
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 600,
    margin: '0 auto 12px',
    padding: '8px 16px',
    gap: 4,
    textAlign: 'center',
  },
  gregorianDate: { fontSize: 15, fontWeight: 700, color: '#374151' },
  hijriDate: { fontSize: 14, fontWeight: 800, color: '#065f46' },
  hijriTranslit: { fontWeight: 700, marginLeft: 6, color: '#065f46', opacity: 0.9 },
}

if (typeof document !== 'undefined') {
  const responsive = document.createElement('style')
  responsive.textContent = `
    @media (max-width: 640px) {
      /* already stacked; just ensure spacing */
      div[style*="flex-direction: column"][style*="max-width: 600"] { gap: 6px !important; }
    }
  `
  if (!document.head.querySelector('style[data-datebar-responsive]')) {
    responsive.setAttribute('data-datebar-responsive', 'true')
    document.head.appendChild(responsive)
  }
}
