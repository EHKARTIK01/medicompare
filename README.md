# MediCompare — Healthcare Price Transparency Platform

MediCompare lets patients compare hospital prices, ratings, and appointment availability, then book and pay for appointments online. 

Built as a lightweight, fast, standalone web application with built-in mock data for local demonstration.

## Architecture

```
React 18 (Vite) ──► In-Memory Mock API Adapter ──► Demo Datasets (Hospitals, Services, Doctors)
```

## Tech Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios
- **API Engine:** Client-side Mock Adapter (`mockAdapter.js` + `mockData.js`)
- **Payments:** Simulated Razorpay checkout flow
- **Maps:** Google Maps JavaScript API (with fallback UI)

## Project Layout

```
medicompare/
├── frontend/           React + Vite app
│   ├── src/pages, src/pages/admin, src/components, src/context
│   └── src/api         (axiosClient.js, mockAdapter.js, mockData.js)
├── docker-compose.yml  Frontend container configuration
└── README.md
```

## Running Locally

### Prerequisites
- Node.js 18+

### Quick Start

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at:
   **`http://localhost:5173`**

### Demo Login Accounts

| Role    | Email                  | Password  |
|---------|------------------------|-----------|
| Admin   | admin@medicompare.in   | Admin@123 |
| Patient | demo@medicompare.in    | Demo@123  |

---

## Features Included

- **Hospital & Service Search:** Search and filter hospitals by city, service, or pricing.
- **Price Comparison:** Compare healthcare service rates across different providers.
- **Appointment Booking:** Select doctors, date, and available time slots.
- **Payment Gateway Flow:** Simulated Razorpay order creation and payment verification.
- **Invoices & Reviews:** Instant invoice generation and patient review system.
- **Admin Dashboard:** Manage hospitals, doctors, medical services, appointments, users, and payments.

// CHANGE ARE THERE YOU HAVE TO CHANGE 