// src/lib/recommend.js

/**
 * Menghitung skor kecocokan (0-100) antara kriteria user dan data properti
 * @param {Object} property - Data rumah dari Supabase
 * @param {Object} preferences - Kriteria yang dipilih user
 */
export const calculateMatchScore = (property, preferences) => {
  let totalScore = 0;
  let totalWeight = 0;

  const weights = {
    harga: 40,      // Harga biasanya prioritas utama
    wilayah: 30,    // Lokasi sangat penting di Jakarta
    fasilitas: 20,
    tipe: 10
  };

  // 1. Cek Harga (Jika di bawah budget, skor maksimal)
  totalWeight += weights.harga;
  if (property.harga <= preferences.maxHarga) {
    totalScore += weights.harga;
  } else {
    // Berikan skor parsial jika hanya lewat sedikit dari budget (toleransi 10%)
    const diff = (property.harga - preferences.maxHarga) / preferences.maxHarga;
    if (diff < 0.1) totalScore += weights.harga * 0.5;
  }

  // 2. Cek Wilayah
  totalWeight += weights.wilayah;
  if (preferences.wilayah.includes(property.wilayah)) {
    totalScore += weights.wilayah;
  }

  // 3. Cek Fasilitas (Menghitung rasio fasilitas yang cocok)
  totalWeight += weights.fasilitas;
  if (preferences.fasilitas?.length > 0) {
    const matchingFasilitas = preferences.fasilitas.filter(f => 
      property.fasilitas?.includes(f)
    );
    const ratio = matchingFasilitas.length / preferences.fasilitas.length;
    totalScore += (weights.fasilitas * ratio);
  } else {
    totalScore += weights.fasilitas; // Default jika user tidak pilih filter fasilitas
  }

  // 4. Cek Tipe Properti
  totalWeight += weights.tipe;
  if (preferences.tipe === property.tipe) {
    totalScore += weights.tipe;
  }

  return Math.round((totalScore / totalWeight) * 100);
};

export const getRecommendationLabel = (score) => {
  if (score >= 90) return { label: 'Sangat Cocok', color: 'text-emerald-400' };
  if (score >= 75) return { label: 'Cocok', color: 'text-blue-400' };
  return { label: 'Kurang Cocok', color: 'text-slate-400' };
};