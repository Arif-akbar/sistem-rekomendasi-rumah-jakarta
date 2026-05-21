import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '../store/FilterStore';
import { supabase } from '../lib/supabase';

export default function CompareBar() {
  const navigate = useNavigate();
  const { compareList, toggleCompare, clearCompare } = useFilterStore();
  const [items, setItems] = useState([]);

  // Fetch hanya properti yang ada di compareList (bukan semua properti)
  useEffect(() => {
    if (compareList.length === 0) {
      setItems([]);
      return;
    }
    supabase
      .from('properties')
      .select('id, nama, foto_urls')
      .in('id', compareList)
      .then(({ data }) => setItems(data ?? []));
  }, [compareList]);

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-4 shadow-[0_0_30px_rgba(139,92,246,0.15)] flex items-center gap-4">
        <div className="flex-1 flex gap-2 overflow-x-auto">
          {/* Tampilkan item yang sudah di-fetch */}
          {compareList.map((id) => {
            const item = items.find((p) => p.id === id);
            return (
              <div key={id} className="relative flex-shrink-0 group">
                {item?.foto_urls?.[0] ? (
                  <img
                    src={item.foto_urls[0]}
                    alt={item.nama}
                    className="w-12 h-12 rounded-xl object-cover border border-white/10 group-hover:border-violet-400 transition-colors"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-lg opacity-40">
                    🏠
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleCompare(id); }}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-400 transition-colors rounded-full w-5 h-5 text-[10px] flex items-center justify-center text-white shadow-lg"
                >
                  ✕
                </button>
              </div>
            );
          })}
          {/* Slot kosong */}
          {[...Array(3 - compareList.length)].map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-slate-500 text-xs"
            >
              +
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            disabled={compareList.length < 2}
            onClick={() => navigate('/compare')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              compareList.length >= 2
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]'
                : 'bg-white/5 text-slate-500'
            }`}
          >
            Bandingkan
          </button>
          <button onClick={clearCompare} className="text-[11px] text-slate-400 hover:text-white transition-colors">
            Batalkan
          </button>
        </div>
      </div>
    </div>
  );
}