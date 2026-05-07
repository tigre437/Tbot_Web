import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, Crown, X } from 'lucide-react'
import api from '../utils/api'
import './SubscriptionWarning.css'

export default function SubscriptionWarning() {
    const [subscriptionStatus, setSubscriptionStatus] = useState(null)
    const [loading, setLoading] = useState(true)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        const fetchSubscriptionStatus = async () => {
            try {
                console.log('🔍 [SubscriptionWarning] Fetching subscription status...')
                const response = await api.get('/subscription/status')
                console.log('✅ [SubscriptionWarning] Status response:', response.data)
                setSubscriptionStatus(response.data)
            } catch (error) {
                console.error('❌ [SubscriptionWarning] Error fetching subscription status:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSubscriptionStatus()
    }, [])

    // Debug logs
    useEffect(() => {
        console.log('🔍 [SubscriptionWarning] Status:', subscriptionStatus)
        console.log('🔍 [SubscriptionWarning] Loading:', loading)
        console.log('🔍 [SubscriptionWarning] Dismissed:', dismissed)
        
        if (subscriptionStatus) {
            console.log('🔍 [SubscriptionWarning] Has subscription:', subscriptionStatus.has_subscription)
            console.log('🔍 [SubscriptionWarning] Auto renew:', subscriptionStatus.auto_renew)
            console.log('🔍 [SubscriptionWarning] Days until expiry:', subscriptionStatus.days_until_expiry)
            
            const shouldShow = (
                subscriptionStatus.has_subscription && 
                !subscriptionStatus.auto_renew && 
                subscriptionStatus.days_until_expiry < 15
            )
            
            console.log('🔍 [SubscriptionWarning] Should show warning:', shouldShow)
        }
    }, [subscriptionStatus, loading, dismissed])

    // Don't show if loading, dismissed, or no subscription, or auto-renew is enabled
    if (loading || dismissed || !subscriptionStatus || !subscriptionStatus.has_subscription || subscriptionStatus.auto_renew) {
        return null
    }

    // Show warning if subscription expires in less than 15 days
    if (subscriptionStatus.days_until_expiry >= 15) {
        return null
    }

    const daysLeft = subscriptionStatus.days_until_expiry
    const isUrgent = daysLeft <= 3

    return (
        <div className={`subscription-warning ${isUrgent ? 'subscription-warning--urgent' : ''}`}>
            <div className="subscription-warning__content">
                <div className="subscription-warning__icon">
                    {isUrgent ? <AlertTriangle size={24} /> : <Clock size={24} />}
                </div>
                <div className="subscription-warning__text">
                    <h4>
                        {isUrgent ? '¡Tu suscripción está por expirar!' : 'Tu suscripción está por expirar'}
                    </h4>
                    <p>
                        Tu plan Pro expirará en <strong>{daysLeft} día{daysLeft !== 1 ? 's' : ''}</strong>. 
                        La renovación automática está desactivada.
                    </p>
                    <p className="subscription-warning__subtext">
                        Activa la renovación automática o renueva manualmente para no perder el acceso a las funciones Pro.
                    </p>
                </div>
                <div className="subscription-warning__actions">
                    <button 
                        className="btn btn-primary subscription-warning__btn"
                        onClick={() => window.open('https://dashboard.stripe.com/subscriptions', '_blank')}
                    >
                        <Clock size={16} /> Gestionar Suscripción
                    </button>
                    <button 
                        className="btn btn-secondary subscription-warning__btn"
                        onClick={() => {
                            // Trigger upgrade flow for renewal
                            import('../context/AuthContext').then(({ useAuth }) => {
                                const { createPaymentSession } = useAuth()
                                createPaymentSession('annual')
                            })
                        }}
                    >
                        <Crown size={16} /> Renovar Ahora
                    </button>
                </div>
                <button 
                    className="subscription-warning__close"
                    onClick={() => setDismissed(true)}
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    )
}
