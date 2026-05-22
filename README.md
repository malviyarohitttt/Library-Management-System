<!-- <p align="center">
  <a href="#" target="_blank"><img src="#" width="200" alt="logo" /></a>
</p> -->

<p align="center">
  <a href="#" target="_blank">Library Management System</a>
</p>

## Description

A simple backend-based **Library Management System** built using **NestJS, Prisma ORM, PostgreSQL, JWT Authentication, and Docker**.

This system follows a **librarian-managed workflow**, where only the librarian/admin can log in and manage the library. Members do not have direct access to the system.

The librarian can:

- Manage books
- Register members
- Issue books
- Return books
- View rental history
- Track book availability

---

## Features

- Librarian Authentication (JWT)
- Member Management
- Book Management
- Book Issue / Return
- Rental History Tracking
- Book Availability Management
- Duplicate Rental Prevention
- Member Blocking System
- Pagination & Search
- Swagger API Documentation
- Docker Support

---

## Tech Stack

- NestJS
- Prisma ORM
- PostgreSQL
- Docker
- JWT Authentication
- Swagger
- TypeScript

---

## Installation & Setup

```bash
git clone <repo-url>
cd library-management-system
npm install
```

Copy the contents of example.env to create .env in the root and update env variables to set server configuration to run.

```bash
cp .env.example .env

# Update this with your DATABASE_URL
DATABASE_URL=postgresql://postgres:admin@localhost:5432/"your_db_url"

#Update this with your REDIS_URI
REDIS_URI=redis://default:secret@redis:6379

# Update Jwt Secrate
JWT_SECRET="your_jwt_secrate"
```

First you need to run and initialize databases.

## Migrate/Sync Database Schema

```bash
# initialize the prisma schema
$ npx prisma init

# generate migration for new changes
$ npx prisma migrate dev --name init

# generate client with schema
$ npx prisma generate

# reset database
$ npx prisma migrate reset

# preview schema
$ npx prisma studio

# seed database
$ npx prisma db seed

```

## Test

```bash
# unit tests
$ npm run test
```

## Run the server in local machine

```bash
# development
$ npm run start:dev

# production
$ npm run start:prod
```

## API Documentation

```bash
# development
http://localhost:{PORT}/api

```

## 🔑 Default Credentials for Librarian

| Field    | Value                 |
| -------- | --------------------- |
| Email    | librarian@library.com |
| Password | Admin123!@#           |

# API Documentation

---

Base URL:

```bash
http://localhost:3000
```

Protected routes require:

```bash
Authorization: Bearer <token>
```

---

## Authentication & Authorization

### Login Librarian

`POST /auth/login`

Authenticate librarian and return JWT token.

**Request**

```json
{
  "email": "librarian@gmail.com",
  "password": "Admin123!@#"
}
```

---

### Logout Librarian

`POST /auth/logout`

Logout authenticated librarian.

---

## Librarian APIs

### Update Profile

`PATCH /librarian/update`

Update librarian profile details.

---

### Change Password

`POST /librarian/change-password`

Change librarian password.

---

### Authenticate Password

`POST /librarian/authenticate`

Verify password before sensitive actions.

---

## Member APIs

### Create Member

`POST /members`

Register a new library member.

Example Request:

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "9123456789",
  "address": "Indore, Madhya Pradesh"
}
```

---

### Get All Members

`GET /members`

Supports:

- Search
- Pagination

Query Example:

```bash
/members?search=rahul&page=1&limit=10
```

---

### Get Member By ID

`GET /members/:id`

Fetch member details.

---

### Update Member

`PATCH /members/:id`

Update member details.

---

### Delete Member

`DELETE /members/:id`

Delete a member.

---

### Block Member

`PATCH /members/:id/block`

Block a member from renting books.

---

### Member Rental History

`PATCH /members/:id/history`

Get rental history of a member.

---

## Book APIs

### Add Book

`POST /books`

Create a new book.

Example Request:

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "978-0-13-468599-1",
  "genre": "Technology",
  "description": "A handbook of agile software craftsmanship",
  "publishedYear": 2008,
  "totalCopies": 3
}
```

---

### Get All Books

`GET /books`

Supports:

- Search by title
- Search by author
- Pagination

Example:

```bash
/books?search=clean code&page=1&limit=10
```

---

### Get Book By ID

`GET /books/:id`

Fetch book details.

---

### Update Book

`PATCH /books/:id`

Update book details.

---

### Delete Book

`DELETE /books/:id`

Delete a book.

---

## Rental APIs

### Issue Book

`POST /rentals/issue`

Issue a book to a member.

Example Request:

```json
{
  "membershipId": "MEM-1001",
  "bookId": 1,
  "dueDays": 7
}
```

---

### Return Book

`PATCH /rentals/return/:rentalId`

Return an issued book.

---

### Get All Rentals

`GET /rentals`

Supports:

- Status filter
- Pagination

Available status:

- Issued
- Returned
- Overdue

Example:

```bash
/rentals?status=Issued&page=1&limit=10
```

---

### Get Overdue Rentals

`GET /rentals/overdue`

Fetch all overdue rentals.

---

### Get Member Rentals

`GET /rentals/member/:memberId`

Get rental records of a specific member.

Supports:

- Status filter
- Pagination

---

## 🔧 Business Rules

### Members

- `membershipId` is auto-generated as `MEM-1001`, `MEM-1002`, etc.
- `BLOCKED` members cannot rent books
- Phone number must be unique (10-digit Indian mobile)
- Cannot delete a member with active rentals

### Books

- `availableCopies` is set equal to `totalCopies` on creation
- `availableCopies` decrements on issue, increments on return
- Cannot delete a book with active rentals
- `availableCopies` can never go negative

### Rentals

- Max **3 active rentals** per member
- Same member cannot rent the same book twice simultaneously
- `dueDate` = `issueDate + dueDays`
- Overdue status is auto-updated when `dueDate < now`, by running "CRON" job in background
- Only `ISSUED` or `OVERDUE` rentals can be returned

---

## 🔒 Security Features

- JWT authentication (Bearer token)
- Passwords hashed
- Helmet HTTP security headers
- CORS protection
- Global ValidationPipe with whitelist
- Prisma parameterized queries (SQL injection safe)

---
