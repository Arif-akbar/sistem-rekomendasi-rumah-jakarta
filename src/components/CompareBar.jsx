import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '../store/FilterStore';
import { useProperties, formatHarga } from '../hooks/UseProperties'; 
export default function CompareBar() {
  const navigate = useNavigate();
  const { compareList, toggleCompare, clearCompare } = useFilterStore();
  const { properties } = useProperties({}, 'created_at:desc');
  
  if (compareList.length === 0) return null;

  const comparedProps = properties.filter(p => compareList.includes(p.id));

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4">
      <div className="bg-slate-900/90 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 shadow-2xl flex items-center gap-4">
        <div className="flex-1 flex gap-2 overflow-x-auto">
          {comparedProps.map(item => (
            <div key={item.id} className="relative flex-shrink-0 group">
              <img src={item.foto_urls?.[0]} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
              <button 
                onClick={(e) => { e.stopPropagation(); toggleCompare(item.id); }}
                className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-[10px] flex items-center justify-center text-white"
              >✕</button>
            </div>
          ))}
          {[...Array(3 - comparedProps.length)].map((_, i) => (
            <div key={i} className="w-12 h-12 rounded-lg border border-dashed border-white/10 flex items-center justify-center text-white/10 text-xs">+</div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <button 
            disabled={compareList.length < 2}
            onClick={() => navigate('/compare')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              compareList.length >= 2 ? 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'bg-white/5 text-white/20'
            }`}
          >
            Bandingkan
          </button>
          <button onClick={clearCompare} className="text-[10px] text-white/30 hover:text-white/60">Batalkan</button>
        </div>
      </div>
    </div>
  );
}