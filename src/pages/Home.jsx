import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/UseAuth'
import { useFilterStore } from '../store/FilterStore'
import { useProperties, PAGE_SIZE } from '../hooks/UseProperties'
import { toggleWishlist, getWishlist } from '../lib/supabase'
import Navbar from '../components/Navbar'
import FilterPanel from '../components/FilterPanel'
import PropertyCard, { PropertySkeleton } from '../components/PropertyCard'
import MapView from '../components/MapView'

// ── Empty state ─────────────────────────────────────────────
function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
      <div className="text-6xl opacity-20">🔍</div>
      <p className="text-white/40 font-mono text-sm">Tidak ada properti yang cocok</p>
      <p className="text-white/20 font-mono text-xs">Coba ubah filter pencarian kamu</p>
      <button
        onClick={onReset}
        className="mt-2 px-4 py-2 rounded border border-emerald-400/30 text-emerald-400 text-xs
          font-mono hover:bg-emerald-400/10 transition-all"
      >
        Reset Filter
      </button>
    </div>
  )
}

// ── Stats bar ───────────────────────────────────────────────
function StatsBar({ total, loading, properties }) {
  if (loading) return null
  const avgHarga = properties.length
    ? properties.reduce((s, p) => s + p.harga, 0) / properties.length
    : 0

  const fmt = (v) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} M`
    if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(0)} Jt`
    return v.toLocaleString('id-ID')
  }

  return (
    <div className="flex items-center gap-6 px-1 py-3 border-b border-white/6 mb-6">
      <div className="text-xs font-mono">
        <span className="text-white/25">Total: </span>
        <span className="text-emerald-400 tabular-nums">{total}</span>
        <span className="text-white/25"> properti</span>
      </div>
      {avgHarga > 0 && (
        <div className="text-xs font-mono">
          <span className="text-white/25">Rata-rata: </span>
          <span className="text-white/60 tabular-nums">Rp {fmt(avgHarga)}</span>
        </div>
      )}
      <div className="text-xs font-mono">
        <span className="text-white/25">Menampilkan: </span>
        <span className="text-white/60 tabular-nums">{properties.length}</span>
      </div>
    </div>
  )
}

// ── Pagination ───────────────────────────────────────────────
function Pagination({ page, total, onPageChange }) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-8 font-mono">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded border border-white/10 text-xs text-white/40
          hover:border-emerald-400/30 hover:text-emerald-400 disabled:opacity-20
          disabled:cursor-not-allowed transition-all"
      >
        ← Prev
      </button>

      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
            acc.push(p)
            return acc
          }, [])
          .map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-xs text-white/20">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded text-xs transition-all ${
                  p === page
                    ? 'bg-emerald-400/15 border border-emerald-400/40 text-emerald-400'
                    : 'border border-white/8 text-white/35 hover:border-white/20'
                }`}
              >
                {p}
              </button>
            )
          )}
      </div>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 rounded border border-white/10 text-xs text-white/40
          hover:border-emerald-400/30 hover:text-emerald-400 disabled:opacity-20
          disabled:cursor-not-allowed transition-all"
      >
        Next →
      </button>
    </div>
  )
}

// ── Mobile Filter Drawer ─────────────────────────────────────
function MobileFilterDrawer({ open, onClose }) {
  if (!open) return null
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden overflow-y-auto
        bg-[#030712] border-r border-white/8 p-5"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-emerald-400 tracking-widest">FILTER</span>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/60 text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <FilterPanel />
      </div>
    </>
  )
}

// ── Main Home ────────────────────────────────────────────────
export default function HomePage() {
  const { user } = useAuth()
  const { filters, sortKey, viewMode, resetFilters, page, setPage } = useFilterStore()
  const { properties, loading, error, total } = useProperties(filters, sortKey, page)

  const [wishlistIds, setWishlistIds] = useState(new Set())
  const [filterOpen, setFilterOpen] = useState(true)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Load wishlist IDs
  useEffect(() => {
    if (!user) return
    getWishlist(user.id).then(({ data }) => {
      if (data) setWishlistIds(new Set(data.map((w) => w.property_id)))
    })
  }, [user])

  // Scroll ke atas saat ganti halaman
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const handleWishlist = async (propertyId) => {
    if (!user) return
    const { added } = await toggleWishlist(user.id, propertyId)
    setWishlistIds((prev) => {
      const next = new Set(prev)
      added ? next.add(propertyId) : next.delete(propertyId)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-[#030712]"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}>

      {/* Subtle grid bg */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,212,170,1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,212,170,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <Navbar />

      {/* Mobile filter drawer */}
      <MobileFilterDrawer open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-6">

        {/* Hero strip */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              Properti{' '}
              <span style={{
                background: 'linear-gradient(90deg, #00d4aa, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Jakarta</span>
            </h1>
            <p className="text-white/30 text-xs font-mono mt-1">
              Temukan properti yang paling cocok untukmu
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol filter mobile */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 rounded border
                border-white/10 text-white/40 hover:border-white/25 text-xs font-mono transition-all"
            >
              <span>⚙</span> Filter
            </button>

            {/* Toggle filter panel desktop */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded border text-xs font-mono
                transition-all ${filterOpen
                  ? 'border-emerald-400/30 text-emerald-400 bg-emerald-400/8'
                  : 'border-white/10 text-white/40 hover:border-white/25'}`}
            >
              <span>⚙</span>
              <span>{filterOpen ? 'Sembunyikan' : 'Tampilkan'} Filter</span>
            </button>
          </div>
        </div>

        <div className="flex gap-5 items-start">

          {/* Filter sidebar desktop */}
          {filterOpen && (
            <div className="hidden lg:block sticky top-20">
              <FilterPanel total={total} loading={loading} />
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <StatsBar total={total} loading={loading} properties={properties} />

            {/* Error */}
            {error && (
              <div className="mb-6 px-4 py-3 rounded border border-red-500/30 bg-red-500/8 text-red-400 text-xs font-mono">
                ⚠ Gagal memuat data: {error}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                : 'space-y-3'
              }>
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertySkeleton key={i} mode={viewMode === 'map' ? 'grid' : viewMode} />
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && properties.length === 0 && (
              <EmptyState onReset={resetFilters} />
            )}

            {/* Grid / List / Map */}
            {!loading && properties.length > 0 && (
              viewMode === 'map' ? (
                <div className="h-[600px] w-full animate-[fadeInUp_0.4s_ease_both]">
                  <MapView properties={properties} />
                </div>
              ) : (
                <>
                  <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'space-y-3'
                  }>
                    {properties.map((p, i) => (
                      <div
                        key={p.id}
                        style={{
                          animation: `fadeInUp 0.4s ease both`,
                          animationDelay: `${Math.min(i * 50, 400)}ms`,
                        }}
                      >
                        <PropertyCard
                          property={p}
                          viewMode={viewMode}
                          onWishlist={handleWishlist}
                          isWishlisted={wishlistIds.has(p.id)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination page={page} total={total} onPageChange={setPage} />
                </>
              )
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}