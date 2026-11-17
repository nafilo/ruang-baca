export function matchesSearch(item, query) {
  if (!query || !query.trim()) return true
  const q = query.toLowerCase()
  const name = (item.name || '').toLowerCase()
  const desc = (item.description || '').toLowerCase()
  const cat = (item.category || '').toLowerCase()
  return name.includes(q) || desc.includes(q) || cat.includes(q)
}

export function matchesCategory(item, category) {
  if (!category || category === 'All') return true
  return (item.category || '').toLowerCase() === category.toLowerCase()
}

export function sortItems(items, key = 'name', order = 'asc') {
  return [...items].sort((a, b) => {
    let valA = a[key] ?? ''
    let valB = b[key] ?? ''
    if (typeof valA === 'string') valA = valA.toLowerCase()
    if (typeof valB === 'string') valB = valB.toLowerCase()
    if (valA < valB) return order === 'asc' ? -1 : 1
    if (valA > valB) return order === 'asc' ? 1 : -1
    return 0
  })
}

export function extractCategories(items) {
  const cats = new Set(['All'])
  items.forEach((item) => {
    if (item.category) cats.add(item.category)
  })
  return Array.from(cats)
}
