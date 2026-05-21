import { useFilterStore } from '../store/FilterStore'
import { WILAYAH_OPTIONS, TIPE_OPTIONS } from '../hooks/UseProperties'

const SERTIFIKAT_OPTIONS = ['SHM', 'HGB', 'SHGB', 'Strata']
const FASILITAS_OPTIONS  = ['Kolam Renang', 'Gym', 'Keamanan 24 Jam', 'Parkir', 'Taman', 'AC', 'CCTV', 'Lift']

function Label({ children }) {
  return <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-2">{children}</p>
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
        active
          ? 'bg-violet-500/20 border-violet-500/50 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.2)]'
          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20'
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
    <aside className="w-64 space-y-6 text-white bg-white/[0.02] p-5 rounded-2xl border border-white/5 shadow-xl backdrop-blur-md">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 tracking-wider">FILTER</span>
        <button
          onClick={resetFilters}
          className="text-[10px] text-white/40 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-2 py-1 rounded-md"
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
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
        />
      </div>

      {/* Harga */}
      <div>
        <Label>Harga Maks: <span className="text-violet-300">Rp {fmtHarga(filters.harga_max)}</span></Label>
        <input
          type="range"
          min={500_000_000}
          max={20_000_000_000}
          step={500_000_000}
          value={filters.harga_max}
          onChange={(e) => setFilter('harga_max', Number(e.target.value))}
          className="w-full accent-violet-500 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium">
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
          <Label>K. Tidur</Label>
          <select
            value={filters.kamar_tidur}
            onChange={(e) => setFilter('kamar_tidur', Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 appearance-none"
          >
            {[0,1,2,3,4,5].map((n) => <option key={n} value={n} className="bg-slate-900">{n === 0 ? 'Semua' : `${n}+`}</option>)}
          </select>
        </div>
        <div>
          <Label>K. Mandi</Label>
          <select
            value={filters.kamar_mandi}
            onChange={(e) => setFilter('kamar_mandi', Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 appearance-none"
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
      <div className="border-t border-white/10 pt-5 space-y-4">
        {/* Sort */}
        <div>
          <Label>Urutkan</Label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 appearance-none"
          >
            <option value="created_at:desc" className="bg-slate-900">Terbaru</option>
            <option value="harga:asc"       className="bg-slate-900">Harga Terendah</option>
            <option value="harga:desc"      className="bg-slate-900">Harga Tertinggi</option>
          </select>
        </div>

        {/* View Mode */}
        <div>
          <Label>Tampilan</Label>
          <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            {['grid','list','map'].map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  viewMode === m
                    ? 'bg-violet-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {m === 'grid' ? '⊞' : m === 'list' ? '≡' : '⊕'} <span className="capitalize">{m}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}