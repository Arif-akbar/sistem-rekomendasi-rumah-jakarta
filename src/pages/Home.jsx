import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/UseAuth'
import { useFilterStore } from '../store/FilterStore'
import { useProperties, PAGE_SIZE } from '../hooks/UseProperties'
import { toggleWishlist, getWishlist } from '../lib/supabase'
import Navbar from '../components/Navbar'
import FilterPanel from '../components/FilterPanel'
import PropertyCard, { PropertySkeleton } from '../components/PropertyCard'
import MapView from '../components/MapView'

function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
        style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <p className="text-white/60 font-semibold text-base">Tidak ada properti ditemukan</p>
      <p className="text-white/30 text-sm max-w-xs">Coba ubah atau reset filter pencarian kamu</p>
      <button onClick={onReset}
        className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
        style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', color: '#c4b5fd' }}>
        Reset Filter
      </button>
    </div>
  )
}

function StatsBar({ total, loading, properties }) {
  if (loading) return null
  const avgHarga = properties.length ? properties.reduce((s, p) => s + p.harga, 0) / properties.length : 0
  const fmt = (v) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} M`
    if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(0)} Jt`
    return v.toLocaleString('id-ID')
  }
  return (
    <div className="flex items-center gap-4 mb-5 flex-wrap">
      {[
        ['Total', total, 'text-violet-300'],
        avgHarga > 0 ? ['Rata-rata', `Rp ${fmt(avgHarga)}`, 'text-white/70'] : null,
        ['Halaman ini', properties.length, 'text-white/70'],
      ].filter(Boolean).map(([label, val, cls]) => (
        <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="text-white/40">{label}</span>
          <span className={`font-semibold ${cls}`}>{val}</span>
        </div>
      ))}
    </div>
  )
}

function Pagination({ page, total, onPageChange }) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
      acc.push(p)
      return acc
    }, [])
  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Prev
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e-${i}`} className="w-9 text-center text-white/25 text-sm">…</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p)}
            className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
            style={{
              background: p === page ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${p === page ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.07)'}`,
              color: p === page ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
            }}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onPageChange(page + 1)} disabled={page === Math.ceil(total / PAGE_SIZE)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
        Next
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>
  )
}

function MobileFilterDrawer({ open, onClose }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  return (
    <>
      <div className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden overflow-y-auto transition-transform duration-300"
        style={{ background: '#0c0a14', borderRight: '1px solid rgba(255,255,255,0.08)', transform: open ? 'translateX(0)' : 'translateX(-100%)' }}>
        <div className="flex items-center justify-between p-5 sticky top-0 z-10"
          style={{ background: '#0c0a14', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="font-semibold text-white">Filter Properti</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="p-5"><FilterPanel /></div>
      </div>
    </>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const { filters, sortKey, viewMode, resetFilters, page, setPage } = useFilterStore()
  const { properties, loading, error, total } = useProperties(filters, sortKey, page)
  const [wishlistIds, setWishlistIds]           = useState(new Set())
  const [filterOpen, setFilterOpen]             = useState(true)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    getWishlist(user.id).then(({ data }) => {
      if (data) setWishlistIds(new Set(data.map(w => w.property_id)))
    })
  }, [user])

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [page])

  const handleWishlist = async (propertyId) => {
    if (!user) return
    const { added } = await toggleWishlist(user.id, propertyId)
    setWishlistIds(prev => { const next = new Set(prev); added ? next.add(propertyId) : next.delete(propertyId); return next })
  }

  return (
    <div className="min-h-screen" style={{ background: '#0c0a14' }}>

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }} />
      </div>

      <Navbar />
      <MobileFilterDrawer open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium text-violet-400/70 uppercase tracking-widest mb-2">
              Sistem Rekomendasi Properti
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Properti di <span className="text-gradient">Jakarta</span>
            </h1>
            <p className="text-white/40 text-sm mt-2">Temukan hunian yang paling sesuai dengan kebutuhanmu</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filter
            </button>
            <button onClick={() => setFilterOpen(!filterOpen)}
              className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: filterOpen ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${filterOpen ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: filterOpen ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              {filterOpen ? 'Sembunyikan' : 'Tampilkan'} Filter
            </button>
          </div>
        </div>

        <div className="flex gap-6 items-start">

          {/* Filter sidebar */}
          {filterOpen && (
            <div className="hidden lg:block sticky top-24 rounded-2xl flex-shrink-0 scrollbar-thin"
              style={{ background: '#16112a', border: '1px solid rgba(255,255,255,0.07)', width: '272px', maxHeight: 'calc(100vh - 7rem)', overflowY: 'auto' }}>
              <div className="p-5">
                <FilterPanel />
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <StatsBar total={total} loading={loading} properties={properties} />

            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Gagal memuat data: {error}
              </div>
            )}

            {loading && (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'space-y-4'}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertySkeleton key={i} mode={viewMode === 'map' ? 'grid' : viewMode} />
                ))}
              </div>
            )}

            {!loading && properties.length === 0 && <EmptyState onReset={resetFilters} />}

            {!loading && properties.length > 0 && (
              viewMode === 'map' ? (
                <div className="h-[600px] w-full rounded-2xl overflow-hidden animate-fade-in"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <MapView properties={properties} />
                </div>
              ) : (
                <>
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'space-y-4'}>
                    {properties.map((p, i) => (
                      <div key={p.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}>
                        <PropertyCard property={p} viewMode={viewMode} onWishlist={handleWishlist} isWishlisted={wishlistIds.has(p.id)} />
                      </div>
                    ))}
                  </div>
                  <Pagination page={page} total={total} onPageChange={setPage} />
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
