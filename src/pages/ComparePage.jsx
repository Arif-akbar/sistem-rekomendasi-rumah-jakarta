import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFilterStore } from '../store/FilterStore'
import { supabase } from '../lib/supabase'
import { formatHarga } from '../hooks/UseProperties'
import Navbar from '../components/Navbar'

const SPECS = [
  { key: 'harga',         label: 'Harga',          fmt: (v) => formatHarga(v) },
  { key: 'tipe',          label: 'Tipe',            fmt: (v) => v },
  { key: 'kota_wilayah',  label: 'Wilayah',         fmt: (v) => v },
  { key: 'kecamatan',     label: 'Kecamatan',       fmt: (v) => v },
  { key: 'luas_bangunan', label: 'Luas Bangunan',   fmt: (v) => `${v} m²` },
  { key: 'luas_tanah',    label: 'Luas Tanah',      fmt: (v) => `${v} m²` },
  { key: 'kamar_tidur',   label: 'Kamar Tidur',     fmt: (v) => v },
  { key: 'kamar_mandi',   label: 'Kamar Mandi',     fmt: (v) => v },
  { key: 'lantai',        label: 'Lantai',          fmt: (v) => v },
  { key: 'garasi',        label: 'Garasi',          fmt: (v) => v },
  { key: 'sertifikat',    label: 'Sertifikat',      fmt: (v) => v },
]

export default function ComparePage() {
  const navigate = useNavigate()
  const { compareList, clearCompare } = useFilterStore()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (compareList.length === 0) { setLoading(false); return }
    supabase
      .from('properties')
      .select('*')
      .in('id', compareList)
      .then(({ data }) => {
        setProperties(data ?? [])
        setLoading(false)
      })
  }, [compareList])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center font-mono text-emerald-400 animate-pulse">
        MEMUAT DATA...
      </div>
    )
  }

  if (compareList.length === 0 || properties.length === 0) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-white font-mono">
        <Navbar />
        <div className="text-center space-y-4 mt-16">
          <div className="text-6xl opacity-20">⊞</div>
          <p className="text-white/40 text-sm">Belum ada properti yang dipilih untuk dibandingkan.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 px-5 py-2 rounded border border-emerald-400/30 text-emerald-400 text-xs hover:bg-emerald-400/10 transition-all"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <Navbar />

      {/* Fixed grid bg */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,212,170,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
              Perbandingan{' '}
              <span style={{ background: 'linear-gradient(90deg, #00d4aa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Properti
              </span>
            </h1>
            <p className="text-white/30 text-xs mt-1">Membandingkan {properties.length} properti</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded border border-white/10 text-white/40 text-xs hover:border-white/20 transition-all"
            >
              ← Kembali
            </button>
            <button
              onClick={() => { clearCompare(); navigate('/') }}
              className="px-4 py-2 rounded border border-red-400/30 text-red-400 text-xs hover:bg-red-400/10 transition-all"
            >
              Hapus Semua
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left text-white/25 uppercase tracking-widest w-36 bg-slate-900/50">Spesifikasi</th>
                {properties.map((p) => (
                  <th key={p.id} className="p-4 bg-slate-900/30">
                    <div className="text-left space-y-2">
                      <div className="w-full h-28 rounded-lg overflow-hidden bg-white/5 mb-3">
                        <img src={p.foto_urls?.[0]} alt={p.nama} className="w-full h-full object-cover" />
                      </div>
                      <p className="font-bold text-white text-sm line-clamp-2" style={{ fontFamily: "'Syne', sans-serif" }}>{p.nama}</p>
                      <p className="text-white/30 text-[10px]">◎ {p.kecamatan}, {p.kota_wilayah}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPECS.map(({ key, label, fmt }, idx) => (
                <tr
                  key={key}
                  className={`border-b border-white/5 ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                >
                  <td className="p-4 text-white/30 uppercase tracking-tighter text-[10px] font-bold">{label}</td>
                  {properties.map((p) => {
                    const vals = properties.map((x) => x[key])
                    const numVals = vals.filter((v) => typeof v === 'number')
                    const isBest = numVals.length > 1 && (
                      key === 'harga'
                        ? p[key] === Math.min(...numVals)
                        : p[key] === Math.max(...numVals)
                    )
                    return (
                      <td key={p.id} className={`p-4 ${isBest ? 'text-emerald-400 font-bold' : 'text-white/60'}`}>
                        {p[key] != null ? fmt(p[key]) : <span className="text-white/20 italic">—</span>}
                        {isBest && <span className="ml-2 text-[9px] bg-emerald-400/10 border border-emerald-400/30 px-1 py-0.5 rounded">TERBAIK</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {/* Fasilitas row */}
              <tr className="border-b border-white/5">
                <td className="p-4 text-white/30 uppercase tracking-tighter text-[10px] font-bold">Fasilitas</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {p.fasilitas?.length > 0
                        ? p.fasilitas.map((f, i) => (
                            <span key={i} className="text-[9px] border border-white/10 px-1.5 py-0.5 rounded text-white/40">{f}</span>
                          ))
                        : <span className="text-white/20 italic text-[10px]">—</span>
                      }
                    </div>
                  </td>
                ))}
              </tr>
              {/* Detail button row */}
              <tr>
                <td className="p-4" />
                {properties.map((p) => (
                  <td key={p.id} className="p-4">
                    <button
                      onClick={() => navigate(`/properti/${p.id}`)}
                      className="w-full py-2 rounded border border-emerald-400/30 text-emerald-400 text-[10px] hover:bg-emerald-400/10 transition-all"
                    >
                      Lihat Detail →
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <style>{``}</style>
    </div>
  )
}
