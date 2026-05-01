import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function AuthCallback() {
    const [params] = useSearchParams()
    const { setTokenAndUser } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const code = params.get('code')
        const token = params.get('token') // if backend sends token directly

        if (token) {
            // Backend redirected with token
            api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setTokenAndUser(token, res.data)
                navigate('/dashboard', { replace: true })
            }).catch(() => navigate('/', { replace: true }))
        } else if (code) {
            // Exchange code for token
            api.post('/auth/discord/callback', { code })
                .then(res => {
                    setTokenAndUser(res.data.token, res.data.user)
                    navigate('/dashboard', { replace: true })
                })
                .catch(() => navigate('/', { replace: true }))
        } else {
            navigate('/', { replace: true })
        }
    }, [])

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            color: 'var(--text-secondary)'
        }}>
            <div className="spinner" />
            <p style={{ fontSize: '0.95rem' }}>Iniciando sesión con Discord...</p>
        </div>
    )
}
