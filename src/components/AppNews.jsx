"use client"

import { useState } from "react"

const IOS_STORE_URL = "https://apps.apple.com/ca/app/jamaah/id6755858703"
const ANDROID_STORE_URL = "https://play.google.com/store/apps/details?id=com.hassaan141.jamaahapp"

const slides = [
  {
    title: "Create an account",
    text: "Set up Jamaah once and keep your masjid experience ready wherever you go.",
    graphic: "account",
  },
  {
    title: "Turn on notifications and location",
    text: "Allow location and notifications so Jamaah can send timely prayer alerts.",
    graphic: "permissions",
  },
  {
    title: "Travel with local adhan alerts",
    text: "Get adhan notifications from the closest masjids as you move through the day.",
    graphic: "travel",
  },
]

export default function AppNews() {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = slides[activeIndex]

  function goToSlide(index) {
    setActiveIndex(index)
  }

  function nextSlide() {
    setActiveIndex((current) => (current + 1) % slides.length)
  }

  return (
    <section style={styles.shell} className="app-news" aria-label="Jamaah mobile app announcement">
      <div style={styles.copy}>
        <div style={styles.badge}>New app</div>
        <h2 style={styles.title}>Jamaah is now on mobile</h2>
        <p style={styles.body}>
          Download the app for prayer alerts, nearby masjids, and location-aware adhan notifications.
        </p>
        <div style={styles.storeRow}>
          <a href={IOS_STORE_URL} target="_blank" rel="noopener noreferrer" style={styles.storeButton}>
            App Store
          </a>
          <a href={ANDROID_STORE_URL} target="_blank" rel="noopener noreferrer" style={styles.storeButtonAlt}>
            Google Play
          </a>
        </div>
      </div>

      <div style={styles.carousel} className="app-news-carousel">
        <button
          type="button"
          onClick={nextSlide}
          style={styles.slideButton}
          className="app-news-slide-button"
          aria-label="Show next app guide step"
        >
          <GuideGraphic type={active.graphic} />
          <span style={styles.stepCount}>Step {activeIndex + 1} of {slides.length}</span>
          <strong style={styles.stepTitle}>{active.title}</strong>
          <span style={styles.stepText}>{active.text}</span>
        </button>

        <div style={styles.dots} aria-label="App guide steps">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => goToSlide(index)}
              style={{
                ...styles.dot,
                ...(index === activeIndex ? styles.dotActive : null),
              }}
              aria-label={`Show ${slide.title}`}
              aria-pressed={index === activeIndex}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function GuideGraphic({ type }) {
  if (type === "permissions") {
    return (
      <svg style={styles.graphic} viewBox="0 0 180 120" role="img" aria-label="Notifications and location illustration">
        <rect x="50" y="12" width="80" height="96" rx="14" fill="#f8fafc" stroke="#0f766e" strokeWidth="4" />
        <path d="M90 42c13 0 24 11 24 24H66c0-13 11-24 24-24z" fill="#ccfbf1" />
        <path d="M90 30v12M70 66h40M76 82h28" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
        <circle cx="126" cy="32" r="16" fill="#fde68a" stroke="#ca8a04" strokeWidth="4" />
        <path d="M126 24v8l6 4" stroke="#854d0e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (type === "travel") {
    return (
      <svg style={styles.graphic} viewBox="0 0 180 120" role="img" aria-label="Travel and nearby masjids illustration">
        <path d="M28 86c34-32 76-32 124 0" fill="none" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
        <circle cx="54" cy="72" r="10" fill="#bbf7d0" stroke="#15803d" strokeWidth="4" />
        <circle cx="126" cy="52" r="10" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="4" />
        <path d="M84 76l12-38 12 38-12-8-12 8z" fill="#fef3c7" stroke="#ca8a04" strokeWidth="4" strokeLinejoin="round" />
        <path d="M40 92h100" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg style={styles.graphic} viewBox="0 0 180 120" role="img" aria-label="Account setup illustration">
      <rect x="44" y="16" width="92" height="88" rx="16" fill="#f8fafc" stroke="#0f766e" strokeWidth="4" />
      <circle cx="90" cy="52" r="17" fill="#d1fae5" stroke="#047857" strokeWidth="4" />
      <path d="M61 90c7-18 51-18 58 0" fill="#ccfbf1" stroke="#047857" strokeWidth="4" strokeLinecap="round" />
      <path d="M58 28h64" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

const styles = {
  shell: {
    display: "grid",
    gridTemplateColumns: "1fr minmax(240px, 320px)",
    gap: 14,
    alignItems: "stretch",
    background: "#ffffff",
    border: "1px solid #d1fae5",
    borderRadius: 8,
    padding: 16,
    margin: "0 0 18px",
    boxShadow: "0 2px 12px rgba(15, 118, 110, 0.08)",
  },
  copy: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minWidth: 0,
  },
  badge: {
    width: "fit-content",
    padding: "4px 8px",
    borderRadius: 8,
    background: "#ecfeff",
    color: "#155e75",
    border: "1px solid #a5f3fc",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 8,
  },
  title: {
    margin: 0,
    color: "#064e3b",
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.15,
  },
  body: {
    margin: "8px 0 0",
    color: "#374151",
    fontSize: 14,
    lineHeight: 1.45,
  },
  storeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  storeButton: {
    color: "#ffffff",
    background: "#047857",
    border: "1px solid #047857",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 14,
    fontWeight: 800,
    textDecoration: "none",
  },
  storeButtonAlt: {
    color: "#075985",
    background: "#e0f2fe",
    border: "1px solid #7dd3fc",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 14,
    fontWeight: 800,
    textDecoration: "none",
  },
  carousel: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minWidth: 0,
  },
  slideButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    textAlign: "left",
    gap: 5,
    width: "100%",
    height: "100%",
    border: "1px solid #bae6fd",
    borderRadius: 8,
    background: "#f8fafc",
    padding: 12,
    cursor: "pointer",
  },
  graphic: {
    width: "100%",
    height: 92,
    display: "block",
  },
  stepCount: {
    color: "#0369a1",
    fontSize: 12,
    fontWeight: 800,
  },
  stepTitle: {
    color: "#0f172a",
    fontSize: 16,
    lineHeight: 1.2,
  },
  stepText: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 1.35,
  },
  dots: {
    display: "flex",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    border: "1px solid #0f766e",
    background: "#ffffff",
    padding: 0,
    cursor: "pointer",
  },
  dotActive: {
    width: 24,
    background: "#0f766e",
  },
}

if (typeof document !== "undefined") {
  const styleEl = document.createElement("style")
  styleEl.textContent = `
    .app-news a:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(15, 118, 110, 0.16);
    }
    .app-news-slide-button:hover {
      background: #f0fdfa !important;
    }
    @media (max-width: 720px) {
      .app-news {
        grid-template-columns: 1fr !important;
        padding: 14px !important;
      }
      .app-news-carousel {
        order: -1;
      }
    }
  `
  if (!document.head.querySelector('style[data-app-news-styles]')) {
    styleEl.setAttribute('data-app-news-styles', 'true')
    document.head.appendChild(styleEl)
  }
}
