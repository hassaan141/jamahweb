"use client"

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.section}>
            <h3 style={styles.heading}>Contact Us</h3>
            <a href="mailto:info@awqat.net" style={styles.link}>
              info@awqat.net
            </a>
          </div>
          <div style={styles.section}>
            <h3 style={styles.heading}>Help & Support</h3>
            <a href="mailto:jamahcommunityapp@gmail.com" style={styles.link}>
              jamahcommunityapp@gmail.com
            </a>
          </div>
        </div>
        <div style={styles.copyright}>
          <p style={styles.copyrightText}>© {new Date().getFullYear()} Awqat. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

const styles = {
  footer: {
    background: "#ffffff",
    borderTop: "1px solid #e5e7eb",
    marginTop: "auto",
  },
  container: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "40px 16px 24px",
  },
  content: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: 48,
    marginBottom: 32,
    flexWrap: "wrap",
  },
  section: {
    textAlign: "center",
  },
  heading: {
    fontSize: 14,
    fontWeight: 600,
    color: "#059669",
    marginBottom: 12,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  link: {
    fontSize: 15,
    color: "#374151",
    textDecoration: "none",
    transition: "color 0.2s ease",
    display: "inline-block",
  },
  text: {
    fontSize: 15,
    color: "#374151",
    margin: 0,
  },
  copyright: {
    textAlign: "center",
    paddingTop: 24,
    borderTop: "1px solid #f3f4f6",
  },
  copyrightText: {
    fontSize: 13,
    color: "#9ca3af",
    margin: 0,
  },
}

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style")
  styleSheet.textContent = `
    footer a:hover {
      color: #059669 !important;
    }
  `
  if (!document.head.querySelector("style[data-footer-hover]")) {
    styleSheet.setAttribute("data-footer-hover", "true")
    document.head.appendChild(styleSheet)
  }
}
