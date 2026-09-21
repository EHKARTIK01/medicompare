import React, { createContext, useContext, useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('mc_user')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('mc_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('mc_user')
    }
  }, [user])

  async function login(email, password) {
    const { data } = await axiosClient.post('/auth/login', { email, password })
    localStorage.setItem('mc_token', data.accessToken)
    setUser(data)
    return data
  }

  async function register(fullName, email, password, phone) {
    const { data } = await axiosClient.post('/auth/register', { fullName, email, password, phone })
    localStorage.setItem('mc_token', data.accessToken)
    setUser(data)
    return data
  }

  function logout() {
    localStorage.removeItem('mc_token')
    localStorage.removeItem('mc_user')
    setUser(null)
  }

  const isAdmin = user?.role === 'ROLE_ADMIN'

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
