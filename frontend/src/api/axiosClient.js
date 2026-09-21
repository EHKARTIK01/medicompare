import axios from 'axios'
import { handleMockRequest } from './mockAdapter.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mc_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If backend is offline or network error occurs, fall back gracefully to mock handlers
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      try {
        const mockRes = handleMockRequest(error.config)
        return Promise.resolve(mockRes)
      } catch (mockErr) {
        console.error('[Mock API Error]', mockErr)
      }
    }

    if (error?.response?.status === 401) {
      // token invalid/expired - clear local session; UI decides where to redirect
      localStorage.removeItem('mc_token')
      localStorage.removeItem('mc_user')
    }
    return Promise.reject(error)
  }
)

export default axiosClient

