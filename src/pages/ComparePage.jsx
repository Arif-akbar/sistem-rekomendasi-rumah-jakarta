import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFilterStore } from '../store/FilterStore'
import { supabase } from '../lib/supabase'
import { formatHarga } from '../hooks/UseProperties'
import Navbar from '../components/Navbar'

const T = {
  bgPage: '#0c0a14', bgCard: '#16112a',
  border: 'rgba(255,255,255,0.07)', borderHover: 'rgba(124,58,237,0.3)',
  textPrimary: '#f1f0f5', textMuted: 'rgba(255,255,255,0.45)', textSubtle: 'rgba(255,255,255,0.25)',
  violetLight: '#a78bfa', violetPale: '#c4b5fd', amberLight: '#fbbf24',
}

const SPECS = [
  { key: 'harga',         label: 'Harga',         fmt: v => formatHarga(v) },
  { key: 'tipe',          label: 'Tipe',           fmt: v => v },
  { key: 'kota_wilayah',  label: 'Wilayah',        fmt: v => v },
  { key: 'kecamatan',     label: 'Kecamatan',      fmt: v => v },
  { key: 'luas_bangunan', label: 'Luas Bangunan',  fmt: v => `${v} m²` },
  { key: 'luas_tanah',    label: 'Luas Tanah',     fmt: v => `${v} m²` },
  { key: 'kamar_tidur',   label: 'Kamar Tidur',    fmt: v => v },
  { key: 'kamar_mandi',   label: 'Kamar Mandi',    fmt: v => v },
  { key: 'lantai',        label: 'Lantai',         fmt: v => v },
  { key: 'garasi',        label: 'Garasi',         fmt: v => v },
  { key: 'sertifikat',    label: 'Sertifikat',     fmt: v => v },
]

export default function ComparePage() {
  const navigate = useNavigate()
  const { compareList, clearCompare } = useFilterStore()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (compareList.length === 0) { setLoading(false); return }
    supabase.from('properties').select('*').in('id', compareList)
      .then(({ data }) => { setProperties(data ?? []); setLoading(false) })
  }, [compareList])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: T.bgPage }}>
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <div className="h-8 w-48 rounded-xl animate-pulse mb-8" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}`, background: T.bgCard }}>
            <div className="flex">
              <div className="w-36 flex-shrink-0 p-4 space-y-4" style={{ borderRight: `1px solid ${T.border}` }}>
                {[...Array(8)].map((_, i) => <div key={i} className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: `${50 + (i % 3) * 20}%` }} />)}
              </div>
              {[...Array(2)].map((_, ci) => (
                <div key={ci} className="flex-1 p-4 space-y-4" style={{ borderRight: ci === 0 ? `1px solid ${T.border}` : 'none' }}>
                  <div className="h-24 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  {[...Array(7)].map((_, i) => <div key={i} className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: `${40 + (i % 4) * 15}%` }} />)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (compareList.length === 0 || properties.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: T.bgPage }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-4">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>⊞</div>
          <p className="text-lg font-semibold" style={{ color: T.textPrimary }}>Belum ada properti untuk dibandingkan</p>
          <p className="text-sm max-w-xs" style={{ color: T.textMuted }}>
            Pilih hingga 3 properti dari halaman utama untuk membandingkannya di sini.
          </p>
          <button onClick={() => navigate('/')}
            className="mt-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: T.bgPage, color: T.textPrimary }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: T.textPrimary }}>Perbandingan Properti</h1>
            <p className="text-sm mt-1" style={{ color: T.textMuted }}>Membandingkan {properties.length} properti</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ background: T.bgCard, border: `1px solid ${T.border}`, color: T.textMuted }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.violetLight }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted }}>
              ← Kembali
            </button>
            <button onClick={() => { clearCompare(); navigate('/') }}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)' }}>
              Hapus Semua
            </button>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden overflow-x-auto" style={{ border: `1px solid ${T.border}` }}>
          <table className="w-full text-sm border-collapse" style={{ minWidth: `${200 + properties.length * 220}px` }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                <th className="p-4 text-left align-bottom"
                  style={{ background: T.bgCard, width: 160, minWidth: 160, position: 'sticky', left: 0, zIndex: 10, borderRight: `1px solid ${T.border}` }}>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.textSubtle }}>Spesifikasi</span>
                </th>
                {properties.map(p => (
                  <th key={p.id} className="p-4 align-top"
                    style={{ background: T.bgCard, minWidth: 220, borderRight: `1px solid ${T.border}` }}>
                    <div className="space-y-3 text-left">
                      <div className="w-full h-28 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {p.foto_urls?.[0]
                          ? <img src={p.foto_urls[0]} alt={p.nama} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-3xl" style={{ opacity: 0.2 }}>🏠</div>
                        }
                      </div>
                      <p className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: T.textPrimary }}>{p.nama}</p>
                      <p className="text-xs" style={{ color: T.textSubtle }}>📍 {p.kecamatan}, {p.kota_wilayah}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPECS.map(({ key, label, fmt }, idx) => {
                const vals    = properties.map(x => x[key])
                const numVals = vals.filter(v => typeof v === 'number')
                return (
                  <tr key={key} style={{ borderBottom: `1px solid ${T.border}`, background: idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                    <td className="p-4"
                      style={{ background: idx % 2 === 0 ? 'rgba(22,17,42,0.97)' : 'rgba(12,10,20,0.97)', position: 'sticky', left: 0, zIndex: 5, borderRight: `1px solid ${T.border}` }}>
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: T.textSubtle }}>{label}</span>
                    </td>
                    {properties.map(p => {
                      const isBest = numVals.length > 1 && (key === 'harga' ? p[key] === Math.min(...numVals) : p[key] === Math.max(...numVals))
                      return (
                        <td key={p.id} className="p-4" style={{ borderRight: `1px solid ${T.border}` }}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium" style={{ color: isBest ? T.amberLight : T.textMuted }}>
                              {p[key] != null ? fmt(p[key]) : <span style={{ color: T.textSubtle, fontStyle: 'italic' }}>—</span>}
                            </span>
                            {isBest && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: T.amberLight }}>
                                Terbaik
                              </span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}

              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                <td className="p-4"
                  style={{ background: 'rgba(12,10,20,0.97)', position: 'sticky', left: 0, zIndex: 5, borderRight: `1px solid ${T.border}` }}>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: T.textSubtle }}>Fasilitas</span>
                </td>
                {properties.map(p => (
                  <td key={p.id} className="p-4" style={{ borderRight: `1px solid ${T.border}` }}>
                    <div className="flex flex-wrap gap-1.5">
                      {p.fasilitas?.length > 0
                        ? p.fasilitas.map((f, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-lg"
                              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.textMuted }}>
                              {f}
                            </span>
                          ))
                        : <span className="text-xs italic" style={{ color: T.textSubtle }}>—</span>
                      }
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4"
                  style={{ background: 'rgba(12,10,20,0.97)', position: 'sticky', left: 0, zIndex: 5, borderRight: `1px solid ${T.border}` }} />
                {properties.map(p => (
                  <td key={p.id} className="p-4" style={{ borderRight: `1px solid ${T.border}` }}>
                    <button onClick={() => navigate(`/properti/${p.id}`)}
                      className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', boxShadow: '0 2px 12px rgba(124,58,237,0.3)' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.5)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.3)'}>
                      Lihat Detail →
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
