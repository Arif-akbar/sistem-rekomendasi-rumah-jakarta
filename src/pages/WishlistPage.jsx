import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/UseAuth'
import { getWishlist, toggleWishlist } from '../lib/supabase'
import { formatHarga } from '../hooks/UseProperties'
import Navbar from '../components/Navbar'

const T = {
  bgPage: '#0c0a14', bgCard: '#16112a', bgCardHover: '#1e1840',
  border: 'rgba(255,255,255,0.07)', borderHover: 'rgba(124,58,237,0.3)',
  textPrimary: '#f1f0f5', textMuted: 'rgba(255,255,255,0.45)', textSubtle: 'rgba(255,255,255,0.25)',
  violetLight: '#a78bfa', violetPale: '#c4b5fd',
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="h-44 animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="p-4 space-y-3">
        {[16, 12, 8, 20].map((h, i) => (
          <div key={i} className={`h-${h === 16 ? 4 : h === 12 ? 3 : h === 8 ? 3 : 5} rounded-full animate-pulse`}
            style={{ background: 'rgba(255,255,255,0.06)', width: ['75%','50%','60%','66%'][i] }} />
        ))}
      </div>
    </div>
  )
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    getWishlist(user.id).then(({ data }) => { setWishlist(data ?? []); setLoading(false) })
  }, [user, authLoading])

  const handleRemove = async (propertyId) => {
    await toggleWishlist(user.id, propertyId)
    setWishlist(prev => prev.filter(w => w.property_id !== propertyId))
  }

  return (
    <div className="min-h-screen" style={{ background: T.bgPage, color: T.textPrimary }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold" style={{ color: T.textPrimary }}>Wishlist Saya</h1>
          {!loading && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: T.violetLight }}>
              {wishlist.length}
            </span>
          )}
        </div>

        {(authLoading || loading) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>

        ) : wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>🤍</div>
            <p className="text-lg font-semibold" style={{ color: T.textPrimary }}>Wishlist masih kosong</p>
            <p className="text-sm max-w-xs" style={{ color: T.textMuted }}>
              Simpan properti favoritmu dari halaman utama untuk melihatnya di sini.
            </p>
            <button onClick={() => navigate('/')}
              className="mt-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
              Jelajahi Properti
            </button>
          </div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {wishlist.map(({ property_id, properties: p }) => {
              if (!p) return null
              return (
                <article key={property_id} onClick={() => navigate(`/properti/${property_id}`)}
                  className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300"
                  style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = T.bgCardHover }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = T.bgCard }}>

                  <div className="relative h-44 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {p.foto_urls?.[0]
                      ? <img src={p.foto_urls[0]} alt={p.nama} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl" style={{ opacity: 0.2 }}>🏠</div>
                    }
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(to top, rgba(12,10,20,0.6) 0%, transparent 60%)' }} />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.4)', color: T.violetPale, backdropFilter: 'blur(8px)' }}>
                      {p.tipe}
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <h3 className="text-sm font-semibold leading-tight line-clamp-1" style={{ color: T.textPrimary }}>{p.nama}</h3>
                    <p className="text-xs flex items-center gap-1" style={{ color: T.textSubtle }}>📍 {p.kecamatan}, {p.kota_wilayah}</p>
                    <p className="text-base font-bold"
                      style={{ background: `linear-gradient(90deg, ${T.violetLight}, ${T.violetPale})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {formatHarga(p.harga)}
                    </p>
                    <div className="flex items-center justify-between pt-2.5" style={{ borderTop: `1px solid ${T.border}` }}>
                      <div className="flex gap-3 text-xs" style={{ color: T.textSubtle }}>
                        {p.kamar_tidur > 0  && <span>🛏 {p.kamar_tidur}</span>}
                        {p.kamar_mandi > 0  && <span>🚿 {p.kamar_mandi}</span>}
                        {p.luas_bangunan > 0 && <span>⬡ {p.luas_bangunan}m²</span>}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleRemove(property_id) }}
                        className="text-xs px-2.5 py-1 rounded-lg transition-all duration-200"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(252,165,165,0.7)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#fca5a5' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = 'rgba(252,165,165,0.7)' }}>
                        Hapus
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
