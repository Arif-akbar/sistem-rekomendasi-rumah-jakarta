import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFilterStore } from '../store/FilterStore'
import { formatHarga } from '../hooks/UseProperties'
import { calculateMatchScore } from '../lib/Recommend'
import ScoreBadge from './ScoreBadge'

const TIPE_COLOR = {
  rumah:      { bg: 'bg-violet-500/10', text: 'text-violet-400',  border: 'border-violet-500/30' },
  apartemen:  { bg: 'bg-cyan-500/10',   text: 'text-cyan-400',     border: 'border-cyan-500/30'   },
  ruko:       { bg: 'bg-fuchsia-500/10',  text: 'text-fuchsia-400',    border: 'border-fuchsia-500/30'  },
  tanah:      { bg: 'bg-emerald-500/10', text: 'text-emerald-400',   border: 'border-emerald-500/30' },
  villa:      { bg: 'bg-indigo-500/10', text: 'text-indigo-400',   border: 'border-indigo-500/30' },
}

const STATUS_COLOR = {
  aktif:    'text-violet-400',
  terjual:  'text-red-400',
  nonaktif: 'text-slate-500',
}

function WishlistBtn({ active, onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={`p-1.5 rounded-md transition-all duration-300 border ${
        active
          ? 'border-fuchsia-500/50 bg-fuchsia-500/20 text-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.3)]'
          : 'border-white/5 bg-white/5 text-slate-400 hover:text-fuchsia-400 hover:border-fuchsia-500/30 hover:bg-fuchsia-500/10'
      }`}
      title={active ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  )
}

function CompareBtn({ active, onClick, disabled }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      disabled={disabled && !active}
      className={`p-1.5 rounded-md transition-all duration-300 border text-[10px] ${
        active
          ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
          : disabled
          ? 'border-white/5 text-white/10 cursor-not-allowed'
          : 'border-white/5 bg-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10'
      }`}
      title={active ? 'Hapus dari perbandingan' : disabled ? 'Maks 3 properti' : 'Bandingkan'}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    </button>
  )
}

// ── Grid Card ────────────────────────────────────────────────
function GridCard({ property, onWishlist, isWishlisted, score }) {
  const navigate = useNavigate()
  const { compareList, toggleCompare } = useFilterStore()
  const [imgErr, setImgErr] = useState(false)
  const inCompare = compareList.includes(property.id)
  const tipe = TIPE_COLOR[property.tipe] ?? TIPE_COLOR.rumah
  const foto = !imgErr && property.foto_urls?.[0]

  return (
    <article
      onClick={() => navigate(`/properti/${property.id}`)}
      className="relative rounded-2xl border border-white/5 overflow-hidden cursor-pointer group
        transition-all duration-500 hover:border-violet-500/30 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.3)] bg-white/[0.02] backdrop-blur-xl"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-white/5">
        {foto ? (
          <img
            src={foto} alt={property.nama}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-20">🏠</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/20 to-transparent opacity-90" />

        {/* Tipe badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border backdrop-blur-md ${tipe.bg} ${tipe.text} ${tipe.border}`}>
          {property.tipe}
        </div>

        {/* Score badge */}
        <div className="absolute top-3 right-3 z-10">
          <ScoreBadge score={score} />
        </div>

        {/* Status dot */}
        {property.status !== 'aktif' && (
          <div className={`absolute bottom-3 left-3 text-[10px] font-medium tracking-wide ${STATUS_COLOR[property.status]}`}>
            ● <span className="uppercase">{property.status}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-white leading-tight line-clamp-1 group-hover:text-violet-400 transition-colors font-display tracking-wide">
            {property.nama}
          </h3>
          <p className="text-[12px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-violet-400/50">📍</span>
            {property.kecamatan}, {property.kota_wilayah?.replace('Jakarta ', 'Jkt ')}
          </p>
        </div>

        {/* Price */}
        <p className="text-xl font-bold tracking-tight text-gradient">
          {formatHarga(property.harga)}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-4 text-[12px] text-slate-300">
          {property.kamar_tidur > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500">🛏</span> {property.kamar_tidur}
            </span>
          )}
          {property.kamar_mandi > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500">🚿</span> {property.kamar_mandi}
            </span>
          )}
          {property.luas_bangunan > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500">⬡</span> {property.luas_bangunan}m²
            </span>
          )}
          {property.sertifikat && (
            <span className="ml-auto text-slate-400 border border-white/10 px-2 py-0.5 rounded-md text-[10px] font-medium">
              {property.sertifikat}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex gap-2">
            <WishlistBtn active={isWishlisted} onClick={() => onWishlist(property.id)} />
            <CompareBtn
              active={inCompare}
              onClick={() => toggleCompare(property.id)}
              disabled={compareList.length >= 3}
            />
          </div>
          <span className="text-xs font-medium text-slate-500 group-hover:text-violet-400 transition-colors flex items-center gap-1">
            Lihat Detail
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </div>
    </article>
  )
}

// ── List Card ────────────────────────────────────────────────
function ListCard({ property, onWishlist, isWishlisted, score }) {
  const navigate = useNavigate()
  const { compareList, toggleCompare } = useFilterStore()
  const [imgErr, setImgErr] = useState(false)
  const inCompare = compareList.includes(property.id)
  const tipe = TIPE_COLOR[property.tipe] ?? TIPE_COLOR.rumah
  const foto = !imgErr && property.foto_urls?.[0]

  return (
    <article
      onClick={() => navigate(`/properti/${property.id}`)}
      className="flex flex-col sm:flex-row gap-5 p-5 rounded-2xl border border-white/5 cursor-pointer group
        transition-all duration-500 hover:border-violet-500/30 hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.3)] bg-white/[0.02] backdrop-blur-xl"
    >
      {/* Thumbnail */}
      <div className="relative w-full sm:w-48 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-white/5">
        {foto ? (
          <img src={foto} alt={property.nama} onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🏠</div>
        )}
        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border backdrop-blur-md ${tipe.bg} ${tipe.text} ${tipe.border}`}>
          {property.tipe}
        </div>
        {score && (
          <div className="absolute bottom-2 right-2">
            <ScoreBadge score={score} size={36} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-white group-hover:text-violet-400 transition-colors truncate font-display tracking-wide">
            {property.nama}
          </h3>
          <p className="text-[12px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-violet-400/50">📍</span> {property.kecamatan}, {property.kota_wilayah}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-3">
          <p className="text-xl font-bold tracking-tight text-gradient">
            {formatHarga(property.harga)}
          </p>
          <div className="flex items-center gap-3 text-[12px] text-slate-300">
            {property.kamar_tidur > 0  && <span>🛏 {property.kamar_tidur}</span>}
            {property.kamar_mandi > 0  && <span>🚿 {property.kamar_mandi}</span>}
            {property.luas_bangunan > 0 && <span>⬡ {property.luas_bangunan}m²</span>}
            {property.sertifikat && <span className="border border-white/10 px-2 py-0.5 rounded-md text-[10px]">{property.sertifikat}</span>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between flex-shrink-0 border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-5 mt-3 sm:mt-0">
        <div className="flex gap-2">
          <WishlistBtn active={isWishlisted} onClick={() => onWishlist(property.id)} />
          <CompareBtn active={inCompare} onClick={() => toggleCompare(property.id)} disabled={compareList.length >= 3} />
        </div>
        <span className="text-xs font-medium text-slate-500 group-hover:text-violet-400 transition-colors flex items-center gap-1">
          Detail
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </div>
    </article>
  )
}

// ── Skeleton loader ─────────────────────────────────────────
export function PropertySkeleton({ mode = 'grid' }) {
  if (mode === 'list') return (
    <div className="flex gap-5 p-5 rounded-2xl border border-white/5 animate-pulse bg-white/[0.02]">
      <div className="w-full sm:w-48 h-32 rounded-xl bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-2/3 rounded-full bg-white/5" />
        <div className="h-3 w-1/3 rounded-full bg-white/5" />
        <div className="h-6 w-1/4 rounded-full bg-white/5 mt-4" />
      </div>
    </div>
  )
  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden animate-pulse bg-white/[0.02]">
      <div className="h-48 bg-white/5" />
      <div className="p-5 space-y-4">
        <div className="h-4 w-3/4 rounded-full bg-white/5" />
        <div className="h-3 w-1/2 rounded-full bg-white/5" />
        <div className="h-6 w-2/5 rounded-full bg-white/5" />
        <div className="flex gap-3">
          <div className="h-3 w-10 rounded-full bg-white/5" />
          <div className="h-3 w-10 rounded-full bg-white/5" />
          <div className="h-3 w-16 rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  )
}

// ── Export main card component ───────────────────────────────
export default function PropertyCard({ property, viewMode = 'grid', onWishlist, isWishlisted }) {
  // 2. Ambil state filter dari Zustand Store
  const { filters } = useFilterStore()
  
  // 3. Kalkulasi score secara dinamis (tanpa perlu dilempar dari parent komponen)
  const score = calculateMatchScore(property, filters)

  if (viewMode === 'list') {
    return <ListCard property={property} onWishlist={onWishlist} isWishlisted={isWishlisted} score={score} />
  }
  return <GridCard property={property} onWishlist={onWishlist} isWishlisted={isWishlisted} score={score} />
}