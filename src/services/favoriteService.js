import { apiClient } from '../config/api'

const favoriteService = {
  async getFavorites(userIdentifier) {
    try {
      const data = await apiClient.get(
        `/rest/v1/favorites?user_identifier=eq.${userIdentifier}&select=*`
      )
      return { success: true, data: Array.isArray(data) ? data : [] }
    } catch (err) {
      return { success: false, message: err.message, data: [] }
    }
  },

  async toggleFavorite({ recipe_id, user_identifier }) {
    try {
      // Check if already favorited
      const existing = await apiClient.get(
        `/rest/v1/favorites?recipe_id=eq.${recipe_id}&user_identifier=eq.${user_identifier}`
      )
      if (Array.isArray(existing) && existing.length > 0) {
        await apiClient.delete(
          `/rest/v1/favorites?recipe_id=eq.${recipe_id}&user_identifier=eq.${user_identifier}`
        )
        return { success: true, data: { is_favorited: false } }
      } else {
        await apiClient.post('/rest/v1/favorites', { recipe_id, user_identifier }, {
          headers: { Prefer: 'return=representation' },
        })
        return { success: true, data: { is_favorited: true } }
      }
    } catch (err) {
      return { success: false, message: err.message }
    }
  },
}

export default favoriteService
