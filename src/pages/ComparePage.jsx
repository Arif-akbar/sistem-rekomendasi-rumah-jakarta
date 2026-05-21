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
      <div className="min-h-screen flex items-center justify-center text-violet-400">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold tracking-widest text-sm">MEMUAT DATA...</span>
        </div>
      </div>
    )
  }

  if (compareList.length === 0 || properties.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <Navbar />
        <div className="text-center space-y-4 mt-16">
          <div className="text-6xl opacity-20">⊞</div>
          <p className="text-slate-500 text-sm font-medium">Belum ada properti yang dipilih untuk dibandingkan.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-sm font-semibold hover:bg-violet-500/20 transition-all"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <Navbar />

      {/* Fixed grid bg */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">
              Perbandingan{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
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
        <div className="overflow-x-auto rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-5 text-left text-slate-500 uppercase tracking-widest text-xs font-semibold w-40 bg-white/5">Spesifikasi</th>
                {properties.map((p) => (
                  <th key={p.id} className="p-5 bg-white/[0.02]">
                    <div className="text-left space-y-3">
                      <div className="w-full h-32 rounded-xl overflow-hidden bg-white/5 mb-3 border border-white/10">
                        <img src={p.foto_urls?.[0]} alt={p.nama} className="w-full h-full object-cover" />
                      </div>
                      <p className="font-bold text-white text-base line-clamp-2 font-display">{p.nama}</p>
                      <p className="text-slate-400 text-xs flex items-center gap-1"><span className="text-violet-400/50">📍</span> {p.kecamatan}, {p.kota_wilayah}</p>
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
                  <td className="p-5 text-slate-400 uppercase tracking-wider text-[11px] font-bold">{label}</td>
                  {properties.map((p) => {
                    const vals = properties.map((x) => x[key])
                    const numVals = vals.filter((v) => typeof v === 'number')
                    const isBest = numVals.length > 1 && (
                      key === 'harga'
                        ? p[key] === Math.min(...numVals)
                        : p[key] === Math.max(...numVals)
                    )
                    return (
                      <td key={p.id} className={`p-5 ${isBest ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}>
                        {p[key] != null ? fmt(p[key]) : <span className="text-white/20 italic">—</span>}
                        {isBest && <span className="ml-2 text-[10px] bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-1.5 py-0.5 rounded tracking-wide font-semibold">TERBAIK</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {/* Fasilitas row */}
              <tr className="border-b border-white/5">
                <td className="p-5 text-slate-400 uppercase tracking-wider text-[11px] font-bold">Fasilitas</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-5">
                    <div className="flex flex-wrap gap-1.5">
                      {p.fasilitas?.length > 0
                        ? p.fasilitas.map((f, i) => (
                            <span key={i} className="text-[10px] font-medium border border-white/10 bg-white/5 px-2 py-1 rounded text-slate-300">{f}</span>
                          ))
                        : <span className="text-white/20 italic text-xs">—</span>
                      }
                    </div>
                  </td>
                ))}
              </tr>
              {/* Detail button row */}
              <tr>
                <td className="p-5" />
                {properties.map((p) => (
                  <td key={p.id} className="p-5">
                    <button
                      onClick={() => navigate(`/properti/${p.id}`)}
                      className="w-full py-2.5 rounded-xl border border-violet-500/30 text-violet-400 text-xs font-semibold bg-violet-500/10 hover:bg-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)] hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all"
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
