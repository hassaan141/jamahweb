"use client"

import { FaMapMarkerAlt, FaGlobe, FaHeart, FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa'

export default function ActionButtons({ org }) {
  if (!org) return null

  // Extract URLs
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
    org.donate_link,
  )
  const facebookUrl = firstTruthy(
    org.facebook_url,
    org.facebook,
  )
  const instagramUrl = firstTruthy(
    org.instagram_url,
    org.instagram,
  )
  const twitterUrl = firstTruthy(
    org.twitter_url,
    org.twitter,
  )

  const websiteHref = normalizeUrl(siteUrl)
  const donateHref = normalizeUrl(donateUrl)
  const facebookHref = normalizeUrl(facebookUrl)
  const instagramHref = normalizeUrl(instagramUrl)
  const twitterHref = normalizeUrl(twitterUrl)

  // Map data
  const name = org.name || 'Destination'
  const lat = typeof org.latitude === 'number' ? org.latitude : parseFloat(org.latitude)
  const lng = typeof org.longitude === 'number' ? org.longitude : parseFloat(org.longitude)
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
  const addressParts = [org.address, org.city, org.province_state, org.country].filter(Boolean)
  const address = addressParts.join(', ')

  const hasWebsite = Boolean(websiteHref)
  const hasDonate = Boolean(donateHref)
  const hasFacebook = Boolean(facebookHref)
  const hasInstagram = Boolean(instagramHref)
  const hasTwitter = Boolean(twitterHref)
  const hasMaps = Boolean(address || hasCoords)

  // If no actions available, don't render
  if (!hasWebsite && !hasDonate && !hasMaps && !hasFacebook && !hasInstagram && !hasTwitter) return null

  function openMaps() {
    try {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : ''
      const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window).MSStream
      const label = encodeURIComponent(name)
      const coords = hasCoords ? `${lat},${lng}` : null
      const q = address ? encodeURIComponent(address) : null

      // Platform-specific URLs
      const apple = hasCoords
        ? `https://maps.apple.com/?daddr=${coords}&q=${label}`
        : q
          ? `https://maps.apple.com/?q=${q}`
          : null

      // Prefer address for Google Maps; fallback to coords
      const google = q
        ? `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=driving`
        : coords
          ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}&travelmode=driving`
          : null

      const url = isIOS ? apple : google
      if (url) {
        const win = window.open(url, isIOS ? '_self' : '_blank', 'noopener,noreferrer')
        if (win) { try { win.opener = null } catch {} }
      }
    } catch (e) {
      // no-op
    }
  }

  return (
    <div style={styles.card} className="action-buttons">
      <div style={styles.header}>
        <div style={styles.title}>{name}</div>
        {address && <div style={styles.subtitle}>{address}</div>}
        {org.description && <div style={styles.description}>{org.description}</div>}
      </div>
      
      <div style={styles.buttonRow} className="action-button-row">
        {hasMaps && (
          <button 
            type="button" 
            onClick={openMaps} 
            style={{ ...styles.btn, ...styles.btnMaps }}
            className="action-btn action-btn-maps"
          >
            <FaMapMarkerAlt style={styles.btnIcon} />
            <span>Directions</span>
          </button>
        )}
        
        {hasWebsite && (
          <a
            href={websiteHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.btn, ...styles.btnWebsite }}
            className="action-btn action-btn-website"
          >
            <FaGlobe style={styles.btnIcon} />
            <span>Website</span>
          </a>
        )}
        
        {hasDonate && (
          <a
            href={donateHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.btn, ...styles.btnDonate }}
            className="action-btn action-btn-donate"
          >
            <FaHeart style={styles.btnIcon} />
            <span>Donate</span>
          </a>
        )}
        
        {hasFacebook && (
          <a
            href={facebookHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.btn, ...styles.btnFacebook }}
            className="action-btn action-btn-facebook"
          >
            <FaFacebookF style={styles.btnIcon} />
            <span>Facebook</span>
          </a>
        )}
        
        {hasInstagram && (
          <a
            href={instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.btn, ...styles.btnInstagram }}
            className="action-btn action-btn-instagram"
          >
            <FaInstagram style={styles.btnIcon} />
            <span>Instagram</span>
          </a>
        )}
        
        {hasTwitter && (
          <a
            href={twitterHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.btn, ...styles.btnTwitter }}
            className="action-btn action-btn-twitter"
          >
            <FaTwitter style={styles.btnIcon} />
            <span>Twitter</span>
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
    margin: '16px auto 0',
    padding: '16px 20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  header: {
    marginBottom: 16,
    textAlign: 'center',
  },
  title: { 
    fontSize: 16, 
    fontWeight: 700, 
    color: '#065f46',
    marginBottom: 4,
  },
  subtitle: { 
    fontSize: 14, 
    color: '#6b7280',
    lineHeight: 1.4,
  },
  description: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 1.6,
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid #f3f4f6',
    whiteSpace: 'pre-wrap',
    textAlign: 'center',
  },
  buttonRow: {
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
    gap: 6,
    padding: '10px 16px',
    borderRadius: 999,
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 14,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    minWidth: 110,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  btnMaps: {
    background: '#059669',
    color: 'white',
  },
  btnWebsite: {
    background: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
  },
  btnDonate: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
  },
  btnFacebook: {
    background: '#1877f2',
    color: 'white',
    border: 'none',
  },
  btnInstagram: {
    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    color: 'white',
    border: 'none',
  },
  btnTwitter: {
    background: '#1DA1F2',
    color: 'white',
    border: 'none',
  },
  btnIcon: {
    fontSize: 14,
    lineHeight: 1,
  },
}

if (typeof document !== 'undefined') {
  const responsive = document.createElement('style')
  responsive.textContent = `
    .action-btn:hover { 
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }
    .action-btn-maps:hover { filter: brightness(1.05); }
    .action-btn-website:hover { background: #d1fae5 !important; }
    .action-btn-donate:hover { filter: brightness(1.1); }
    .action-btn-facebook:hover { filter: brightness(1.1); }
    .action-btn-instagram:hover { filter: brightness(1.1); }
    .action-btn-twitter:hover { filter: brightness(1.1); }
    
    @media (max-width: 640px) {
      .action-button-row { 
        flex-direction: column !important; 
        gap: 10px !important; 
      }
      .action-btn { 
        width: 100% !important; 
        min-width: unset !important;
        padding: 12px 16px !important;
      }
      .action-buttons { 
        margin: 12px 0 0 0 !important; 
        padding: 14px 16px !important;
      }
    }
    
    @media (max-width: 480px) {
      .action-btn { font-size: 13px !important; }
    }
  `
  if (!document.head.querySelector('style[data-action-buttons-responsive]')) {
    responsive.setAttribute('data-action-buttons-responsive', 'true')
    document.head.appendChild(responsive)
  }
}