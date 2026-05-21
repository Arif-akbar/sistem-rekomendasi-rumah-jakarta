// src/lib/Recommend.js

/**
 * Menghitung skor kecocokan (0-100) antara kriteria user dan data properti.
 * Menerima objek `filters` langsung dari FilterStore (Zustand).
 *
 * @param {Object} property    - Data properti dari Supabase
 * @param {Object} filters     - State filters dari FilterStore
 */
export const calculateMatchScore = (property, filters) => {
  if (!property || !filters) return 0;

  let totalScore = 0;
  let totalWeight = 0;

  const weights = {
    harga:     40,   // Harga adalah prioritas utama
    wilayah:   30,   // Lokasi sangat penting di Jakarta
    fasilitas: 20,
    tipe:      10,
  };

  // ── 1. Harga ────────────────────────────────────────────────
  // Gunakan harga_max dari FilterStore (bukan maxHarga)
  totalWeight += weights.harga;
  const budgetMax = filters.harga_max ?? 20_000_000_000;
  if (property.harga <= budgetMax) {
    totalScore += weights.harga;
  } else {
    // Skor parsial jika hanya lewat < 10% dari budget
    const diff = (property.harga - budgetMax) / budgetMax;
    if (diff < 0.1) totalScore += weights.harga * 0.5;
  }

  // ── 2. Wilayah ──────────────────────────────────────────────
  // FilterStore menyimpan wilayah sebagai string tunggal (bukan array).
  // Jika filter kosong → semua wilayah cocok (skor penuh).
  totalWeight += weights.wilayah;
  const filterWilayah = filters.wilayah ?? '';
  if (!filterWilayah || filterWilayah === property.kota_wilayah) {
    totalScore += weights.wilayah;
  }

  // ── 3. Fasilitas ────────────────────────────────────────────
  totalWeight += weights.fasilitas;
  const filterFasilitas = filters.fasilitas ?? [];
  if (filterFasilitas.length > 0) {
    const propertyFasilitas = property.fasilitas ?? [];
    const matched = filterFasilitas.filter((f) => propertyFasilitas.includes(f));
    const ratio = matched.length / filterFasilitas.length;
    totalScore += weights.fasilitas * ratio;
  } else {
    // Tidak ada filter fasilitas → skor penuh
    totalScore += weights.fasilitas;
  }

  // ── 4. Tipe Properti ────────────────────────────────────────
  totalWeight += weights.tipe;
  const filterTipe = filters.tipe ?? '';
  if (!filterTipe || filterTipe === property.tipe) {
    totalScore += weights.tipe;
  }

  return Math.round((totalScore / totalWeight) * 100);
};

/**
 * Mengembalikan label dan warna berdasarkan skor kecocokan.
 * @param {number} score - Skor 0-100
 */
export const getRecommendationLabel = (score) => {
  if (score >= 90) return { label: 'Sangat Cocok', color: 'text-emerald-400' };
  if (score >= 75) return { label: 'Cocok',        color: 'text-blue-400'    };
  return                  { label: 'Kurang Cocok', color: 'text-slate-400'   };
};