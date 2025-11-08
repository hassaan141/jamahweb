"use client"

export default function LinksCard({ org }) {
  if (!org) return null

  const siteUrl = firstTruthy(
    org.website_url,
    org.website,
    org.url,
    org.site,
  )
  const donateUrl = firstTruthy(
    org.donation_url,
    org.donate_url,
    org.donation,
    org.donate,
  )

  const websiteHref = normalizeUrl(siteUrl)
  const donateHref = normalizeUrl(donateUrl)

  const hasWebsite = Boolean(websiteHref)
  const hasDonate = Boolean(donateHref)
  if (!hasWebsite && !hasDonate) return null

  return (
    <div style={styles.card} className="links-card">
      <div style={styles.row} className="links-row">
        {hasWebsite && (
          <a
            href={websiteHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.btn, ...styles.btnSecondary }}
            className="links-btn links-btn-website"
          >
            Visit Website
          </a>
        )}
        {hasDonate && (
          <a
            href={donateHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.btn, ...styles.btnPrimary }}
            className="links-btn links-btn-donate"
          >
            Donate
          </a>
        )}
      </div>
    </div>
  )
}

function firstTruthy(...vals) {
  for (const v of vals) {
    const s = (v == null ? '' : String(v)).trim()
    if (s) return s
  }
  return null
}

function normalizeUrl(u) {
  if (!u) return null
  let s = String(u).trim()
  if (/^mailto:/i.test(s)) return s
  if (!/^https?:\/\//i.test(s)) {
    // Prepend https by default
    s = `https://${s}`
  }
  try {
    // Validate URL structure
    const url = new URL(s)
    return url.toString()
  } catch {
    return null
  }
}

const styles = {
  card: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    maxWidth: 600,
    margin: '12px auto 0',
    padding: 16,
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 16px',
    borderRadius: 999,
    textDecoration: 'none',
    fontWeight: 800,
    fontSize: 14,
    transition: 'filter 0.15s ease, transform 0.15s ease',
    whiteSpace: 'nowrap',
    minWidth: 120,
    border: '1px solid transparent',
  },
  btnPrimary: {
    background: '#059669',
    color: 'white',
    borderColor: '#059669',
    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
  },
  btnSecondary: {
    background: '#ecfdf5',
    color: '#065f46',
    borderColor: '#a7f3d0',
  },
}

if (typeof document !== 'undefined') {
  const responsive = document.createElement('style')
  responsive.textContent = `
    .links-btn:hover { filter: brightness(0.95); transform: translateY(-1px); }
    @media (max-width: 640px) {
      .links-row { flex-direction: column; gap: 10px !important; }
      .links-btn { width: 100%; }
    }
  `
  if (!document.head.querySelector('style[data-links-card-responsive]')) {
    responsive.setAttribute('data-links-card-responsive', 'true')
    document.head.appendChild(responsive)
  }
}
