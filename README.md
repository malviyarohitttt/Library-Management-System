<!-- <p align="center">
  <a href="#" target="_blank"><img src="#" width="200" alt="logo" /></a>
</p> -->

<p align="center">
  <a href="#" target="_blank">Library Management System</a>
</p>

## Description

To be specified.

## Installation

_Note: Skip this section for docker based production deployment_

```bash
git clone <repo-url>
cd library-management-system
npm install
```

## Setup

Copy the contents of example.env to create .env in the root and update env variables to set server configuration to run.

```bash
cp .env.example .env
```

First you need to run and initialize databases.

> For non docker environment

`DATABASE_URL`, `REDIS_URI` in .env will be use to connect with databases, Please make sure you have correct connection uri here.

```bash
# development
$ npm run db:init

# production
$ npm run db:migrate:deploy
$ npm run db:seed
```

> For docker environment

_Note: If you already have running required database containers then you can follow same setup as mentioned above for non docker environment._

`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `REDIS_PORT`, `REDIS_PASSWORD` will be use to create database containers with authentication credential from .env, So make sure `DATABASE_URL` and `REDIS_URI` have exact same user, password and port for connection.

To run production database containers you need to set `POSTGRES_DATA_VOLUME` and `REDIS_DATA_VOLUME` value to be set in .env file to mount the volume into host machine.

```bash
# development
$ npm run dev:db
$ npm run db:init

# production
$ npm run prod:db
$ npm run db:migrate:deploy
$ npm run db:seed
```

For convenience to switch between docker environment to local environment & testing, Please create host entry in your machine with following:-

```
127.0.0.1 postgres
127.0.0.1 redis
```

## Run the server in docker container

```bash
# development
$ npm run dev
$ npm run dev:stop # To shut down containers

# production
$ npm run prod
$ npm run prod:stop # To shut down containers
```

## Run the server in local machine

```bash
# development
$ npm run start:dev

# production
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Migrate/Sync Database Schema

```bash
# initialize database - push schema, add constraints & seed database
$ npm run db:init

# preview schema
$ npm run db:studio

# seed database
$ npm run db:seed

# seed specific seed file into the database
$ npm run db:seed:only <name> # i.e. `npm run db:seed:only admin` to run prisma/seeds/admin.seed.ts

# add constraints in schema (Note: Not required, If not using `db:schema:push` on staging or production env)
$ npm run db:schema:constraints

# add constraints for the specific table
$ npm run db:schema:constraints:only <table name> # i.e. `npm run db:schema:constraints:only user` to add constraints into the user table

# generate client with schema
$ npm run db:client:generate

# push schema changes to the database without migration
$ npm run db:schema:push

# generate migration for new changes
$ npm run db:migration:create

# generate migration for new changes & deploy
$ npm run db:migrate:dev

# reset database
$ npm run db:migrate:reset

# deploy all migrations
$ npm run db:migrate:deploy
```

## Monitoring

To enable metrics server update `.env` file with below variables -

```bash
ENABLE_METRICS=true
METRICS_PORT=8080
METRICS_HOST=0.0.0.0
```

Copy `example.env` file & create `.env` file in `monitoring` directory. Then use below command to start/stop monitoring tools `Prometheus` & `Grafana`

```bash
# start
$ npm run monitoring

# stop
$ npm run monitoring:stop
```

To access `Grafana` & `Prometheus` navigate to below urls -

```bash
# Grafana
http://127.0.0.1:{GRAFANA_PORT}

# Prometheus
http://127.0.0.1:{PROMETHEUS_PORT}

```

## API Documentation

```bash
# development
http://localhost:{PORT}/api

```

## 🔑 Default Credentials (after seed)

| Field    | Value                 |
| -------- | --------------------- |
| Email    | librarian@library.com |
| Password | Admin123!@#           |

## 📋 API Examples

### Register Librarian

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rohit Librarian",
    "email": "rohit@library.com",
    "password": "Password123!@#!"
  }'
```

### Login

```bash
curl -X POST http://localhost:{PORT}/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "librarian@library.com",
    "password": "Admin123!@#"
  }'
# Response includes "token" — use it as Bearer token in all subsequent requests
```

### Register Member

```bash
curl -X POST http://localhost:{PORT}/members \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phone": "9876543210",
    "address": "Indore, MP"
  }'
# Response includes auto-generated "membershipId": "MEM-1001"
```

### Add Book

```bash
curl -X POST http://localhost:{PORT}/books \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "978-0-13-468599-1",
    "genre": "Technology",
    "publishedYear": 2008,
    "totalCopies": 3
  }'
```

### Issue Book

```bash
curl -X POST http://localhost:{PORT}/rentals/issue \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "membershipId": "MEM-1001",
    "bookId": 1,
    "dueDays": 7
  }'
```

### Return Book

```bash
curl -X PATCH http://localhost:{PORT}/rentals/return/1 \
  -H "Authorization: Bearer <token>"

```

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
- Overdue status is auto-updated when `dueDate < now`
- Only `ISSUED` or `OVERDUE` rentals can be returned

---

---

## 🔒 Security Features

- JWT authentication (Bearer token)
- Passwords hashed
- Helmet HTTP security headers
- CORS protection
- Global ValidationPipe with whitelist
- Prisma parameterized queries (SQL injection safe)

---
