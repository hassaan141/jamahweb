import React, { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Analytics } from "@vercel/analytics/react"
import Home from './pages/Home'
import Masjid from './pages/Masjid'
import MasjidHorizontal from './pages/MasjidHorizontal'
import './App.css'

function ManifestUpdater() {
  const location = useLocation()
  const baseManifestRef = useRef(null)
  const baseManifestUrlRef = useRef(null)
  const baseScopeRef = useRef(null)

  useEffect(() => {
    const link = document.querySelector('link[rel="manifest"]')
    if (!link) return

    const updateManifest = async () => {
      if (!baseManifestUrlRef.current) {
        baseManifestUrlRef.current = link.getAttribute('href')
      }

      if (!baseScopeRef.current) {
        try {
          const absUrl = new URL(baseManifestUrlRef.current || '', window.location.href)
          const manifestPath = absUrl.pathname || '/'
          const scopeFromPath = manifestPath.endsWith('/') ? manifestPath : manifestPath.replace(/[^/]*$/, '')
          baseScopeRef.current = scopeFromPath || '/'
        } catch {
          baseScopeRef.current = '/'
        }
      }

      if (!baseManifestRef.current) {
        try {
          const res = await fetch(baseManifestUrlRef.current || link.getAttribute('href'))
          if (!res.ok) return
          baseManifestRef.current = await res.json()
        } catch {
          return
        }
      }

      const baseManifest = baseManifestRef.current || {}
      const pathname = location.pathname || '/'
      const search = location.search || ''
      const startUrl = pathname.startsWith('/') ? `${pathname}${search}` : '/'
      const scope = baseScopeRef.current || '/'
      const manifest = {
        ...baseManifest,
        start_url: startUrl,
        scope: scope
      }

      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' })
      const url = URL.createObjectURL(blob)
      const prevUrl = link.dataset.blobUrl
      link.setAttribute('href', url)
      link.dataset.blobUrl = url
      if (prevUrl) URL.revokeObjectURL(prevUrl)
    }

    updateManifest()
  }, [location])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ManifestUpdater />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/masjid/:slug" element={<Masjid />} />
        <Route path="/masjid/:slug/tv" element={<MasjidHorizontal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  )
}
