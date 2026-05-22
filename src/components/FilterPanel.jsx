import { useFilterStore } from '../store/FilterStore'
import { WILAYAH_OPTIONS, TIPE_OPTIONS } from '../hooks/UseProperties'

const SERTIFIKAT_OPTIONS = ['SHM', 'HGB', 'SHGB', 'Strata']
const FASILITAS_OPTIONS  = ['Kolam Renang', 'Gym', 'Keamanan 24 Jam', 'Parkir', 'Taman', 'AC', 'CCTV', 'Lift']

function SectionLabel({ children }) {
  return <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2.5">{children}</p>
}

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
      style={{
        background: active ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
        color: active ? '#c4b5fd' : 'rgba(255,255,255,0.45)',
      }}>
      {label}
    </button>
  )
}

function Section({ children }) {
  return <div className="pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{children}</div>
}

export default function FilterPanel() {
  const { filters, setFilter, resetFilters } = useFilterStore()

  const fmtHarga = (v) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} M`
    if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(0)} Jt`
    return v.toLocaleString('id-ID')
  }

  const toggleFasilitas = (f) => {
    const cur = filters.fasilitas ?? []
    setFilter('fasilitas', cur.includes(f) ? cur.filter(x => x !== f) : [...cur, f])
  }

  const hasActiveFilters =
    filters.wilayah || filters.tipe || filters.sertifikat ||
    filters.kamar_tidur > 0 || filters.kamar_mandi > 0 ||
    (filters.fasilitas?.length > 0) || filters.harga_max < 20_000_000_000

  return (
    <aside className="w-64 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.8)" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          <span className="text-sm font-semibold text-white">Filter</span>
          {hasActiveFilters && <span className="w-2 h-2 rounded-full" style={{ background: '#a78bfa' }} />}
        </div>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-xs font-medium transition-colors"
            style={{ color: 'rgba(167,139,250,0.7)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(167,139,250,0.7)'}>
            Reset semua
          </button>
        )}
      </div>

      {/* Harga */}
      <Section>
        <SectionLabel>Budget Maksimal</SectionLabel>
        <div className="text-center py-2 px-3 rounded-xl mb-3 text-sm font-bold"
          style={{ background: 'rgba(124,58,237,0.1)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.2)' }}>
          Rp {fmtHarga(filters.harga_max)}
        </div>
        <input type="range" min={500_000_000} max={20_000_000_000} step={500_000_000}
          value={filters.harga_max} onChange={(e) => setFilter('harga_max', Number(e.target.value))}
          className="w-full cursor-pointer" style={{ accentColor: '#7c3aed' }} />
        <div className="flex justify-between text-[10px] text-white/25 mt-1.5">
          <span>500 Jt</span><span>20 M</span>
        </div>
      </Section>

      {/* Wilayah */}
      <Section>
        <SectionLabel>Wilayah</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="Semua" active={!filters.wilayah} onClick={() => setFilter('wilayah', '')} />
          {WILAYAH_OPTIONS.map(w => (
            <FilterChip key={w} label={w.replace('Jakarta ', 'Jkt ')} active={filters.wilayah === w}
              onClick={() => setFilter('wilayah', filters.wilayah === w ? '' : w)} />
          ))}
        </div>
      </Section>

      {/* Tipe */}
      <Section>
        <SectionLabel>Tipe Properti</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="Semua" active={!filters.tipe} onClick={() => setFilter('tipe', '')} />
          {TIPE_OPTIONS.map(t => (
            <FilterChip key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={filters.tipe === t}
              onClick={() => setFilter('tipe', filters.tipe === t ? '' : t)} />
          ))}
        </div>
      </Section>

      {/* Kamar */}
      <Section>
        <SectionLabel>Jumlah Kamar</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {[{ label: 'Kamar Tidur', key: 'kamar_tidur', opts: [0,1,2,3,4] },
            { label: 'Kamar Mandi', key: 'kamar_mandi', opts: [0,1,2,3] }].map(({ label, key, opts }) => (
            <div key={key}>
              <p className="text-[10px] text-white/30 mb-1.5">{label}</p>
              <div className="flex gap-1">
                {opts.map(n => (
                  <button key={n} onClick={() => setFilter(key, n)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: filters[key] === n ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${filters[key] === n ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.07)'}`,
                      color: filters[key] === n ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
                    }}>
                    {n === 0 ? 'All' : `${n}+`}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Sertifikat */}
      <Section>
        <SectionLabel>Sertifikat</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="Semua" active={!filters.sertifikat} onClick={() => setFilter('sertifikat', '')} />
          {SERTIFIKAT_OPTIONS.map(s => (
            <FilterChip key={s} label={s} active={filters.sertifikat === s}
              onClick={() => setFilter('sertifikat', filters.sertifikat === s ? '' : s)} />
          ))}
        </div>
      </Section>

      {/* Fasilitas */}
      <div>
        <SectionLabel>Fasilitas</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {FASILITAS_OPTIONS.map(f => (
            <FilterChip key={f} label={f} active={(filters.fasilitas ?? []).includes(f)}
              onClick={() => toggleFasilitas(f)} />
          ))}
        </div>
        {filters.fasilitas?.length > 0 && (
          <p className="text-[10px] text-violet-400/60 mt-2">{filters.fasilitas.length} fasilitas dipilih</p>
        )}
      </div>
    </aside>
  )
}
