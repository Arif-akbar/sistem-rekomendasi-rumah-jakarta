import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase, toggleWishlist } from '../lib/supabase'
import { formatHarga } from '../hooks/UseProperties'
import { useAuth } from '../hooks/UseAuth'
import { useFilterStore } from '../store/FilterStore'
import Navbar from '../components/Navbar'

const T = {
  bgPage: '#0c0a14', bgCard: '#16112a',
  border: 'rgba(255,255,255,0.07)', borderHover: 'rgba(124,58,237,0.3)',
  textPrimary: '#f1f0f5', textMuted: 'rgba(255,255,255,0.45)', textSubtle: 'rgba(255,255,255,0.25)',
  violet: '#7c3aed', violetLight: '#a78bfa', violetPale: '#c4b5fd',
  amberLight: '#fbbf24',
}

function Skeleton({ className, style }) {
  return <div className={`rounded-xl animate-pulse ${className}`} style={{ background: 'rgba(255,255,255,0.06)', ...style }} />
}

function PageSkeleton() {
  return (
    <div style={{ background: T.bgPage }} className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <Skeleton className="w-24 h-9 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="w-full rounded-2xl" style={{ aspectRatio: '16/9' }} />
            <div className="flex gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="w-24 h-16 flex-shrink-0" />)}</div>
            <Skeleton className="w-full h-40 rounded-2xl" />
          </div>
          <div className="lg:col-span-4"><Skeleton className="w-full h-96 rounded-2xl" /></div>
        </div>
      </div>
    </div>
  )
}

function SpecCard({ label, value }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}` }}>
      <div className="text-xs mb-1 font-medium" style={{ color: T.textSubtle }}>{label}</div>
      <div className="text-sm font-bold" style={{ color: T.textPrimary }}>{value ?? '—'}</div>
    </div>
  )
}

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { compareList, toggleCompare } = useFilterStore()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const inCompare = compareList.includes(id)

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true)
      const { data, error } = await supabase.from('properties').select('*').eq('id', id).single()
      if (error) console.error('Error fetching detail:', error)
      else setProperty(data)
      setLoading(false)
    }
    fetchDetail()
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    if (!user) return
    supabase.from('wishlist').select('id').eq('user_id', user.id).eq('property_id', id).maybeSingle()
      .then(({ data }) => setIsWishlisted(!!data))
  }, [user, id])

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return }
    const { added } = await toggleWishlist(user.id, id)
    setIsWishlisted(added)
  }

  const handleHubungiAgen = () => {
    const msg = encodeURIComponent(`Halo, saya tertarik dengan properti: ${property?.nama}\nHarga: ${formatHarga(property?.harga)}\nAlamat: ${property?.alamat}, ${property?.kecamatan}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  if (loading) return <PageSkeleton />

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: T.bgPage }}>
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>🏚</div>
          <p className="text-lg font-semibold" style={{ color: T.textPrimary }}>Properti tidak ditemukan</p>
          <p className="text-sm" style={{ color: T.textMuted }}>Data properti ini tidak tersedia atau telah dihapus.</p>
          <button onClick={() => navigate('/')}
            className="mt-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: T.bgPage, color: T.textPrimary }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        <button onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={{ background: T.bgCard, border: `1px solid ${T.border}`, color: T.textMuted }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.violetLight }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted }}>
          ← Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: gallery + description */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9', border: `1px solid ${T.border}` }}>
              <img src={property.foto_urls?.[activeImg] || 'https://via.placeholder.com/800x450'} alt={property.nama}
                className="w-full h-full object-cover transition-opacity duration-300" />
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(12,10,20,0.5) 0%, transparent 50%)' }} />
            </div>

            {property.foto_urls?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {property.foto_urls.map((url, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className="relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden transition-all duration-200"
                    style={{ border: `2px solid ${activeImg === i ? T.violet : 'transparent'}`, opacity: activeImg === i ? 1 : 0.45 }}
                    onMouseEnter={e => { if (activeImg !== i) e.currentTarget.style.opacity = '0.8' }}
                    onMouseLeave={e => { if (activeImg !== i) e.currentTarget.style.opacity = '0.45' }}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="rounded-2xl p-6" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
              <h2 className="text-base font-semibold mb-3" style={{ color: T.violetLight }}>Deskripsi Properti</h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: T.textMuted }}>
                {property.deskripsi || 'Tidak ada deskripsi tersedia untuk properti ini.'}
              </p>
            </div>
          </div>

          {/* Right: sticky info panel */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl p-6" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: T.violetPale }}>
                  {property.tipe}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: T.amberLight }}>
                  {property.sertifikat}
                </span>
              </div>

              <h1 className="text-xl font-bold leading-snug mb-2" style={{ color: T.textPrimary }}>{property.nama}</h1>
              <p className="text-xs mb-5" style={{ color: T.textSubtle }}>
                📍 {property.alamat}, {property.kecamatan}, {property.kota_wilayah}
              </p>

              <div className="text-2xl font-bold mb-6"
                style={{ background: `linear-gradient(90deg, ${T.violetLight}, ${T.violetPale})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {formatHarga(property.harga)}
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-6">
                <SpecCard label="Luas Bangunan" value={property.luas_bangunan ? `${property.luas_bangunan} m²` : null} />
                <SpecCard label="Luas Tanah"    value={property.luas_tanah    ? `${property.luas_tanah} m²`    : null} />
                <SpecCard label="Kamar Tidur"   value={property.kamar_tidur} />
                <SpecCard label="Kamar Mandi"   value={property.kamar_mandi} />
                <SpecCard label="Lantai"        value={property.lantai} />
                <SpecCard label="Garasi"        value={property.garasi} />
              </div>

              {property.fasilitas?.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-medium mb-2.5" style={{ color: T.textSubtle }}>Fasilitas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {property.fasilitas.map((f, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.textMuted }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ height: 1, background: T.border, marginBottom: '1.25rem' }} />

              <div className="space-y-2.5">
                <button onClick={handleHubungiAgen}
                  className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', boxShadow: '0 4px 16px rgba(22,163,74,0.3)' }}>
                  💬 Hubungi via WhatsApp
                </button>
                <div className="flex gap-2">
                  <button onClick={handleWishlist}
                    className="flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200"
                    style={isWishlisted
                      ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }
                      : { background: 'transparent', border: `1px solid ${T.border}`, color: T.textMuted }}>
                    {isWishlisted ? '♥ Tersimpan' : '♡ Wishlist'}
                  </button>
                  <button
                    onClick={() => { if (!inCompare && compareList.length >= 3) return; toggleCompare(id) }}
                    disabled={!inCompare && compareList.length >= 3}
                    className="flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200"
                    style={inCompare
                      ? { background: 'rgba(124,58,237,0.12)', border: `1px solid ${T.borderHover}`, color: T.violetLight }
                      : compareList.length >= 3
                      ? { background: 'transparent', border: '1px solid rgba(255,255,255,0.04)', color: T.textSubtle, cursor: 'not-allowed' }
                      : { background: 'transparent', border: `1px solid ${T.border}`, color: T.textMuted }}>
                    {inCompare ? '⊞ Dibandingkan' : compareList.length >= 3 ? 'Maks 3' : '⊞ Bandingkan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
