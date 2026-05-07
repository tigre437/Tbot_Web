import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import logoImg from '../assets/logo256.png'
import './PaymentStatus.css'

export default function PaymentStatus({ status }) {
    const [searchParams] = useSearchParams()
    const [loading, setLoading] = useState(status === 'success')
    const sessionId = searchParams.get('session_id')

    useEffect(() => {
        if (status === 'success' && sessionId) {
            // Podríamos validar la sesión aquí con el backend si quisiéramos
            const timer = setTimeout(() => setLoading(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [status, sessionId])

    if (loading) {
        return (
            <div className="payment-status payment-status--loading">
                <div className="payment-status__card">
                    <Loader2 size={48} className="spin gradient-text" />
                    <h2>Procesando tu suscripción...</h2>
                    <p>Estamos activando tus funciones PRO. No cierres esta ventana.</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`payment-status payment-status--${status} page-enter`}>
            <div className="payment-status__glow" />
            <div className="payment-status__card">
                <div className="payment-status__icon">
                    {status === 'success' ? (
                        <CheckCircle2 size={64} color="var(--green)" />
                    ) : (
                        <XCircle size={64} color="var(--red)" />
                    )}
                </div>

                <h1 className="gradient-text">
                    {status === 'success' ? '¡Ya eres PRO!' : 'Pago Cancelado'}
                </h1>

                <p className="payment-status__message">
                    {status === 'success' 
                        ? 'Gracias por confiar en TBot. Todas las funciones premium han sido activadas para tu servidor.'
                        : 'El proceso de pago se ha cancelado. No se ha realizado ningún cargo en tu cuenta.'
                    }
                </p>

                {status === 'success' && (
                    <div className="payment-status__features">
                        <div className="payment-status__feature">
                            <Sparkles size={16} /> Paneles de tickets ilimitados
                        </div>
                        <div className="payment-status__feature">
                            <Sparkles size={16} /> Arrival Studio desbloqueado
                        </div>
                        <div className="payment-status__feature">
                            <Sparkles size={16} /> Canales de voz dinámicos
                        </div>
                    </div>
                )}

                <div className="payment-status__actions">
                    <Link to="/dashboard" className="btn btn-primary">
                        Ir al Dashboard <ArrowRight size={16} />
                    </Link>
                    {status === 'cancel' && (
                        <Link to="/" className="btn btn-secondary">
                            Volver al inicio
                        </Link>
                    )}
                </div>
                
                <img src={logoImg} alt="TBot" className="payment-status__logo" />
            </div>
        </div>
    )
}
