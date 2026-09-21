# MediCompare — Healthcare Price Transparency Platform

A final-year full-stack academic project. MediCompare lets patients compare hospital
prices, ratings and appointment availability, then book and pay for an appointment
online — built as a real layered application, not a demo landing page.

> **Data notice:** the seeded hospitals, prices and reviews are **illustrative demo
> data only** (see `backend/src/main/resources/data.sql`), not verified real-world
> provider pricing. Hospitals are marked `verified: false` throughout for this reason.

## Architecture

```
React (Vite)  ── REST/JSON ──►  Spring Boot API
                                     │
                        ┌────────────┼───────────────┐
                        ▼            ▼                ▼
                     MySQL        Redis          External APIs
                  (persistence)  (caching)     Google Maps · Razorpay
```

Backend layering: `controller → service → repository → entity`, with separate
`dto`, `security`, `config`, and `exception` packages. Controllers contain no
business logic — everything sits in the service layer.

## Tech stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios
- **Backend:** Java 17, Spring Boot 3, Spring Web, Spring Data JPA, Spring Security, JWT (jjwt), Bean Validation
- **Database:** MySQL 8
- **Cache:** Redis (hospital search, hospital details, price comparison results)
- **Payments:** Razorpay, with a safe **mock payment mode** for local/demo use
- **Maps:** Google Maps JavaScript API, with a graceful fallback UI when no API key is configured

## Project layout

```
medicompare/
├── backend/            Spring Boot API (Maven project)
│   ├── src/main/java/com/medicompare/
│   │   ├── entity/ repository/ dto/ service/ controller/
│   │   ├── security/ config/ exception/ util/
│   ├── src/main/resources/
│   │   ├── application.yml   (all config via env vars — no hardcoded secrets)
│   │   ├── schema.sql        (reference schema — Hibernate creates tables automatically)
│   │   └── data.sql          (59 demo hospitals, 13 services, 767 prices, 150 doctors)
│   └── .env.example
├── frontend/           React + Vite app
│   ├── src/pages, src/pages/admin, src/components, src/context, src/api
│   └── .env.example
├── docker-compose.yml  MySQL + Redis + backend + frontend, for local/demo use
└── README.md
```

## Running locally

### 1. Backend

Prerequisites: JDK 17+, Maven, a running MySQL 8 instance, a running Redis instance.

```bash
cd backend
cp .env.example .env      # then edit values, or export them directly
# Load the env vars into your shell, e.g.:
export $(grep -v '^#' .env | xargs)

# First run only — create the demo dataset:
# set SQL_INIT_MODE=always for the first run, then switch back to "never"
mvn spring-boot:run
```

The API starts on `http://localhost:8080`. Swagger UI is available at
`http://localhost:8080/swagger-ui.html`.

On first startup, a demo admin and patient account are seeded automatically
(via `DataSeeder`, using real bcrypt hashing — never a hardcoded hash):

| Role    | Email                  | Password  |
|---------|------------------------|-----------|
| Admin   | admin@medicompare.in   | Admin@123 |
| Patient | demo@medicompare.in    | Demo@123  |

**Change or remove these before any non-local deployment.**

### 2. Frontend

Prerequisites: Node.js 18+.

```bash
cd frontend
cp .env.example .env.local   # set VITE_API_BASE_URL and (optionally) VITE_GOOGLE_MAPS_API_KEY
npm install
npm run dev
```

Runs on `http://localhost:5173`.

### 3. Or run everything with Docker Compose

```bash
cp backend/.env.example backend/.env   # edit DB_PASSWORD / JWT_SECRET
docker compose up --build
```

## Environment variables (no secrets are hardcoded anywhere in the code)

See `backend/.env.example` and `frontend/.env.example` for the full list. Key ones:

- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` — MySQL connection
- `REDIS_HOST`, `REDIS_PORT` — Redis connection
- `JWT_SECRET` — must be a long random string in any real deployment
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — leave blank to stay in **mock payment mode**
- `VITE_GOOGLE_MAPS_API_KEY` — leave blank to show the labelled map fallback instead of a live map

## Key design decisions

- **Price comparison** is the core feature: `hospital_services` is a join table of
  `(hospital, medical_service) → price`, queried and sorted server-side, then cached
  in Redis for 5 minutes per `(service, city, sort)` combination.
- **Double-booking prevention:** booking a slot takes a pessimistic write lock
  (`SELECT ... FOR UPDATE`) on the `appointment_slots` row inside a transaction, so
  two concurrent requests for the same slot can't both succeed.
- **Payments are never trusted from the frontend.** The backend independently
  verifies the Razorpay signature (`Utils.verifyPaymentSignature`) before marking a
  payment as `PAID` and confirming the appointment. In mock mode the same code path
  runs against a simulated order/signature instead of hitting Razorpay.
- **Role-based access:** JWTs carry the user's role; `/api/admin/**` is restricted to
  `ROLE_ADMIN` at the Spring Security filter-chain level, not just in the UI.
- **No entities leak sensitive/circular data:** `User.passwordHash` is `@JsonIgnore`d,
  and bidirectional collections (`Hospital.doctors`, `Hospital.reviews`,
  `Hospital.hospitalServices`, `User.appointments`) are `@JsonIgnore`d to avoid
  infinite recursion when entities are serialized directly from a few simple
  admin endpoints.

## What's included

Implemented end-to-end: auth (patient + admin), hospital search/listing/details,
price comparison with sort/filter, appointment booking with real slot locking,
Razorpay integration with mock mode and server-side verification, a Razorpay
**webhook** backstop (`/api/webhooks/razorpay`, no-ops safely if no webhook
secret is configured), invoices, reviews, profile editing and password change,
and a full admin panel — hospitals, **doctors**, services, prices, appointments,
users, reviews, payments, and dashboard stats — with **client-side pagination**
on every admin table.

**Bookable slots:** `data.sql` seeds ~9,000 appointment slots across all doctors
for the days following whenever the seed script was generated, so the booking
flow works immediately after a fresh install. Since these dates are static SQL,
they'll eventually run out. Two safety nets handle that: `DataSeeder` runs at
every startup and automatically generates the next 7 days of slots for any
doctor with no upcoming availability left, and admins can also generate slots
for any doctor and date range on demand from **Admin → Doctors → Generate
slots**, which calls `POST /api/admin/slots/generate` (backed by `SlotService`).

**Email notifications:** booking confirmations and cancellations are sent via
`EmailNotificationService`. If `MAIL_HOST` isn't set, it falls back to logging the
email content instead of sending it — the same mock-mode pattern used for
payments, so nothing needs SMTP credentials to demo end-to-end.

Deliberately left simple for a student project: refund flows beyond marking a
payment `REFUNDED` in the enum, SMS notifications, and server-side pagination
(the admin tables paginate client-side, which is fine at this data scale but
wouldn't be the choice for a much larger dataset).
