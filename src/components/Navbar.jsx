import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/UseAuth'
import { useFilterStore } from '../store/FilterStore'
import { signOut } from '../lib/supabase'
import { SORT_OPTIONS } from '../hooks/UseProperties'

export default function Navbar() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { profile, isAdmin } = useAuth()
  const { filters, setFilter, sortKey, setSortKey, viewMode, setViewMode, compareList } = useFilterStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const menuRef = useRef(null)

  const isHome = location.pathname === '/'

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
        setSortOpen(false)
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
  const initials = profile?.nama
    ? profile.nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <header className="sticky top-0 z-50 h-16 glass-panel">
      <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center gap-3">

        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 flex-shrink-0 group mr-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-white transition-all duration-300 group-hover:scale-105 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span className="font-display font-bold text-lg text-white hidden sm:block tracking-tight">
            Rumah<span className="text-gradient">JKT</span>
          </span>
        </button>

        {/* Search (home only) */}
        {isHome && (
          <div className="flex-1 max-w-sm relative group">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => setFilter('keyword', e.target.value)}
              placeholder="Tanyakan properti impianmu..."
              className="w-full rounded-full pl-10 pr-8 py-2 text-sm text-slate-100 outline-none transition-all duration-300 bg-white/5 border border-white/10 focus:bg-white/10 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
            />
            {filters.keyword && (
              <button onClick={() => setFilter('keyword', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-2 ml-auto" ref={menuRef}>

          {/* View mode (home only) */}
          {isHome && (
            <div className="hidden sm:flex items-center rounded-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { mode: 'grid', label: 'Grid',
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                },
                { mode: 'list', label: 'List',
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/></svg>
                },
                { mode: 'map', label: 'Peta',
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                },
              ].map(({ mode, label, icon }) => (
                <button key={mode} onClick={() => setViewMode(mode)} title={label}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-200"
                  style={{ color: viewMode === mode ? '#a78bfa' : 'rgba(255,255,255,0.35)', background: viewMode === mode ? 'rgba(124,58,237,0.15)' : 'transparent' }}>
                  {icon}
                  <span className="hidden md:inline">{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Sort (home only) */}
          {isHome && (
            <div className="relative hidden sm:block">
              <button onClick={() => { setSortOpen(!sortOpen); setMenuOpen(false) }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-white/50 transition-all duration-200 hover:text-white/80"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M7 12h10M11 18h2"/>
                </svg>
                <span className="text-xs">{currentSort?.label}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`}>
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50 py-1"
                  style={{ background: '#1a1530', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                  {SORT_OPTIONS.map((o) => (
                    <button key={o.value} onClick={() => { setSortKey(o.value); setSortOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2"
                      style={{ color: sortKey === o.value ? '#a78bfa' : 'rgba(255,255,255,0.5)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {sortKey === o.value && <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6 9 17l-5-5"/></svg>}
                      <span className={sortKey === o.value ? '' : 'ml-4'}>{o.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Compare badge */}
          {compareList.length > 0 && (
            <button onClick={() => navigate('/compare')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
              <span>{compareList.length}/3</span>
              <span className="hidden sm:inline">Bandingkan</span>
            </button>
          )}

          {/* Admin badge */}
          {isAdmin && (
            <button onClick={() => navigate('/admin')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Admin
            </button>
          )}

          {/* User menu */}
          <div className="relative">
            <button onClick={() => { setMenuOpen(!menuOpen); setSortOpen(false) }}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl transition-all duration-200 hover:bg-white/5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                {initials}
              </div>
              <span className="text-sm text-white/60 hidden sm:block max-w-[100px] truncate">
                {profile?.nama?.split(' ')[0] ?? 'Akun'}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className={`text-white/30 transition-transform ${menuOpen ? 'rotate-180' : ''}`}>
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50"
                style={{ background: '#1a1530', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 48px rgba(0,0,0,0.6)' }}>
                <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{profile?.nama ?? 'User'}</p>
                      <p className="text-xs text-white/40 truncate">{profile?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="py-1.5">
                  <button onClick={() => { navigate('/wishlist'); setMenuOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white/60 flex items-center gap-3 transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    Wishlist Saya
                  </button>
                  {isAdmin && (
                    <button onClick={() => { navigate('/admin'); setMenuOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-white/60 flex items-center gap-3 transition-colors"
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                      Dashboard Admin
                    </button>
                  )}
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="py-1.5">
                  <button onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors"
                    style={{ color: '#f87171' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                    </svg>
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
