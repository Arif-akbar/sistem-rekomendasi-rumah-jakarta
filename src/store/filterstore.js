import { create } from 'zustand'
import { DEFAULT_FILTERS } from '../hooks/UseProperties'

export const useFilterStore = create((set) => ({
    filters: { ...DEFAULT_FILTERS },
    sortKey: 'created_at:desc',
    viewMode: 'grid',          // 'grid' | 'list' | 'map'
    compareList: [],           // max 3 property IDs
    page: 1,                   // halaman aktif untuk pagination

    setFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: value }, page: 1 })),

    resetFilters: () =>
        set({ filters: { ...DEFAULT_FILTERS }, page: 1 }),

    setSortKey: (k) => set({ sortKey: k, page: 1 }),

    setPage: (p) => set({ page: p }),

    setViewMode: (m) => set({ viewMode: m }),

    toggleCompare: (id) =>
        set((s) => {
            const list = s.compareList
            if (list.includes(id)) return { compareList: list.filter((x) => x !== id) }
            if (list.length >= 3) return s   // max 3
            return { compareList: [...list, id] }
        }),

    clearCompare: () => set({ compareList: [] }),
}))