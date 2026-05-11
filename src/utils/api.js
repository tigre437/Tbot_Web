import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    withCredentials: true,
    headers: {
        'ngrok-skip-browser-warning': 'true'
    }
})

// Request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log('🔍 API Request:', config.method?.toUpperCase(), config.url)
        console.log('🔍 Full URL:', config.baseURL + config.url)
        console.log('🔍 Headers:', config.headers)
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.status, response.config.url)
        return response
    },
    (error) => {
        console.log('❌ API Error:', error.response?.status, error.config?.url)
        if (error.response?.status === 401) {
            localStorage.removeItem('tbot_token')
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)

export default api
