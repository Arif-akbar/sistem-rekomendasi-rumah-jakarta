import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../lib/supabase'
import { useAuth } from '../hooks/UseAuth'

// ── Animated grid background ────────────────────────────────
function GridBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Deep base */}
      <div className="absolute inset-0 bg-[#030712]" />

      {/* Perspective grid floor */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,200,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,200,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%, black 70%, transparent 100%)',
        }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #00ffcc, #00ffcc 1px, transparent 1px, transparent 4px)',
        }}
      />

      {/* Ambient glow spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #00d4aa 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-8"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full animate-pulse"
          style={{
            background: i % 3 === 0 ? '#00d4aa' : i % 3 === 1 ? '#3b82f6' : '#a78bfa',
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
    'bl': 'bottom-0 left-0 border-b-2 border-l-2',
    'br': 'bottom-0 right-0 border-b-2 border-r-2',
  }[position]
  return (
    <div className={`absolute w-5 h-5 ${cls} border-emerald-400/60`} />
  )
}

// ── Input field ─────────────────────────────────────────────
function CyberInput({ label, icon, type = 'text', value, onChange, placeholder, error }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-mono text-emerald-400/70 tracking-widest uppercase">
        {label}
      </label>
      <div
        className={`relative flex items-center transition-all duration-300 ${
          focused ? 'ring-1 ring-emerald-400/50' : 'ring-1 ring-white/8'
        } ${error ? 'ring-1 ring-red-500/60' : ''} rounded bg-white/4`}
      >
        <span className={`pl-3 text-base transition-colors ${focused ? 'text-emerald-400' : 'text-white/30'}`}>
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-white/20
            outline-none font-mono tracking-wide caret-emerald-400"
        />
        {/* Active indicator bar */}
        <div
          className={`absolute bottom-0 left-0 h-[1px] bg-emerald-400 transition-all duration-300 ${
            focused ? 'w-full opacity-100' : 'w-0 opacity-0'
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
    <div className="min-h-screen flex items-center justify-center relative px-4 overflow-hidden"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      <GridBackground />

      {/* Centered card */}
      <div className="relative z-10 w-full max-w-md">

        {/* Top brand */}
        <div className="text-center mb-8 space-y-3 animate-[fadeIn_0.6s_ease]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/5 text-emerald-400 text-xs tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SISTEM AKTIF
          </div>
          <h1 className="text-4xl font-bold tracking-tight"
            style={{
              fontFamily: "'Syne', 'Orbitron', sans-serif",
              background: 'linear-gradient(135deg, #ffffff 30%, #00d4aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            RumahJKT
          </h1>
          <p className="text-white/30 text-xs tracking-widest">
            SISTEM REKOMENDASI PROPERTI JAKARTA
          </p>
        </div>

        {/* Card */}
        <div
          className="relative rounded-lg border border-white/8 p-8"
          style={{
            background: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <CornerAccent position="tl" />
          <CornerAccent position="tr" />
          <CornerAccent position="bl" />
          <CornerAccent position="br" />

          {/* Mode tabs */}
          <div className="flex mb-8 border-b border-white/8">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 pb-3 text-xs tracking-widest uppercase transition-all duration-200 relative ${
                  mode === m ? 'text-emerald-400' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {m === 'login' ? 'Masuk' : 'Daftar'}
                {mode === m && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Success state */}
          {success ? (
            <div className="text-center space-y-4 py-8 animate-[fadeIn_0.4s_ease]">
              <div className="text-5xl">✓</div>
              <p className="text-emerald-400 font-mono text-sm tracking-wide">Registrasi berhasil!</p>
              <p className="text-white/40 text-xs leading-relaxed">
                Cek email kamu untuk verifikasi akun,<br />lalu kembali dan login.
              </p>
              <button
                onClick={() => switchMode('login')}
                className="mt-4 text-xs text-emerald-400/70 hover:text-emerald-400 underline underline-offset-4 tracking-widest transition-colors"
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
                className="w-full mt-2 py-3.5 rounded relative overflow-hidden
                  border border-emerald-400/40 text-emerald-400 text-xs tracking-widest uppercase
                  transition-all duration-300 hover:bg-emerald-400/10 hover:border-emerald-400/70
                  disabled:opacity-40 disabled:cursor-not-allowed
                  active:scale-[0.98] group"
              >
                {/* Shimmer on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700
                  bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
                <span className="relative">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </span>
                  ) : (
                    mode === 'login' ? '→ Masuk ke Sistem' : '→ Buat Akun'
                  )}
                </span>
              </button>

              {/* Forgot password */}
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-center w-full text-xs text-white/20 hover:text-emerald-400 transition-colors tracking-wide mt-1"
                >
                  Lupa password?
                </button>
              )}
              {/* Forgot password form */}
              {mode === 'forgot' && (
                <div className="space-y-4">
                  <div className="h-px bg-white/8" />
                  {resetSent ? (
                    <div className="text-center space-y-2 py-4">
                      <p className="text-emerald-400 text-sm">✓ Email reset terkirim!</p>
                      <p className="text-white/30 text-xs">Cek inbox email kamu dan ikuti instruksinya.</p>
                      <button type="button" onClick={() => switchMode('login')} className="text-xs text-white/40 hover:text-white/70">← Kembali login</button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-3">
                      <CyberInput label="Email" icon="@" type="email" placeholder="email@domain.com" value={form.email} onChange={set('email')} error={errors.email} />
                      {globalError && <p className="text-xs text-red-400">{globalError}</p>}
                      <button type="submit" disabled={loading}
                        className="w-full py-3 rounded border border-emerald-400/40 text-emerald-400 text-xs hover:bg-emerald-400/10 transition-all disabled:opacity-40">
                        {loading ? 'Mengirim...' : '→ Kirim Link Reset'}
                      </button>
                      <button type="button" onClick={() => switchMode('login')} className="w-full text-xs text-white/20 hover:text-white/50">← Batal</button>
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
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Syne:wght@700&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}