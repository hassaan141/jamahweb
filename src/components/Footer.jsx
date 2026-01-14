"use client"

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.section}>
            <h3 style={styles.heading}>Contact Us</h3>
            <a href="mailto:infoawqat@gmail.com" style={styles.link}>
              infoawqat@gmail.com
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
          <p style={styles.copyrightText}>Â© {new Date().getFullYear()} Awqat. All rights reserved.</p>
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
    /* reduced padding to make footer less tall */
    padding: "20px 12px 12px",
  },
  content: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: 28,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  section: {
    textAlign: "center",
  },
  heading: {
    fontSize: 13,
    fontWeight: 700,
    color: "#059669",
    marginBottom: 8,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  link: {
    fontSize: 14,
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
    /* tighter top padding so footer doesn't take too much vertical space */
    paddingTop: 12,
    borderTop: "1px solid #f3f4f6",
  },
  copyrightText: {
    fontSize: 12,
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
    /* Responsive tweaks: make footer more compact on small screens */
    @media (max-width: 640px) {
      footer { padding-bottom: 8px; }
      footer .container { padding: 14px 12px !important; }
      footer h3 { margin-bottom: 6px !important; }
      footer a { font-size: 14px !important; }
      footer p { font-size: 12px !important; }
    }
  `
  if (!document.head.querySelector("style[data-footer-hover]")) {
    styleSheet.setAttribute("data-footer-hover", "true")
    document.head.appendChild(styleSheet)
  }
}