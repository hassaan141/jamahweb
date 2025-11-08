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
    margin: '0 auto 8px',
    padding: '6px 14px',
    gap: 2,
    textAlign: 'center',
  },
  gregorianDate: { fontSize: 14, fontWeight: 700, color: '#374151' },
  hijriDate: { fontSize: 13, fontWeight: 800, color: '#065f46' },
  hijriTranslit: { fontWeight: 700, marginLeft: 4, color: '#065f46', opacity: 0.85, fontSize: 12 },
}

if (typeof document !== 'undefined') {
  const responsive = document.createElement('style')
  responsive.textContent = `
    @media (max-width: 640px) {
      div[style*="flex-direction: column"][style*="max-width: 600"] { gap: 4px !important; padding: 4px 10px !important; margin-bottom: 6px !important; }
    }
  `
  if (!document.head.querySelector('style[data-datebar-responsive]')) {
    responsive.setAttribute('data-datebar-responsive', 'true')
    document.head.appendChild(responsive)
  }
}
