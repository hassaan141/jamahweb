"use client"

export default function PrayerTimes({ prayerTimes }) {
  if (!prayerTimes) return null

  const prayerKeys = [
    { key: "fajr", name: "Fajr", azanKey: "fajr_azan", iqamahKey: "fajr_iqamah" },
    { key: "sunrise", name: "Sunrise", azanKey: "sunrise", iqamahKey: null, showIqamah: false },
    { key: "dhuhr", name: "Dhuhr", azanKey: "dhuhr_azan", iqamahKey: "dhuhr_iqamah" },
    { key: "asr", name: "Asr", azanKey: "asr_azan", iqamahKey: "asr_iqamah" },
    { key: "maghrib", name: "Maghrib", azanKey: "maghrib_azan", iqamahKey: "maghrib_iqamah" },
    { key: "isha", name: "Isha", azanKey: "isha_azan", iqamahKey: "isha_iqamah" },
  ]

  const prayers = prayerKeys
    .map(({ name, azanKey, iqamahKey, showIqamah = true }) => {
      const azan = prayerTimes[azanKey]
      const iqamah = showIqamah ? prayerTimes[iqamahKey] : null

      if (azan && azan !== "-" && (!showIqamah || (iqamah && iqamah !== "-"))) {
        return {
          name,
          adhan: azan,
          iqamah: showIqamah ? iqamah : "-",
        }
      }
      return null
    })
    .filter(Boolean) 

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
              <tr
                key={idx}
                style={styles.row}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f9fafb"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                <td style={styles.prayerName}>{prayer.name}</td>
                <td style={styles.time}>{String(prayer.adhan)}</td>
                <td style={styles.time}>{String(prayer.iqamah)}</td>
              </tr>
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
    }
  `
  if (!document.head.querySelector("style[data-prayer-times-responsive]")) {
    responsive.setAttribute("data-prayer-times-responsive", "true")
    document.head.appendChild(responsive)
  }
}
