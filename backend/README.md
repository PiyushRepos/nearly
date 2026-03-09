# nearly. Backend API

This is the Express.js and Node.js backend API for **nearly.**, a hyperlocal home-services marketplace. The server handles everything from RESTful API endpoints and authentication to secure payment processing, file uploads, geolocation searches, and real-time websockets.

---

## 🚀 Tech Stack

- **Runtime:** Node.js (v20+)
- **Framework:** Express.js 4
- **Database:** PostgreSQL (Neon / Supabase)
- **ORM:** Drizzle ORM
- **Authentication:** Better Auth
- **Real-time WebSockets:** Socket.io
- **Payments:** Razorpay
- **File Uploads:** Cloudinary + Multer
- **Validation:** Zod
- **Security:** Helmet, CORS
- **Logging:** Morgan

---

## 🛠 Project Structure

```bash
backend/
├── src/
│   ├── config/          # Centralized configuration (db, auth, cloudinary)
│   ├── controllers/     # Route logic separated by domain model
│   ├── db/              # Drizzle ORM config and Postgres schema definition
│   ├── lib/             # Utility functions and WebSocket initialization
│   ├── middleware/      # Express middlewares (auth roles, error handlers, uploads)
│   ├── routes/          # Express route definitions
│   ├── scripts/         # Seed scripts for the database
│   └── index.js         # Entry point for the Express app and Socket.io server
├── .env.example         # Example environment variables required
├── drizzle.config.js    # Drizzle Kit CLI configuration
└── package.json         # Dependencies and scripts workflows
```

---

## 📦 Setting Up the Environment

### 1. Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v20 or higher)
- pnpm (Active package manager)
- A PostgreSQL database URL

### 2. Environment Variables
Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
cp .env.example .env
```

Your `.env` should look something like this:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/nearly

# Better Auth Configuration 
BETTER_AUTH_SECRET=your-secret-key-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3000

# CORS Support
FRONTEND_URL=http://localhost:5173

# Cloudinary (Profile Pictures, Work Attachments)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (Payment Gateway)
RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Server
PORT=3000
```

---

## 🔄 Database Commands (Drizzle)

This project relies on **Drizzle ORM**. Instead of writing raw SQL schema migrations for every change, you declare your schema exclusively in `src/db/schema.js` and push it.

```bash
# 1. Install dependencies
pnpm install

# 2. Push the schema to your Postgres Database
pnpm db:push

# 3. (Optional) Open Drizzle Studio to inspect database data visually
pnpm db:studio

# 4. Seed the database with the core Service Categories
pnpm db:seed

# 5. (Optional) Seed the database with fully mocked Provider Data
pnpm db:seed-mock
```

---

## ⚡ Running the Server

```bash
# Start the development server with live-reloading (--watch)
pnpm dev

# Start the production server
pnpm start
```
*The server will boot up and immediately attach the Socket.io WebSocket server to the same HTTP app.*

---

## 🔌 Core Features & Endpoints Breakdown

### 1. Authentication (`/api/auth`)
Handled automatically via [Better Auth](https://better-auth.com). It creates the Database sessions and validates user emails securely. Middlewares (`requireAuth`, `requireRole`) guard the protected endpoints securely.

### 2. Service Categories & Public Searching (`/api/categories`, `/api/providers`)
- Providers are fetched alongside their geolocation `latitude` and `longitude`.
- Uses raw `sql` Drizzle commands implementing the **Haversine Formula** to sort out and filter local providers accurately by Distance Radius straight from the Database querying engine.

### 3. Customer & Professional Bookings (`/api/customer/bookings`, `/api/provider/bookings`)
- Handled seamlessly through PostgreSQL SQL Transactions (`db.transaction()`) ensuring all states (Creating a booking + Generating the initial Progress Update) occur atomically or elegantly fail.

### 4. Real-time Messaging (`/api/messages` & Socket.io)
- **WebSockets** implementation connects to the `/socket.io/` default path namespace. 
- Users securely `socket.emit("joinBooking", bookingId)` which acts as private isolated Chat Rooms. Messages instantly broadcast out to `newMessage` on the client.
- The `messages.controller.js` guards historical messages strictly to the verified Customer & Provider associated.

### 5. Secure Payments (`/api/payments`)
- Configured heavily around secure `Razorpay` Order Creation rules. 
- Listens for `/verify` callbacks from the frontend which securely rebuilds the SHA256 HMAC Crypto string against your `RAZORPAY_KEY_SECRET` before marking things as "Paid" to combat spoofing.

### 6. Cloudinary Uploads (`/api/uploads`)
- Images natively parse via `multer` into memory buffers, and ship securely off to Cloudinary CDN returning secure `https` raw strings saved into the PostgreSQL `booking_updates` tables perfectly avoiding unmanaged file blob bloat on the server.

---

## 🕵️ Error Logging

The API contains a unified global generic error catcher at the bottom of the stack (`src/middleware/errorHandler.js`). Native Zod parsing issues, SQL constraints, or general application breaks funnel natively into clean `Error 500` JSON shapes without instantly crashing out the NodeJS runtime itself.
