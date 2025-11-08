"use client"

import { useCallback, useMemo } from 'react'

// Compact, accessible segmented control for Today/Tomorrow
export default function DateToggle({ value = 'today', onChange }) {
  const selectedIndex = useMemo(() => (value === 'tomorrow' ? 1 : 0), [value])

  const handleKeyDown = useCallback(
    (e) => {
      if (!onChange) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
      }
      if (e.key === 'ArrowRight') {
        onChange(selectedIndex === 0 ? 'tomorrow' : 'tomorrow')
      } else if (e.key === 'ArrowLeft') {
        onChange(selectedIndex === 1 ? 'today' : 'today')
      }
    },
    [onChange, selectedIndex]
  )

  return (
    <div
      className="segmented-date-toggle"
      style={styles.wrap}
      role="tablist"
      aria-label="Select day"
      onKeyDown={handleKeyDown}
    >
      {/* Active thumb */}
      <div
        aria-hidden
        style={{
          ...styles.thumb,
          left: selectedIndex === 0 ? 2 : 'calc(50% + 2px)',
        }}
      />

      <button
        type="button"
        role="tab"
        aria-selected={selectedIndex === 0}
        tabIndex={selectedIndex === 0 ? 0 : -1}
        onClick={() => onChange && onChange('today')}
        style={{ ...styles.btn, ...(selectedIndex === 0 ? styles.btnActive : null) }}
      >
        Today
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={selectedIndex === 1}
        tabIndex={selectedIndex === 1 ? 0 : -1}
        onClick={() => onChange && onChange('tomorrow')}
        style={{ ...styles.btn, ...(selectedIndex === 1 ? styles.btnActive : null) }}
      >
        Tomorrow
      </button>
    </div>
  )
}

const styles = {
  wrap: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 0,
    alignItems: 'center',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: 999,
    padding: 2,
    height: 30,
    minWidth: 170,
    boxShadow: '0 1px 1px rgba(0,0,0,0.03)',
  },
  thumb: {
    position: 'absolute',
    top: 2,
    width: 'calc(50% - 4px)',
    height: 'calc(100% - 4px)',
    background: '#ffffff',
    borderRadius: 999,
    border: '1px solid #a7f3d0',
    boxShadow: '0 1px 1px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)',
    transition: 'left 160ms ease',
  },
  btn: {
    position: 'relative',
    zIndex: 1,
    appearance: 'none',
    background: 'transparent',
    border: 'none',
    color: '#065f46',
    fontWeight: 700,
    fontSize: 11,
    cursor: 'pointer',
    borderRadius: 999,
    padding: '4px 8px',
    outline: 'none',
  },
  btnActive: {
    color: '#065f46',
  },
}

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style')
  styleEl.textContent = `
    .segmented-date-toggle button:focus-visible { box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.45); }
    @media (max-width: 640px) {
      .segmented-date-toggle { min-width: 100% !important; height: 28px !important; }
      .segmented-date-toggle button { font-size: 11px !important; padding: 4px 6px !important; }
    }
  `
  if (!document.head.querySelector('style[data-segmented-date-toggle]')) {
    styleEl.setAttribute('data-segmented-date-toggle', 'true')
    document.head.appendChild(styleEl)
  }
}
