import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase, toggleWishlist } from '../lib/supabase';
import { formatHarga } from '../hooks/UseProperties';
import { useAuth } from '../hooks/UseAuth';
import { useFilterStore } from '../store/FilterStore';
import Navbar from '../components/Navbar';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { compareList, toggleCompare } = useFilterStore();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const inCompare = compareList.includes(id);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      if (error) console.error('Error fetching detail:', error);
      else setProperty(data);
      setLoading(false);
    }
    fetchDetail();
    window.scrollTo(0, 0);
  }, [id]);

  // Cek status wishlist saat user login — query spesifik, bukan fetch semua
  useEffect(() => {
    if (!user) return;
    supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', id)
      .maybeSingle()
      .then(({ data }) => setIsWishlisted(!!data));
  }, [user, id]);

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    const { added } = await toggleWishlist(user.id, id);
    setIsWishlisted(added);
  };

  const handleHubungiAgen = () => {
    const msg = encodeURIComponent(`Halo, saya tertarik dengan properti: ${property?.nama}\nHarga: ${formatHarga(property?.harga)}\nAlamat: ${property?.alamat}, ${property?.kecamatan}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-violet-400">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold tracking-widest text-sm">MEMUAT DATA...</span>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <p className="text-slate-500 mb-6 font-medium">Properti tidak ditemukan.</p>
        <button onClick={() => navigate('/')} className="text-violet-400 border border-violet-500/30 bg-violet-500/10 px-6 py-2.5 rounded-full hover:bg-violet-500/20 transition-all text-sm font-semibold tracking-wide">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white selection:bg-violet-500/30">
      
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Breadcrumb / Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 text-sm font-medium text-slate-400 hover:text-violet-400 flex items-center gap-2 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sisi Kiri: Gallery & Deskripsi (8 Kolom) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-4">
              {/* Image Utama */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group">
                <img 
                  src={property.foto_urls?.[activeImg] || 'https://via.placeholder.com/800x450'} 
                  alt={property.nama}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/60 to-transparent pointer-events-none" />
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {property.foto_urls?.map((url, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImg === i ? 'border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'border-white/5 opacity-40 hover:opacity-100'
                    }`}
                  >
                    <img src={url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Deskripsi & Detail */}
            <div className="bg-white/[0.02] backdrop-blur-md rounded-3xl p-8 border border-white/5">
              <h2 className="text-xl font-display font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 tracking-wide">
                Deskripsi Properti
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                {property.deskripsi || "Tidak ada deskripsi tersedia untuk properti ini."}
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Panel Info & Spesifikasi (4 Kolom) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="mb-6 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-semibold px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 uppercase tracking-widest">
                    {property.tipe}
                  </span>
                  <span className="text-[10px] font-semibold px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                    {property.sertifikat}
                  </span>
                </div>
                <h1 className="text-3xl font-display font-bold leading-tight text-white mb-2">
                  {property.nama}
                </h1>
                <p className="text-sm text-slate-400 flex items-center gap-1.5">
                  <span className="text-violet-400/50">📍</span> {property.alamat}, {property.kecamatan}, {property.kota_wilayah}
                </p>
              </div>

              <div className="text-3xl font-bold tracking-tight text-gradient mb-8 relative z-10">
                {formatHarga(property.harga)}
              </div>

              {/* Grid Spesifikasi */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <SpecBadge label="L. BANGUNAN" value={`${property.luas_bangunan} m²`} />
                <SpecBadge label="L. TANAH" value={`${property.luas_tanah} m²`} />
                <SpecBadge label="K. TIDUR" value={property.kamar_tidur} />
                <SpecBadge label="K. MANDI" value={property.kamar_mandi} />
                <SpecBadge label="LANTAI" value={property.lantai} />
                <SpecBadge label="GARASI" value={property.garasi} />
              </div>

              {/* Fasilitas */}
              <div className="space-y-4">
                <h3 className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Fasilitas Tersedia</h3>
                <div className="flex flex-wrap gap-2">
                  {property.fasilitas?.length > 0 ? (
                    property.fasilitas.map((f, i) => (
                      <span key={i} className="text-xs font-medium bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300">
                        {f}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">Tidak ada data fasilitas.</span>
                  )}
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="mt-8 pt-6 border-t border-white/10 space-y-3 relative z-10">
                <button
                  onClick={handleHubungiAgen}
                  className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 group"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:scale-110 transition-transform"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>Hubungi via WhatsApp</span>
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleWishlist}
                    className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-2 ${
                      isWishlisted
                        ? 'border-fuchsia-500/50 bg-fuchsia-500/20 text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.2)]'
                        : 'border-white/10 bg-white/5 hover:border-fuchsia-500/30 hover:bg-fuchsia-500/10 hover:text-fuchsia-400 text-slate-400'
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {isWishlisted ? 'Tersimpan' : 'Wishlist'}
                  </button>
                  <button
                    onClick={() => {
                      if (!inCompare && compareList.length >= 3) return;
                      toggleCompare(id);
                    }}
                    disabled={!inCompare && compareList.length >= 3}
                    className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-2 ${
                      inCompare
                        ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : compareList.length >= 3
                        ? 'border-white/5 text-white/20 cursor-not-allowed'
                        : 'border-white/10 bg-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400 text-slate-400'
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                    {inCompare ? 'Dibandingkan' : compareList.length >= 3 ? 'Maks 3' : 'Bandingkan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

function SpecBadge({ label, value }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl flex flex-col items-start hover:border-violet-500/30 transition-colors">
      <div className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-widest">{label}</div>
      <div className="text-sm font-bold text-white tracking-wide">{value || '-'}</div>
    </div>
  );
}