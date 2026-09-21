import {
  MOCK_SERVICES,
  MOCK_HOSPITALS,
  MOCK_PRICES,
  MOCK_DOCTORS,
  MOCK_REVIEWS,
  MOCK_USERS,
} from './mockData.js'

// In-memory state for mock sessions
let servicesState = [...MOCK_SERVICES]
let hospitalsState = [...MOCK_HOSPITALS]
let pricesState = [...MOCK_PRICES]
let doctorsState = [...MOCK_DOCTORS]
let reviewsState = [...MOCK_REVIEWS]
let usersState = [...MOCK_USERS]

let appointmentsState = [
  {
    id: 101,
    userId: 2,
    patientName: 'Demo Patient',
    patientEmail: 'demo@medicompare.in',
    patientPhone: '+91-9123456789',
    hospitalId: 1,
    hospitalName: 'City Hospital & Research Centre',
    doctorId: 1,
    doctorName: 'Dr. Rajesh Sharma',
    serviceId: 1,
    serviceName: 'MRI Scan',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM',
    status: 'CONFIRMED',
    totalAmount: 3800.0,
    createdAt: new Date().toISOString(),
  },
]

let paymentsState = [
  {
    id: 501,
    appointmentId: 101,
    userId: 2,
    razorpayOrderId: 'order_mock_101',
    razorpayPaymentId: 'pay_mock_991823',
    amount: 3800.0,
    status: 'PAID',
    createdAt: new Date().toISOString(),
  },
]

export function handleMockRequest(config) {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()
  const params = config.params || {}
  const data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {})

  console.log(`[Mock API] ${method.toUpperCase()} ${url}`, params, data)

  // 1. Auth
  if (url === '/auth/login' && method === 'post') {
    const { email, password } = data
    if (email === 'admin@medicompare.in' && (password === 'Admin@123' || password)) {
      return response(200, {
        accessToken: 'mock-admin-jwt-token',
        userId: 1,
        email: 'admin@medicompare.in',
        fullName: 'System Admin',
        role: 'ROLE_ADMIN',
      })
    }
    const user = usersState.find((u) => u.email.toLowerCase() === (email || '').toLowerCase())
    return response(200, {
      accessToken: 'mock-user-jwt-token',
      userId: user ? user.id : 2,
      email: email || 'demo@medicompare.in',
      fullName: user ? user.fullName : 'Demo Patient',
      role: user ? user.role : 'ROLE_PATIENT',
    })
  }

  if (url === '/auth/register' && method === 'post') {
    const newUser = {
      id: usersState.length + 1,
      fullName: data.fullName || 'New User',
      email: data.email,
      phone: data.phone || '',
      role: 'ROLE_PATIENT',
      active: true,
    }
    usersState.push(newUser)
    return response(200, {
      accessToken: 'mock-user-jwt-token-' + newUser.id,
      userId: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: 'ROLE_PATIENT',
    })
  }

  // 2. Hospitals
  if (url === '/hospitals' && method === 'get') {
    let list = [...hospitalsState]
    if (params.city) {
      list = list.filter((h) => h.city.toLowerCase() === params.city.toLowerCase())
    }
    if (params.query) {
      const q = params.query.toLowerCase()
      list = list.filter((h) => h.name.toLowerCase().includes(q) || h.locality.toLowerCase().includes(q) || h.specialties.toLowerCase().includes(q))
    }
    const size = Number(params.size) || 10
    const page = Number(params.page) || 0
    const paged = list.slice(page * size, (page + 1) * size)
    return response(200, {
      content: paged,
      totalPages: Math.ceil(list.length / size) || 1,
      totalElements: list.length,
    })
  }

  if (url.match(/^\/hospitals\/\d+$/) && method === 'get') {
    const id = Number(url.split('/')[2])
    const hospital = hospitalsState.find((h) => h.id === id)
    if (!hospital) return response(404, { message: 'Hospital not found' })

    // Include hospital's priced services
    const hospitalPricings = pricesState.filter((p) => p.hospitalId === id)
    const services = hospitalPricings.map((p) => {
      const s = servicesState.find((srv) => srv.id === p.medicalServiceId)
      return {
        id: p.medicalServiceId,
        serviceId: p.medicalServiceId,
        serviceName: s ? s.name : 'Medical Service',
        category: s ? s.category : 'General',
        price: p.price,
        available: p.available,
      }
    })

    return response(200, { ...hospital, hospitalServices: services })
  }

  if (url.match(/^\/hospitals\/\d+\/doctors$/) && method === 'get') {
    const id = Number(url.split('/')[2])
    let docs = doctorsState.filter((d) => d.hospitalId === id)
    if (docs.length === 0) {
      docs = doctorsState.slice(0, 2)
    }
    return response(200, docs)
  }

  if (url.match(/^\/hospitals\/\d+\/slots$/) && method === 'get') {
    const dates = [0, 1, 2, 3].map((offset) => {
      const d = new Date()
      d.setDate(d.getDate() + offset)
      return d.toISOString().split('T')[0]
    })
    const timeSlots = ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM']
    const slots = []
    let idCounter = 1000
    dates.forEach((date) => {
      timeSlots.forEach((slot) => {
        slots.push({
          id: idCounter++,
          date,
          timeSlot: slot,
          status: 'AVAILABLE',
        })
      })
    })
    return response(200, slots)
  }

  // 3. Price Comparison
  if (url === '/compare' && method === 'get') {
    const serviceQuery = (params.service || 'MRI Scan').toLowerCase()
    const targetService = servicesState.find((s) => s.name.toLowerCase() === serviceQuery || s.name.toLowerCase().includes(serviceQuery)) || servicesState[0]

    let hospitalPricings = pricesState.filter((p) => p.medicalServiceId === targetService.id && p.available)
    if (params.city) {
      const cityHospitals = hospitalsState.filter((h) => h.city.toLowerCase() === params.city.toLowerCase()).map((h) => h.id)
      hospitalPricings = hospitalPricings.filter((p) => cityHospitals.includes(p.hospitalId))
    }

    let results = hospitalPricings.map((p) => {
      const h = hospitalsState.find((hosp) => hosp.id === p.hospitalId) || hospitalsState[0]
      return {
        hospitalId: h.id,
        hospitalName: h.name,
        city: h.city,
        locality: h.locality,
        rating: h.rating,
        reviewCount: h.reviewCount,
        price: p.price,
        verified: h.verified,
        available: h.available,
      }
    })

    if (params.sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating)
    } else if (params.sortBy === 'price_desc') {
      results.sort((a, b) => b.price - a.price)
    } else {
      results.sort((a, b) => a.price - b.price)
    }

    const lowestPrice = results.length > 0 ? Math.min(...results.map((r) => r.price)) : 0

    return response(200, {
      serviceId: targetService.id,
      serviceName: targetService.name,
      category: targetService.category,
      description: targetService.description,
      lowestPrice,
      results,
    })
  }

  // 4. Appointments
  if (url === '/appointments' && method === 'post') {
    const newAppointment = {
      id: appointmentsState.length + 101,
      userId: 2,
      patientName: data.patientName || 'Demo Patient',
      patientEmail: data.patientEmail || 'demo@medicompare.in',
      patientPhone: data.patientPhone || '+91-9123456789',
      hospitalId: data.hospitalId,
      hospitalName: (hospitalsState.find((h) => h.id === data.hospitalId) || {}).name || 'Partner Hospital',
      doctorId: data.doctorId,
      doctorName: (doctorsState.find((d) => d.id === data.doctorId) || {}).name || 'Specialist Doctor',
      serviceId: data.serviceId,
      serviceName: (servicesState.find((s) => s.id === data.serviceId) || {}).name || 'Medical Service',
      appointmentDate: data.slotDate || new Date().toISOString().split('T')[0],
      timeSlot: data.timeSlot || '10:00 AM',
      status: 'PENDING_PAYMENT',
      totalAmount: data.amount || 3800.0,
      createdAt: new Date().toISOString(),
    }
    appointmentsState.push(newAppointment)
    return response(200, newAppointment)
  }

  if (url === '/appointments/me' && method === 'get') {
    return response(200, appointmentsState)
  }

  if (url.match(/^\/appointments\/\d+$/) && method === 'get') {
    const id = Number(url.split('/')[2])
    const appt = appointmentsState.find((a) => a.id === id) || appointmentsState[0]
    return response(200, appt)
  }

  if (url.match(/^\/appointments\/\d+\/cancel$/) && method === 'post') {
    const id = Number(url.split('/')[2])
    const appt = appointmentsState.find((a) => a.id === id)
    if (appt) appt.status = 'CANCELLED'
    return response(200, { message: 'Appointment cancelled' })
  }

  // 5. Payments
  if (url === '/payments/create-order' && method === 'post') {
    const apptId = data.appointmentId
    const appt = appointmentsState.find((a) => a.id === apptId)
    return response(200, {
      razorpayOrderId: 'order_mock_' + apptId,
      amount: appt ? appt.totalAmount : 3800.0,
      currency: 'INR',
      keyId: 'rzp_test_mock',
    })
  }

  if (url === '/payments/verify' && method === 'post') {
    const apptId = data.appointmentId || 101
    const appt = appointmentsState.find((a) => a.id === apptId)
    if (appt) appt.status = 'CONFIRMED'

    const payment = {
      id: paymentsState.length + 501,
      appointmentId: apptId,
      userId: 2,
      razorpayOrderId: data.razorpayOrderId || ('order_mock_' + apptId),
      razorpayPaymentId: data.razorpayPaymentId || ('pay_mock_' + Date.now()),
      amount: appt ? appt.totalAmount : 3800.0,
      status: 'PAID',
      createdAt: new Date().toISOString(),
    }
    paymentsState.push(payment)
    return response(200, payment)
  }

  if (url === '/payments/me' && method === 'get') {
    return response(200, paymentsState)
  }

  // 6. Invoices
  if (url.match(/^\/invoices\/appointment\/\d+$/) && method === 'get') {
    const apptId = Number(url.split('/').pop())
    const appt = appointmentsState.find((a) => a.id === apptId) || appointmentsState[0]
    return response(200, {
      invoiceNumber: 'INV-' + apptId + '-2026',
      issueDate: new Date().toISOString().split('T')[0],
      patientName: appt.patientName,
      hospitalName: appt.hospitalName,
      serviceName: appt.serviceName,
      doctorName: appt.doctorName,
      appointmentDate: appt.appointmentDate,
      timeSlot: appt.timeSlot,
      amount: appt.totalAmount,
      status: 'PAID',
    })
  }

  // 7. Reviews
  if (url.match(/^\/reviews\/hospital\/\d+$/) && method === 'get') {
    const hospId = Number(url.split('/').pop())
    const revs = reviewsState.filter((r) => r.hospitalId === hospId && r.approved)
    return response(200, revs)
  }

  if (url === '/reviews' && method === 'post') {
    const newRev = {
      id: reviewsState.length + 1,
      hospitalId: data.hospitalId,
      userName: data.userName || 'Verified Patient',
      rating: data.rating || 5,
      comment: data.comment,
      createdAt: new Date().toISOString().split('T')[0],
      approved: true,
    }
    reviewsState.push(newRev)
    return response(200, newRev)
  }

  // 8. User Profile
  if (url === '/users/me' && method === 'get') {
    return response(200, usersState[1] || usersState[0])
  }

  if (url === '/users/me' && method === 'put') {
    const u = usersState[1] || usersState[0]
    if (data.fullName) u.fullName = data.fullName
    if (data.phone) u.phone = data.phone
    return response(200, u)
  }

  if (url === '/users/me/password' && method === 'put') {
    return response(200, { message: 'Password updated successfully' })
  }

  // 9. Admin API Routes
  if (url === '/admin/dashboard' && method === 'get') {
    return response(200, {
      totalHospitals: hospitalsState.length,
      totalAppointments: appointmentsState.length,
      totalRevenue: paymentsState.reduce((acc, p) => acc + (p.amount || 0), 0),
      totalUsers: usersState.length,
      totalDoctors: doctorsState.length,
      totalServices: servicesState.length,
    })
  }

  if (url === '/admin/users' && method === 'get') {
    return response(200, usersState)
  }

  if (url.match(/^\/admin\/users\/\d+\/toggle-status$/) && method === 'put') {
    const id = Number(url.split('/')[3])
    const u = usersState.find((usr) => usr.id === id)
    if (u) u.active = !u.active
    return response(200, u)
  }

  if (url === '/admin/reviews' && method === 'get') {
    return response(200, reviewsState)
  }

  if (url.match(/^\/admin\/reviews\/\d+\/approval$/) && method === 'put') {
    const id = Number(url.split('/')[3])
    const rev = reviewsState.find((r) => r.id === id)
    if (rev) rev.approved = Boolean(params.approved)
    return response(200, rev)
  }

  if (url.match(/^\/admin\/reviews\/\d+$/) && method === 'delete') {
    const id = Number(url.split('/')[3])
    reviewsState = reviewsState.filter((r) => r.id !== id)
    return response(200, { message: 'Review deleted' })
  }

  if (url === '/admin/services' && method === 'get') {
    return response(200, servicesState)
  }

  if (url === '/admin/services' && method === 'post') {
    const newService = { id: servicesState.length + 1, ...data }
    servicesState.push(newService)
    return response(200, newService)
  }

  if (url.match(/^\/admin\/services\/\d+$/) && method === 'delete') {
    const id = Number(url.split('/')[3])
    servicesState = servicesState.filter((s) => s.id !== id)
    return response(200, { message: 'Service deleted' })
  }

  if (url.match(/^\/admin\/services\/prices\/\d+$/) && method === 'get') {
    const hospId = Number(url.split('/').pop())
    const plist = pricesState.filter((p) => p.hospitalId === hospId)
    return response(200, plist)
  }

  if (url.match(/^\/admin\/services\/\d+\/price\/\d+$/) && method === 'put') {
    const parts = url.split('/')
    const hospId = Number(parts[3])
    const srvId = Number(parts[5])
    let p = pricesState.find((pr) => pr.hospitalId === hospId && pr.medicalServiceId === srvId)
    if (!p) {
      p = { hospitalId: hospId, medicalServiceId: srvId, price: data.price, available: data.available !== false }
      pricesState.push(p)
    } else {
      p.price = data.price
      p.available = data.available !== false
    }
    return response(200, p)
  }

  if (url === '/admin/hospitals' && method === 'post') {
    const newH = { id: hospitalsState.length + 1, rating: 4.0, reviewCount: 0, available: true, verified: false, ...data }
    hospitalsState.push(newH)
    return response(200, newH)
  }

  if (url.match(/^\/admin\/hospitals\/\d+$/) && method === 'put') {
    const id = Number(url.split('/')[3])
    const hIdx = hospitalsState.findIndex((h) => h.id === id)
    if (hIdx !== -1) {
      hospitalsState[hIdx] = { ...hospitalsState[hIdx], ...data }
      return response(200, hospitalsState[hIdx])
    }
    return response(404, { message: 'Hospital not found' })
  }

  if (url.match(/^\/admin\/hospitals\/\d+$/) && method === 'delete') {
    const id = Number(url.split('/')[3])
    hospitalsState = hospitalsState.filter((h) => h.id !== id)
    return response(200, { message: 'Hospital deleted' })
  }

  if (url === '/admin/doctors' && method === 'get') {
    return response(200, doctorsState)
  }

  if (url === '/admin/doctors' && method === 'post') {
    const newDoc = { id: doctorsState.length + 1, ...data }
    doctorsState.push(newDoc)
    return response(200, newDoc)
  }

  if (url.match(/^\/admin\/doctors\/\d+$/) && method === 'delete') {
    const id = Number(url.split('/')[3])
    doctorsState = doctorsState.filter((d) => d.id !== id)
    return response(200, { message: 'Doctor deleted' })
  }

  if (url === '/admin/appointments' && method === 'get') {
    return response(200, appointmentsState)
  }

  if (url === '/admin/payments' && method === 'get') {
    return response(200, paymentsState)
  }

  if (url === '/admin/slots/generate' && method === 'post') {
    return response(200, { message: 'Generated slots successfully' })
  }

  // Fallback default response
  return response(200, [])
}

function response(status, data) {
  return {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'content-type': 'application/json' },
    config: {},
    data,
  }
}
