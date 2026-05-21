import { create } from 'zustand'
import { DEFAULT_FILTERS } from '../hooks/UseProperties'

export const useFilterStore = create((set) => ({
    filters: { ...DEFAULT_FILTERS },
    sortKey: 'created_at:desc',
    viewMode: 'grid',          // 'grid' | 'list'
    compareList: [],           // max 3 property IDs

    setFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: value } })),

    resetFilters: () =>
        set({ filters: { ...DEFAULT_FILTERS } }),

    setSortKey: (k) => set({ sortKey: k }),

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