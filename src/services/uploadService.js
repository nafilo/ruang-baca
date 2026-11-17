import { apiClient, SUPABASE_KEY } from '../config/api'

const uploadService = {
  async uploadImage(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const fileName = `${Date.now()}_${file.name}`
      const response = await apiClient.post(
        `/storage/v1/object/recipe-images/${fileName}`,
        formData,
        {
          headers: {
            'Content-Type': file.type,
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      )
      const url = `${import.meta.env.VITE_API_BASE_URL}/storage/v1/object/public/recipe-images/${fileName}`
      return { success: true, data: { url } }
    } catch (err) {
      return { success: false, message: err.message }
    }
  },
}

export default uploadService
