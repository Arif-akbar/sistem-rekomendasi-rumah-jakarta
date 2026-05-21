import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/UseAuth'
import { useFilterStore } from '../store/FilterStore'
import { signOut } from '../lib/supabase'
import { SORT_OPTIONS } from '../hooks/UseProperties'

export default function Navbar() {
  const navigate = useNavigate()
  const { profile, isAdmin } = useAuth()
  const { filters, setFilter, sortKey, setSortKey, viewMode, setViewMode, compareList } = useFilterStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const menuRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false); setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const currentSort = SORT_OPTIONS.find(o => o.value === sortKey)

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/8 px-6 py-3 flex items-center gap-4"
      style={{ background: 'rgba(3,7,18,0.92)', backdropFilter: 'blur(20px)' }}
    >
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 flex-shrink-0 group"
      >
        <div className="w-7 h-7 rounded border border-emerald-400/40 flex items-center justify-center
          bg-emerald-400/5 group-hover:bg-emerald-400/10 transition-colors">
          <span className="text-emerald-400 text-xs font-bold">R</span>
        </div>
        <span className="text-white font-bold text-sm tracking-tight hidden sm:block"
          style={{ fontFamily: "'Syne', sans-serif" }}>
          RumahJKT
        </span>
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-xs font-mono">⌕</span>
        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => setFilter('keyword', e.target.value)}
          placeholder="Cari nama properti..."
          className="w-full bg-white/4 border border-white/8 rounded px-8 py-2 text-xs text-white
            placeholder-white/20 font-mono outline-none focus:border-emerald-400/40 focus:bg-white/6
            transition-all caret-emerald-400"
        />
        {filters.keyword && (
          <button
            onClick={() => setFilter('keyword', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 text-xs"
          >✕</button>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto" ref={menuRef}>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => { setSortOpen(!sortOpen); setMenuOpen(false) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded border border-white/8 text-xs
              text-white/50 font-mono hover:border-white/20 hover:text-white/70 transition-all"
          >
            <span className="text-white/25">↕</span>
            <span className="hidden sm:inline">{currentSort?.label}</span>
            <span className="text-white/20 text-[10px]">▾</span>
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded border border-white/10 overflow-hidden z-50"
              style={{ background: 'rgba(6,12,26,0.97)', backdropFilter: 'blur(20px)' }}>
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => { setSortKey(o.value); setSortOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-mono transition-colors ${
                    sortKey === o.value
                      ? 'text-emerald-400 bg-emerald-400/8'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/4'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex border border-white/8 rounded overflow-hidden">
          {[
            { mode: 'grid', icon: '▦' },
            { mode: 'list', icon: '☰' },
            { mode: 'map',  icon: '⊕' },
          ].map(({ mode, icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={mode}
              className={`px-2.5 py-2 text-xs transition-all ${
                viewMode === mode
                  ? 'bg-emerald-400/15 text-emerald-400'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/4'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Compare indicator */}
        {compareList.length > 0 && (
          <button
            onClick={() => navigate('/compare')}
            className="flex items-center gap-1.5 px-3 py-2 rounded border border-cyan-400/30
              bg-cyan-400/8 text-cyan-400 text-xs font-mono hover:bg-cyan-400/15 transition-all animate-pulse"
          >
            <span>⬡</span>
            <span>{compareList.length}/3</span>
            <span className="hidden sm:inline">Bandingkan</span>
          </button>
        )}

        {/* Admin link */}
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="px-3 py-2 rounded border border-amber-400/30 bg-amber-400/8
              text-amber-400 text-xs font-mono hover:bg-amber-400/15 transition-all"
          >
            Admin
          </button>
        )}

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setMenuOpen(!menuOpen); setSortOpen(false) }}
            className="flex items-center gap-2 px-3 py-2 rounded border border-white/8
              hover:border-white/20 transition-all group"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-400/20 border border-emerald-400/30
              flex items-center justify-center text-[10px] text-emerald-400 font-mono">
              {profile?.nama?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="text-xs text-white/50 font-mono hidden sm:inline max-w-20 truncate">
              {profile?.nama ?? 'User'}
            </span>
            <span className="text-white/20 text-[10px]">▾</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded border border-white/10 overflow-hidden z-50"
              style={{ background: 'rgba(6,12,26,0.97)', backdropFilter: 'blur(20px)' }}>
              <div className="px-4 py-3 border-b border-white/6">
                <p className="text-xs text-white/70 font-mono truncate">{profile?.nama}</p>
                <p className="text-[10px] text-white/30 font-mono truncate">{profile?.email}</p>
              </div>
              <button
                onClick={() => { navigate('/wishlist'); setMenuOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-xs font-mono text-white/40
                  hover:text-white/70 hover:bg-white/4 transition-colors flex items-center gap-2"
              >
                <span>♡</span> Wishlist Saya
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 text-xs font-mono text-red-400/60
                  hover:text-red-400 hover:bg-red-400/5 transition-colors flex items-center gap-2"
              >
                <span>→</span> Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}