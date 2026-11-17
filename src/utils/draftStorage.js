const DRAFT_PREFIX = 'bookshelf_draft_'

export function saveDraft(data, key = 'create') {
  try {
    const entry = { data, timestamp: Date.now() }
    localStorage.setItem(DRAFT_PREFIX + key, JSON.stringify(entry))
    return true
  } catch {
    return false
  }
}

export function loadDraft(key = 'create') {
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + key)
    if (!raw) return null
    const entry = JSON.parse(raw)
    return entry.data || null
  } catch {
    return null
  }
}

export function deleteDraft(key = 'create') {
  try {
    localStorage.removeItem(DRAFT_PREFIX + key)
  } catch { /* ignore */ }
}

export function hasDraft(key = 'create') {
  try {
    return !!localStorage.getItem(DRAFT_PREFIX + key)
  } catch {
    return false
  }
}

export function getDraftTimestamp(key = 'create') {
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + key)
    if (!raw) return null
    return JSON.parse(raw).timestamp || null
  } catch {
    return null
  }
}

export function formatDraftTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
