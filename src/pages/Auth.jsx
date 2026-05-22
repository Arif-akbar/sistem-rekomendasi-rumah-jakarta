import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/UseAuth'

const T = {
  bgPage: '#0c0a14', bgCard: '#16112a',
  border: 'rgba(255,255,255,0.07)', borderHover: 'rgba(124,58,237,0.3)',
  textPrimary: '#f1f0f5', textMuted: 'rgba(255,255,255,0.45)', textSubtle: 'rgba(255,255,255,0.25)',
  violet: '#7c3aed', violetLight: '#a78bfa', violetPale: '#c4b5fd',
}

function FeatureItem({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
        style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>{title}</p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: T.textMuted }}>{desc}</p>
      </div>
    </div>
  )
}

function AuthInput({ label, icon, type = 'text', value, onChange, placeholder, error }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium" style={{ color: T.textMuted }}>{label}</label>
      <div className="relative flex items-center rounded-xl transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : focused ? T.borderHover : T.border}`,
          boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.15)' : 'none',
        }}>
        <span className="pl-3.5 text-base flex-shrink-0 transition-colors duration-200"
          style={{ color: focused ? T.violetLight : T.textSubtle }}>{icon}</span>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full bg-transparent px-3 py-3 text-sm outline-none"
          style={{ color: T.textPrimary, caretColor: T.violetLight }} />
      </div>
      {error && <p className="text-xs flex items-center gap-1" style={{ color: '#f87171' }}>⚠ {error}</p>}
    </div>
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [form, setForm] = useState({ nama: '', email: '', password: '', confirmPassword: '' })

  useEffect(() => { if (user) navigate('/', { replace: true }) }, [user, navigate])

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
    if (mode === 'register' && form.password !== form.confirmPassword) e.confirmPassword = 'Password tidak cocok'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true); setGlobalError('')
    if (mode === 'login') {
      const { error } = await signIn({ email: form.email, password: form.password })
      if (error) setGlobalError(error.message.includes('Invalid') ? 'Email atau password salah.' : error.message)
      else navigate('/')
    } else {
      const { error } = await signUp({ email: form.email, password: form.password, nama: form.nama })
      if (error) setGlobalError(error.message.includes('already') ? 'Email sudah terdaftar.' : error.message)
      else setSuccess(true)
    }
    setLoading(false)
  }

  const switchMode = (m) => {
    setMode(m); setErrors({}); setGlobalError(''); setSuccess(false); setResetSent(false)
    setForm({ nama: '', email: '', password: '', confirmPassword: '' })
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!form.email.includes('@')) { setErrors({ email: 'Email tidak valid' }); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/login`,
    })
    setLoading(false)
    if (error) setGlobalError(error.message)
    else setResetSent(true)
  }

  return (
    <div className="min-h-screen flex" style={{ background: T.bgPage }}>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #130d2a 0%, #1a0f3a 50%, #0f0a20 100%)', borderRight: `1px solid ${T.border}` }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>R</div>
            <span className="text-2xl font-bold"
              style={{ background: 'linear-gradient(135deg, #f1f0f5 30%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              RumahJKT
            </span>
          </div>
          <p className="text-xs" style={{ color: T.textSubtle }}>Sistem Rekomendasi Properti Jakarta</p>
        </div>

        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="text-3xl font-bold leading-tight mb-3" style={{ color: T.textPrimary }}>
              Temukan rumah<br />
              <span style={{ background: 'linear-gradient(90deg, #a78bfa, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                impian kamu
              </span>
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: T.textMuted }}>
              Platform rekomendasi properti cerdas untuk Jakarta dan sekitarnya.
            </p>
          </div>
          <div className="space-y-6">
            <FeatureItem icon="✦" title="Rekomendasi Cerdas" desc="Algoritma AI menyesuaikan pilihan properti dengan preferensi dan anggaran kamu." />
            <FeatureItem icon="🏘" title="500+ Properti" desc="Database properti lengkap mencakup seluruh wilayah Jakarta dan sekitarnya." />
            <FeatureItem icon="🗺" title="Peta Interaktif" desc="Visualisasi lokasi properti secara real-time dengan filter area yang mudah." />
          </div>
        </div>

        <div className="relative z-10 flex gap-8">
          {[['500+', 'Properti'], ['5', 'Wilayah'], ['Gratis', 'Selamanya']].map(([val, lbl]) => (
            <div key={lbl}>
              <p className="text-xl font-bold"
                style={{ background: 'linear-gradient(90deg, #a78bfa, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {val}
              </p>
              <p className="text-xs" style={{ color: T.textSubtle }}>{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">

          <div className="lg:hidden flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>R</div>
            <span className="text-xl font-bold"
              style={{ background: 'linear-gradient(135deg, #f1f0f5 30%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              RumahJKT
            </span>
          </div>

          {mode !== 'forgot' && (
            <div>
              <h1 className="text-2xl font-bold" style={{ color: T.textPrimary }}>
                {mode === 'login' ? 'Selamat datang kembali' : 'Buat akun baru'}
              </h1>
              <p className="text-sm mt-1" style={{ color: T.textMuted }}>
                {mode === 'login' ? 'Masuk untuk melanjutkan pencarian properti kamu.' : 'Daftar gratis dan mulai eksplorasi properti.'}
              </p>
            </div>
          )}

          <div className="rounded-2xl p-8 space-y-6" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>

            {mode !== 'forgot' && (
              <div className="flex p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {['login', 'register'].map(m => (
                  <button key={m} onClick={() => switchMode(m)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={mode === m
                      ? { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', boxShadow: '0 2px 8px rgba(124,58,237,0.4)' }
                      : { color: T.textMuted }}>
                    {m === 'login' ? 'Masuk' : 'Daftar'}
                  </button>
                ))}
              </div>
            )}

            {success ? (
              <div className="text-center space-y-4 py-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>✓</div>
                <p className="font-semibold" style={{ color: T.textPrimary }}>Registrasi berhasil!</p>
                <p className="text-sm leading-relaxed" style={{ color: T.textMuted }}>Cek email kamu untuk verifikasi akun, lalu kembali dan login.</p>
                <button onClick={() => switchMode('login')} className="text-sm font-medium" style={{ color: T.violetLight }}>
                  Ke halaman login →
                </button>
              </div>

            ) : mode === 'forgot' ? (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: T.textPrimary }}>Reset Password</h2>
                  <p className="text-sm mt-1" style={{ color: T.textMuted }}>Masukkan email kamu dan kami akan kirimkan link reset.</p>
                </div>
                {resetSent ? (
                  <div className="text-center space-y-3 py-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl mx-auto"
                      style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>📧</div>
                    <p className="font-semibold" style={{ color: T.textPrimary }}>Email terkirim!</p>
                    <p className="text-sm" style={{ color: T.textMuted }}>Cek inbox dan ikuti instruksinya.</p>
                    <button onClick={() => switchMode('login')} className="text-sm font-medium" style={{ color: T.violetLight }}>← Kembali login</button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <AuthInput label="Alamat Email" icon="✉" type="email" placeholder="email@domain.com" value={form.email} onChange={set('email')} error={errors.email} />
                    {globalError && <p className="text-sm" style={{ color: '#f87171' }}>{globalError}</p>}
                    <button type="submit" disabled={loading}
                      className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
                      {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Mengirim...</span> : 'Kirim Link Reset'}
                    </button>
                    <button type="button" onClick={() => switchMode('login')} className="w-full text-sm" style={{ color: T.textSubtle }}>← Batal</button>
                  </form>
                )}
              </div>

            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {globalError && (
                  <div className="px-4 py-3 rounded-xl text-sm"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                    ⚠ {globalError}
                  </div>
                )}
                {mode === 'register' && <AuthInput label="Nama Lengkap" icon="👤" placeholder="Nama kamu" value={form.nama} onChange={set('nama')} error={errors.nama} />}
                <AuthInput label="Alamat Email" icon="✉" type="email" placeholder="email@domain.com" value={form.email} onChange={set('email')} error={errors.email} />
                <AuthInput label="Password" icon="🔒" type="password" placeholder="Minimal 8 karakter" value={form.password} onChange={set('password')} error={errors.password} />
                {mode === 'register' && <AuthInput label="Konfirmasi Password" icon="🔒" type="password" placeholder="Ulangi password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                  {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memproses...</span> : mode === 'login' ? 'Masuk' : 'Buat Akun'}
                </button>
                {mode === 'login' && (
                  <div className="text-center">
                    <button type="button" onClick={() => switchMode('forgot')} className="text-sm transition-colors" style={{ color: T.textSubtle }}
                      onMouseEnter={e => e.target.style.color = T.violetLight} onMouseLeave={e => e.target.style.color = T.textSubtle}>
                      Lupa password?
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>

          <p className="text-center text-xs" style={{ color: T.textSubtle }}>
            Data dilindungi oleh Supabase RLS · Jakarta, Indonesia
          </p>
        </div>
      </div>
    </div>
  )
}
