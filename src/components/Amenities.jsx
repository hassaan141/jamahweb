"use client"

import { FaWifi, FaParking, FaWheelchair, FaBaby, FaToilet, FaPrayingHands, FaUserFriends, FaTv, FaBook, FaUtensils } from 'react-icons/fa'
import { MdWc, MdAir, MdLocalLibrary } from 'react-icons/md'

export default function Amenities({ org }) {
  if (!org) return null

  // Common amenity mappings with icons
  const amenityMap = {
    wifi: { label: 'WiFi', icon: FaWifi, color: '#3b82f6' },
    parking: { label: 'Parking', icon: FaParking, color: '#6b7280' },
    street_parking: { label: 'Street Parking', icon: FaParking, color: '#6b7280' },
    on_site_parking: { label: 'On-Site Parking', icon: FaParking, color: '#6b7280' },
    wheelchair_accessible: { label: 'Wheelchair Accessible', icon: FaWheelchair, color: '#059669' },
    wheelchair: { label: 'Wheelchair Access', icon: FaWheelchair, color: '#059669' },
    'baby_changing': { label: 'Baby Changing', icon: FaBaby, color: '#f59e0b' },
    washrooms: { label: 'Washrooms', icon: FaToilet, color: '#6366f1' },
    women_washroom: { label: 'Women Washroom', icon: FaToilet, color: '#ec4899' },
    men_washroom: { label: 'Men Washroom', icon: FaToilet, color: '#3b82f6' },
    women_prayer_space: { label: 'Women Prayer Space', icon: FaPrayingHands, color: '#ec4899' },
    men_prayer_space: { label: 'Men Prayer Space', icon: FaPrayingHands, color: '#3b82f6' },
    'prayer_rugs': { label: 'Prayer Rugs', icon: FaPrayingHands, color: '#059669' },
    'community_hall': { label: 'Community Hall', icon: FaUserFriends, color: '#dc2626' },
    'womens_area': { label: "Women's Area", icon: FaUserFriends, color: '#ec4899' },
    'mens_area': { label: "Men's Area", icon: FaUserFriends, color: '#3b82f6' },
    tv: { label: 'TV/Screen', icon: FaTv, color: '#374151' },
    library: { label: 'Library', icon: FaBook, color: '#7c3aed' },
    'islamic_library': { label: 'Islamic Library', icon: MdLocalLibrary, color: '#7c3aed' },
    kitchen: { label: 'Kitchen', icon: FaUtensils, color: '#f97316' },
    ac: { label: 'Air Conditioning', icon: MdAir, color: '#06b6d4' },
    'air_conditioning': { label: 'Air Conditioning', icon: MdAir, color: '#06b6d4' },
    heating: { label: 'Heating', icon: MdAir, color: '#ef4444' },
    wudu: { label: 'Wudu Area', icon: MdWc, color: '#0891b2' },
    'wudu_area': { label: 'Wudu Area', icon: MdWc, color: '#0891b2' },
    'wudu_facilities': { label: 'Wudu Facilities', icon: MdWc, color: '#0891b2' }
  }

  // Extract amenities from organization data
  const amenities = []

  // Check for amenities field (could be array, string, or object)
  if (org.amenities) {
    if (typeof org.amenities === 'object' && !Array.isArray(org.amenities)) {
      // Handle object format like { "street_parking": true, "women_washroom": false }
      Object.entries(org.amenities).forEach(([key, value]) => {
        if (value === true || value === 'true' || value === 1) {
          amenities.push(key)
        }
      })
    } else if (Array.isArray(org.amenities)) {
      amenities.push(...org.amenities)
    } else if (typeof org.amenities === 'string') {
      // Try to parse as JSON first, fallback to comma-separated
      try {
        const parsed = JSON.parse(org.amenities)
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          Object.entries(parsed).forEach(([key, value]) => {
            if (value === true || value === 'true' || value === 1) {
              amenities.push(key)
            }
          })
        } else if (Array.isArray(parsed)) {
          amenities.push(...parsed)
        } else {
          amenities.push(org.amenities)
        }
      } catch {
        // Split by common delimiters
        amenities.push(...org.amenities.split(/[,;|\n]/).map(a => a.trim()).filter(Boolean))
      }
    }
  }

  // Check for individual boolean fields at the org root level
  Object.keys(amenityMap).forEach(key => {
    if (org[key] === true || org[key] === 'true' || org[key] === 1) {
      if (!amenities.includes(key)) {
        amenities.push(key)
      }
    }
  })

  // Filter out duplicates and normalize keys
  const normalizedAmenities = [...new Set(amenities.filter(Boolean))]

  if (normalizedAmenities.length === 0) return null

  return (
    <div style={styles.card} className="amenities-card">
      <div style={styles.header}>
        <span style={styles.title}>Amenities</span>
      </div>
      <div style={styles.grid} className="amenities-grid">
        {normalizedAmenities.map(amenity => {
          const mapping = amenityMap[amenity] || {
            label: amenity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            icon: FaPrayingHands,
            color: '#059669'
          }
          const IconComponent = mapping.icon

          return (
            <div key={amenity} style={styles.amenity} className="amenity-item">
              <IconComponent 
                style={{ ...styles.icon, color: mapping.color }} 
                aria-hidden="true"
              />
              <span style={styles.label}>{mapping.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
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
    letterSpacing: '-0.01em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12,
  },
  amenity: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  icon: {
    fontSize: 14,
    flexShrink: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    lineHeight: 1.2,
  },
}

if (typeof document !== 'undefined') {
  const responsive = document.createElement('style')
  responsive.textContent = `
    .amenity-item:hover {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important;
      border-color: #a7f3d0 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
    }
    
    @media (max-width: 640px) {
      .amenities-grid { 
        grid-template-columns: 1fr !important;
        gap: 8px !important;
      }
      .amenity-item { 
        padding: 12px 14px !important;
        justify-content: center !important;
      }
      .amenities-card {
        margin: 12px auto 0 !important;
        padding: 14px 16px !important;
      }
    }
    
    @media (max-width: 480px) {
      .amenity-item span { 
        font-size: 12px !important; 
      }
      .amenity-item svg {
        font-size: 13px !important;
      }
    }
  `
  if (!document.head.querySelector('style[data-amenities-responsive]')) {
    responsive.setAttribute('data-amenities-responsive', 'true')
    document.head.appendChild(responsive)
  }
}