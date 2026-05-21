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
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-5 animate-fade-in-up">
      <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(139,92,246,0.15)]">
        ✨
      </div>
      <div>
        <p className="text-white/80 font-medium text-lg">Tidak ada properti yang cocok</p>
        <p className="text-white/40 text-sm mt-1">Coba sesuaikan kembali filter pencarian Anda.</p>
      </div>
      <button
        onClick={onReset}
        className="mt-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm
          hover:bg-violet-500/20 hover:border-violet-500/50 hover:text-violet-300 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-300"
      >
        Reset Pencarian
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
    <div className="flex items-center gap-6 px-2 py-3 border-b border-white/5 mb-6">
      <div className="text-sm">
        <span className="text-white/40">Total: </span>
        <span className="text-violet-400 font-semibold">{total}</span>
        <span className="text-white/40"> properti</span>
      </div>
      {avgHarga > 0 && (
        <div className="text-sm">
          <span className="text-white/40">Rata-rata: </span>
          <span className="text-white/80 font-medium">Rp {fmt(avgHarga)}</span>
        </div>
      )}
      <div className="text-sm">
        <span className="text-white/40">Menampilkan: </span>
        <span className="text-white/80 font-medium">{properties.length}</span>
      </div>
    </div>
  )
}

// ── Pagination ───────────────────────────────────────────────
function Pagination({ page, total, onPageChange }) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-10 mb-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 rounded-full border border-white/10 text-sm text-white/60
          hover:bg-white/5 hover:text-white disabled:opacity-20
          disabled:cursor-not-allowed transition-all"
      >
        Prev
      </button>

      <div className="flex gap-1.5 mx-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
            acc.push(p)
            return acc
          }, [])
          .map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-white/30">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                  p === page
                    ? 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
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
        className="px-4 py-2 rounded-full border border-white/10 text-sm text-white/60
          hover:bg-white/5 hover:text-white disabled:opacity-20
          disabled:cursor-not-allowed transition-all"
      >
        Next
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-80 z-50 lg:hidden overflow-y-auto
        bg-[#05050A]/95 backdrop-blur-xl border-r border-white/5 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 tracking-wider">
            FILTER PENCARIAN
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all"
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
    <div className="min-h-screen">
      <Navbar />

      {/* Mobile filter drawer */}
      <MobileFilterDrawer open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-6">

        {/* Hero strip */}
        <div className="mb-8 mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-xl animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight leading-tight">
              Temukan Properti <br className="hidden sm:block" />
              <span className="text-gradient">Masa Depanmu</span>
            </h1>
            <p className="text-white/50 text-sm sm:text-base mt-3 max-w-md leading-relaxed">
              Sistem rekomendasi AI cerdas kami membantu Anda menemukan rumah, apartemen, atau tanah yang paling sesuai di Jakarta.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tombol filter mobile */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 text-sm transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
              Filter
            </button>

            {/* Toggle filter panel desktop */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${
                filterOpen
                  ? 'border-violet-500/30 text-violet-300 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                  : 'border-white/10 text-white/60 bg-white/5 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
              <span>{filterOpen ? 'Sembunyikan Filter' : 'Tampilkan Filter'}</span>
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