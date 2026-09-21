import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await login(email, password)
      navigate(res.role === 'ROLE_ADMIN' ? '/admin' : (location.state?.from || '/dashboard'))
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-ink mb-2">Welcome back</h1>
      <p className="text-ink/60 mb-8">Log in to manage your appointments and payments.</p>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-primary-100 rounded-2xl p-6">
        <div>
          <label className="text-xs text-ink/60 block mb-1">Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Password</label>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button disabled={loading} type="submit" className="w-full bg-primary-500 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-600 disabled:opacity-60">
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-ink/50 text-center mt-6">
        Don't have an account? <Link to="/register" className="text-primary-500 font-semibold">Sign up</Link>
      </p>
      <p className="text-xs text-ink/40 text-center mt-2">
        Demo account: demo@medicompare.in / Demo@123
      </p>
    </div>
  )
}
