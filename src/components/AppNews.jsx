"use client"

import { useEffect, useState } from "react"
import { FaApple, FaGooglePlay } from "react-icons/fa"
import { FiBell, FiMapPin, FiUserPlus, FiX } from "react-icons/fi"
import { ANDROID_STORE_URL, IOS_STORE_URL } from "../constants/appLinks"

const STORAGE_KEY = "jamaah-app-news-dismissed"

const steps = [
  {
    icon: FiUserPlus,
    title: "Create an account",
    text: "Keep your masjid preferences ready on your phone.",
  },
  {
    icon: FiBell,
    title: "Enable alerts",
    text: "Turn on notifications and location for timely reminders.",
  },
  {
    icon: FiMapPin,
    title: "Travel with adhan",
    text: "Get alerts from the closest masjids wherever you are.",
  },
]

export default function AppNews() {
  const [visible, setVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const active = steps[activeStep]
  const ActiveIcon = active.icon

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(STORAGE_KEY) !== "true")
    } catch {
      setVisible(true)
    }
  }, [])

  useEffect(() => {
    if (!visible) return undefined

    function onKeyDown(event) {
      if (event.key === "Escape") setVisible(false)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [visible])

  function dismissForever() {
    setVisible(false)
    try {
      window.localStorage.setItem(STORAGE_KEY, "true")
    } catch { }
  }

  if (!visible) return null

  return (
    <div style={styles.overlay} className="app-news-overlay" role="presentation">
      <section
        style={styles.modal}
        className="app-news-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="jamaah-app-title"
      >
        <button type="button" onClick={() => setVisible(false)} style={styles.closeButton} aria-label="Close app announcement">
          <FiX aria-hidden />
        </button>

        <div style={styles.visualPanel} className="app-news-visual">
          <div style={styles.logoPlate}>
            <img src="/logo.png" alt="" style={styles.logo} />
          </div>
          <div style={styles.screenStack} className="app-news-screen-stack" aria-hidden>
            <img src="/maps.png" alt="" style={{ ...styles.screenImage, ...styles.mapScreen }} />
            <img src="/home.png" alt="" style={{ ...styles.screenImage, ...styles.homeScreen }} />
            <img src="/location.png" alt="" style={{ ...styles.screenImage, ...styles.locationScreen }} />
          </div>
        </div>

        <div style={styles.contentPanel}>
          <span style={styles.kicker}>New Jamaah app</span>
          <h2 id="jamaah-app-title" style={styles.title}>Prayer alerts, wherever you are.</h2>
          <p style={styles.body}>
            Download Jamaah for nearby masjids, adhan notifications, and prayer reminders that follow your location.
          </p>

          <div style={styles.storeRow}>
            <a href={IOS_STORE_URL} target="_blank" rel="noopener noreferrer" style={styles.primaryButton}>
              <FaApple aria-hidden />
              <span>Download for iOS</span>
            </a>
            <a href={ANDROID_STORE_URL} target="_blank" rel="noopener noreferrer" style={styles.secondaryButton}>
              <FaGooglePlay aria-hidden />
              <span>Get it on Android</span>
            </a>
          </div>

          <div style={styles.guideCard}>
            <div style={styles.guideHeader}>
              <span>Quick setup</span>
              <span>{activeStep + 1}/{steps.length}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveStep((current) => (current + 1) % steps.length)}
              style={styles.stepButton}
              aria-label="Show next setup step"
            >
              <span style={styles.stepIcon}>
                <ActiveIcon aria-hidden />
              </span>
              <span>
                <strong style={styles.stepTitle}>{active.title}</strong>
                <span style={styles.stepText}>{active.text}</span>
              </span>
            </button>
            <div style={styles.dots}>
              {steps.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  style={{
                    ...styles.dot,
                    ...(index === activeStep ? styles.dotActive : null),
                  }}
                  aria-label={`Show ${step.title}`}
                  aria-pressed={index === activeStep}
                />
              ))}
            </div>
          </div>

          <button type="button" onClick={dismissForever} style={styles.dismissButton}>
            Don&apos;t show again
          </button>
        </div>
      </section>
    </div>
  )
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 2147483000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    background: "rgba(15, 23, 42, 0.52)",
    backdropFilter: "blur(5px)",
  },
  modal: {
    position: "relative",
    zIndex: 1,
    isolation: "isolate",
    display: "grid",
    gridTemplateColumns: "0.86fr 1fr",
    width: "min(820px, calc(100vw - 40px))",
    overflow: "hidden",
    background: "#ffffff",
    borderRadius: 8,
    boxShadow: "0 28px 80px rgba(0, 0, 0, 0.35)",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
    display: "inline-flex",
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(15, 23, 42, 0.14)",
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.92)",
    color: "#111827",
    cursor: "pointer",
  },
  visualPanel: {
    minHeight: 420,
    padding: 28,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    background: "linear-gradient(150deg, #052e2b 0%, #047857 56%, #e0f2fe 100%)",
  },
  logoPlate: {
    width: 74,
    height: 74,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.92)",
    border: "1px solid rgba(255, 255, 255, 0.42)",
  },
  logo: {
    width: 58,
    height: 58,
    objectFit: "contain",
  },
  screenStack: {
    position: "relative",
    width: "min(250px, 100%)",
    height: 330,
    alignSelf: "center",
  },
  screenImage: {
    position: "absolute",
    display: "block",
    objectFit: "cover",
    borderRadius: 18,
    border: "1px solid rgba(255, 255, 255, 0.42)",
    boxShadow: "0 22px 48px rgba(0, 0, 0, 0.3)",
    background: "#10231d",
  },
  mapScreen: {
    left: 28,
    top: 10,
    width: 178,
    height: 306,
    zIndex: 1,
  },
  homeScreen: {
    left: 0,
    top: 92,
    width: 112,
    height: 190,
    zIndex: 2,
  },
  locationScreen: {
    right: 0,
    top: 114,
    width: 116,
    height: 190,
    zIndex: 3,
  },
  contentPanel: {
    padding: "46px 40px 28px",
  },
  kicker: {
    display: "inline-flex",
    padding: "5px 9px",
    borderRadius: 8,
    background: "#ecfdf5",
    color: "#065f46",
    border: "1px solid #a7f3d0",
    fontSize: 12,
    fontWeight: 900,
  },
  title: {
    margin: "14px 40px 0 0",
    color: "#0f172a",
    fontSize: 34,
    fontWeight: 900,
    lineHeight: 1.04,
    letterSpacing: 0,
  },
  body: {
    margin: "14px 0 0",
    color: "#4b5563",
    fontSize: 16,
    lineHeight: 1.5,
  },
  storeRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 22,
  },
  primaryButton: {
    minHeight: 48,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    background: "#047857",
    border: "1px solid #047857",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 900,
  },
  secondaryButton: {
    minHeight: 48,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    background: "#e0f2fe",
    border: "1px solid #7dd3fc",
    color: "#075985",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 900,
  },
  guideCard: {
    marginTop: 18,
    padding: 12,
    borderRadius: 8,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
  },
  guideHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 900,
    marginBottom: 9,
  },
  stepButton: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "42px 1fr",
    gap: 12,
    alignItems: "center",
    minHeight: 64,
    padding: 10,
    border: 0,
    borderRadius: 8,
    background: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
  },
  stepIcon: {
    display: "inline-flex",
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    background: "#064e3b",
    color: "#ffffff",
    fontSize: 20,
  },
  stepTitle: {
    display: "block",
    color: "#111827",
    fontSize: 15,
    fontWeight: 900,
    lineHeight: 1.2,
  },
  stepText: {
    display: "block",
    marginTop: 3,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.35,
  },
  dots: {
    display: "flex",
    justifyContent: "center",
    gap: 7,
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    padding: 0,
    borderRadius: 999,
    border: "1px solid #047857",
    background: "#ffffff",
    cursor: "pointer",
  },
  dotActive: {
    width: 24,
    background: "#047857",
  },
  dismissButton: {
    marginTop: 14,
    padding: 0,
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
    .app-news-modal {
      animation: appNewsModalIn 180ms ease-out;
    }
    .app-news-overlay {
      z-index: 2147483000 !important;
    }
    .app-news-modal a:hover,
    .app-news-modal button:hover {
      filter: brightness(0.98);
    }
    @keyframes appNewsModalIn {
      from { opacity: 0; transform: translateY(10px) scale(0.985); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @media (max-width: 720px) {
      .app-news-overlay {
        align-items: flex-end !important;
        padding: 10px !important;
      }
      .app-news-modal {
        width: 100% !important;
        max-height: calc(100vh - 20px);
        grid-template-columns: 1fr !important;
        overflow-y: auto !important;
      }
      .app-news-visual {
        min-height: 156px !important;
        padding: 18px !important;
        flex-direction: row !important;
        align-items: center !important;
      }
      .app-news-visual > div:first-child {
        flex: 0 0 auto;
      }
      .app-news-screen-stack {
        width: 168px !important;
        height: 122px !important;
      }
      .app-news-screen-stack img:nth-child(1) {
        left: 46px !important;
        top: 0 !important;
        width: 72px !important;
        height: 120px !important;
        border-radius: 10px !important;
      }
      .app-news-screen-stack img:nth-child(2) {
        left: 0 !important;
        top: 34px !important;
        width: 70px !important;
        height: 78px !important;
        border-radius: 10px !important;
      }
      .app-news-screen-stack img:nth-child(3) {
        right: 0 !important;
        top: 30px !important;
        width: 70px !important;
        height: 82px !important;
        border-radius: 10px !important;
      }
      .app-news-modal > div:last-child {
        padding: 22px 18px 18px !important;
      }
      .app-news-modal h2 {
        margin-right: 34px !important;
        font-size: 26px !important;
      }
      .app-news-modal [style*="grid-template-columns: 1fr 1fr"] {
        grid-template-columns: 1fr !important;
      }
    }
  `
  if (!document.head.querySelector('style[data-app-news-styles]')) {
    styleEl.setAttribute('data-app-news-styles', 'true')
    document.head.appendChild(styleEl)
  }
}
