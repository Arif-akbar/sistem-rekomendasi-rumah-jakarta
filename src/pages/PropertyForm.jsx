import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

const T = {
  bgPage: '#0c0a14', bgCard: '#16112a', bgInput: '#0f0c1e',
  border: 'rgba(255,255,255,0.07)', borderFocus: 'rgba(124,58,237,0.5)',
  textPrimary: '#f1f0f5', textMuted: 'rgba(255,255,255,0.45)', textSubtle: 'rgba(255,255,255,0.25)',
  violetLight: '#a78bfa', violetPale: '#c4b5fd',
}

const FASILITAS_OPTIONS = ['Kolam Renang', 'Gym', 'Keamanan 24 Jam', 'Parkir', 'Taman', 'AC', 'CCTV', 'Lift']
const SERTIFIKAT_OPTIONS = ['SHM', 'HGB', 'SHGB', 'Strata']
const STATUS_OPTIONS = [
  { value: 'aktif',    label: 'Aktif',    color: 'rgba(52,211,153,0.2)',  border: 'rgba(52,211,153,0.4)',  text: '#6ee7b7' },
  { value: 'nonaktif', label: 'Nonaktif', color: 'rgba(100,116,139,0.2)', border: 'rgba(100,116,139,0.4)', text: '#94a3b8' },
  { value: 'terjual',  label: 'Terjual',  color: 'rgba(239,68,68,0.2)',   border: 'rgba(239,68,68,0.4)',   text: '#fca5a5' },
]

// Input field yang konsisten
function FormInput({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: T.textMuted }}>
        {label}{required && <span className="ml-1" style={{ color: '#f87171' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass = {
  background: T.bgInput,
  border: `1px solid ${T.border}`,
  color: T.textPrimary,
  borderRadius: '10px',
  padding: '10px 12px',
  outline: 'none',
  fontSize: '14px',
  width: '100%',
  transition: 'border-color 0.2s',
}

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  const [formData, setFormData] = useState({
    nama: '', deskripsi: '', harga: '', tipe: 'rumah',
    kota_wilayah: 'Jakarta Selatan', kecamatan: '', alamat: '',
    kamar_tidur: 0, kamar_mandi: 0, luas_tanah: 0, luas_bangunan: 0,
    lantai: 1, garasi: 0, sertifikat: 'SHM', kondisi: 'Bagus',
    foto_urls: [], lat: -6.2088, lng: 106.8456, status: 'aktif',
    fasilitas: [],
  });

  useEffect(() => {
    if (!id) return;
    supabase.from('properties').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (data) setFormData({ ...data, fasilitas: data.fasilitas ?? [], foto_urls: data.foto_urls ?? [] });
        setLoadingData(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value }));
  };

  const toggleFasilitas = (f) => {
    setFormData(prev => {
      const cur = prev.fasilitas ?? [];
      return { ...prev, fasilitas: cur.includes(f) ? cur.filter(x => x !== f) : [...cur, f] };
    });
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `foto-rumah/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('property-photos').upload(filePath, file);
    if (uploadError) {
      alert('Gagal upload: ' + uploadError.message);
    } else {
      const { data } = supabase.storage.from('property-photos').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, foto_urls: [...prev.foto_urls, data.publicUrl] }));
    }
    setUploading(false);
    e.target.value = ''; // reset input file
  };

  const hapusFoto = (index) => {
    setFormData(prev => ({ ...prev, foto_urls: prev.foto_urls.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama.trim()) { alert('Nama properti wajib diisi'); return; }
    if (!formData.harga || formData.harga <= 0) { alert('Harga harus lebih dari 0'); return; }
    setLoading(true);
    const action = id
      ? supabase.from('properties').update(formData).eq('id', id)
      : supabase.from('properties').insert([formData]);
    const { error } = await action;
    if (error) {
      alert('Gagal menyimpan: ' + error.message);
    } else {
      navigate('/admin');
    }
    setLoading(false);
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.bgPage }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'rgba(124,58,237,0.3)', borderTopColor: '#a78bfa' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: T.bgPage, color: T.textPrimary }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        {/* Back button */}
        <button onClick={() => navigate('/admin')}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={{ background: T.bgCard, border: `1px solid ${T.border}`, color: T.textMuted }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderFocus; e.currentTarget.style.color = T.violetLight }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted }}>
          ← Kembali ke Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: T.textPrimary }}>
            {id ? 'Edit Properti' : 'Tambah Properti Baru'}
          </h1>
          <p className="text-sm mt-1" style={{ color: T.textMuted }}>
            {id ? 'Perbarui informasi properti yang sudah ada.' : 'Isi semua informasi properti dengan lengkap.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Informasi Dasar ── */}
          <section className="rounded-2xl p-6 space-y-4" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: T.violetLight }}>Informasi Dasar</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Nama Properti" required>
                <input name="nama" value={formData.nama} onChange={handleChange} required
                  placeholder="Contoh: Rumah Mewah Kebayoran Baru"
                  style={inputClass}
                  onFocus={e => e.target.style.borderColor = T.borderFocus}
                  onBlur={e => e.target.style.borderColor = T.border} />
              </FormInput>
              <FormInput label="Harga (Rp)" required>
                <input type="number" name="harga" value={formData.harga} onChange={handleChange} required
                  placeholder="Contoh: 2500000000"
                  style={inputClass}
                  onFocus={e => e.target.style.borderColor = T.borderFocus}
                  onBlur={e => e.target.style.borderColor = T.border} />
              </FormInput>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput label="Wilayah">
                <select name="kota_wilayah" value={formData.kota_wilayah} onChange={handleChange} style={inputClass}>
                  {['Jakarta Selatan','Jakarta Pusat','Jakarta Barat','Jakarta Timur','Jakarta Utara'].map(w => (
                    <option key={w} value={w} style={{ background: '#1a1530' }}>{w}</option>
                  ))}
                </select>
              </FormInput>
              <FormInput label="Kecamatan">
                <input name="kecamatan" value={formData.kecamatan} onChange={handleChange}
                  placeholder="Contoh: Kebayoran Baru"
                  style={inputClass}
                  onFocus={e => e.target.style.borderColor = T.borderFocus}
                  onBlur={e => e.target.style.borderColor = T.border} />
              </FormInput>
              <FormInput label="Tipe Properti">
                <select name="tipe" value={formData.tipe} onChange={handleChange} style={inputClass}>
                  {['rumah','apartemen','ruko','tanah','villa'].map(t => (
                    <option key={t} value={t} style={{ background: '#1a1530' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </FormInput>
            </div>

            <FormInput label="Alamat Lengkap">
              <input name="alamat" value={formData.alamat} onChange={handleChange}
                placeholder="Jl. Contoh No. 1, RT 01/RW 02"
                style={inputClass}
                onFocus={e => e.target.style.borderColor = T.borderFocus}
                onBlur={e => e.target.style.borderColor = T.border} />
            </FormInput>

            <FormInput label="Deskripsi">
              <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows={4}
                placeholder="Deskripsikan properti secara lengkap..."
                style={{ ...inputClass, resize: 'none' }}
                onFocus={e => e.target.style.borderColor = T.borderFocus}
                onBlur={e => e.target.style.borderColor = T.border} />
            </FormInput>
          </section>

          {/* ── Spesifikasi ── */}
          <section className="rounded-2xl p-6 space-y-4" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: T.violetLight }}>Spesifikasi</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'L. Bangunan (m²)', name: 'luas_bangunan' },
                { label: 'L. Tanah (m²)',    name: 'luas_tanah' },
                { label: 'Kamar Tidur',      name: 'kamar_tidur' },
                { label: 'Kamar Mandi',      name: 'kamar_mandi' },
                { label: 'Lantai',           name: 'lantai' },
                { label: 'Garasi',           name: 'garasi' },
              ].map(({ label, name }) => (
                <FormInput key={name} label={label}>
                  <input type="number" name={name} value={formData[name]} onChange={handleChange}
                    style={{ ...inputClass, textAlign: 'center' }}
                    onFocus={e => e.target.style.borderColor = T.borderFocus}
                    onBlur={e => e.target.style.borderColor = T.border} />
                </FormInput>
              ))}
            </div>
          </section>

          {/* ── Sertifikat & Status ── */}
          <section className="rounded-2xl p-6 space-y-5" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
            <h2 className="text-sm font-semibold" style={{ color: T.violetLight }}>Sertifikat & Status</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium mb-2.5" style={{ color: T.textMuted }}>Sertifikat</p>
                <div className="flex flex-wrap gap-2">
                  {SERTIFIKAT_OPTIONS.map(s => (
                    <button key={s} type="button" onClick={() => setFormData(prev => ({ ...prev, sertifikat: s }))}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                      style={{
                        background: formData.sertifikat === s ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${formData.sertifikat === s ? 'rgba(124,58,237,0.5)' : T.border}`,
                        color: formData.sertifikat === s ? T.violetPale : T.textMuted,
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium mb-2.5" style={{ color: T.textMuted }}>Status Properti</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s.value} type="button" onClick={() => setFormData(prev => ({ ...prev, status: s.value }))}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                      style={{
                        background: formData.status === s.value ? s.color : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${formData.status === s.value ? s.border : T.border}`,
                        color: formData.status === s.value ? s.text : T.textMuted,
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Fasilitas ── */}
          <section className="rounded-2xl p-6" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: T.violetLight }}>Fasilitas</h2>
            <div className="flex flex-wrap gap-2">
              {FASILITAS_OPTIONS.map(f => (
                <button key={f} type="button" onClick={() => toggleFasilitas(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    background: (formData.fasilitas ?? []).includes(f) ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${(formData.fasilitas ?? []).includes(f) ? 'rgba(124,58,237,0.5)' : T.border}`,
                    color: (formData.fasilitas ?? []).includes(f) ? T.violetPale : T.textMuted,
                  }}>
                  {f}
                </button>
              ))}
            </div>
            {formData.fasilitas?.length > 0 && (
              <p className="text-xs mt-3" style={{ color: 'rgba(167,139,250,0.6)' }}>
                {formData.fasilitas.length} fasilitas dipilih
              </p>
            )}
          </section>

          {/* ── Koordinat Peta ── */}
          <section className="rounded-2xl p-6 space-y-4" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
            <h2 className="text-sm font-semibold" style={{ color: T.violetLight }}>Koordinat Peta</h2>
            <p className="text-xs" style={{ color: T.textSubtle }}>
              Gunakan Google Maps untuk mendapatkan koordinat yang tepat.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Latitude">
                <input type="number" step="any" name="lat" value={formData.lat} onChange={handleChange}
                  style={inputClass}
                  onFocus={e => e.target.style.borderColor = T.borderFocus}
                  onBlur={e => e.target.style.borderColor = T.border} />
              </FormInput>
              <FormInput label="Longitude">
                <input type="number" step="any" name="lng" value={formData.lng} onChange={handleChange}
                  style={inputClass}
                  onFocus={e => e.target.style.borderColor = T.borderFocus}
                  onBlur={e => e.target.style.borderColor = T.border} />
              </FormInput>
            </div>
          </section>

          {/* ── Upload Foto ── */}
          <section className="rounded-2xl p-6" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: T.violetLight }}>Foto Properti</h2>

            <label
              className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl cursor-pointer transition-all duration-200"
              style={{ border: `2px dashed ${uploading ? 'rgba(124,58,237,0.5)' : T.border}`, background: 'rgba(255,255,255,0.02)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = uploading ? 'rgba(124,58,237,0.5)' : T.border}>
              <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
              {uploading ? (
                <>
                  <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'rgba(124,58,237,0.3)', borderTopColor: '#a78bfa' }} />
                  <p className="text-sm" style={{ color: T.violetLight }}>Mengunggah...</p>
                </>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className="text-sm" style={{ color: T.textMuted }}>Klik untuk upload foto</p>
                  <p className="text-xs" style={{ color: T.textSubtle }}>JPG, PNG, WEBP — Bisa lebih dari 1</p>
                </>
              )}
            </label>

            {formData.foto_urls.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {formData.foto_urls.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`Foto ${i + 1}`}
                      className="w-24 h-24 object-cover rounded-xl"
                      style={{ border: `1px solid ${T.border}` }} />
                    <button type="button" onClick={() => hapusFoto(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white transition-all opacity-0 group-hover:opacity-100"
                      style={{ background: '#ef4444' }}>
                      ✕
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[9px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: 'rgba(124,58,237,0.8)', color: '#fff' }}>
                        Utama
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Submit ── */}
          <button type="submit" disabled={loading || uploading}
            className="w-full py-4 rounded-2xl text-base font-semibold transition-all duration-200 disabled:opacity-50 active:scale-[0.99]"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: '#fff',
              boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
            }}>
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </span>
              : id ? 'Simpan Perubahan' : 'Tambah Properti'
            }
          </button>
        </form>
      </div>
    </div>
  );
}
