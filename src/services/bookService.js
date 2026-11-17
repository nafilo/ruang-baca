import { apiClient } from '../config/api'

const bookService = {
  async getBooks(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.offset) queryParams.append('offset', params.offset)
      if (params.select) queryParams.append('select', params.select)

      const url = `/rest/v1/recipes${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const data = await apiClient.get(url)
      return { success: true, data: Array.isArray(data) ? data : [] }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to fetch books.', data: [] }
    }
  },

  async getBookById(id) {
    try {
      const data = await apiClient.get(`/rest/v1/recipes?id=eq.${id}&select=*,ingredients(*),steps(*)`)
      const book = Array.isArray(data) ? data[0] : data
      return { success: true, data: book }
    } catch (err) {
      return { success: false, message: err.message || 'Book not found.' }
    }
  },

  async createBook(payload) {
    try {
      const data = await apiClient.post('/rest/v1/recipes', payload, {
        headers: { Prefer: 'return=representation' },
      })
      const created = Array.isArray(data) ? data[0] : data
      return { success: true, data: created }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to create book.' }
    }
  },

  async updateBook(id, payload) {
    try {
      const data = await apiClient.patch(`/rest/v1/recipes?id=eq.${id}`, payload, {
        headers: { Prefer: 'return=representation' },
      })
      const updated = Array.isArray(data) ? data[0] : data
      return { success: true, data: updated }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update book.' }
    }
  },

  async deleteBook(id) {
    try {
      await apiClient.delete(`/rest/v1/recipes?id=eq.${id}`)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to delete book.' }
    }
  },
}

export default bookService
