"use client"
import moment from 'moment-hijri'

export default function PrayerTimes({ prayerTimes, comparePrayerTimes = null, highlightChanges = false }) {
  if (!prayerTimes) return null
  function parseHHMM(str) {
    const s = (str == null ? '' : String(str)).trim()
    if (!s || s === '-') return null
    const match = s.match(/(\d{1,2}):(\d{2})/)
    if (!match) return null
    const h = parseInt(match[1], 10)
    const m = parseInt(match[2], 10)
    if (Number.isNaN(h) || Number.isNaN(m)) return null
    return { h, m }
  }

  function toMomentFor(prayerName, timeStr) {
    const parsed = parseHHMM(timeStr)
    if (!parsed) return null
    let { h, m } = parsed
    // Force PM for afternoon/evening prayers and Jummah
    if (['Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Jummah'].includes(prayerName)) {
      if (h < 12) h += 12
    } else if (prayerName === 'Fajr' || prayerName === 'Sunrise') {
      // Fajr and Sunrise are AM; treat 12 as midnight
      if (h === 12) h = 0
    }
    const t = moment()
    t.hour(h).minute(m).second(0).millisecond(0)
    return t
  }

  function formatTime(timeStr, prayerName) {
    const m = toMomentFor(prayerName, timeStr)
    if (!m || !m.isValid()) return '-'
    return m.format('h:mm A')
  }

  const prayerKeys = [
    { key: "fajr", name: "Fajr", azanKey: "fajr_azan", iqamahKey: "fajr_iqamah" },
    { key: "sunrise", name: "Sunrise", azanKey: "sunrise", iqamahKey: null, showIqamah: false },
    { key: "dhuhr", name: "Dhuhr", azanKey: "dhuhr_azan", iqamahKey: "dhuhr_iqamah" },
    { key: "asr", name: "Asr", azanKey: "asr_azan", iqamahKey: "asr_iqamah" },
    { key: "maghrib", name: "Maghrib", azanKey: "maghrib_azan", iqamahKey: "maghrib_iqamah" },
    { key: "isha", name: "Isha", azanKey: "isha_azan", iqamahKey: "isha_iqamah" },
    { key: "jummah", name: "Jummah", jummahKeys: ["jumah_time_1", "jumah_time_2", "jumah_time_3"] },
  ]

  const normalizeRaw = (v) => (v == null ? '-' : String(v))

  const prayers = prayerKeys.flatMap(({ name, azanKey, iqamahKey, showIqamah = true, jummahKeys }) => {
    if (jummahKeys && Array.isArray(jummahKeys)) {
      const rawTimes = jummahKeys.map((jk) => {
        const alt = jk.includes('jumah') ? jk.replace('jumah', 'jummah') : jk.replace('jummah', 'jumah')
        return (prayerTimes && (prayerTimes[jk] ?? prayerTimes[alt])) ?? null
      })

      const compRawTimes = comparePrayerTimes
        ? jummahKeys.map((jk) => {
            const alt = jk.includes('jumah') ? jk.replace('jumah', 'jummah') : jk.replace('jummah', 'jumah')
            return (comparePrayerTimes && (comparePrayerTimes[jk] ?? comparePrayerTimes[alt])) ?? null
          })
        : null

      const times = rawTimes.map((v) => (v && v !== '-' ? formatTime(v, 'Jummah') : null)).filter(Boolean)

      // determine if any raw times changed (only mark changed when highlightChanges is true)
      let changed = false
      if (highlightChanges && compRawTimes) {
        for (let i = 0; i < Math.max(rawTimes.length, compRawTimes.length); i++) {
          if (normalizeRaw(rawTimes[i]) !== normalizeRaw(compRawTimes[i])) {
            changed = true
            break
          }
        }
      }

      return [{
        type: 'jummah',
        name,
        times,
        changed,
      }]
    }

    const azanRaw = (prayerTimes && azanKey ? prayerTimes[azanKey] : null) ?? null
    const iqamahRaw = (prayerTimes && iqamahKey ? prayerTimes[iqamahKey] : null) ?? null

    const azan = azanRaw
    const iqamah = showIqamah ? iqamahRaw : null

    if (azan && azan !== '-' && (!showIqamah || (iqamah && iqamah !== '-'))) {
      // compare with alternate day's raw values
      let changed = false
      if (highlightChanges && comparePrayerTimes) {
        const compAzanRaw = azanKey ? (comparePrayerTimes[azanKey] ?? null) : null
        const compIqamahRaw = iqamahKey ? (comparePrayerTimes[iqamahKey] ?? null) : null
        if (normalizeRaw(azanRaw) !== normalizeRaw(compAzanRaw)) changed = true
        if (showIqamah && normalizeRaw(iqamahRaw) !== normalizeRaw(compIqamahRaw)) changed = true
      }

      return [{
        type: 'normal',
        name,
        adhan: formatTime(azanRaw, name),
        iqamah: showIqamah ? formatTime(iqamahRaw, name) : '-',
        changed,
      }]
    }

    return []
  })

  return (
    <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.headerText}>Prayer Times</span>
        </div>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Salat</th>
                <th style={styles.th}>Adhan</th>
                <th style={styles.th}>Iqamah</th>
              </tr>
            </thead>
            <tbody>
              {prayers.map((prayer, idx) => {
                if (prayer.type === "jummah") {
                  // Place jummah times into Adhan/Iqamah columns per rules:
                  // 1 time -> Adhan
                  // 2 times -> Adhan, Iqamah
                  // 3+ times -> Adhan, Iqamah (second/third joined with ' / ')
                  const t = prayer.times || []
                  let adhanVal = "-"
                  let iqamahVal = "-"

                  if (t.length === 1) {
                    adhanVal = t[0]
                  } else if (t.length === 2) {
                    adhanVal = t[0]
                    iqamahVal = t[1]
                  } else if (t.length >= 3) {
                    adhanVal = t[0]
                    iqamahVal = `${t[1]} / ${t[2]}`
                  }

                  return (
                    <tr
                      key={idx}
                      style={{ ...styles.row, ...(prayer.changed ? styles.changedRow : {}) }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <td style={styles.prayerName}>{prayer.name}</td>
                      <td style={styles.time}>{adhanVal}</td>
                      <td style={styles.time}>{iqamahVal}</td>
                    </tr>
                  )
                }

                return (
                  <tr
                    key={idx}
                    style={{ ...styles.row, ...(prayer.changed ? styles.changedRow : {}) }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={styles.prayerName}>{prayer.name}</td>
                    <td style={styles.time}>{String(prayer.adhan)}</td>
                    <td style={styles.time}>{String(prayer.iqamah)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
    </div>
  )
}

const styles = {
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    maxWidth: 600,
    margin: "0 auto",
    padding: 0,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    overflow: "hidden",
    transition: "box-shadow 0.3s ease",
  },
  header: {
    display: "none",
  },
  headerText: {
    fontWeight: 600,
    fontSize: 16,
    letterSpacing: "-0.01em",
  },
  tableContainer: {
    padding: "24px",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  headerRow: {
    borderBottom: "1px solid #e5e7eb",
  },
  th: {
    padding: "12px 16px",
    textAlign: "center",
    fontSize: 12,
    fontWeight: 600,
    color: "#059669",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    background: "transparent",
  },
  row: {
    borderBottom: "1px solid #f3f4f6",
    transition: "background 0.2s ease",
    cursor: "default",
  },
  prayerName: {
    padding: "18px 16px",
    color: "#059669",
    fontSize: 16,
    fontWeight: 600,
    textAlign: "left",
  },
  time: {
    padding: "18px 16px",
    color: "#4b5563",
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: "tabular-nums",
    textAlign: "center",
  },
  changedRow: {
    background: "#ecfdf5",
  },
}

// Add keyframe animations
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style")
  styleSheet.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
  if (!document.head.querySelector("style[data-prayer-times-animations]")) {
    styleSheet.setAttribute("data-prayer-times-animations", "true")
    document.head.appendChild(styleSheet)
  }

  const responsive = document.createElement("style")
  responsive.textContent = `
    @media (max-width: 640px) {
      div[style*="box-shadow: 0 4px 16px"][style*="border-radius: 16px"] { margin: 0 0 8px 0 !important; }
      div[style*="overflow-x: auto"][style*="padding: 24px"] { padding: 16px !important; }
      th[style*="text-transform: uppercase"] { font-size: 11px !important; padding: 10px 8px !important; }
      td[style*="text-align: center"][style*="padding: 18px 16px"] { padding: 14px 8px !important; font-size: 14px !important; }
      td[style*="text-align: left"][style*="font-weight: 600"] { padding: 14px 8px !important; font-size: 14px !important; }
      div[style*="display: flex"][style*="justify-content: space-between"][style*="max-width: 600"] { flex-direction: column !important; align-items: center !important; }
      div[style*="background: #ecfdf5"][style*="border: 1px solid #a7f3d0"] { width: 100% !important; }
    }
  `
  if (!document.head.querySelector("style[data-prayer-times-responsive]")) {
    responsive.setAttribute("data-prayer-times-responsive", "true")
    document.head.appendChild(responsive)
  }
}
