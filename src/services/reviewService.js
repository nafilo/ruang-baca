import { apiClient } from '../config/api'

const reviewService = {
  async getReviews(bookId) {
    try {
      const data = await apiClient.get(
        `/rest/v1/reviews?recipe_id=eq.${bookId}&select=*&order=created_at.desc`
      )
      return { success: true, data: Array.isArray(data) ? data : [] }
    } catch (err) {
      return { success: false, message: err.message, data: [] }
    }
  },

  async createReview(bookId, reviewData) {
    try {
      const payload = { ...reviewData, recipe_id: bookId }
      const data = await apiClient.post('/rest/v1/reviews', payload, {
        headers: { Prefer: 'return=representation' },
      })
      const created = Array.isArray(data) ? data[0] : data
      return { success: true, data: created }
    } catch (err) {
      return { success: false, message: err.message }
    }
  },
}

export default reviewService
