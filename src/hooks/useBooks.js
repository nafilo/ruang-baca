import { useState, useEffect, useCallback } from 'react'
import bookService from '../services/bookService'

export function useBooks(params = {}) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const paramKey = JSON.stringify(params)

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await bookService.getBooks(params)
      if (response.success) {
        setBooks(response.data || [])
      } else {
        setError(response.message || 'Failed to fetch books.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching books.')
      setBooks([])
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  return { books, loading, error, refetch: fetchBooks }
}

export function useBookById(id) {
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBook = useCallback(async () => {
    if (!id) { setLoading(false); return }
    try {
      setLoading(true)
      setError(null)
      const response = await bookService.getBookById(id)
      if (response.success) {
        setBook(response.data)
      } else {
        setError(response.message || 'Book not found.')
      }
    } catch (err) {
      setError(err.message || 'Failed to load book details.')
      setBook(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchBook()
  }, [fetchBook])

  return { book, loading, error, refetch: fetchBook }
}
