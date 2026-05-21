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
      <div className="bg-slate-900/90 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 shadow-2xl flex items-center gap-4">
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
                    className="w-12 h-12 rounded-lg object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-lg opacity-40">
                    🏠
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleCompare(id); }}
                  className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-[10px] flex items-center justify-center text-white"
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
              className="w-12 h-12 rounded-lg border border-dashed border-white/10 flex items-center justify-center text-white/10 text-xs"
            >
              +
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <button
            disabled={compareList.length < 2}
            onClick={() => navigate('/compare')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              compareList.length >= 2
                ? 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                : 'bg-white/5 text-white/20'
            }`}
          >
            Bandingkan
          </button>
          <button onClick={clearCompare} className="text-[10px] text-white/30 hover:text-white/60">
            Batalkan
          </button>
        </div>
      </div>
    </div>
  );
}