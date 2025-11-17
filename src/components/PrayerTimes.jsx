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

  // Accept changedKeys prop for minimal change
  const changedKeys = prayerTimes.changedKeys || [];

  const prayerKeys = [
    { key: "fajr", name: "Fajr", azanKey: "fajr_azan", iqamahKey: "fajr_iqamah" },
    { key: "sunrise", name: "Sunrise", azanKey: "sunrise", iqamahKey: null, showIqamah: false },
    { key: "dhuhr", name: "Dhuhr", azanKey: "dhuhr_azan", iqamahKey: "dhuhr_iqamah" },
    { key: "asr", name: "Asr", azanKey: "asr_azan", iqamahKey: "asr_iqamah" },
    { key: "maghrib", name: "Maghrib", azanKey: "maghrib_azan", iqamahKey: "maghrib_iqamah" },
    { key: "isha", name: "Isha", azanKey: "isha_azan", iqamahKey: "isha_iqamah" },
  ];

  let prayers = prayerKeys
    .map(({ key, name, azanKey, iqamahKey, showIqamah = true }) => {
      const azan = prayerTimes[azanKey];
      const iqamah = showIqamah ? prayerTimes[iqamahKey] : null;
      let changed = false;
      if (highlightChanges && comparePrayerTimes) {
        const compAzan = comparePrayerTimes[azanKey];
        const compIqamah = showIqamah ? comparePrayerTimes[iqamahKey] : null;
        if (azan !== compAzan || (showIqamah && iqamah !== compIqamah)) {
          changed = true;
        }
      } else {
        changed = changedKeys.includes(key);
      }
      if (azan && azan !== "-" && (!showIqamah || (iqamah && iqamah !== "-"))) {
        return {
          key,
          name,
          adhan: azan,
          iqamah: showIqamah ? iqamah : "-",
          changed,
        };
      }
      return null;
    })
    .filter(Boolean);

  // Insert zawal after sunrise if present
  if (prayerTimes.zawal && prayerTimes.zawal !== "-") {
    const sunriseIdx = prayers.findIndex(p => p.key === "sunrise");
    prayers.splice(sunriseIdx + 1, 0, {
      key: "zawal",
      name: "Zawal",
      adhan: prayerTimes.zawal,
      iqamah: "-",
      changed: false,
    });
  }

  // Insert jummah rows if present
  const jummahKeys = ["jumah_time_1", "jumah_time_2", "jumah_time_3"];
  const jummahLabels = ["Jummah 1", "Jummah 2", "Jummah 3"];
  const jummahTimes = jummahKeys.map(jk => prayerTimes[jk]).filter(v => v && v !== "-");
  if (jummahTimes.length > 0) {
    // Format times
    const formatted = jummahTimes.map(t => formatTime(t, "Jummah"));
    prayers.push({
      key: "jummah",
      name: "Jummah",
      adhan: formatted[0] || "-",
      iqamah: formatted[1] || "-",
      extra: formatted.slice(2), // for Jummah 3
      labels: jummahLabels.slice(0, formatted.length),
      changed: changedKeys.includes("jummah"),
    });
  }

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
              {prayers.map((prayer, idx) => (
                prayer.key === "jummah" ? (
                  <tr key={idx} style={prayer.changed ? { ...styles.row, ...styles.rowChanged } : styles.row}>
                    <td style={styles.prayerName}>{prayer.name}</td>
                    <td style={styles.time}>
                      {prayer.labels[0] && <div style={{fontSize:12, color:'#059669', marginBottom:2}}>{prayer.labels[0]}</div>}
                      {prayer.adhan}
                      {prayer.labels[2] && <div style={{fontSize:12, color:'#059669', marginTop:4}}>{prayer.labels[2]}</div>}
                      {prayer.extra && prayer.extra[0] && <div>{prayer.extra[0]}</div>}
                    </td>
                    <td style={styles.time}>
                      {prayer.labels[1] && <div style={{fontSize:12, color:'#059669', marginBottom:2}}>{prayer.labels[1]}</div>}
                      {prayer.iqamah}
                    </td>
                  </tr>
                ) : (
                  <tr key={idx} style={prayer.changed ? { ...styles.row, ...styles.rowChanged } : styles.row}>
                    <td style={styles.prayerName}>{prayer.name}</td>
                    <td style={styles.time}>{String(prayer.adhan)}</td>
                    <td style={styles.time}>{String(prayer.iqamah)}</td>
                  </tr>
                )
              ))}
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
    background: "transparent",
  },
  rowChanged: {
    background: "#d1fae5",
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
