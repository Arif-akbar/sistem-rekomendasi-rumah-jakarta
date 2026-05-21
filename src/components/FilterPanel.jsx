import { useFilterStore } from '../store/FilterStore'
import { WILAYAH_OPTIONS, TIPE_OPTIONS } from '../hooks/UseProperties'

const SERTIFIKAT_OPTIONS = ['SHM', 'HGB', 'SHGB', 'Strata']
const FASILITAS_OPTIONS  = ['Kolam Renang', 'Gym', 'Keamanan 24 Jam', 'Parkir', 'Taman', 'AC', 'CCTV', 'Lift']

function Label({ children }) {
  return <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1">{children}</p>
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded text-[10px] font-mono border transition-all ${
        active
          ? 'bg-emerald-400/15 border-emerald-400/40 text-emerald-400'
          : 'bg-white/3 border-white/8 text-white/35 hover:border-white/20'
      }`}
    >
      {label}
    </button>
  )
}

export default function FilterPanel({ total, loading }) {
  const { filters, setFilter, resetFilters, sortKey, setSortKey, viewMode, setViewMode } = useFilterStore()

  const fmtHarga = (v) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} M`
    if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(0)} Jt`
    return v.toLocaleString('id-ID')
  }

  const toggleFasilitas = (f) => {
    const cur = filters.fasilitas ?? []
    setFilter('fasilitas', cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f])
  }

  return (
    <aside className="w-64 space-y-5 text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-400 tracking-widest">FILTER</span>
        <button
          onClick={resetFilters}
          className="text-[10px] text-white/30 hover:text-white/60 transition-colors border border-white/10 px-2 py-0.5 rounded"
        >
          Reset
        </button>
      </div>

      {/* Keyword */}
      <div>
        <Label>Kata Kunci</Label>
        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => setFilter('keyword', e.target.value)}
          placeholder="Nama properti..."
          className="w-full bg-white/4 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-400/40 transition-colors"
        />
      </div>

      {/* Harga */}
      <div>
        <Label>Harga Maks: Rp {fmtHarga(filters.harga_max)}</Label>
        <input
          type="range"
          min={500_000_000}
          max={20_000_000_000}
          step={500_000_000}
          value={filters.harga_max}
          onChange={(e) => setFilter('harga_max', Number(e.target.value))}
          className="w-full accent-emerald-400 cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-white/20 mt-1">
          <span>500 Jt</span>
          <span>20 M</span>
        </div>
      </div>

      {/* Wilayah */}
      <div>
        <Label>Wilayah</Label>
        <div className="flex flex-wrap gap-1.5">
          <Chip label="Semua" active={!filters.wilayah} onClick={() => setFilter('wilayah', '')} />
          {WILAYAH_OPTIONS.map((w) => (
            <Chip key={w} label={w.replace('Jakarta ', 'Jkt ')} active={filters.wilayah === w} onClick={() => setFilter('wilayah', filters.wilayah === w ? '' : w)} />
          ))}
        </div>
      </div>

      {/* Tipe */}
      <div>
        <Label>Tipe Properti</Label>
        <div className="flex flex-wrap gap-1.5">
          <Chip label="Semua" active={!filters.tipe} onClick={() => setFilter('tipe', '')} />
          {TIPE_OPTIONS.map((t) => (
            <Chip key={t} label={t} active={filters.tipe === t} onClick={() => setFilter('tipe', filters.tipe === t ? '' : t)} />
          ))}
        </div>
      </div>

      {/* Kamar */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>K. Tidur Min</Label>
          <select
            value={filters.kamar_tidur}
            onChange={(e) => setFilter('kamar_tidur', Number(e.target.value))}
            className="w-full bg-white/4 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400/40"
          >
            {[0,1,2,3,4,5].map((n) => <option key={n} value={n} className="bg-slate-900">{n === 0 ? 'Semua' : `${n}+`}</option>)}
          </select>
        </div>
        <div>
          <Label>K. Mandi Min</Label>
          <select
            value={filters.kamar_mandi}
            onChange={(e) => setFilter('kamar_mandi', Number(e.target.value))}
            className="w-full bg-white/4 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400/40"
          >
            {[0,1,2,3,4].map((n) => <option key={n} value={n} className="bg-slate-900">{n === 0 ? 'Semua' : `${n}+`}</option>)}
          </select>
        </div>
      </div>

      {/* Sertifikat */}
      <div>
        <Label>Sertifikat</Label>
        <div className="flex flex-wrap gap-1.5">
          <Chip label="Semua" active={!filters.sertifikat} onClick={() => setFilter('sertifikat', '')} />
          {SERTIFIKAT_OPTIONS.map((s) => (
            <Chip key={s} label={s} active={filters.sertifikat === s} onClick={() => setFilter('sertifikat', filters.sertifikat === s ? '' : s)} />
          ))}
        </div>
      </div>

      {/* Fasilitas */}
      <div>
        <Label>Fasilitas</Label>
        <div className="flex flex-wrap gap-1.5">
          {FASILITAS_OPTIONS.map((f) => (
            <Chip key={f} label={f} active={(filters.fasilitas ?? []).includes(f)} onClick={() => toggleFasilitas(f)} />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/6 pt-4 space-y-3">
        {/* Sort */}
        <div>
          <Label>Urutkan</Label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="w-full bg-white/4 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400/40"
          >
            <option value="created_at:desc" className="bg-slate-900">Terbaru</option>
            <option value="harga:asc"       className="bg-slate-900">Harga Terendah</option>
            <option value="harga:desc"      className="bg-slate-900">Harga Tertinggi</option>
          </select>
        </div>

        {/* View Mode */}
        <div>
          <Label>Tampilan</Label>
          <div className="flex gap-1.5">
            {['grid','list','map'].map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`flex-1 py-1.5 rounded text-[10px] border transition-all ${
                  viewMode === m
                    ? 'bg-emerald-400/15 border-emerald-400/40 text-emerald-400'
                    : 'bg-white/3 border-white/8 text-white/35 hover:border-white/20'
                }`}
              >
                {m === 'grid' ? '⊞' : m === 'list' ? '≡' : '⊕'} {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}