"use client"

import { useEffect, useState } from "react"
import { ANDROID_STORE_URL, IOS_STORE_URL } from "../constants/appLinks"

const STORAGE_KEY = "jamaah-app-news-dismissed"

const steps = [
  "Create your account",
  "Enable location and notifications",
  "Receive adhan alerts from nearby masjids",
]

export default function AppNews() {
  const [hidden, setHidden] = useState(true)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    try {
      setHidden(window.localStorage.getItem(STORAGE_KEY) === "true")
    } catch {
      setHidden(false)
    }
  }, [])

  function dismiss() {
    setHidden(true)
    try {
      window.localStorage.setItem(STORAGE_KEY, "true")
    } catch { }
  }

  function closeForNow() {
    setHidden(true)
  }

  if (hidden) return null

  return (
    <aside style={styles.panel} className="app-news-panel" aria-label="Jamaah mobile app">
      <button type="button" onClick={closeForNow} style={styles.closeButton} aria-label="Close app announcement">
        ×
      </button>

      <div style={styles.kicker}>Jamaah app</div>
      <h2 style={styles.title}>Prayer alerts that travel with you.</h2>
      <p style={styles.body}>
        Get nearby masjids, adhan reminders, and location-aware prayer notifications on your phone.
      </p>

      <div style={styles.storeRow} aria-label="Download Jamaah">
        <a href={IOS_STORE_URL} target="_blank" rel="noopener noreferrer" style={styles.primaryButton}>
          iOS
        </a>
        <a href={ANDROID_STORE_URL} target="_blank" rel="noopener noreferrer" style={styles.secondaryButton}>
          Android
        </a>
      </div>

      <div style={styles.guide} aria-label="App setup guide">
        <div style={styles.guideHeader}>
          <span style={styles.guideLabel}>Quick setup</span>
          <span style={styles.guideCount}>{activeStep + 1}/{steps.length}</span>
        </div>
        <button
          type="button"
          onClick={() => setActiveStep((current) => (current + 1) % steps.length)}
          style={styles.stepButton}
          aria-label="Show next setup step"
        >
          <span style={styles.stepNumber}>{activeStep + 1}</span>
          <span style={styles.stepText}>{steps[activeStep]}</span>
        </button>
        <div style={styles.dots}>
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => setActiveStep(index)}
              style={{
                ...styles.dot,
                ...(index === activeStep ? styles.dotActive : null),
              }}
              aria-label={`Show step ${index + 1}`}
              aria-pressed={index === activeStep}
            />
          ))}
        </div>
      </div>

      <button type="button" onClick={dismiss} style={styles.dismissButton}>
        Don&apos;t show again
      </button>
    </aside>
  )
}

const styles = {
  panel: {
    position: "fixed",
    left: 16,
    bottom: 16,
    zIndex: 35,
    width: "min(340px, calc(100vw - 32px))",
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.22)",
    padding: "16px",
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "#ffffff",
    color: "#111827",
    fontSize: 20,
    lineHeight: 1,
    cursor: "pointer",
  },
  kicker: {
    display: "inline-flex",
    width: "fit-content",
    padding: "4px 8px",
    borderRadius: 8,
    background: "#ecfdf5",
    color: "#065f46",
    border: "1px solid #a7f3d0",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 10,
  },
  title: {
    margin: "0 36px 0 0",
    color: "#0f172a",
    fontSize: 20,
    fontWeight: 800,
    lineHeight: 1.15,
  },
  body: {
    margin: "8px 0 0",
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 1.45,
  },
  storeRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginTop: 14,
  },
  primaryButton: {
    display: "inline-flex",
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    background: "#047857",
    border: "1px solid #047857",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 800,
    textDecoration: "none",
  },
  secondaryButton: {
    display: "inline-flex",
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    color: "#075985",
    background: "#e0f2fe",
    border: "1px solid #7dd3fc",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 800,
    textDecoration: "none",
  },
  guide: {
    marginTop: 12,
    padding: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "#f8fafc",
  },
  guideHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  guideLabel: {
    color: "#374151",
    fontSize: 12,
    fontWeight: 800,
  },
  guideCount: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 700,
  },
  stepButton: {
    display: "grid",
    gridTemplateColumns: "32px 1fr",
    alignItems: "center",
    gap: 10,
    width: "100%",
    minHeight: 44,
    border: 0,
    borderRadius: 8,
    background: "#ffffff",
    padding: "8px 10px",
    textAlign: "left",
    cursor: "pointer",
  },
  stepNumber: {
    display: "inline-flex",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    background: "#064e3b",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 900,
  },
  stepText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: 800,
    lineHeight: 1.25,
  },
  dots: {
    display: "flex",
    justifyContent: "center",
    gap: 6,
    marginTop: 9,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    border: "1px solid #047857",
    background: "#ffffff",
    padding: 0,
    cursor: "pointer",
  },
  dotActive: {
    width: 22,
    background: "#047857",
  },
  dismissButton: {
    width: "100%",
    marginTop: 10,
    border: 0,
    background: "transparent",
    color: "#4b5563",
    fontSize: 13,
    fontWeight: 800,
    textDecoration: "underline",
    cursor: "pointer",
  },
}

if (typeof document !== "undefined") {
  const styleEl = document.createElement("style")
  styleEl.textContent = `
    .app-news-panel {
      animation: appNewsIn 180ms ease-out;
    }
    .app-news-panel a:hover,
    .app-news-panel button:hover {
      filter: brightness(0.98);
    }
    @keyframes appNewsIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 640px) {
      .app-news-panel {
        left: 10px !important;
        right: 10px !important;
        bottom: 10px !important;
        width: auto !important;
        padding: 14px !important;
      }
    }
  `
  if (!document.head.querySelector('style[data-app-news-styles]')) {
    styleEl.setAttribute('data-app-news-styles', 'true')
    document.head.appendChild(styleEl)
  }
}
