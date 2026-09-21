import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/Home.jsx'
import HospitalSearch from './pages/HospitalSearch.jsx'
import HospitalListing from './pages/HospitalListing.jsx'
import HospitalDetails from './pages/HospitalDetails.jsx'
import ServiceComparison from './pages/ServiceComparison.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'

import UserDashboard from './pages/UserDashboard.jsx'
import MyAppointments from './pages/MyAppointments.jsx'
import AppointmentDetails from './pages/AppointmentDetails.jsx'
import PaymentHistory from './pages/PaymentHistory.jsx'
import Profile from './pages/Profile.jsx'
import Invoice from './pages/Invoice.jsx'

import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboardHome from './pages/admin/AdminDashboardHome.jsx'
import ManageHospitals from './pages/admin/ManageHospitals.jsx'
import ManageDoctors from './pages/admin/ManageDoctors.jsx'
import ManageMedicalServices from './pages/admin/ManageMedicalServices.jsx'
import ManagePrices from './pages/admin/ManagePrices.jsx'
import ManageAppointments from './pages/admin/ManageAppointments.jsx'
import ManageUsers from './pages/admin/ManageUsers.jsx'
import ManageReviews from './pages/admin/ManageReviews.jsx'
import PaymentManagement from './pages/admin/PaymentManagement.jsx'

function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="font-display text-4xl font-bold text-ink mb-2">404</p>
      <p className="text-ink/60">This page doesn't exist.</p>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<HospitalSearch />} />
          <Route path="/hospitals" element={<HospitalListing />} />
          <Route path="/hospitals/:id" element={<HospitalDetails />} />
          <Route path="/compare" element={<ServiceComparison />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Authenticated user */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
          <Route path="/appointments/:id" element={<ProtectedRoute><AppointmentDetails /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/invoice/:appointmentId" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboardHome /></ProtectedRoute>} />
          <Route path="/admin/hospitals" element={<ProtectedRoute adminOnly><ManageHospitals /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute adminOnly><ManageDoctors /></ProtectedRoute>} />
          <Route path="/admin/services" element={<ProtectedRoute adminOnly><ManageMedicalServices /></ProtectedRoute>} />
          <Route path="/admin/prices" element={<ProtectedRoute adminOnly><ManagePrices /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute adminOnly><ManageAppointments /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute adminOnly><ManageReviews /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute adminOnly><PaymentManagement /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
