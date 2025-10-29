"use client"

import { Link } from "react-router-dom"
import { useState, useEffect } from 'react'
import moment from "moment-hijri"

export default function Header({
  title,
  subtitle,
  logoSrc = "/logo.png",
  showBack = false,
  backTo = "/",
  titleColor,
}) {
  // current time state (updates every second)
  const [time, setTime] = useState(moment().format('HH:mm:ss'))

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(moment().format('HH:mm:ss'))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Hijri date pieces: numeric (7/5/1447) and Arabic month name
  const hijriNumeric = moment().format('iD/iM/iYYYY')
  const hijriArabicMonth = moment().locale('ar').format('iMMMM')
  return (
    <header style={styles.headerWrapper}>
      <div style={styles.topBar}>
        <div style={styles.brandSection}>
          <div style={styles.logoWrap}>
            <img src={logoSrc} alt="Logo" style={styles.logo} />
          </div>
          <div style={styles.brandText}>
            <div style={styles.brandName}>Awqat</div>
            <div style={styles.brandTag}>Prayer Times</div>
          </div>
        </div>

        <div style={styles.centerSection}>
          <div style={styles.islamicDateCenter}>
            {/* Numeric Hijri date like 7/5/1447 + Arabic month */}
            <div style={styles.hijriNumeric}>
              {hijriNumeric} {hijriArabicMonth}
            </div>
            {/* Live current time (HH:mm:ss) */}
            <div style={styles.currentTime} id="header-current-time">{time}</div>
          </div>
        </div>

        <div style={styles.metaSection}>
          <a href="mailto:info@awqat.net" style={styles.metaLink}>
            <span style={styles.metaIcon}>✉</span> info@awqat.net
          </a>
          <a
            href="https://awqat.net/MFASInfo.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.metaBadge}
            title="Muslim Funeral Aid Services"
            aria-label="Muslim Funeral Aid Services PDF"
          >
            Funeral Aid Services
          </a>
        </div>
      </div>

      <div style={styles.hero}>
        <div style={styles.heroInner}>
          {showBack && (
            <Link to={backTo} style={styles.backLink}>
              <span style={styles.backArrow}>←</span> Back
            </Link>
          )}
          <div style={styles.titleWrapper}>
            <h1 style={{ ...styles.title, ...(titleColor ? { color: titleColor } : null) }}>{title}</h1>
            {subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}
          </div>
        </div>
      </div>
    </header>
  )
}

const styles = {
  headerWrapper: {
    background: "#ffffff",
    color: "#111827",
    borderBottom: "1px solid #e5e7eb",
  },
  topBar: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "10px 16px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 16,
  },
  brandSection: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logoWrap: {
    width: 68,
    height: 68,
    background: "transparent",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #059669",
    padding: 0,
    overflow: "hidden",
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  brandText: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.1,
  },
  brandName: {
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: "-0.01em",
    color: "#059669",
  },
  brandTag: {
    fontSize: 13,
    color: "#065f46",
    fontWeight: 600,
  },
  centerSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  islamicDateCenter: {
    fontSize: 16,
    fontWeight: 700,
    color: "#065f46",
    fontFamily: "system-ui, -apple-system, sans-serif",
    letterSpacing: "0.01em",
    lineHeight: 1.4,
    textAlign: "center",
  },
  hijriNumeric: {
    fontSize: 16,
    fontWeight: 800,
    color: "#065f46",
    marginBottom: 2,
  },
  currentTime: {
    fontSize: 13,
    fontWeight: 600,
    color: "#064e3b",
    marginTop: 2,
  },
  metaSection: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "flex-end",
    marginLeft: "auto",
  },
  metaLink: {
    color: "#064e3b",
    textDecoration: "none",
    fontSize: 14,
    padding: "8px 12px",
    borderRadius: 8,
    background: "#ecfdf5",
    border: "1px solid #86efac",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.2s ease",
    fontWeight: 600,
  },
  metaIcon: {
    fontSize: 12,
    lineHeight: 1,
  },
  metaBadge: {
    fontSize: 12,
    fontWeight: 700,
    color: "#065f46",
    background: "#d1fae5",
    border: "1px solid #a7f3d0",
    borderRadius: 999,
    padding: "8px 12px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
    whiteSpace: "nowrap",
  },
  hero: {
    padding: "14px 16px",
    textAlign: "center",
    background: "#f0fdf4",
    borderTop: "1px solid #e5e7eb",
  },
  heroInner: {
    maxWidth: 800,
    margin: "0 auto",
    position: "relative",
  },
  backLink: {
    color: "#065f46",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 999,
    background: "#ecfdf5",
    transition: "all 0.2s ease",
    border: "1px solid #a7f3d0",
    marginBottom: 8,
    position: "absolute",
    left: 0,
    top: 0,
  },
  backArrow: {
    fontSize: 16,
  },
  titleWrapper: {
    textAlign: "center",
  },
  title: {
    margin: "4px 0 0",
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.01em",
    color: "#111827",
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: 15,
    fontWeight: 500,
    color: "#6b7280",
  },
}

if (typeof document !== "undefined") {
  const styleEl = document.createElement("style")
  styleEl.textContent = `
    a[style*="metaLink"]:hover { background: #d1fae5 !important; }
    a[style*="backLink"]:hover { background: #d1fae5 !important; transform: translateY(-1px); }
    @media (max-width: 768px) {
      div[style*="topBar"] { flex-direction: column !important; align-items: center !important; gap: 8px !important; }
      div[style*="metaSection"] { justify-content: center !important; }
    }
    @media (max-width: 640px) {
      h1[style*="title"] { font-size: 20px !important; }
      div[style*="topBar"] { padding: 8px 12px !important; }
      img[alt="Logo"] { width: 24px !important; height: 24px !important; }
      span[style*="metaBadge"] { display: none !important; }
    }
  `
  if (!document.head.querySelector('style[data-header-styles]')) {
    styleEl.setAttribute('data-header-styles', 'true')
    document.head.appendChild(styleEl)
  }
}


