import axios from 'axios'
import { handleMockRequest } from './mockAdapter.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const axiosClient = axios.create({
  baseURL: API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mc_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Serve requests instantly via mock adapter when no live backend URL is set
  if (!import.meta.env.VITE_API_BASE_URL) {
    config.adapter = async (cfg) => {
      return handleMockRequest(cfg)
    }
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      try {
        const mockRes = handleMockRequest(error.config)
        return Promise.resolve(mockRes)
      } catch (mockErr) {
        console.error('[Mock API Error]', mockErr)
      }
    }

    if (error?.response?.status === 401) {
      localStorage.removeItem('mc_token')
      localStorage.removeItem('mc_user')
    }
    return Promise.reject(error)
  }
)

export default axiosClient


