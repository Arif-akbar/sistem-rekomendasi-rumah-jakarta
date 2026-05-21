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
    getWishlist(user.id).then(({ data }) => {
      setWishlist(data ?? [])
      setLoading(false)
    })
  }, [user, authLoading])

  const handleRemove = async (propertyId) => {
    await toggleWishlist(user.id, propertyId)
    setWishlist(prev => prev.filter(w => w.property_id !== propertyId))
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-violet-400">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold tracking-widest text-sm">MEMUAT WISHLIST...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">
            Wishlist{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              Saya
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">{wishlist.length} properti disimpan</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
            <div className="text-6xl opacity-20">♡</div>
            <p className="text-slate-400 font-medium text-sm">Wishlist Anda masih kosong</p>
            <p className="text-slate-500 text-xs">Simpan properti favorit Anda dari halaman utama</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-sm font-semibold hover:bg-violet-500/20 transition-all"
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
                  className="relative rounded-2xl border border-white/5 overflow-hidden cursor-pointer group transition-all duration-300 hover:border-violet-500/50 hover:-translate-y-1 bg-white/[0.02] backdrop-blur-xl hover:shadow-[0_0_25px_rgba(139,92,246,0.15)]"
                >
                  <div className="relative h-44 overflow-hidden bg-white/5">
                    {p.foto_urls?.[0] ? (
                      <img src={p.foto_urls[0]} alt={p.nama} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🏠</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-transparent to-transparent opacity-80" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider border bg-violet-500/20 text-violet-300 border-violet-500/30 uppercase">
                      {p.tipe}
                    </div>
                  </div>
                  <div className="p-5 space-y-2.5">
                    <h3 className="text-base font-display font-bold text-white leading-tight line-clamp-1 group-hover:text-violet-400 transition-colors">
                      {p.nama}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <span className="text-violet-400/50">📍</span> {p.kecamatan}, {p.kota_wilayah}
                    </p>
                    <p className="text-lg font-bold tracking-tight text-gradient">
                      {formatHarga(p.harga)}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex gap-3 text-xs text-slate-400 font-medium">
                        {p.kamar_tidur > 0 && <span className="flex items-center gap-1"><span className="opacity-50">🛏</span> {p.kamar_tidur}</span>}
                        {p.kamar_mandi > 0 && <span className="flex items-center gap-1"><span className="opacity-50">🚿</span> {p.kamar_mandi}</span>}
                        {p.luas_bangunan > 0 && <span className="flex items-center gap-1"><span className="opacity-50">⬡</span> {p.luas_bangunan}m²</span>}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemove(property_id) }}
                        className="text-[10px] font-semibold text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors border border-transparent hover:border-red-400/30 px-2 py-1 rounded-md"
                      >
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

      <style>{``}</style>
    </div>
  )
}
