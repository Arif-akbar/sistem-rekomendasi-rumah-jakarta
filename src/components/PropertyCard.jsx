import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFilterStore } from '../store/FilterStore'
import { formatHarga } from '../hooks/UseProperties'
import { calculateMatchScore } from '../lib/Recommend' 

const TIPE_COLOR = {
  rumah:      { bg: 'bg-emerald-400/10', text: 'text-emerald-400',  border: 'border-emerald-400/30' },
  apartemen:  { bg: 'bg-blue-400/10',   text: 'text-blue-400',     border: 'border-blue-400/30'   },
  ruko:       { bg: 'bg-amber-400/10',  text: 'text-amber-400',    border: 'border-amber-400/30'  },
  tanah:      { bg: 'bg-orange-400/10', text: 'text-orange-400',   border: 'border-orange-400/30' },
  villa:      { bg: 'bg-purple-400/10', text: 'text-purple-400',   border: 'border-purple-400/30' },
}

const STATUS_COLOR = {
  aktif:    'text-emerald-400',
  terjual:  'text-red-400',
  nonaktif: 'text-white/30',
}

function ScoreBadge({ score }) {
  if (!score) return null
  const color = score >= 80 ? '#00d4aa' : score >= 60 ? '#60a5fa' : '#f59e0b'
  return (
    <div
      className="absolute top-3 right-3 flex items-center justify-center z-10"
      title={`Skor kecocokan: ${score}%`}
    >
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="rgba(3,7,18,0.85)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle
          cx="22" cy="22" r="15"
          fill="none" stroke={color} strokeWidth="2.5"
          strokeDasharray={`${(score / 100) * 94.2} 94.2`}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
          opacity="0.8"
        />
        <text x="22" y="26" textAnchor="middle" fill={color} fontSize="10" fontFamily="monospace" fontWeight="bold">
          {score}%
        </text>
      </svg>
    </div>
  )
}

function WishlistBtn({ active, onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={`p-1.5 rounded transition-all duration-200 border ${
        active
          ? 'border-red-400/50 bg-red-400/10 text-red-400'
          : 'border-white/10 bg-white/5 text-white/30 hover:text-red-400 hover:border-red-400/30'
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
      className={`p-1.5 rounded transition-all duration-200 border text-[10px] font-mono ${
        active
          ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-400'
          : disabled
          ? 'border-white/5 text-white/15 cursor-not-allowed'
          : 'border-white/10 bg-white/5 text-white/30 hover:text-cyan-400 hover:border-cyan-400/30'
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
      className="relative rounded-lg border border-white/8 overflow-hidden cursor-pointer group
        transition-all duration-300 hover:border-emerald-400/30 hover:-translate-y-0.5"
      style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-white/4">
        {foto ? (
          <img
            src={foto} alt={property.nama}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-20">🏠</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-80" />

        {/* Tipe badge */}
        <div className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono border ${tipe.bg} ${tipe.text} ${tipe.border}`}>
          {property.tipe}
        </div>

        {/* Score badge */}
        <ScoreBadge score={score} />

        {/* Status dot */}
        {property.status !== 'aktif' && (
          <div className={`absolute bottom-3 left-3 text-[10px] font-mono ${STATUS_COLOR[property.status]}`}>
            ● {property.status}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium text-white leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            {property.nama}
          </h3>
          <p className="text-[11px] text-white/35 font-mono mt-0.5 flex items-center gap-1">
            <span className="text-emerald-400/50">◎</span>
            {property.kecamatan}, {property.kota_wilayah?.replace('Jakarta ', 'Jkt ')}
          </p>
        </div>

        {/* Price */}
        <p className="text-lg font-bold tabular-nums"
          style={{
            fontFamily: 'monospace',
            background: 'linear-gradient(90deg, #ffffff, #00d4aa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          {formatHarga(property.harga)}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-3 text-[11px] text-white/35 font-mono">
          {property.kamar_tidur > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-white/20">🛏</span> {property.kamar_tidur}
            </span>
          )}
          {property.kamar_mandi > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-white/20">🚿</span> {property.kamar_mandi}
            </span>
          )}
          {property.luas_bangunan > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-white/20">⬡</span> {property.luas_bangunan}m²
            </span>
          )}
          {property.sertifikat && (
            <span className="ml-auto text-white/25 border border-white/10 px-1.5 py-0.5 rounded">
              {property.sertifikat}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-white/6">
          <div className="flex gap-1.5">
            <WishlistBtn active={isWishlisted} onClick={() => onWishlist(property.id)} />
            <CompareBtn
              active={inCompare}
              onClick={() => toggleCompare(property.id)}
              disabled={compareList.length >= 3}
            />
          </div>
          <span className="text-[10px] font-mono text-white/20 group-hover:text-emerald-400/50 transition-colors">
            Detail →
          </span>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(0,212,170,0.15), 0 0 20px rgba(0,212,170,0.05)' }} />
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
      className="flex gap-4 p-4 rounded-lg border border-white/8 cursor-pointer group
        transition-all duration-300 hover:border-emerald-400/25"
      style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* Thumbnail */}
      <div className="relative w-36 h-24 flex-shrink-0 rounded overflow-hidden bg-white/4">
        {foto ? (
          <img src={foto} alt={property.nama} onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🏠</div>
        )}
        <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono border ${tipe.bg} ${tipe.text} ${tipe.border}`}>
          {property.tipe}
        </div>
        {score && (
          <div className="absolute bottom-1.5 right-1.5">
            <ScoreBadge score={score} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            {property.nama}
          </h3>
          <p className="text-[11px] text-white/35 font-mono mt-0.5">
            ◎ {property.kecamatan}, {property.kota_wilayah}
          </p>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <p className="text-base font-bold tabular-nums"
            style={{
              fontFamily: 'monospace',
              background: 'linear-gradient(90deg, #fff, #00d4aa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            {formatHarga(property.harga)}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-white/30 font-mono">
            {property.kamar_tidur > 0  && <span>🛏 {property.kamar_tidur}</span>}
            {property.kamar_mandi > 0  && <span>🚿 {property.kamar_mandi}</span>}
            {property.luas_bangunan > 0 && <span>⬡ {property.luas_bangunan}m²</span>}
            {property.sertifikat && <span className="border border-white/10 px-1.5 py-0.5 rounded">{property.sertifikat}</span>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <div className="flex gap-1.5">
          <WishlistBtn active={isWishlisted} onClick={() => onWishlist(property.id)} />
          <CompareBtn active={inCompare} onClick={() => toggleCompare(property.id)} disabled={compareList.length >= 3} />
        </div>
        <span className="text-[10px] font-mono text-white/20 group-hover:text-emerald-400/50 transition-colors">Detail →</span>
      </div>
    </article>
  )
}

// ── Skeleton loader ─────────────────────────────────────────
export function PropertySkeleton({ mode = 'grid' }) {
  if (mode === 'list') return (
    <div className="flex gap-4 p-4 rounded-lg border border-white/6 animate-pulse"
      style={{ background: 'rgba(3,7,18,0.6)' }}>
      <div className="w-36 h-24 rounded bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/3 rounded bg-white/5" />
        <div className="h-2 w-1/3 rounded bg-white/5" />
        <div className="h-4 w-1/4 rounded bg-white/5 mt-3" />
      </div>
    </div>
  )
  return (
    <div className="rounded-lg border border-white/6 overflow-hidden animate-pulse"
      style={{ background: 'rgba(3,7,18,0.6)' }}>
      <div className="h-44 bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-3/4 rounded bg-white/5" />
        <div className="h-2 w-1/2 rounded bg-white/5" />
        <div className="h-5 w-2/5 rounded bg-white/5" />
        <div className="flex gap-2">
          <div className="h-2 w-8 rounded bg-white/5" />
          <div className="h-2 w-8 rounded bg-white/5" />
          <div className="h-2 w-12 rounded bg-white/5" />
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