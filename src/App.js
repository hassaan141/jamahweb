import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './services/supabase/queryClient'
import Home from './pages/Home'
import Masjid from './pages/Masjid'
import MasjidHorizontal from './pages/MasjidHorizontal'
import './App.css'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/masjid/:slug" element={<Masjid />} />
          <Route path="/masjid/:slug/horizontal" element={<MasjidHorizontal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
