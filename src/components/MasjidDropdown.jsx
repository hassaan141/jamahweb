"use client"

import { useMemo } from "react"
import hardcodedData from "../data/data.json"

// Security: Validate external URLs to prevent XSS attacks
function isValidExternalUrl(url) {
  if (!url) return false
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols (prevent javascript:, data:, etc.)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export default function MasjidDropdown({ masjids = [], selectedMasjid, onSelect }) {
  // Group masjids by city
  const masjidsByCity = useMemo(() => {
    // Combine regular masjids with hardcoded data for city grouping
    const allMasjids = [...masjids, ...hardcodedData]
    
    const grouped = {}
    allMasjids.forEach((m) => {
      const city = m.city || "Other"
      if (!grouped[city]) {
        grouped[city] = []
      }
      grouped[city].push(m)
    })
    // Sort cities alphabetically
    return Object.keys(grouped)
      .sort()
      .map((city) => ({
        city,
        masjids: grouped[city].sort((a, b) => a.name.localeCompare(b.name)),
      }))
  }, [masjids])

  // Create allMasjids for use in onChange handler
  const allMasjids = [...masjids, ...hardcodedData]

  return (
    <div style={styles.selectWrapper}>
      <label style={styles.label}>Select Masjid</label>
      <div style={styles.inputWrapper}>
        <select
          style={styles.select}
          value={selectedMasjid?.id || ""}
          onChange={(e) => {
            const id = e.target.value
            // Find masjid in combined list (regular + hardcoded)
            const m = allMasjids.find((x) => String(x.id) === id)
            
            // If it has an external URL, navigate to it (with security validation)
            if (m && m.externalUrl) {
              if (isValidExternalUrl(m.externalUrl)) {
                window.open(m.externalUrl, '_blank', 'noopener,noreferrer')
              } else {
                console.error('[MasjidDropdown] Invalid external URL blocked:', m.externalUrl)
                // Fallback to normal selection if URL is invalid
                onSelect?.(m || null)
              }
              return
            }
            
            // Otherwise, handle normal selection
            onSelect?.(m || null)
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#059669"
            e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)"
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#d1d5db"
            e.target.style.boxShadow = "none"
          }}
        >
          <option value="">Choose a masjid...</option>
          {masjidsByCity.map(({ city, masjids }) => (
            <optgroup key={city} label={city}>
              {masjids.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <div style={styles.icon}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

const styles = {
  selectWrapper: {
    width: "100%",
  },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 10,
    letterSpacing: "0.01em",
  },
  inputWrapper: {
    position: "relative",
    display: "block",
    width: "100%",
  },
  select: {
    width: "100%",
    padding: "14px 44px 14px 16px",
    fontSize: 15,
    fontWeight: 500,
    color: "#374151",
    background: "#fafafa",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    appearance: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
  },
  icon: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    color: "#9ca3af",
    transition: "color 0.2s ease",
  },
}

if (typeof document !== "undefined") {
  const responsive = document.createElement("style")
  responsive.textContent = `
    @media (max-width: 640px) {
      select[style*="padding: 14px 44px 14px 16px"] { padding: 12px 40px 12px 14px !important; font-size: 14px !important; }
      label[style*="font-weight: 600"][style*="margin-bottom: 10px"] { margin-bottom: 8px !important; }
      div[style*="position: relative"][style*="display: block"] svg { width: 16px !important; height: 16px !important; }
    }
  `
  if (!document.head.querySelector('style[data-dropdown-responsive]')) {
    responsive.setAttribute('data-dropdown-responsive', 'true')
    document.head.appendChild(responsive)
  }
}
