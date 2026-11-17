import axios from 'axios'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
const TABLE_PATH = '/rest/v1/ruang_baca_books'
const BOOK_FIELDS = 'id,title,author,genre,year,description,cover,added_at'
const PAGE_SIZE = 500

export const databaseConfigured = Boolean(url && publishableKey?.startsWith('sb_publishable_'))

const api = axios.create({
  baseURL: url,
  headers: { apikey: publishableKey },
  timeout: 10000,
})
let auth
let pendingSession

async function getOrCreateSession() {
  if (!auth) {
    const { createClient } = await import('@supabase/supabase-js')
    auth = createClient(url, publishableKey, {
      auth: {
        detectSessionInUrl: false,
        storageKey: `ruang-baca-auth:${new URL(url).host}`,
      },
      global: {
        fetch(input, options) {
          const timeout = AbortSignal.timeout(10000)
          const signal = options?.signal ? AbortSignal.any([timeout, options.signal]) : timeout
          return fetch(input, { ...options, signal })
        },
      },
    }).auth
  }

  const { data, error } = await auth.getSession()
  if (error) throw error
  if (data.session) return data.session

  const result = await auth.signInAnonymously()
  if (result.error) throw result.error
  return result.data.session
}

async function sessionHeaders() {
  if (!pendingSession) {
    const locks = globalThis.navigator?.locks
    pendingSession = (locks
      ? locks.request(`ruang-baca-sign-in:${new URL(url).host}`, getOrCreateSession)
      : getOrCreateSession()
    ).finally(() => { pendingSession = undefined })
  }

  const session = await pendingSession
  if (!session) throw new Error('Sesi Supabase tidak tersedia.')
  return { Authorization: `Bearer ${session.access_token}` }
}

function fromRow({ added_at, year, ...book }) {
  return { ...book, year: year ?? '', addedAt: added_at }
}

function toRow({ title, author, genre, year, description }) {
  return { title, author, genre, year: year === '' ? null : year, description }
}

export async function fetchBooks(signal) {
  const headers = await sessionHeaders()
  const rows = []
  let total = Infinity

  while (rows.length < total) {
    const response = await api.get(TABLE_PATH, {
      signal,
      headers: { ...headers, Prefer: 'count=exact' },
      params: { select: BOOK_FIELDS, order: 'added_at.desc,id.asc', limit: PAGE_SIZE, offset: rows.length },
    })
    if (!response.data.length) break
    rows.push(...response.data)
    total = Number(response.headers['content-range']?.split('/').at(-1))
    if (!Number.isFinite(total)) break
  }

  return rows.map(fromRow)
}

export async function saveBook(book, editing) {
  const headers = { ...await sessionHeaders(), Prefer: 'return=representation' }
  const body = toRow(book)
  const params = { select: BOOK_FIELDS, id: `eq.${book.id}` }

  if (editing) {
    const { data } = await api.patch(TABLE_PATH, body, { headers, params })
    if (!data.length) throw new Error('Buku ini sudah tidak tersedia.')
    return fromRow(data[0])
  }

  const { data } = await api.post(TABLE_PATH, { ...body, id: book.id, cover: Number(book.cover) }, {
    headers: { ...headers, Prefer: 'resolution=ignore-duplicates,return=representation' },
    params: { select: BOOK_FIELDS, on_conflict: 'owner_id,id' },
  })
  if (data.length) return fromRow(data[0])

  // A prior request may have saved this book before its response was lost.
  const previous = await api.get(TABLE_PATH, { headers, params })
  if (!previous.data.length) throw new Error('Buku belum dapat dibaca dari database.')
  return fromRow(previous.data[0])
}

export async function deleteBook(id) {
  await api.delete(TABLE_PATH, {
    headers: await sessionHeaders(),
    params: { id: `eq.${id}` },
  })
}
