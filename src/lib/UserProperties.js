/**
 * UserProperties.js
 * Helper functions untuk operasi properti yang berkaitan dengan user
 * (wishlist, riwayat lihat, dll.)
 */

import { supabase } from './supabase'

/**
 * Mengambil semua properti yang ada di wishlist user.
 * @param {string} userId
 * @returns {Promise<{ data: Array, error: any }>}
 */
export const getUserWishlist = async (userId) => {
  const { data, error } = await supabase
    .from('wishlist')
    .select('property_id, created_at, properties(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

/**
 * Mengecek apakah sebuah properti ada di wishlist user.
 * @param {string} userId
 * @param {string} propertyId
 * @returns {Promise<boolean>}
 */
export const isPropertyWishlisted = async (userId, propertyId) => {
  const { data } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .maybeSingle()

  return !!data
}

/**
 * Mengambil beberapa properti berdasarkan array ID.
 * Berguna untuk halaman compare atau preview.
 * @param {string[]} ids
 * @returns {Promise<{ data: Array, error: any }>}
 */
export const getPropertiesByIds = async (ids) => {
  if (!ids || ids.length === 0) return { data: [], error: null }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .in('id', ids)

  return { data, error }
}
