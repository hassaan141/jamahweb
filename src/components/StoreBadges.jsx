"use client"

import { FaApple, FaGooglePlay } from "react-icons/fa"
import { ANDROID_STORE_URL, IOS_STORE_URL } from "../constants/appLinks"

export default function StoreBadges({ compact = false }) {
  return (
    <div style={styles.row} className="store-badges" aria-label="Download Jamaah app">
      <a href={IOS_STORE_URL} target="_blank" rel="noopener noreferrer" style={styles.badge}>
        <FaApple aria-hidden style={compact ? styles.compactIcon : styles.icon} />
        <span style={styles.textStack}>
          {!compact ? <span style={styles.eyebrow}>Download on the</span> : null}
          <span style={compact ? styles.compactLabel : styles.label}>App Store</span>
        </span>
      </a>
      <a href={ANDROID_STORE_URL} target="_blank" rel="noopener noreferrer" style={styles.badge}>
        <FaGooglePlay aria-hidden style={compact ? styles.compactIcon : styles.icon} />
        <span style={styles.textStack}>
          {!compact ? <span style={styles.eyebrow}>Get it on</span> : null}
          <span style={compact ? styles.compactLabel : styles.label}>Google Play</span>
        </span>
      </a>
    </div>
  )
}

const styles = {
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  badge: {
    minHeight: 48,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    padding: "0 13px",
    borderRadius: 8,
    background: "#0b0f0d",
    border: "1px solid #0b0f0d",
    color: "#ffffff",
    textDecoration: "none",
    boxShadow: "0 8px 18px rgba(2, 6, 23, 0.18)",
  },
  icon: {
    width: 22,
    height: 22,
    flex: "0 0 auto",
  },
  compactIcon: {
    width: 18,
    height: 18,
    flex: "0 0 auto",
  },
  textStack: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    lineHeight: 1,
  },
  eyebrow: {
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 3,
  },
  label: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 900,
    letterSpacing: 0,
    whiteSpace: "nowrap",
  },
  compactLabel: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: 0,
    whiteSpace: "nowrap",
  },
}

if (typeof document !== "undefined") {
  const styleEl = document.createElement("style")
  styleEl.textContent = `
    .store-badges a:hover {
      filter: brightness(1.08);
      transform: translateY(-1px);
    }
    @media (max-width: 700px) {
      .store-badges {
        grid-template-columns: 1fr 1fr !important;
        width: 100%;
      }
    }
  `
  if (!document.head.querySelector('style[data-store-badges-styles]')) {
    styleEl.setAttribute('data-store-badges-styles', 'true')
    document.head.appendChild(styleEl)
  }
}
