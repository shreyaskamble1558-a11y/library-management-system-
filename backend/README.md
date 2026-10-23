# Library Management System API

A library management system API using Express, MongoDB, Mongoose, JWT and bcrypt.

## Features
- Admin and member authentication with role-specific JWTs
- Book and member management
- Book issue and return flow
- Transaction tracking and overdue detection
- Dashboard stats and recent transactions
- Seeded default admin account

## Quick start

1. Install dependencies:
   npm install
2. Start the server:
   npm run dev
3. Default admin login:
   Email: admin@library.com
   Password: Admin@123

## User accounts

Library members sign in with their member ID as their roll number and a password.
Create the member with an administrator bearer token using `POST /api/members`;
the request body must include the member's `password` (at least 8 characters).
Existing member credentials can be set or reset with `PUT /api/members/:id` and
a `password` field (at least 8 characters). Passwords are hashed before storage
and are never included in API responses.

Authentication endpoints:
- `POST /api/auth/admin/login` — `{ "email": "...", "password": "..." }`
- `POST /api/auth/user/login` — `{ "rollNo": "...", "password": "..." }`
- `GET /api/auth/user/me` — current member, searchable books, and that member's transactions
- The reader portal's book search uses the same MongoDB `Book` collection as the admin catalog.
- Admin book/member/issue/return actions use the protected `/api/books`, `/api/members`, and `/api/transactions` endpoints; readers can only read their own loans.

Admin-only API routes reject user-role tokens. User-role tokens cannot access the
books, members, transactions, or admin profile API routes.

## Environment variables
- PORT=5001
- MONGO_URI=
- JWT_SECRET=your_secret
- JWT_EXPIRE=7d

When MONGO_URI is empty, the server automatically starts an in-memory MongoDB instance for local development.
The root Vite app proxies `/api` requests to `http://localhost:5001` by default; set `VITE_API_TARGET` in the root environment to use a different backend URL.
