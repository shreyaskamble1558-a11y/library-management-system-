const KEYS = {
  books: 'library_books',
  members: 'library_members',
  transactions: 'library_transactions',
}

const today = () => new Date().toISOString().slice(0, 10)
const offsetDate = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const demoData = {
  books: [
    { id: 'BK-1001', title: 'The Design of Everyday Things', author: 'Don Norman', category: 'Design', isbn: '9780465050659', quantity: 8, availableQuantity: 5 },
    { id: 'BK-1002', title: 'Atomic Habits', author: 'James Clear', category: 'Self development', isbn: '9780735211292', quantity: 12, availableQuantity: 9 },
    { id: 'BK-1003', title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', isbn: '9780062316097', quantity: 6, availableQuantity: 5 },
    { id: 'BK-1004', title: 'Clean Code', author: 'Robert C. Martin', category: 'Technology', isbn: '9780132350884', quantity: 7, availableQuantity: 7 },
    { id: 'BK-1005', title: 'The Silent Patient', author: 'Alex Michaelides', category: 'Fiction', isbn: '9781250301697', quantity: 5, availableQuantity: 3 },
    { id: 'BK-1006', title: 'Educated', author: 'Tara Westover', category: 'Biography', isbn: '9780399590504', quantity: 4, availableQuantity: 4 },
  ],
  members: [
    { id: 'MB-2041', name: 'Aarav Mehta', email: 'aarav.mehta@campus.edu', phone: '+1 415 555 0182', membershipDate: offsetDate(-180) },
    { id: 'MB-2042', name: 'Sofia Bennett', email: 'sofia.bennett@campus.edu', phone: '+1 415 555 0146', membershipDate: offsetDate(-122) },
    { id: 'MB-2043', name: 'Noah Kim', email: 'noah.kim@campus.edu', phone: '+1 415 555 0193', membershipDate: offsetDate(-88) },
    { id: 'MB-2044', name: 'Maya Patel', email: 'maya.patel@campus.edu', phone: '+1 415 555 0160', membershipDate: offsetDate(-41) },
  ],
  transactions: [
    { id: 'TX-3001', bookId: 'BK-1001', memberId: 'MB-2041', issueDate: offsetDate(-8), expectedReturnDate: offsetDate(6), returnDate: '', status: 'Issued' },
    { id: 'TX-3002', bookId: 'BK-1002', memberId: 'MB-2042', issueDate: offsetDate(-4), expectedReturnDate: offsetDate(10), returnDate: '', status: 'Issued' },
    { id: 'TX-3003', bookId: 'BK-1005', memberId: 'MB-2043', issueDate: offsetDate(-18), expectedReturnDate: offsetDate(-4), returnDate: offsetDate(-5), status: 'Returned' },
    { id: 'TX-3004', bookId: 'BK-1003', memberId: 'MB-2044', issueDate: offsetDate(-2), expectedReturnDate: offsetDate(12), returnDate: '', status: 'Issued' },
  ],
}

export function readStorage() {
  const data = {}
  for (const [name, key] of Object.entries(KEYS)) {
    try {
      data[name] = JSON.parse(localStorage.getItem(key) || 'null') ?? demoData[name]
    } catch {
      data[name] = demoData[name]
    }
  }
  return data
}

export function initializeStorage() {
  const data = readStorage()
  for (const [name, key] of Object.entries(KEYS)) {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify(data[name]))
  }
  return data
}

export function persistStorage(data) {
  for (const [name, key] of Object.entries(KEYS)) {
    localStorage.setItem(key, JSON.stringify(data[name]))
  }
}

export function createId(prefix) {
  const suffix = globalThis.crypto?.randomUUID?.().slice(0, 8).toUpperCase() || Math.random().toString(36).slice(2, 10).toUpperCase()
  return `${prefix}-${suffix}`
}

export function currentDate() {
  return today()
}
