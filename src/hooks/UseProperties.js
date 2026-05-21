import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const WILAYAH_OPTIONS = ['Jakarta Selatan', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Pusat']
export const TIPE_OPTIONS = ['rumah', 'apartemen', 'ruko', 'tanah', 'villa']
export const SORT_OPTIONS = [
  { label: 'Terbaru',         value: 'created_at:desc' },
  { label: 'Harga Terendah', value: 'harga:asc'        },
  { label: 'Harga Tertinggi',value: 'harga:desc'       },
]

export const formatHarga = (value) => {
    if (!value) return '—'
    if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)} M`
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)} Jt`
    return `Rp ${value.toLocaleString('id-ID')}`
}

export const DEFAULT_FILTERS = {
    harga_min: 0,
    harga_max: 20_000_000_000,
    wilayah: '',
    tipe: '',
    kamar_tidur: 0,
    kamar_mandi: 0,
    sertifikat: '',
    fasilitas: [],
    keyword: '',
}

export function useProperties(filters, sortKey = 'created_at:desc') {
    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [total, setTotal] = useState(0)

    const filtersKey = JSON.stringify(filters ?? DEFAULT_FILTERS)

    useEffect(() => {
        let cancelled = false
        async function run() {
            setLoading(true)
            try {
                const f = JSON.parse(filtersKey)
                let q = supabase.from('properties').select('*', { count: 'exact' }).eq('status', 'aktif')

                if (f.harga_min > 0) q = q.gte('harga', f.harga_min)
                if (f.harga_max < 20_000_000_000) q = q.lte('harga', f.harga_max)
                if (f.wilayah) q = q.eq('kota_wilayah', f.wilayah)
                if (f.tipe) q = q.eq('tipe', f.tipe)
                if (f.kamar_tidur > 0) q = q.gte('kamar_tidur', f.kamar_tidur)
                if (f.kamar_mandi > 0) q = q.gte('kamar_mandi', f.kamar_mandi)
                if (f.keyword) q = q.ilike('nama', `%${f.keyword}%`)

                const [col, dir] = sortKey.split(':')
                q = q.order(col, { ascending: dir === 'asc' })

                const { data, error: err, count } = await q
                if (cancelled) return
                if (err) throw err
                setProperties(data ?? [])
                setTotal(count ?? 0)
            } catch (err) {
                if (!cancelled) setError(err.message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        run()
        return () => { cancelled = true }
    }, [filtersKey, sortKey])

    return { properties, loading, error, total }
}