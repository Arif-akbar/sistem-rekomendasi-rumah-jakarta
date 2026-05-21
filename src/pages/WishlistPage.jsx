import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/UseAuth'
import { getWishlist, toggleWishlist } from '../lib/supabase'
import { formatHarga } from '../hooks/UseProperties'
import Navbar from '../components/Navbar'

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login', { replace: true }); return }
    getWishlist(user.id).then(({ data }) => {
      setWishlist(data ?? [])
      setLoading(false)
    })
  }, [user, authLoading, navigate])

  const handleRemove = async (propertyId) => {
    await toggleWishlist(user.id, propertyId)
    setWishlist(prev => prev.filter(w => w.property_id !== propertyId))
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center font-mono text-emerald-400 animate-pulse">
        MEMUAT WISHLIST...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <Navbar />

      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,212,170,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
            Wishlist{' '}
            <span style={{ background: 'linear-gradient(90deg, #00d4aa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Saya
            </span>
          </h1>
          <p className="text-white/30 text-xs mt-1 font-mono">{wishlist.length} properti disimpan</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
            <div className="text-6xl opacity-20">♡</div>
            <p className="text-white/40 font-mono text-sm">Wishlist kamu masih kosong</p>
            <p className="text-white/20 font-mono text-xs">Simpan properti favoritmu dari halaman utama</p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 px-5 py-2 rounded border border-emerald-400/30 text-emerald-400 text-xs hover:bg-emerald-400/10 transition-all font-mono"
            >
              ← Jelajahi Properti
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.map(({ property_id, properties: p }) => {
              if (!p) return null
              return (
                <article
                  key={property_id}
                  onClick={() => navigate(`/properti/${property_id}`)}
                  className="relative rounded-lg border border-white/8 overflow-hidden cursor-pointer group transition-all duration-300 hover:border-emerald-400/30 hover:-translate-y-0.5"
                  style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(12px)' }}
                >
                  <div className="relative h-44 overflow-hidden bg-white/4">
                    {p.foto_urls?.[0] ? (
                      <img src={p.foto_urls[0]} alt={p.nama} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🏠</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-80" />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono border bg-emerald-400/10 text-emerald-400 border-emerald-400/30">
                      {p.tipe}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-medium text-white leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {p.nama}
                    </h3>
                    <p className="text-[11px] text-white/35 font-mono">
                      ◎ {p.kecamatan}, {p.kota_wilayah}
                    </p>
                    <p className="text-base font-bold tabular-nums"
                      style={{ background: 'linear-gradient(90deg, #fff, #00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'monospace' }}>
                      {formatHarga(p.harga)}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-white/6">
                      <div className="flex gap-3 text-[11px] text-white/30 font-mono">
                        {p.kamar_tidur > 0 && <span>🛏 {p.kamar_tidur}</span>}
                        {p.kamar_mandi > 0 && <span>🚿 {p.kamar_mandi}</span>}
                        {p.luas_bangunan > 0 && <span>⬡ {p.luas_bangunan}m²</span>}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemove(property_id) }}
                        className="text-[10px] font-mono text-red-400/50 hover:text-red-400 transition-colors border border-red-400/20 hover:border-red-400/40 px-2 py-0.5 rounded"
                      >
                        ✕ Hapus
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Syne:wght@700&display=swap');`}</style>
    </div>
  )
}
