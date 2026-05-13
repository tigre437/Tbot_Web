import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import logoImg from '../assets/logo256.png'
import './PaymentStatus.css'

export default function PaymentStatus({ status }) {
    const { t } = useLanguage()
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
                    <h2>{t('payment.processing_title')}</h2>
                    <p>{t('payment.processing_desc')}</p>
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
                    {status === 'success' ? t('payment.success_title') : t('payment.cancel_title')}
                </h1>

                <p className="payment-status__message">
                    {status === 'success' 
                        ? t('payment.success_desc')
                        : t('payment.cancel_desc')
                    }
                </p>

                {status === 'success' && (
                    <div className="payment-status__features">
                        <div className="payment-status__feature">
                            <Sparkles size={16} /> {t('dashboard.modal.features.tickets')}
                        </div>
                        <div className="payment-status__feature">
                            <Sparkles size={16} /> {t('dashboard.modal.features.arrival')}
                        </div>
                        <div className="payment-status__feature">
                            <Sparkles size={16} /> {t('dashboard.modal.features.voice')}
                        </div>
                    </div>
                )}

                <div className="payment-status__actions">
                    <Link to="/dashboard" className="btn btn-primary">
                        {t('payment.go_dashboard')} <ArrowRight size={16} />
                    </Link>
                    {status === 'cancel' && (
                        <Link to="/" className="btn btn-secondary">
                            {t('payment.go_home')}
                        </Link>
                    )}
                </div>
                
                <img src={logoImg} alt="TBot" className="payment-status__logo" />
            </div>
        </div>
    )
}
