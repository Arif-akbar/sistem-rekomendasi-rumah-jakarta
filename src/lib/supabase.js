import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Test koneksi saat startup (hanya di development)
if (import.meta.env.DEV) {
  supabase.from('properties').select('id', { count: 'exact', head: true })
    .then(({ count, error }) => {
      if (error) console.error('❌ Supabase connection error:', error.message)
      else console.log(`✅ Supabase connected — ${count} properties found`)
    })
}

// Auth helpers
export const signUp = async ({ email, password, nama }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nama },
    },
  })
  return { data, error }
}

export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Properties helpers
export const getProperties = async (filters = {}) => {
  let query = supabase
    .from('properties')
    .select('*')
    .eq('status', 'aktif')

  if (filters.harga_min) query = query.gte('harga', filters.harga_min)
  if (filters.harga_max) query = query.lte('harga', filters.harga_max)
  if (filters.wilayah) query = query.eq('kota_wilayah', filters.wilayah)
  if (filters.tipe) query = query.eq('tipe', filters.tipe)
  if (filters.kamar_tidur) query = query.gte('kamar_tidur', filters.kamar_tidur)
  if (filters.kamar_mandi) query = query.gte('kamar_mandi', filters.kamar_mandi)
  if (filters.sertifikat) query = query.eq('sertifikat', filters.sertifikat)

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  return { data, error }
}

export const getPropertyById = async (id) => {
  const { data, error } = await supabase
    .from('properties')
    .select('*, ratings(nilai, komentar, user_id, created_at)')
    .eq('id', id)
    .single()
  return { data, error }
}

// Wishlist helpers
export const getWishlist = async (userId) => {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*, properties(*)')
    .eq('user_id', userId)
  return { data, error }
}

export const toggleWishlist = async (userId, propertyId) => {
  const { data: existing } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .single()

  if (existing) {
    const { error } = await supabase.from('wishlist').delete().eq('id', existing.id)
    return { added: false, error }
  } else {
    const { error } = await supabase.from('wishlist').insert({ user_id: userId, property_id: propertyId })
    return { added: true, error }
  }
}

/// Upload foto ke Supabase Storage
export const uploadPropertyPhoto = async (file, propertyId) => {
  try {
    const ext = file.name.split('.').pop()

    const fileName = `${propertyId}/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('property-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    console.log(data)

    if (error) {
      return { url: null, error }
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from('property-photos')
      .getPublicUrl(fileName)

    return {
      url: publicUrl,
      error: null,
    }

  } catch (err) {
    return {
      url: null,
      error: err,
    }
  }
}