import { useState, useEffect, createContext, useContext } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      api.get('/auth/profile')
        .then(response => {
          if (response.data.success) {
            setUser(response.data.user)
          } else {
            throw new Error('Profile fetch failed')
          }
        })
        .catch(() => {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    try {
      console.log('Frontend login attempt:', { email: credentials.email })
      const response = await api.post('/auth/login', credentials)
      console.log('Frontend login response:', response.data)
      
      const { success, accessToken, refreshToken, user } = response.data
      if (!success) {
        throw new Error(response.data.message || 'Login failed')
      }
      
      // Store tokens securely
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setUser(user)
      return response.data
    } catch (error) {
      console.error('Frontend login error:', error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      console.log('Frontend register attempt:', { email: userData.email })
      const response = await api.post('/auth/register', userData)
      console.log('Frontend register response:', response.data)
      
      const { success, accessToken, refreshToken, user } = response.data
      if (!success) {
        throw new Error(response.data.message || 'Registration failed')
      }
      
      // Store tokens securely
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setUser(user)
      return response.data
    } catch (error) {
      console.error('Frontend register error:', error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    }
  }

  if (loading) {
    return <div className="text-center py-5"><div className="loading-spinner"></div></div>
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}