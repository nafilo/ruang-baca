import { useState, useEffect, useCallback } from 'react'
import reviewService from '../services/reviewService'

export function useReviews(bookId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReviews = useCallback(async () => {
    if (!bookId) { setLoading(false); return }
    try {
      setLoading(true)
      setError(null)
      const response = await reviewService.getReviews(bookId)
      if (response.success) {
        setReviews(response.data || [])
      } else {
        setError(response.message || 'Failed to fetch reviews.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching reviews.')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [bookId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return { reviews, loading, error, refetch: fetchReviews }
}

export function useCreateReview() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const createReview = async (bookId, reviewData) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      const response = await reviewService.createReview(bookId, reviewData)
      if (response.success) {
        setSuccess(true)
        return response.data
      } else {
        setError(response.message || 'Failed to submit review.')
        return null
      }
    } catch (err) {
      setError(err.message || 'An error occurred while submitting review.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createReview, loading, error, success }
}
