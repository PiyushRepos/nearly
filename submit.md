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

- **React Compiler compatibility** — `babel-plugin-react-compiler` aggressively memoizes components and breaks third-party hooks (react-day-picker's `DayPicker`, react-hook-form's `form.watch()`). The fix is to use the `"use no memo"` directive in affected files and replace `watch()` with `useWatch()` from react-hook-form so the compiler sees stable hook calls.

- **pnpm + duplicate React** — pnpm's strict hoisting can create multiple React instances, which breaks the Rules of Hooks. Adding `resolve.dedupe: ["react", "react-dom"]` in Vite config forces a single instance across all packages.

- **Drizzle ORM self-joins** — joining the same table twice in one query (e.g. joining `user` for both a customer name and a provider name) requires aliasing. Drizzle handles this cleanly by assigning the table to a variable.

- **Stateless update messages** — provider job updates stored in the DB say "Please pay to close the booking" even after payment is made. Rather than migrating old rows, the cleanest fix was to rewrite the display string on the frontend based on `paymentStatus`, keeping the DB clean.

- **Role-scoped API design** — using separate prefixes (`/customer/bookings` vs `/provider/bookings`) instead of a single `/bookings` endpoint with role checks makes permissions explicit, prevents accidental cross-role data access, and makes the routes self-documenting.

- **Zod v4 breaking change** — the project uses Zod v4 on the frontend and Zod v3 on the backend (pulled in by Better Auth). They coexist fine as separate packages but cannot share schema definitions directly. Kept validation schemas duplicated intentionally.

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
