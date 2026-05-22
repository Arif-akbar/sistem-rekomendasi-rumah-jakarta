import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase'; // Pastikan huruf kecil
import { useNavigate } from 'react-router-dom';
import { formatHarga } from '../hooks/UseProperties'; // Pastikan huruf besar
import Navbar from '../components/Navbar';

export default function AdminDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Fungsi dibungkus dengan useCallback agar aman dari infinite loop
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error) setProperties(data || []);
    setLoading(false);
  }, []);

  // 2. useEffect memanggil fungsi yang sudah aman
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleDelete = async (id) => {
    const isConfirm = window.confirm('Apakah Anda yakin ingin menghapus properti ini?');
    if (isConfirm) {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (!error) {
        alert('Data berhasil dihapus!');
        fetchProperties(); // Refresh tabel
      } else {
        alert('Gagal menghapus data: ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 pt-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400" style={{ fontFamily: "'Syne', sans-serif" }}>
              CONTROL_PANEL
            </h1>
            <p className="text-white/40 text-xs font-mono mt-1">Manajemen Data Properti</p>
          </div>
          <button 
            onClick={() => navigate('/admin/tambah')}
            className="bg-emerald-500 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 hover:-translate-y-0.5 transition-all font-mono"
          >
            + INPUT DATA BARU
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm">
          {loading ? (
            <div className="p-10 text-center font-mono text-emerald-400 animate-pulse">Loading data...</div>
          ) : (
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-white/5 text-white/40 uppercase tracking-tighter">
                  <th className="p-4 border-b border-white/10">Properti</th>
                  <th className="p-4 border-b border-white/10">Kategori</th>
                  <th className="p-4 border-b border-white/10">Harga</th>
                  <th className="p-4 border-b border-white/10 text-center">Status</th>
                  <th className="p-4 border-b border-white/10 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 border-b border-white/5 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.foto_urls?.[0] || 'https://via.placeholder.com/40'} className="w-12 h-12 rounded object-cover border border-white/10" alt={p.nama} />
                      <div>
                        <div className="font-bold text-white/80 line-clamp-1">{p.nama}</div>
                        <div className="text-[10px] text-white/30">{p.kecamatan}</div>
                      </div>
                    </td>
                    <td className="p-4 text-white/50 uppercase">{p.tipe}</td>
                    <td className="p-4 text-emerald-400 font-bold">{formatHarga(p.harga)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] ${p.status === 'aktif' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => navigate(`/admin/edit/${p.id}`)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded transition-colors" title="Edit">✎</button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded transition-colors" title="Hapus">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}