import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest } from '../utils/api'

const LibraryContext = createContext(null)
const AUTH_KEY = 'library_auth_session'
const emptyData = { books: [], members: [], transactions: [] }

const dateOnly = (value) => value ? new Date(value).toISOString().slice(0, 10) : ''
const daysUntil = (value) => {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  const due = Date.UTC(year, month - 1, day)
  const now = new Date()
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.ceil((due - today) / 86400000)
}

function normalizeBook(book) {
  return { ...book, id: book._id }
}

function normalizeMember(member) {
  return {
    ...member,
    id: member._id,
    membershipDate: dateOnly(member.membershipDate),
  }
}

function normalizeTransaction(transaction) {
  const expectedReturnDate = dateOnly(transaction.expectedReturnDate)
  const daysRemaining = daysUntil(expectedReturnDate)
  return {
    ...transaction,
    id: transaction.transactionId,
    bookId: transaction.book?._id || transaction.book,
    memberId: transaction.member?._id || transaction.member,
    issueDate: dateOnly(transaction.issueDate),
    expectedReturnDate,
    returnDate: dateOnly(transaction.returnDate),
    daysRemaining,
    status: transaction.status === 'Issued' && daysRemaining < 0 ? 'Overdue' : transaction.status,
  }
}

function getTokenPayload(token) {
  const payload = token?.split('.')[1]
  if (!payload) return null
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
}

function readAuthState() {
  const token = window.localStorage.getItem(AUTH_KEY)
  if (!token) return { isAuthenticated: false, token: null, role: null, user: null }

  try {
    const session = JSON.parse(token)
    const payload = getTokenPayload(session.token)
    const validRole = session.role === 'admin' || session.role === 'user'
    const valid = validRole && payload?.role === session.role && payload.exp * 1000 > Date.now()
    return valid
      ? { isAuthenticated: true, token: session.token, role: session.role, user: session.user }
      : { isAuthenticated: false, token: null, role: null, user: null }
  } catch {
    return { isAuthenticated: false, token: null, role: null, user: null }
  }
}

export function LibraryProvider({ children }) {
  const [data, setData] = useState(emptyData)
  const [toast, setToast] = useState(null)
  const [auth, setAuth] = useState(() => readAuthState())

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const notify = (message, type = 'success') => setToast({ id: Date.now(), message, type })

  const loadAdminData = async (token) => {
    const [booksResult, membersResult, transactionsResult] = await Promise.all([
      apiRequest('/api/books?limit=1000', { token }),
      apiRequest('/api/members?limit=1000', { token }),
      apiRequest('/api/transactions?limit=1000', { token }),
    ])
    setData({
      books: booksResult.books.map(normalizeBook),
      members: membersResult.members.map(normalizeMember),
      transactions: transactionsResult.transactions.map(normalizeTransaction),
    })
  }

  useEffect(() => {
    if (auth.role !== 'admin' || !auth.token) return undefined
    let active = true
    Promise.all([
      apiRequest('/api/books?limit=1000', { token: auth.token }),
      apiRequest('/api/members?limit=1000', { token: auth.token }),
      apiRequest('/api/transactions?limit=1000', { token: auth.token }),
    ]).then(([booksResult, membersResult, transactionsResult]) => {
      if (!active) return
      setData({
        books: booksResult.books.map(normalizeBook),
        members: membersResult.members.map(normalizeMember),
        transactions: transactionsResult.transactions.map(normalizeTransaction),
      })
    }).catch((error) => {
      if (active) notify(`Could not load library records: ${error.message}`, 'error')
    })
    return () => { active = false }
  }, [auth.role, auth.token])

  const completeLogin = (result, role, account) => {
    const tokenPayload = getTokenPayload(result.token)
    if (!result.token || !account || tokenPayload?.role !== role) {
      throw new Error('The server returned an invalid sign-in response.')
    }
    const session = { token: result.token, role, user: account }
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(session))
    setAuth({ isAuthenticated: true, ...session })
    if (role === 'admin') setData(emptyData)
    notify(`Welcome back, ${account.name}.`, 'success')
  }

  const loginAdmin = async (email, password) => {
    try {
      const result = await apiRequest('/api/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      completeLogin(result, 'admin', result.admin)
      return { ok: true }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  }

  const loginUser = async (rollNo, password) => {
    try {
      const result = await apiRequest('/api/auth/user/login', {
        method: 'POST',
        body: JSON.stringify({ rollNo, password }),
      })
      completeLogin(result, 'user', result.user)
      return { ok: true }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  }

  const fetchUserDashboard = () => apiRequest('/api/auth/user/me', { token: auth.token })

  const logout = () => {
    window.localStorage.removeItem(AUTH_KEY)
    window.localStorage.removeItem('library_admin_session')
    setAuth({ isAuthenticated: false, token: null, role: null, user: null })
    notify('You have been signed out.', 'info')
  }

  const saveBook = async (book) => {
    const bookId = book._id || book.id
    const payload = {
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      quantity: Number(book.quantity),
      description: book.description || '',
      publishedYear: book.publishedYear || undefined,
      coverImage: book.coverImage || '',
    }
    try {
      if (bookId) {
        await apiRequest(`/api/books/${bookId}`, { token: auth.token, method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await apiRequest('/api/books', { token: auth.token, method: 'POST', body: JSON.stringify(payload) })
      }
      try {
        await loadAdminData(auth.token)
      } catch (refreshError) {
        notify(`Book saved, but the library list could not refresh: ${refreshError.message}`, 'error')
        return { ok: true }
      }
      notify(bookId ? 'Book details updated.' : 'Book added to the collection.')
      return { ok: true }
    } catch (error) {
      notify(error.message, 'error')
      return { ok: false, message: error.message }
    }
  }

  const deleteBook = async (id) => {
    const book = data.books.find((item) => item.id === id)
    if (data.transactions.some((item) => item.bookId === id && ['Issued', 'Overdue'].includes(item.status))) {
      notify('This book has an active loan and cannot be deleted yet.', 'error')
      return false
    }
    try {
      await apiRequest(`/api/books/${book?._id || id}`, { token: auth.token, method: 'DELETE' })
      try {
        await loadAdminData(auth.token)
      } catch (refreshError) {
        notify(`Book deleted, but the library list could not refresh: ${refreshError.message}`, 'error')
        return true
      }
      notify('Book deleted.')
      return true
    } catch (error) {
      notify(error.message, 'error')
      return false
    }
  }

  const saveMember = async (member) => {
    const memberId = member._id || member.id
    const payload = {
      memberId: member.memberId,
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: member.address,
      course: member.course || '',
      year: member.year || '',
      department: member.department || '',
      membershipDate: member.membershipDate,
      status: member.status || 'Active',
    }
    if (member.password) payload.password = member.password
    try {
      if (memberId) {
        await apiRequest(`/api/members/${memberId}`, { token: auth.token, method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await apiRequest('/api/members', { token: auth.token, method: 'POST', body: JSON.stringify(payload) })
      }
      try {
        await loadAdminData(auth.token)
      } catch (refreshError) {
        notify(`Member saved, but the directory could not refresh: ${refreshError.message}`, 'error')
        return { ok: true }
      }
      notify(memberId ? 'Member details updated.' : 'Member added successfully.')
      return { ok: true }
    } catch (error) {
      notify(error.message, 'error')
      return { ok: false, message: error.message }
    }
  }

  const deleteMember = async (id) => {
    const member = data.members.find((item) => item.id === id)
    if (data.transactions.some((item) => item.memberId === id && ['Issued', 'Overdue'].includes(item.status))) {
      notify('This member has an active loan and cannot be deleted yet.', 'error')
      return false
    }
    try {
      await apiRequest(`/api/members/${member?._id || id}`, { token: auth.token, method: 'DELETE' })
      try {
        await loadAdminData(auth.token)
      } catch (refreshError) {
        notify(`Member deleted, but the directory could not refresh: ${refreshError.message}`, 'error')
        return true
      }
      notify('Member deleted.')
      return true
    } catch (error) {
      notify(error.message, 'error')
      return false
    }
  }

  const issueBook = async ({ bookId, memberId, issueDate, expectedReturnDate }) => {
    const book = data.books.find((item) => item.id === bookId)
    if (!memberId || !bookId) return { ok: false, message: 'Choose a member and a book.' }
    if (!book || book.availableQuantity < 1) return { ok: false, message: 'This book is currently unavailable.' }
    try {
      await apiRequest('/api/transactions/issue', {
        token: auth.token,
        method: 'POST',
        body: JSON.stringify({ bookId, memberId, issueDate, expectedReturnDate }),
      })
      try {
        await loadAdminData(auth.token)
      } catch (refreshError) {
        notify(`Book issued, but the dashboard could not refresh: ${refreshError.message}`, 'error')
        return { ok: true }
      }
      notify('Book issued. The transaction has been recorded.')
      return { ok: true }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  }

  const returnBook = async (transaction) => {
    if (!transaction || transaction.status === 'Returned') return false
    try {
      await apiRequest(`/api/transactions/${transaction._id || transaction.id}/return`, { token: auth.token, method: 'PUT' })
      try {
        await loadAdminData(auth.token)
      } catch (refreshError) {
        notify(`Book returned, but the library list could not refresh: ${refreshError.message}`, 'error')
        return true
      }
      notify('Book returned and inventory updated.')
      return true
    } catch (error) {
      notify(error.message, 'error')
      return false
    }
  }

  return (
    <LibraryContext.Provider value={{ ...data, toast, auth, user: auth.user, role: auth.role, token: auth.token, notify, dismissToast: () => setToast(null), loginAdmin, loginUser, fetchUserDashboard, logout, isAuthenticated: auth.isAuthenticated, saveBook, deleteBook, saveMember, deleteMember, issueBook, returnBook }}>
      {children}
    </LibraryContext.Provider>
  )
}

export function useLibrary() {
  const context = useContext(LibraryContext)
  if (!context) throw new Error('useLibrary must be used inside LibraryProvider')
  return context
}
