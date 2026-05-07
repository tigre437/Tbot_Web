import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [paymentLoading, setPaymentLoading] = useState(false)

    // Handle returning from payment without page reload
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && paymentLoading) {
                // User returned to the tab, hide payment modal
                setPaymentLoading(false)
            }
        }

        const handleFocus = () => {
            if (paymentLoading) {
                // Window regained focus, hide payment modal
                setPaymentLoading(false)
            }
        }

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('focus', handleFocus)

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('focus', handleFocus)
        }
    }, [paymentLoading])

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

    const createPaymentSession = async (planType = 'monthly') => {
        try {
            setPaymentLoading(true)
            console.log('Creating payment session with plan type:', planType)
            console.log('Making request to:', '/payment/create-checkout-session')
            const response = await api.post('/payment/create-checkout-session', {
                plan_type: planType
            })
            console.log('Payment session created:', response.data)
            window.location.href = response.data.url
        } catch (error) {
            console.error('Error creating payment session:', error)
            console.error('Error response:', error.response)
            setPaymentLoading(false)
            throw error
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, paymentLoading, login, logout, setTokenAndUser, createPaymentSession }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
