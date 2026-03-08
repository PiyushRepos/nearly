# nearly.

**Nearly** is a hyperlocal home-services marketplace that connects customers with verified local professionals — think plumbers, electricians, cleaners, and more — in just a few taps.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Project Overview

Nearly bridges the gap between customers who need household services and skilled professionals who provide them. Customers can browse verified professionals by category, book a time slot, track job progress in real time, pay securely via Razorpay, and leave reviews — all from a single clean interface.

Professionals get their own dashboard to manage incoming bookings, update job progress, and track earnings. An admin panel gives full oversight of users, providers, categories, and reviews.

---

## Features

### Customer

- **Browse & discover** service categories and local professionals with ratings
- **Book a service** — select a provider, pick a date/time, add address and notes
- **Real-time booking timeline** — track status from Requested → Confirmed → In Progress → Completed
- **Secure payments** via Razorpay (order creation + signature verification)
- **Leave reviews** for completed and paid bookings (one review per booking)
- **My Reviews** — view all reviews submitted, with provider and category details
- **Payment History** — full history of paid bookings with total spend summary
- **Cancel bookings** (when in Requested or Confirmed state)
- **In-app notifications** for booking updates

### Professional (Provider)

- **Profile setup** — bio, city/area, hourly rate, service categories, cover photo, documents upload
- **Booking management** — accept, reject, start, and complete jobs
- **Work updates** — add progress notes and photos during a job
- **Earnings page** — view all completed paid jobs with total earned summary
- **Reviews received** — see all customer reviews with average rating summary
- **In-app notifications** for new bookings and payments

### Admin

- **Dashboard** with platform-wide stats (bookings by status, user counts, pending approvals)
- **Provider approvals** — review and approve/reject provider registrations
- **Category management** — create and toggle service categories
- **Review moderation** — view, approve, and flag reviews
- **User management** — browse all customers and providers

### General

- **Authentication** via Better Auth (email/password, session management)
- **Role-based access control** — customer, provider, admin
- **Image uploads** to Cloudinary (profile photos, booking attachments, work update photos)
- **Responsive UI** — works on mobile and desktop

---

## Tech Stack

| Layer         | Technology                                             |
| ------------- | ------------------------------------------------------ |
| Frontend      | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui |
| Routing       | React Router v7                                        |
| Data fetching | SWR + Axios                                            |
| Forms         | React Hook Form + Zod                                  |
| Backend       | Node.js, Express                                       |
| ORM           | Drizzle ORM                                            |
| Database      | PostgreSQL                                             |
| Auth          | Better Auth                                            |
| Payments      | Razorpay                                               |
| File storage  | Cloudinary                                             |

---

## Setup Instructions

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- PostgreSQL database
- Razorpay account (for payments)
- Cloudinary account (for image uploads)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/nearly.git
cd nearly
```

---

### 2. Backend setup

```bash
cd backend
```

Create a `.env` file (see [Environment Variables](#environment-variables) below), then:

```bash
npm install

# Push the schema to your database
npm run db:push

# Seed service categories
npm run db:seed

# Start development server (runs on port 3000)
npm run dev
```

---

### 3. Frontend setup

```bash
cd frontend
pnpm install

# Start development server (runs on port 5173)
pnpm dev
```

The frontend proxies `/api` requests to `http://localhost:3000` in development.

---

### 4. Open the app

Navigate to [http://localhost:5173](http://localhost:5173).

- Sign up as a **customer** to book services.
- Sign up as a **provider**, complete profile setup, and wait for admin approval.
- The first user with role `admin` can be set directly in the database (`UPDATE "user" SET role = 'admin' WHERE email = 'your@email.com'`).

---

## Environment Variables

### Backend — `backend/.env`

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/nearly

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Frontend origin (for CORS)
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Server
PORT=3000
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:3000
```

---

## Deployment

**Live app:** [https://your-deployment-url.com](https://your-deployment-url.com)

**Recommended deployment targets:**

| Part     | Platform                           |
| -------- | ---------------------------------- |
| Frontend | Vercel / Netlify                   |
| Backend  | Railway / Render / Fly.io          |
| Database | Neon / Supabase / Railway Postgres |

### Production environment notes

- Set `BETTER_AUTH_URL` to your backend's public URL.
- Set `FRONTEND_URL` to your frontend's public URL (used for CORS).
- Set `VITE_API_URL` to your backend's public URL in the frontend build environment.
- Ensure your Razorpay keys are switched to **live** keys for production.
