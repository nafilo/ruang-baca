import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BookPlus,
  Check,
  ChevronDown,
  CircleHelp,
  Compass,
  FilePenLine,
  Database,
  Library,
  Plus,
  Search,
  Smartphone,
  Trash2,
  UserRound,
  WifiOff,
  X,
} from 'lucide-react'
import creatorAvatar from './assets/nafilo-avatar.jpg'
import { databaseConfigured, deleteBook, fetchBooks, saveBook } from './services/collectionService'
import './App.css'

const EMPTY_BOOKS = []
const CURRENT_YEAR = new Date().getFullYear()
const NAV_ITEMS = [
  { id: 'home', label: 'Beranda', icon: Compass },
  { id: 'library', label: 'Koleksi Buku', icon: Library },
  { id: 'profile', label: 'Profil', icon: UserRound },
]

function getInitialPage() {
  const page = window.location.hash.slice(1)
  return NAV_ITEMS.some((item) => item.id === page) ? page : 'home'
}

function App() {
  const [page, setPage] = useState(getInitialPage)
  const [records, setRecords] = useState(null)
  const books = records ?? EMPTY_BOOKS
  const [loadError, setLoadError] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [writeError, setWriteError] = useState('')
  const [saving, setSaving] = useState(false)
  const writeRevision = useRef(0)
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('')
  const [editingBook, setEditingBook] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installMessage, setInstallMessage] = useState('')
  const [appInstalled, setAppInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
  )

  useEffect(() => {
    const handleHashChange = () => setPage(getInitialPage())
    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => {
      setOnline(false)
      setRecords(null)
      setLoadError(false)
    }
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  useEffect(() => {
    if (!online || !databaseConfigured) return

    const request = new AbortController()
    const revision = writeRevision.current
    const isCurrent = () => !request.signal.aborted && revision === writeRevision.current

    fetchBooks(request.signal).then((data) => {
      if (!isCurrent()) return
      setRecords(data)
      setLoadError(false)
      setGenre((current) => data.some((book) => book.genre === current) ? current : '')
    }).catch(() => {
      if (isCurrent()) setLoadError(true)
    })

    return () => request.abort()
  }, [online, loadAttempt])

  useEffect(() => {
    const captureInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    const installed = () => {
      setInstallPrompt(null)
      setAppInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', captureInstallPrompt)
    window.addEventListener('appinstalled', installed)

    return () => {
      window.removeEventListener('beforeinstallprompt', captureInstallPrompt)
      window.removeEventListener('appinstalled', installed)
    }
  }, [])

  const genres = useMemo(
    () => [...new Set(books.map((book) => book.genre).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second, 'id-ID')),
    [books],
  )

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('id-ID')
    return books.filter((book) => {
      const matchesGenre = !genre || book.genre === genre
      const searchable = `${book.title} ${book.author} ${book.genre}`.toLocaleLowerCase(
        'id-ID',
      )
      return matchesGenre && searchable.includes(normalizedQuery)
    })
  }, [books, genre, query])

  const collectionReady = online && databaseConfigured && records !== null && !loadError
  const canWrite = collectionReady && !saving
  const connectionLabel = !online ? 'Mode offline'
    : !databaseConfigured ? 'Supabase belum disiapkan'
      : loadError ? 'Koneksi database gagal'
        : records === null ? 'Memuat koleksi…' : 'Tersambung ke Supabase'
  const collectionMessage = !online ? 'Sambungkan ke internet untuk membuka koleksi buku.'
    : !databaseConfigured ? 'Atur Supabase untuk memuat koleksi buku.'
      : loadError ? 'Koleksi gagal dimuat. Periksa koneksi atau pengaturan Supabase.'
        : 'Mengambil data buku dari Supabase.'

  const retryLoad = () => {
    setLoadError(false)
    setRecords(null)
    setLoadAttempt((attempt) => attempt + 1)
  }

  const updateCollection = (nextBooks) => {
    writeRevision.current += 1
    if (!navigator.onLine) return
    setRecords(nextBooks)
    if (genre && !nextBooks.some((book) => book.genre === genre)) setGenre('')
  }

  const handleSaveBook = async (book) => {
    if (!canWrite) return
    setSaving(true)
    setWriteError('')
    try {
      const saved = await saveBook(book, Boolean(editingBook))
      const nextBooks = editingBook
        ? books.map((item) => item.id === saved.id ? saved : item)
        : [saved, ...books.filter((item) => item.id !== saved.id)]
      updateCollection(nextBooks)
      setFormOpen(false)
      setEditingBook(null)
    } catch {
      setWriteError('Buku belum bisa disimpan. Tekan Simpan buku untuk mencoba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBook = async (book) => {
    if (!canWrite || !window.confirm(`Hapus "${book.title}" dari koleksi?`)) return
    setSaving(true)
    setWriteError('')
    try {
      await deleteBook(book.id)
      updateCollection(books.filter((item) => item.id !== book.id))
    } catch {
      setWriteError('Buku belum bisa dihapus. Coba hapus lagi setelah koneksi tersedia.')
    } finally {
      setSaving(false)
    }
  }

  const openNewBookForm = () => {
    setWriteError('')
    setEditingBook(null)
    setFormOpen(true)
  }

  const openEditBookForm = (book) => {
    setWriteError('')
    setEditingBook(book)
    setFormOpen(true)
  }

  const promptInstall = async () => {
    if (!installPrompt) {
      setInstallMessage(
        'Gunakan menu browser lalu pilih “Tambahkan ke layar utama” untuk memasang aplikasi.',
      )
      return
    }

    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setInstallMessage('Permintaan pemasangan diterima.')
    }
    setInstallPrompt(null)
  }

  const recentBooks = [...books]
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, 3)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="Ruang Baca, beranda">
          <span className="brand-mark"><BookOpen size={22} strokeWidth={2.2} /></span>
          <span className="brand-copy">
            <strong>ruang baca</strong>
          </span>
        </a>

        <nav className="side-nav" aria-label="Navigasi utama">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`nav-link ${page === id ? 'active' : ''}`}
              aria-current={page === id ? 'page' : undefined}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {page === id && <span className="nav-indicator" />}
            </a>
          ))}
        </nav>

      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Ruang Baca</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{NAV_ITEMS.find((item) => item.id === page)?.label}</strong>
          </div>
          <div className="topbar-actions">
            <span className={`status-pill ${collectionReady ? '' : 'offline'}`} role="status">
              {online ? <Database size={15} /> : <WifiOff size={15} />}
              {connectionLabel}
            </span>
            <a className="avatar-link" href="#profile" aria-label="Buka profil Arkan">
              <img src={creatorAvatar} alt="" width="32" height="32" />
            </a>
          </div>
        </header>

        <div className="page-content">
          {writeError && !formOpen && (
            <div className="notice notice-error" role="alert">
              <CircleHelp size={17} />
              <span>{writeError}</span>
            </div>
          )}

          {page === 'home' && (
            <HomePage
              bookCount={collectionReady ? books.length : null}
              recentBooks={recentBooks}
              collectionMessage={collectionMessage}
              canWrite={canWrite}
              onBrowse={() => { window.location.hash = 'library' }}
              onAdd={openNewBookForm}
            />
          )}
          {page === 'library' && (
            <LibraryPage
              books={filteredBooks}
              totalBooks={books.length}
              collectionReady={collectionReady}
              collectionMessage={collectionMessage}
              connectionLabel={connectionLabel}
              onRetry={loadError && online ? retryLoad : undefined}
              canWrite={canWrite}
              genres={genres}
              genre={genre}
              query={query}
              onGenreChange={setGenre}
              onQueryChange={setQuery}
              onAdd={openNewBookForm}
              onEdit={openEditBookForm}
              onDelete={handleDeleteBook}
            />
          )}
          {page === 'profile' && (
            <ProfilePage
              bookCount={collectionReady ? books.length : null}
              onInstall={promptInstall}
              canInstall={Boolean(installPrompt)}
              appInstalled={appInstalled}
              installMessage={installMessage}
            />
          )}
        </div>
      </main>

      {formOpen && (
        <BookForm
          book={editingBook}
          saving={saving}
          canWrite={canWrite}
          writeError={writeError || (collectionReady ? '' : collectionMessage)}
          onClose={() => {
            if (saving) return
            setFormOpen(false)
            setEditingBook(null)
            setWriteError('')
          }}
          onSave={handleSaveBook}
        />
      )}
    </div>
  )
}

function HomePage({ bookCount, recentBooks, collectionMessage, canWrite, onBrowse, onAdd }) {
  return (
    <section className="home-page">
      <div className="welcome-row">
        <div>
          <h1>Rak bacaanmu</h1>
          <p className="welcome-description">
            {bookCount === null ? collectionMessage : `${bookCount} buku tersimpan di koleksimu.`}
          </p>
          <div className="welcome-actions">
            <button className="button button-dark" onClick={onAdd} disabled={!canWrite}>
              <Plus size={17} /> Tambah buku
            </button>
            <button className="button button-quiet" onClick={onBrowse}>
              Buka koleksi <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-sun" />
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-book hero-book-back" />
          <div className="hero-book hero-book-front"><BookOpen size={38} strokeWidth={1} /></div>
          <div className="hero-leaf leaf-one" />
          <div className="hero-leaf leaf-two" />
        </div>
      </div>

      {bookCount !== null && (
        <section className="section-block recent-section">
          <div className="section-heading">
            <h2>Baru ditambahkan</h2>
          </div>
          {recentBooks.length ? (
            <div className="recent-grid">
              {recentBooks.map((book, index) => (
                <BookTile key={book.id} book={book} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Rakmu masih kosong."
              description="Tambahkan buku pertama untuk mulai membangun koleksi."
            />
          )}
        </section>
      )}

    </section>
  )
}

function BookTile({ book, index }) {
  return (
    <article className="book-tile">
      <BookCover book={book} index={index} />
      <div className="book-tile-copy">
        <span className="book-genre">{book.genre}</span>
        <h3>{book.title}</h3>
        <p>{book.author}</p>
        <span className="book-year">{book.year || 'Tahun tidak dicatat'}</span>
      </div>
    </article>
  )
}

function LibraryPage({
  books, totalBooks, collectionReady, collectionMessage, connectionLabel, onRetry, canWrite,
  genres, genre, query, onGenreChange, onQueryChange, onAdd, onEdit, onDelete,
}) {
  return (
    <section className="library-page">
      <div className="page-title-row">
        <h1>Koleksi buku</h1>
        <button className="button button-dark" onClick={onAdd} disabled={!canWrite}><BookPlus size={17} /> Tambah buku</button>
      </div>

      {!collectionReady && (
        <EmptyState
          title={connectionLabel}
          description={collectionMessage}
          action={onRetry && <button className="button button-dark" onClick={onRetry}>Muat ulang</button>}
        />
      )}

      {collectionReady && (
        <>
          <div className="library-toolbar">
            <label className="search-field">
              <Search size={17} />
              <input
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Cari judul, penulis, atau genre..."
                aria-label="Cari buku"
              />
            </label>
            <label className="select-field">
              <select value={genre} onChange={(event) => onGenreChange(event.target.value)} aria-label="Filter genre">
                <option value="">Semua genre</option>
                {genres.map((item) => <option key={item}>{item}</option>)}
              </select>
              <ChevronDown size={16} />
            </label>
            <span className="results-count">{books.length} dari {totalBooks} buku</span>
          </div>

          {books.length ? (
            <div className="library-grid">
              {books.map((book, index) => (
                <article className="library-card" key={book.id}>
                  <BookCover book={book} index={index} />
                  <div className="library-card-content">
                    <div className="library-card-meta">
                      <span className="book-genre">{book.genre}</span>
                      {book.year && <span className="book-year">{book.year}</span>}
                    </div>
                    <h2>{book.title}</h2>
                    <p className="book-author">{book.author}</p>
                    {book.description && <p className="book-description">{book.description}</p>}
                    <div className="card-actions">
                      <button className="button button-edit" onClick={() => onEdit(book)} aria-label={`Edit ${book.title}`} disabled={!canWrite}>
                        <FilePenLine size={15} /> Edit
                      </button>
                      <button className="icon-button danger" onClick={() => onDelete(book)} aria-label={`Hapus ${book.title}`} disabled={!canWrite}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title={totalBooks ? 'Buku tidak ditemukan.' : 'Rakmu masih kosong.'}
              description={totalBooks ? 'Coba kata kunci atau genre lain.' : 'Tambahkan buku pertamamu untuk mengisi rak ini.'}
            />
          )}
        </>
      )}
    </section>
  )
}

function BookCover({ book, index = 0 }) {
  const coverNumber = ((index % 5) + 1)
  return (
    <div
      className={`book-cover cover-${book.cover || coverNumber}`}
      aria-hidden="true"
    >
      {book.year && <span className="cover-topline">{book.year}</span>}
      <span className="cover-title">{book.title}</span>
      <span className="cover-bottomline">{book.author}</span>
      <span className="cover-decoration" aria-hidden="true" />
    </div>
  )
}

function ProfilePage({ bookCount, onInstall, canInstall, appInstalled, installMessage }) {
  return (
    <section className="profile-page">
      <div className="page-title-row">
        <h1>Profil Pembuat</h1>
      </div>

      <div className="profile-layout">
        <article className="profile-card">
          <img className="profile-avatar" src={creatorAvatar} alt="" width="72" height="72" />
          <h2>Arkan Nafi Nurcahyo</h2>
          <a className="profile-github" href="https://github.com/nafilo" target="_blank" rel="noreferrer">
            GitHub · @nafilo <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <div className="profile-divider" />
          <dl className="profile-details">
            <div><dt>NIM</dt><dd>21120124140160</dd></div>
            <div><dt>Kelompok</dt><dd>33</dd></div>
            <div><dt>Shift</dt><dd>5</dd></div>
          </dl>
          {bookCount !== null && <div className="profile-book-count"><BookOpen size={17} /><strong>{bookCount}</strong><span>buku dalam koleksi</span></div>}
        </article>

        <div className="profile-side">
          <article className="info-card">
            <div className="info-card-icon"><Smartphone size={19} /></div>
            <div className="info-card-content">
              <h2>{appInstalled ? 'Ruang Baca terpasang' : 'Pasang Ruang Baca'}</h2>
              <p>Buka Ruang Baca dari layar utama. Beranda, navigasi, dan profil tetap bisa dibuka saat offline.</p>
              {!appInstalled && (
                <button className="button button-dark" onClick={onInstall}>
                  {canInstall ? 'Pasang aplikasi' : 'Cara memasang'} <ArrowRight size={16} />
                </button>
              )}
              {!appInstalled && installMessage && <p className="install-message" role="status">{installMessage}</p>}
            </div>
          </article>

          <article className="storage-card">
            <div className="storage-card-icon"><Database size={17} /></div>
            <div>
              <strong>Koleksi di Supabase</strong>
              <p>Buka dan kelola koleksi saat tersambung ke internet.</p>
            </div>
          </article>

        </div>
      </div>
    </section>
  )
}

function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><BookOpen size={23} /></span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  )
}

function BookForm({ book, saving, canWrite, writeError, onClose, onSave }) {
  const [form, setForm] = useState(() => book || {
    id: crypto.randomUUID(),
    title: '',
    author: '',
    genre: '',
    year: '',
    description: '',
    cover: Math.floor(Math.random() * 5) + 1,
  })
  const [validationError, setValidationError] = useState('')

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setValidationError('')
  }

  const submitForm = (event) => {
    event.preventDefault()
    if (!canWrite) return
    const title = form.title.trim()
    const author = form.author.trim()
    if (!title || !author) {
      setValidationError('Judul dan nama penulis wajib diisi.')
      return
    }

    const year = form.year ? Number(form.year) : ''
    if (year !== '' && (!Number.isInteger(year) || year < 1 || year > CURRENT_YEAR)) {
      setValidationError('Masukkan tahun terbit yang valid.')
      return
    }

    onSave({
      ...form,
      title,
      author,
      genre: form.genre.trim() || 'Lainnya',
      year,
      description: form.description.trim(),
    })
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="book-modal" role="dialog" aria-modal="true" aria-labelledby="book-form-title">
        <div className="modal-heading">
          <h2 id="book-form-title">{book ? 'Edit buku' : 'Tambah buku'}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Tutup formulir" disabled={saving}><X size={19} /></button>
        </div>
        <form onSubmit={submitForm}>
          <label className="form-field">
            <span>Judul buku <i>*</i></span>
            <input name="title" readOnly={saving} value={form.title} onChange={updateField} maxLength={100} autoFocus required placeholder="Contoh: Laskar Pelangi" />
          </label>
          <label className="form-field">
            <span>Penulis <i>*</i></span>
            <input name="author" readOnly={saving} value={form.author} onChange={updateField} maxLength={80} required placeholder="Nama penulis" />
          </label>
          <div className="form-row">
            <label className="form-field">
              <span>Genre</span>
              <input name="genre" readOnly={saving} value={form.genre} onChange={updateField} maxLength={40} placeholder="Fiksi, sejarah..." />
            </label>
            <label className="form-field">
              <span>Tahun terbit</span>
              <input name="year" type="number" readOnly={saving} value={form.year} onChange={updateField} min="1" max={CURRENT_YEAR} placeholder="2024" />
            </label>
          </div>
          <label className="form-field">
            <span>Catatan singkat</span>
            <textarea name="description" readOnly={saving} value={form.description} onChange={updateField} maxLength={240} rows={3} placeholder="Apa yang menarik dari buku ini?" />
          </label>
          {(validationError || writeError) && <p className="form-error" role="alert">{validationError || writeError}</p>}
          <div className="modal-actions">
            <button type="button" className="button button-quiet" onClick={onClose} disabled={saving}>Batal</button>
            <button type="submit" className="button button-dark" disabled={!canWrite}>
              <Check size={16} /> {saving ? 'Menyimpan…' : 'Simpan buku'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default App
