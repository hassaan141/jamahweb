"use client"

import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const menuBtnRef = useRef(null)
  const [menuStyle, setMenuStyle] = useState({})

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(moment().format('HH:mm:ss'))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Close menu on escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Position the menu panel aligned to the hamburger button
  useEffect(() => {
    if (!menuOpen) return
    function positionPanel() {
      const btn = menuBtnRef.current
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      const top = Math.round(rect.bottom + 8)
      const right = Math.round(window.innerWidth - rect.right + 12)
      setMenuStyle({ position: 'fixed', top: `${top}px`, right: `${right}px` })
    }
    positionPanel()
    window.addEventListener('resize', positionPanel)
    window.addEventListener('scroll', positionPanel, { passive: true })
    return () => {
      window.removeEventListener('resize', positionPanel)
      window.removeEventListener('scroll', positionPanel)
    }
  }, [menuOpen])

  // Hijri date pieces: numeric (7/5/1447) and Arabic month name
  const hijriNumeric = moment().format('iD/iM/iYYYY')
  const hijriArabicMonth = moment().locale('ar').format('iMMMM')
  return (
    <header style={styles.headerWrapper}>
      <div style={styles.topBar} className="header-topbar">
        <div style={styles.brandSection}>
          <div style={styles.logoWrap}>
            <img src={logoSrc} alt="Logo" style={styles.logo} className="header-logo" />
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

        <div style={styles.metaSection} className="header-meta">
          <a href="mailto:info@awqat.net" style={styles.metaLink}>
            <span style={styles.metaIcon}>✉</span> info@awqat.net
          </a>
          <a
            href="https://awqat.net/MFASInfo.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.metaBadge}
            className="meta-badge"
            title="Muslim Funeral Aid Services"
            aria-label="Muslim Funeral Aid Services PDF"
          >
            Funeral Aid Services
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          style={styles.menuButton}
          className="header-menu-btn"
          ref={menuBtnRef}
        >
          <span style={styles.menuIcon} aria-hidden>☰</span>
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="header-menu-overlay header-fade-in" onClick={() => setMenuOpen(false)} />
          <div className="header-menu-panel header-menu-in" role="menu" aria-label="Menu" style={menuStyle}>
            <a href="mailto:info@awqat.net" className="header-menu-item" onClick={() => setMenuOpen(false)}>
              <span>✉</span>
              <span>info@awqat.net</span>
            </a>
            <a
              href="https://awqat.net/MFASInfo.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="header-menu-item"
              onClick={() => setMenuOpen(false)}
            >
              <span>📄</span>
              <span>Funeral Aid Services</span>
            </a>
          </div>
        </>
      )}

      <div style={styles.hero} className="header-hero">
        <div style={styles.heroInner} className="header-hero-inner">
          {showBack && (
            <Link to={backTo} style={styles.backLink} className="header-back">
              <span style={styles.backArrow}>←</span> Back
            </Link>
          )}
          <div style={styles.titleWrapper}>
            <h1 style={{ ...styles.title, ...(titleColor ? { color: titleColor } : null) }} className="header-title">{title}</h1>
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
    width: 64,
    height: 64,
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
  menuButton: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #a7f3d0',
    background: '#ecfdf5',
    color: '#065f46',
    padding: '8px 10px',
    borderRadius: 8,
    fontWeight: 800,
    cursor: 'pointer',
  },
  menuIcon: { fontSize: 16, lineHeight: 1 },
  hero: {
    padding: "12px 16px",
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
    margin: "2px 0 0",
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.01em",
    color: "#111827",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: 14,
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
      .header-topbar { grid-template-columns: 1fr !important; gap: 10px !important; }
      .header-meta { justify-content: center !important; }
      .header-back { position: static !important; margin-bottom: 8px !important; }
    }
    @media (max-width: 640px) {
      .header-title { font-size: 18px !important; }
      .header-topbar { padding: 8px 12px !important; }
      .header-logo { width: 40px !important; height: 40px !important; }
      /* Hide the right-side links, show hamburger */
      .header-meta { display: none !important; }
      .header-menu-btn { display: inline-flex !important; margin-left: auto; }
      .header-hero { padding: 6px 12px !important; }
      .header-hero-inner h1 { margin-top: 0 !important; }
      .header-hero-inner p { margin-top: 2px !important; font-size: 13px !important; }
    }
  `
  if (!document.head.querySelector('style[data-header-styles]')) {
    styleEl.setAttribute('data-header-styles', 'true')
    document.head.appendChild(styleEl)
  }

  // Inject mobile menu panel styles and behavior via CSS classes
  const menuStyles = document.createElement('style')
  menuStyles.textContent = `
    .header-menu-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 40; }
    .header-menu-panel { z-index: 41; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); width: min(92vw, 320px); overflow: hidden; }
    .header-menu-item { display: flex; align-items: center; gap: 8px; padding: 12px 14px; color: #065f46; text-decoration: none; font-weight: 700; }
    .header-menu-item + .header-menu-item { border-top: 1px solid #f3f4f6; }
    .header-menu-item:hover { background: #ecfdf5; }
    @media (min-width: 641px) { .header-menu-btn { display: none !important; } }

    /* Animations */
    @keyframes headerMenuIn { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes headerFadeIn { from { opacity: 0; } to { opacity: 1; } }
    .header-menu-in { animation: headerMenuIn 160ms ease-out; transform-origin: top right; }
    .header-fade-in { animation: headerFadeIn 120ms ease-out; }
  `
  if (!document.head.querySelector('style[data-header-menu-styles]')) {
    menuStyles.setAttribute('data-header-menu-styles', 'true')
    document.head.appendChild(menuStyles)
  }
}

// Render mobile menu via a lightweight portal approach
// Note: Using simple DOM APIs to avoid adding dependencies
if (typeof document !== 'undefined') {
  // Observe menu state by polling a data-attribute that we toggle on the button
}


