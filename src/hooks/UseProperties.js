import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const WILAYAH_OPTIONS = ['Jakarta Selatan', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Pusat']
export const TIPE_OPTIONS = ['rumah', 'apartemen', 'ruko', 'tanah', 'villa']
export const SORT_OPTIONS = [
  { label: 'Terbaru',         value: 'created_at:desc' },
  { label: 'Harga Terendah', value: 'harga:asc'        },
  { label: 'Harga Tertinggi',value: 'harga:desc'       },
]

export const PAGE_SIZE = 12

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

export function useProperties(filters, sortKey = 'created_at:desc', page = 1) {
    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [total, setTotal] = useState(0)

    const filtersKey = JSON.stringify(filters ?? DEFAULT_FILTERS)

    useEffect(() => {
        let cancelled = false
        async function run() {
            setLoading(true)
            setError(null)
            try {
                const f = JSON.parse(filtersKey)
                let q = supabase.from('properties').select('*', { count: 'exact' }).eq('status', 'aktif')

                if (f.harga_min > 0) q = q.gte('harga', f.harga_min)
                if (f.harga_max < 20_000_000_000) q = q.lte('harga', f.harga_max)
                if (f.wilayah) q = q.eq('kota_wilayah', f.wilayah)
                if (f.tipe) q = q.eq('tipe', f.tipe)
                if (f.kamar_tidur > 0) q = q.gte('kamar_tidur', f.kamar_tidur)
                if (f.kamar_mandi > 0) q = q.gte('kamar_mandi', f.kamar_mandi)
                if (f.sertifikat) q = q.eq('sertifikat', f.sertifikat)   // ← fix: filter sertifikat
                if (f.keyword) q = q.ilike('nama', `%${f.keyword}%`)

                const [col, dir] = sortKey.split(':')
                q = q.order(col, { ascending: dir === 'asc' })

                // Pagination
                const from = (page - 1) * PAGE_SIZE
                const to   = from + PAGE_SIZE - 1
                q = q.range(from, to)

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
    }, [filtersKey, sortKey, page])

    return { properties, loading, error, total }
}