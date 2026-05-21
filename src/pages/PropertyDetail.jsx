import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase, toggleWishlist, getWishlist } from '../lib/supabase';
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

  // Cek status wishlist saat user login
  useEffect(() => {
    if (!user) return;
    getWishlist(user.id).then(({ data }) => {
      if (data) setIsWishlisted(data.some(w => w.property_id === id));
    });
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
      <div className="min-h-screen bg-[#030712] flex items-center justify-center font-mono text-emerald-400">
        <div className="animate-pulse">INITIALIZING TELEMETRY...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-white font-mono">
        <p className="text-white/40 mb-4">DATA_NOT_FOUND: Properti tidak tersedia.</p>
        <button onClick={() => navigate('/')} className="text-emerald-400 border border-emerald-400/30 px-4 py-2 rounded">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-emerald-500/30"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Breadcrumb / Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 text-xs text-white/30 hover:text-emerald-400 flex items-center gap-2 transition-colors"
        >
          <span>←</span> KEMBALI
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
                    className={`relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImg === i ? 'border-emerald-400' : 'border-white/5 opacity-40 hover:opacity-100'
                    }`}
                  >
                    <img src={url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Deskripsi & Detail */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
              <h2 className="text-lg font-bold mb-4 text-emerald-400" style={{ fontFamily: "'Syne', sans-serif" }}>
                DESKRIPSI_PROPERTI
              </h2>
              <p className="text-white/60 leading-relaxed text-sm whitespace-pre-wrap">
                {property.deskripsi || "Tidak ada deskripsi tersedia untuk properti ini."}
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Panel Info & Spesifikasi (4 Kolom) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 uppercase`}>
                    {property.tipe}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded border border-blue-400/30 bg-blue-400/10 text-blue-400">
                    {property.sertifikat}
                  </span>
                </div>
                <h1 className="text-2xl font-bold leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {property.nama}
                </h1>
                <p className="text-xs text-white/30 mt-2">
                  ◎ {property.alamat}, {property.kecamatan}, {property.kota_wilayah}
                </p>
              </div>

              <div className="text-2xl font-bold text-white mb-8">
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
              <div className="space-y-3">
                <h3 className="text-[10px] text-white/20 font-bold uppercase tracking-widest">FASILITAS_TERSEDIA</h3>
                <div className="flex flex-wrap gap-2">
                  {property.fasilitas?.length > 0 ? (
                    property.fasilitas.map((f, i) => (
                      <span key={i} className="text-[10px] bg-white/5 border border-white/5 px-2 py-1 rounded text-white/50">
                        {f}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-white/20 italic">Tidak ada data fasilitas.</span>
                  )}
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                <button
                  onClick={handleHubungiAgen}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
                >
                  <span>💬</span> Hubungi via WhatsApp
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleWishlist}
                    className={`flex-1 py-2 rounded-xl text-xs transition-all border flex items-center justify-center gap-1 ${
                      isWishlisted
                        ? 'border-red-400/40 bg-red-400/10 text-red-400'
                        : 'border-white/10 hover:border-white/20 text-white/60'
                    }`}
                  >
                    {isWishlisted ? '♥ Tersimpan' : '♡ Simpan Wishlist'}
                  </button>
                  <button
                    onClick={() => {
                      if (!inCompare && compareList.length >= 3) return;
                      toggleCompare(id);
                    }}
                    disabled={!inCompare && compareList.length >= 3}
                    className={`flex-1 py-2 rounded-xl text-xs transition-all border flex items-center justify-center gap-1 ${
                      inCompare
                        ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-400'
                        : compareList.length >= 3
                        ? 'border-white/5 text-white/20 cursor-not-allowed'
                        : 'border-white/10 hover:border-white/20 text-white/60'
                    }`}
                  >
                    {inCompare ? '⊞ Dibandingkan' : compareList.length >= 3 ? 'Maks 3' : '⊞ Bandingkan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Syne:wght@700&display=swap');
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// Komponen Kecil untuk Badge Spesifikasi
function SpecBadge({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
      <div className="text-[10px] text-white/20 mb-1 uppercase tracking-tighter">{label}</div>
      <div className="text-sm font-bold text-white/80">{value || '0'}</div>
    </div>
  );
}