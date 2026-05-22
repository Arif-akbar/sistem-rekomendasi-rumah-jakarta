import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFilterStore } from '../store/FilterStore'
import { formatHarga } from '../hooks/UseProperties'
import { calculateMatchScore, getRecommendationLabel } from '../lib/Recommend'

const TIPE_STYLE = {
  rumah:     { bg: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: 'rgba(124,58,237,0.3)' },
  apartemen: { bg: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
  ruko:      { bg: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: 'rgba(245,158,11,0.3)' },
  tanah:     { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
  villa:     { bg: 'rgba(236,72,153,0.15)', color: '#f9a8d4', border: 'rgba(236,72,153,0.3)' },
}

function ScoreChip({ score }) {
  if (!score && score !== 0) return null
  const { label } = getRecommendationLabel(score)
  const color  = score >= 90 ? '#34d399' : score >= 75 ? '#818cf8' : '#94a3b8'
  const bg     = score >= 90 ? 'rgba(52,211,153,0.12)'  : score >= 75 ? 'rgba(129,140,248,0.12)' : 'rgba(148,163,184,0.08)'
  const border = score >= 90 ? 'rgba(52,211,153,0.3)'   : score >= 75 ? 'rgba(129,140,248,0.3)'  : 'rgba(148,163,184,0.2)'
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: bg, border: `1px solid ${border}`, color }}>
      <span>{score}%</span>
      <span className="opacity-70">{label}</span>
    </div>
  )
}

function ActionBtn({ active, onClick, activeStyle, icon, title }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick() }} title={title}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
      style={active ? activeStyle : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' } }}>
      {icon}
    </button>
  )
}

function GridCard({ property, onWishlist, isWishlisted, score }) {
  const navigate = useNavigate()
  const { compareList, toggleCompare } = useFilterStore()
  const [imgErr, setImgErr] = useState(false)
  const inCompare = compareList.includes(property.id)
  const tipe = TIPE_STYLE[property.tipe] ?? TIPE_STYLE.rumah
  // Guard robust: pastikan array dan URL valid (bukan null/undefined/string kosong)
  const fotoRaw = Array.isArray(property.foto_urls) ? property.foto_urls[0] : property.foto_urls?.[0]
  const foto = !imgErr && fotoRaw && typeof fotoRaw === 'string' && fotoRaw.startsWith('http') ? fotoRaw : null

  return (
    <article onClick={() => navigate(`/properti/${property.id}`)}
      className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ background: '#16112a', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 40px rgba(124,58,237,0.15), 0 4px 24px rgba(0,0,0,0.4)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'}>

      <div className="relative h-48 overflow-hidden" style={{ background: '#0c0a14' }}>
        {foto ? (
          <img src={foto} alt={property.nama} onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(22,17,42,0.9) 0%, transparent 50%)' }} />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize"
            style={{ background: tipe.bg, color: tipe.color, border: `1px solid ${tipe.border}` }}>
            {property.tipe}
          </span>
          <ScoreChip score={score} />
        </div>
        {property.status !== 'aktif' && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-semibold"
            style={{
              background: property.status === 'terjual' ? 'rgba(239,68,68,0.2)' : 'rgba(100,116,139,0.2)',
              color: property.status === 'terjual' ? '#fca5a5' : '#94a3b8',
              border: `1px solid ${property.status === 'terjual' ? 'rgba(239,68,68,0.3)' : 'rgba(100,116,139,0.3)'}`,
            }}>
            {property.status === 'terjual' ? 'Terjual' : 'Nonaktif'}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-1 mb-1 group-hover:text-violet-300 transition-colors">
            {property.nama}
          </h3>
          <div className="flex items-center gap-1 text-xs text-white/40">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {property.kecamatan}, {property.kota_wilayah?.replace('Jakarta ', 'Jkt ')}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-lg font-bold text-gradient">{formatHarga(property.harga)}</p>
        </div>

        <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {property.kamar_tidur > 0 && (
            <div className="flex items-center gap-1 text-xs text-white/50">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 16h20"/>
              </svg>
              {property.kamar_tidur} KT
            </div>
          )}
          {property.kamar_mandi > 0 && (
            <div className="flex items-center gap-1 text-xs text-white/50">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>
                <line x1="10" y1="5" x2="8" y2="7"/><line x1="2" y1="12" x2="22" y2="12"/>
              </svg>
              {property.kamar_mandi} KM
            </div>
          )}
          {property.luas_bangunan > 0 && (
            <div className="flex items-center gap-1 text-xs text-white/50">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
              </svg>
              {property.luas_bangunan} m²
            </div>
          )}
          {property.sertifikat && (
            <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
              {property.sertifikat}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            <ActionBtn active={isWishlisted} onClick={() => onWishlist(property.id)}
              title={isWishlisted ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
              activeStyle={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
            />
            <ActionBtn active={inCompare}
              onClick={() => { if (!inCompare && compareList.length >= 3) return; toggleCompare(property.id) }}
              title={inCompare ? 'Hapus dari perbandingan' : compareList.length >= 3 ? 'Maks 3 properti' : 'Bandingkan'}
              activeStyle={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>}
            />
          </div>
          <span className="text-xs text-white/30 group-hover:text-violet-400 transition-colors flex items-center gap-1">
            Lihat detail
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </div>
    </article>
  )
}

function ListCard({ property, onWishlist, isWishlisted, score }) {
  const navigate = useNavigate()
  const { compareList, toggleCompare } = useFilterStore()
  const [imgErr, setImgErr] = useState(false)
  const inCompare = compareList.includes(property.id)
  const tipe = TIPE_STYLE[property.tipe] ?? TIPE_STYLE.rumah
  const fotoRaw = Array.isArray(property.foto_urls) ? property.foto_urls[0] : property.foto_urls?.[0]
  const foto = !imgErr && fotoRaw && typeof fotoRaw === 'string' && fotoRaw.startsWith('http') ? fotoRaw : null

  return (
    <article onClick={() => navigate(`/properti/${property.id}`)}
      className="group cursor-pointer rounded-2xl overflow-hidden flex gap-0 transition-all duration-300"
      style={{ background: '#16112a', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 2px 16px rgba(0,0,0,0.25)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,58,237,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.25)' }}>

      <div className="relative w-40 sm:w-52 flex-shrink-0 overflow-hidden" style={{ background: '#0c0a14' }}>
        {foto ? (
          <img src={foto} alt={property.nama} onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
          </div>
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize"
          style={{ background: tipe.bg, color: tipe.color, border: `1px solid ${tipe.border}` }}>
          {property.tipe}
        </span>
      </div>

      <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-white text-sm leading-snug line-clamp-1 group-hover:text-violet-300 transition-colors">
              {property.nama}
            </h3>
            <ScoreChip score={score} />
          </div>
          <div className="flex items-center gap-1 text-xs text-white/40 mb-2">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {property.kecamatan}, {property.kota_wilayah}
          </div>
          <p className="text-base font-bold text-gradient">{formatHarga(property.harga)}</p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 text-xs text-white/40">
            {property.kamar_tidur > 0  && <span>{property.kamar_tidur} KT</span>}
            {property.kamar_mandi > 0  && <span>{property.kamar_mandi} KM</span>}
            {property.luas_bangunan > 0 && <span>{property.luas_bangunan} m²</span>}
            {property.sertifikat && (
              <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'rgba(255,255,255,0.06)' }}>
                {property.sertifikat}
              </span>
            )}
          </div>
          <div className="flex gap-1.5">
            <ActionBtn active={isWishlisted} onClick={() => onWishlist(property.id)} title="Wishlist"
              activeStyle={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
            />
            <ActionBtn active={inCompare}
              onClick={() => { if (!inCompare && compareList.length >= 3) return; toggleCompare(property.id) }}
              title="Bandingkan"
              activeStyle={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

export function PropertySkeleton({ mode = 'grid' }) {
  if (mode === 'list') return (
    <div className="rounded-2xl overflow-hidden flex" style={{ background: '#16112a', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-52 h-32 skeleton flex-shrink-0" />
      <div className="flex-1 p-4 space-y-3">
        <div className="h-4 w-2/3 rounded-lg skeleton" />
        <div className="h-3 w-1/3 rounded-lg skeleton" />
        <div className="h-5 w-1/4 rounded-lg skeleton mt-2" />
      </div>
    </div>
  )
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#16112a', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="h-48 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded-lg skeleton" />
        <div className="h-3 w-1/2 rounded-lg skeleton" />
        <div className="h-5 w-2/5 rounded-lg skeleton" />
        <div className="flex gap-3 mt-2">
          <div className="h-3 w-10 rounded skeleton" />
          <div className="h-3 w-10 rounded skeleton" />
          <div className="h-3 w-14 rounded skeleton" />
        </div>
      </div>
    </div>
  )
}

export default function PropertyCard({ property, viewMode = 'grid', onWishlist, isWishlisted }) {
  const { filters } = useFilterStore()
  const score = calculateMatchScore(property, filters)
  if (viewMode === 'list') return <ListCard property={property} onWishlist={onWishlist} isWishlisted={isWishlisted} score={score} />
  return <GridCard property={property} onWishlist={onWishlist} isWishlisted={isWishlisted} score={score} />
}
