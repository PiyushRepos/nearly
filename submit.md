# Submission — nearly.

---

## Documentation

**Nearly** is a full-stack hyperlocal home-services marketplace. Customers can discover verified local professionals (plumbers, electricians, cleaners, etc.), book a time slot, track job progress in real time, pay securely, and leave reviews — all in one place.

### Roles

**Customer**

- Browse service categories and provider profiles (ratings, reviews, hourly rate)
- Book a service with date, time, address, and optional notes/photo
- Live booking timeline: Requested → Confirmed → In Progress → Completed
- Pay for completed jobs via Razorpay (order + signature verification)
- Leave a review after payment (one per booking, blocked once submitted)
- View full payment history and all submitted reviews

**Provider (Professional)**

- Set up a profile: bio, city/area, hourly rate, service categories, cover photo, verification documents
- Accept or reject incoming booking requests
- Update job progress with notes and photos during the job
- Mark jobs as complete
- View earnings history and all received reviews with average rating

**Admin**

- Platform stats dashboard (bookings by status, user counts, pending approvals)
- Approve or reject provider registrations
- Manage service categories
- Moderate reviews (approve / flag)
- Browse all users

---

## Project Approach

The goal was to build a production-quality multi-sided marketplace from scratch, with a clean separation between roles and a focus on real user flows rather than just UI mockups.

**Architecture decisions:**

- Monorepo with `frontend/` and `backend/` as separate packages, each with their own dependencies and scripts
- REST API on Express, with route-level auth middleware (`requireAuth` + `requireRole`) so every endpoint is protected at the correct role boundary
- Drizzle ORM for type-safe SQL queries against PostgreSQL — schema-first approach so the DB structure is the single source of truth
- Better Auth for session management — handles signup, login, and session cookies without rolling custom JWT logic
- SWR on the frontend for all data fetching — gives automatic revalidation, background refresh, and loading/error states for free
- React Hook Form + Zod for all forms — validation runs both client-side and server-side (Zod schemas are shared in spirit, with separate schemas on each layer)
- Razorpay's two-step flow: the backend creates an order and the client verifies with HMAC signature validation — payment confirmation cannot be spoofed
- Cloudinary for all image uploads (provider cover photos, booking attachments, work update photos) so binary data never touches the main server

**Development flow:**
Built role by role — customer booking flow first, then provider job management, then admin, then cross-cutting concerns (reviews, payments history, notifications). Each feature was implemented end-to-end (DB schema → controller → route → frontend page) before moving to the next.

---

## Project Learnings

- **React Compiler breaks third-party hooks** — `babel-plugin-react-compiler` aggressively memoizes components and silently breaks hooks like `react-day-picker` and `form.watch()`. Learned to opt out with `"use no memo"` and swap `watch()` for `useWatch()` so the compiler sees stable hook calls.

- **pnpm strict hoisting can duplicate React** — pnpm's non-flat `node_modules` created two separate React instances at runtime, causing "Invalid hook call" errors. Fixed by adding `resolve.dedupe: ["react", "react-dom"]` in Vite config.

- **Role-scoped API prefixes > single endpoint with role checks** — separating routes into `/customer/bookings` and `/provider/bookings` made access control explicit, self-documenting, and impossible to accidentally cross — much cleaner than conditionals inside a shared handler.

- **Derive display state from data, not DB messages** — when a stored update message like "Please pay to close the booking" becomes stale after payment, migrating rows is overkill. Rewriting the display string on the frontend based on `paymentStatus` is simpler and keeps the DB clean.

- **End-to-end feature slices beat horizontal layers** — building each feature fully (schema → controller → route → page) before moving on made it easier to validate the flow early and avoid integration surprises later.

---

## Tech Stack

| Layer                     | Technology                      |
| ------------------------- | ------------------------------- |
| **Frontend framework**    | React 19 + TypeScript           |
| **Build tool**            | Vite 7                          |
| **Styling**               | Tailwind CSS v4                 |
| **UI components**         | shadcn/ui (Radix UI primitives) |
| **Routing**               | React Router v7                 |
| **Data fetching**         | SWR + Axios                     |
| **Forms & validation**    | React Hook Form + Zod           |
| **Animations**            | Motion (Framer Motion)          |
| **Backend**               | Node.js + Express               |
| **ORM**                   | Drizzle ORM                     |
| **Database**              | PostgreSQL                      |
| **Authentication**        | Better Auth                     |
| **Payments**              | Razorpay                        |
| **File storage**          | Cloudinary                      |
| **Deployment — frontend** | Vercel                          |
| **Deployment — backend**  | Railway                         |
| **Deployment — database** | Neon (serverless Postgres)      |
