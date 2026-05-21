import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom'; 
import Navbar from '../components/Navbar';

const FASILITAS_OPTIONS = ['Kolam Renang', 'Gym', 'Keamanan 24 Jam', 'Parkir', 'Taman', 'AC', 'CCTV', 'Lift']
const SERTIFIKAT_OPTIONS = ['SHM', 'HGB', 'SHGB', 'Strata']
const STATUS_OPTIONS = ['aktif', 'nonaktif', 'terjual']

export default function PropertyForm() {
  // 2. WAJIB ADA BARIS INI untuk mengambil ID dari URL
  const { id } = useParams(); 
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    nama: '', deskripsi: '', harga: '', tipe: 'rumah', 
    kota_wilayah: 'Jakarta Selatan', kecamatan: '', alamat: '', 
    kamar_tidur: 0, kamar_mandi: 0, luas_tanah: 0, luas_bangunan: 0, 
    lantai: 1, garasi: 0, sertifikat: 'SHM', kondisi: 'Bagus',
    foto_urls: [], lat: -6.2088, lng: 106.8456, status: 'aktif',
    fasilitas: [],
  });

  useEffect(() => {
    if (id) {
      supabase.from('properties').select('*').eq('id', id).single()
        .then(({ data }) => {
          if (data) setFormData(data);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value;
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const toggleFasilitas = (f) => {
    setFormData(prev => {
      const cur = prev.fasilitas ?? [];
      return {
        ...prev,
        fasilitas: cur.includes(f) ? cur.filter(x => x !== f) : [...cur, f],
      };
    });
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `foto-rumah/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('property-photos')
      .upload(filePath, file);

    if (uploadError) {
      alert('Gagal upload gambar: ' + uploadError.message);
    } else {
      const { data } = supabase.storage.from('property-photos').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, foto_urls: [...prev.foto_urls, data.publicUrl] }));
    }
    setUploading(false);
  };

  const hapusFoto = (index) => {
    setFormData(prev => ({
      ...prev,
      foto_urls: prev.foto_urls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Di sinilah variabel 'id' digunakan. Jika baris 'const { id } = useParams()' hilang, ini akan error.
    const action = id 
      ? supabase.from('properties').update(formData).eq('id', id) 
      : supabase.from('properties').insert([formData]);
    
    const { error } = await action;
    
    if (error) {
      alert('Gagal menyimpan data: ' + error.message);
    } else {
      alert('Data berhasil disimpan!');
      navigate('/admin');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white font-mono">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 pt-24 pb-12">
        <button onClick={() => navigate('/admin')} className="mb-6 text-xs text-white/40 hover:text-emerald-400">
          ← Kembali ke Dashboard
        </button>
        
        <h1 className="text-2xl font-bold mb-6 text-emerald-400" style={{ fontFamily: "'Syne', sans-serif" }}>
          {id ? 'EDIT_DATA_PROPERTI' : 'INPUT_DATA_BARU'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-white/10 text-sm">
          {/* Baris 1: Nama & Harga */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs">Nama Properti *</label>
              <input name="nama" value={formData.nama} onChange={handleChange} className="bg-[#030712] border border-white/10 p-3 rounded-lg focus:border-emerald-500 outline-none" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs">Harga (Rp) *</label>
              <input type="number" name="harga" value={formData.harga} onChange={handleChange} className="bg-[#030712] border border-white/10 p-3 rounded-lg focus:border-emerald-500 outline-none" required />
            </div>
          </div>

          {/* Baris 2: Wilayah, Kecamatan, Tipe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs">Wilayah</label>
              <select name="kota_wilayah" value={formData.kota_wilayah} onChange={handleChange} className="bg-[#030712] border border-white/10 p-3 rounded-lg outline-none">
                <option value="Jakarta Selatan">Jakarta Selatan</option>
                <option value="Jakarta Pusat">Jakarta Pusat</option>
                <option value="Jakarta Barat">Jakarta Barat</option>
                <option value="Jakarta Timur">Jakarta Timur</option>
                <option value="Jakarta Utara">Jakarta Utara</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs">Kecamatan</label>
              <input name="kecamatan" value={formData.kecamatan} onChange={handleChange} className="bg-[#030712] border border-white/10 p-3 rounded-lg outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs">Tipe</label>
              <select name="tipe" value={formData.tipe} onChange={handleChange} className="bg-[#030712] border border-white/10 p-3 rounded-lg outline-none">
                <option value="rumah">Rumah</option>
                <option value="apartemen">Apartemen</option>
                <option value="ruko">Ruko</option>
                <option value="tanah">Tanah</option>
              </select>
            </div>
          </div>

          {/* Baris 3: Spesifikasi */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-white/5 rounded-xl bg-white/5">
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-[10px]">L. Bangunan (m2)</label>
              <input type="number" name="luas_bangunan" value={formData.luas_bangunan} onChange={handleChange} className="bg-[#030712] border border-white/10 p-2 rounded text-center" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-[10px]">L. Tanah (m2)</label>
              <input type="number" name="luas_tanah" value={formData.luas_tanah} onChange={handleChange} className="bg-[#030712] border border-white/10 p-2 rounded text-center" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-[10px]">K. Tidur</label>
              <input type="number" name="kamar_tidur" value={formData.kamar_tidur} onChange={handleChange} className="bg-[#030712] border border-white/10 p-2 rounded text-center" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-[10px]">K. Mandi</label>
              <input type="number" name="kamar_mandi" value={formData.kamar_mandi} onChange={handleChange} className="bg-[#030712] border border-white/10 p-2 rounded text-center" />
            </div>
          </div>

          {/* Baris 4: Koordinat Peta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs">Latitude (Peta)</label>
              <input type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} className="bg-[#030712] border border-white/10 p-3 rounded-lg outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs">Longitude (Peta)</label>
              <input type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} className="bg-[#030712] border border-white/10 p-3 rounded-lg outline-none" />
            </div>
          </div>

          {/* Baris 5: Alamat & Deskripsi */}
          <div className="flex flex-col gap-2">
            <label className="text-white/50 text-xs">Alamat Lengkap</label>
            <input name="alamat" value={formData.alamat} onChange={handleChange} placeholder="Jl. Contoh No. 1" className="bg-[#030712] border border-white/10 p-3 rounded-lg outline-none focus:border-emerald-500" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white/50 text-xs">Deskripsi</label>
            <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows={4} placeholder="Deskripsi properti..." className="bg-[#030712] border border-white/10 p-3 rounded-lg outline-none focus:border-emerald-500 resize-none" />
          </div>

          {/* Baris 6: Sertifikat & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs">Sertifikat</label>
              <div className="flex flex-wrap gap-2">
                {SERTIFIKAT_OPTIONS.map(s => (
                  <button
                    key={s} type="button"
                    onClick={() => setFormData(prev => ({ ...prev, sertifikat: s }))}
                    className={`px-3 py-1.5 rounded text-xs border transition-all ${
                      formData.sertifikat === s
                        ? 'bg-emerald-400/15 border-emerald-400/40 text-emerald-400'
                        : 'bg-white/3 border-white/10 text-white/40 hover:border-white/25'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs">Status Properti</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s} type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                    className={`px-3 py-1.5 rounded text-xs border transition-all ${
                      formData.status === s
                        ? s === 'aktif' ? 'bg-emerald-400/15 border-emerald-400/40 text-emerald-400'
                          : s === 'terjual' ? 'bg-red-400/15 border-red-400/40 text-red-400'
                          : 'bg-white/10 border-white/20 text-white/60'
                        : 'bg-white/3 border-white/10 text-white/40 hover:border-white/25'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Baris 7: Fasilitas */}
          <div className="flex flex-col gap-2 p-4 border border-white/5 rounded-xl bg-white/3">
            <label className="text-white/50 text-xs mb-1">Fasilitas Tersedia</label>
            <div className="flex flex-wrap gap-2">
              {FASILITAS_OPTIONS.map(f => (
                <button
                  key={f} type="button"
                  onClick={() => toggleFasilitas(f)}
                  className={`px-3 py-1.5 rounded text-xs border transition-all ${
                    (formData.fasilitas ?? []).includes(f)
                      ? 'bg-emerald-400/15 border-emerald-400/40 text-emerald-400'
                      : 'bg-white/3 border-white/10 text-white/40 hover:border-white/25'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {formData.fasilitas?.length > 0 && (
              <p className="text-[10px] text-white/25 mt-1 font-mono">
                {formData.fasilitas.length} fasilitas dipilih
              </p>
            )}
          </div>

          {/* Upload Foto */}
          <div className="flex flex-col gap-2 p-4 border border-dashed border-emerald-500/30 rounded-xl bg-emerald-500/5">
            <label className="text-emerald-400 font-bold text-xs mb-2">Upload Foto Properti (Bisa lebih dari 1)</label>
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="text-xs file:bg-emerald-500 file:border-none file:px-4 file:py-2 file:rounded-lg file:mr-4 file:font-bold cursor-pointer" />
            {uploading && <span className="text-xs text-emerald-400 mt-2 animate-pulse">Mengunggah gambar...</span>}
            
            <div className="flex flex-wrap gap-3 mt-4">
              {formData.foto_urls.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} className="w-24 h-24 object-cover rounded-lg border border-white/20" />
                  <button type="button" onClick={() => hapusFoto(i)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs hidden group-hover:block shadow-lg">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="pt-4 border-t border-white/10">
            <button type="submit" disabled={loading || uploading} className="w-full bg-emerald-500 text-slate-950 font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              {loading ? 'MENYIMPAN DATA...' : 'SIMPAN KE DATABASE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}