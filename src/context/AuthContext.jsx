import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('tbot_token')
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            api.get('/auth/me')
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('tbot_token')
                    delete api.defaults.headers.common['Authorization']
                })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    const login = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/discord`
    }

    const logout = () => {
        localStorage.removeItem('tbot_token')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
    }

    const setTokenAndUser = (token, userData) => {
        localStorage.setItem('tbot_token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(userData)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setTokenAndUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
