"use client"

import { FaApple, FaGooglePlay } from "react-icons/fa"
import { ANDROID_STORE_URL, IOS_STORE_URL } from "../constants/appLinks"

export default function AppDownloadBanner() {
  return (
    <section style={styles.banner} className="app-download-banner" aria-label="Download Jamaah app">
      <div style={styles.previewStack} aria-hidden>
        <img src="/home.png" alt="" style={styles.previewHome} />
        <img src="/maps.png" alt="" style={styles.previewMap} />
      </div>

      <div style={styles.copy}>
        <div style={styles.kicker}>Jamaah mobile app</div>
        <h2 style={styles.title}>Get adhan notifications from your masjid, anywhere on your phone.</h2>
        <p style={styles.text}>Enable location and notifications to receive prayer reminders as you travel.</p>
      </div>

      <div style={styles.actions}>
        <a href={IOS_STORE_URL} target="_blank" rel="noopener noreferrer" style={styles.primaryButton}>
          <FaApple aria-hidden />
          <span>iOS</span>
        </a>
        <a href={ANDROID_STORE_URL} target="_blank" rel="noopener noreferrer" style={styles.secondaryButton}>
          <FaGooglePlay aria-hidden />
          <span>Android</span>
        </a>
      </div>
    </section>
  )
}

const styles = {
  banner: {
    display: "grid",
    gridTemplateColumns: "72px 1fr auto",
    alignItems: "center",
    gap: 14,
    margin: "0 0 18px",
    padding: "14px 16px",
    borderRadius: 8,
    background: "linear-gradient(135deg, #ffffff 0%, #f0fdfa 58%, #e0f2fe 100%)",
    border: "1px solid #a7f3d0",
    boxShadow: "0 10px 28px rgba(15, 118, 110, 0.12)",
  },
  previewStack: {
    position: "relative",
    width: 72,
    height: 58,
  },
  previewHome: {
    position: "absolute",
    left: 0,
    top: 4,
    width: 38,
    height: 50,
    borderRadius: 8,
    objectFit: "cover",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    boxShadow: "0 8px 18px rgba(6, 78, 59, 0.16)",
    background: "#10231d",
  },
  previewMap: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 44,
    height: 58,
    borderRadius: 8,
    objectFit: "cover",
    objectPosition: "center",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    boxShadow: "0 10px 22px rgba(6, 78, 59, 0.2)",
    background: "#10231d",
  },
  copy: {
    minWidth: 0,
  },
  kicker: {
    color: "#047857",
    fontSize: 12,
    fontWeight: 900,
    marginBottom: 3,
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: 18,
    fontWeight: 900,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  text: {
    margin: "4px 0 0",
    color: "#475569",
    fontSize: 13,
    lineHeight: 1.35,
  },
  actions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  primaryButton: {
    minHeight: 40,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "0 13px",
    borderRadius: 8,
    background: "#047857",
    border: "1px solid #047857",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  secondaryButton: {
    minHeight: 40,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "0 13px",
    borderRadius: 8,
    background: "#ffffff",
    border: "1px solid #7dd3fc",
    color: "#075985",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
}

if (typeof document !== "undefined") {
  const styleEl = document.createElement("style")
  styleEl.textContent = `
    .app-download-banner a:hover {
      filter: brightness(0.98);
      transform: translateY(-1px);
    }
    @media (max-width: 700px) {
      .app-download-banner {
        grid-template-columns: auto 1fr !important;
        align-items: start !important;
      }
      .app-download-banner > div:last-child {
        grid-column: 1 / -1;
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        width: 100%;
      }
    }
  `
  if (!document.head.querySelector('style[data-app-download-banner-styles]')) {
    styleEl.setAttribute('data-app-download-banner-styles', 'true')
    document.head.appendChild(styleEl)
  }
}
