import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../lib/supabase'
import { useAuth } from '../hooks/UseAuth'

// ── Animated grid background ────────────────────────────────
function GridBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Perspective grid floor */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%, black 70%, transparent 100%)',
        }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #8b5cf6, #8b5cf6 1px, transparent 1px, transparent 4px)',
        }}
      />

      {/* Ambient glow spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)' }} />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          style={{
            background: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#06b6d4' : '#d946ef',
            left: `${8 + i * 8}%`,
            top: `${15 + (i % 5) * 18}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${2 + (i % 3)}s`,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  )
}

// ── Corner accents ──────────────────────────────────────────
function CornerAccent({ position }) {
  const cls = {
    'tl': 'top-0 left-0 border-t-2 border-l-2',
    'tr': 'top-0 right-0 border-t-2 border-r-2',
    'bl': 'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl',
    'br': 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl',
  }[position]
  return (
    <div className={`absolute w-6 h-6 ${cls} border-violet-500/50 transition-all duration-300 group-hover:border-cyan-400/50`} />
  )
}

// ── Input field ─────────────────────────────────────────────
function CyberInput({ label, icon, type = 'text', value, onChange, placeholder, error }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase ml-1">
        {label}
      </label>
      <div
        className={`relative flex items-center transition-all duration-300 rounded-xl bg-white/5 border ${
          focused ? 'border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]' : 'border-white/10'
        } ${error ? 'border-red-500/60' : ''}`}
      >
        <span className={`pl-4 text-sm transition-colors ${focused ? 'text-violet-400' : 'text-slate-500'}`}>
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent px-3 py-3.5 text-sm text-white placeholder-slate-600
            outline-none tracking-wide caret-violet-400"
        />
        {/* Active indicator bar */}
        <div
          className={`absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500 rounded-t-full ${
            focused ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 font-mono flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

// ── Main Auth Page ───────────────────────────────────────────
export default function AuthPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mode, setMode]         = useState('login')    // 'login' | 'register' | 'forgot'
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [errors, setErrors]     = useState({})
  const [globalError, setGlobalError] = useState('')
  const [resetSent, setResetSent]     = useState(false)
  const [form, setForm] = useState({
    nama: '', email: '', password: '', confirmPassword: '',
  })

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: '' }))
    setGlobalError('')
  }

  const validate = () => {
    const e = {}
    if (mode === 'register' && !form.nama.trim()) e.nama = 'Nama tidak boleh kosong'
    if (!form.email.includes('@')) e.email = 'Email tidak valid'
    if (form.password.length < 8) e.password = 'Password minimal 8 karakter'
    if (mode === 'register' && form.password !== form.confirmPassword)
      e.confirmPassword = 'Password tidak cocok'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setGlobalError('')

    if (mode === 'login') {
      const { error } = await signIn({ email: form.email, password: form.password })
      if (error) {
        setGlobalError(
          error.message.includes('Invalid') ? 'Email atau password salah.' : error.message
        )
      } else {
        navigate('/')
      }
    } else {
      const { error } = await signUp({ email: form.email, password: form.password, nama: form.nama })
      if (error) {
        setGlobalError(error.message.includes('already') ? 'Email sudah terdaftar.' : error.message)
      } else {
        setSuccess(true)
      }
    }
    setLoading(false)
  }

  const switchMode = (m) => {
    setMode(m)
    setErrors({})
    setGlobalError('')
    setSuccess(false)
    setResetSent(false)
    setForm({ nama: '', email: '', password: '', confirmPassword: '' })
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!form.email.includes('@')) { setErrors({ email: 'Email tidak valid' }); return; }
    setLoading(true)
    const { supabase: sb } = await import('../lib/supabase')
    const { error } = await sb.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/login`,
    })
    setLoading(false)
    if (error) setGlobalError(error.message)
    else setResetSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 overflow-hidden">
      <GridBackground />

      {/* Centered card */}
      <div className="relative z-10 w-full max-w-md">

        {/* Top brand */}
        <div className="text-center mb-8 space-y-3 animate-[fadeIn_0.6s_ease]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs tracking-widest font-medium shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            SISTEM AKTIF
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-gradient">
            RumahJKT
          </h1>
          <p className="text-slate-400 text-xs tracking-widest font-medium uppercase mt-2">
            Sistem Rekomendasi Properti
          </p>
        </div>

        {/* Card */}
        <div className="relative rounded-3xl border border-white/5 p-8 bg-white/[0.02] backdrop-blur-2xl shadow-2xl group">
          <CornerAccent position="tl" />
          <CornerAccent position="tr" />
          <CornerAccent position="bl" />
          <CornerAccent position="br" />

          {/* Mode tabs */}
          <div className="flex mb-8 border-b border-white/10">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 pb-3 text-xs tracking-widest font-semibold uppercase transition-all duration-300 relative ${
                  mode === m ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {m === 'login' ? 'Masuk' : 'Daftar'}
                {mode === m && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-violet-500 to-cyan-500 rounded-t-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                )}
              </button>
            ))}
          </div>

          {/* Success state */}
          {success ? (
            <div className="text-center space-y-4 py-8 animate-[fadeIn_0.4s_ease]">
              <div className="w-16 h-16 mx-auto rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-3xl shadow-[0_0_20px_rgba(139,92,246,0.2)]">✓</div>
              <p className="text-white font-display text-lg font-semibold tracking-wide">Registrasi berhasil!</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Cek email Anda untuk verifikasi akun,<br />lalu kembali dan login.
              </p>
              <button
                onClick={() => switchMode('login')}
                className="mt-6 text-sm text-violet-400 hover:text-violet-300 font-medium tracking-wide transition-colors"
              >
                Ke halaman login →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Global error */}
              {globalError && (
                <div className="px-4 py-3 rounded border border-red-500/30 bg-red-500/8 text-red-400 text-xs font-mono">
                  ⚠ {globalError}
                </div>
              )}

              {/* Fields */}
              {mode === 'register' && (
                <CyberInput
                  label="Nama Lengkap"
                  icon="◈"
                  placeholder="nama kamu..."
                  value={form.nama}
                  onChange={set('nama')}
                  error={errors.nama}
                />
              )}

              <CyberInput
                label="Alamat Email"
                icon="@"
                type="email"
                placeholder="email@domain.com"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
              />

              <CyberInput
                label="Password"
                icon="◉"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                error={errors.password}
              />

              {mode === 'register' && (
                <CyberInput
                  label="Konfirmasi Password"
                  icon="◉"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  error={errors.confirmPassword}
                />
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded-xl relative overflow-hidden font-semibold
                  border border-violet-500/50 bg-violet-500/10 text-white text-sm tracking-wider
                  transition-all duration-300 hover:bg-violet-500/20 hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  active:scale-[0.98] group"
              >
                {/* Shimmer on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000
                  bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="inline-block w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </span>
                  ) : (
                    mode === 'login' ? 'Masuk ke Sistem' : 'Buat Akun'
                  )}
                </span>
              </button>

              {/* Forgot password */}
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-center w-full text-sm text-slate-500 hover:text-violet-400 transition-colors mt-3"
                >
                  Lupa password?
                </button>
              )}
              {/* Forgot password form */}
              {mode === 'forgot' && (
                <div className="space-y-5">
                  <div className="h-px bg-white/10" />
                  {resetSent ? (
                    <div className="text-center space-y-3 py-4">
                      <div className="w-12 h-12 mx-auto rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xl shadow-[0_0_15px_rgba(139,92,246,0.2)]">✓</div>
                      <p className="text-white font-medium">Email reset terkirim!</p>
                      <p className="text-slate-400 text-sm">Cek inbox email Anda dan ikuti instruksinya.</p>
                      <button type="button" onClick={() => switchMode('login')} className="mt-4 text-sm text-slate-400 hover:text-white transition-colors">← Kembali login</button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <CyberInput label="Email" icon="@" type="email" placeholder="email@domain.com" value={form.email} onChange={set('email')} error={errors.email} />
                      {globalError && <p className="text-xs text-red-400">{globalError}</p>}
                      <button type="submit" disabled={loading}
                        className="w-full py-3.5 rounded-xl border border-violet-500/50 text-white font-medium bg-violet-500/10 hover:bg-violet-500/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all disabled:opacity-50">
                        {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                      </button>
                      <button type="button" onClick={() => switchMode('login')} className="w-full text-sm text-slate-500 hover:text-white transition-colors">← Batal</button>
                    </form>
                  )}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-white/20 text-xs mt-6 tracking-wide">
          Data dilindungi oleh Supabase RLS · Jakarta, Indonesia
        </p>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}