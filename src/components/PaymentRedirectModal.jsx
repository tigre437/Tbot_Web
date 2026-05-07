import { Loader2 } from 'lucide-react'
import './PaymentRedirectModal.css'

export default function PaymentRedirectModal() {
    return (
        <div className="payment-redirect-overlay">
            <div className="payment-redirect-modal">
                <div className="payment-redirect-content">
                    <div className="payment-redirect-spinner">
                        <Loader2 size={48} className="spin" />
                    </div>
                    <h2>Redirigiendo a la plataforma de pago</h2>
                    <p>Por favor, espera mientras te dirigimos a Stripe...</p>
                    <p className="payment-redirect-subtitle">Esto solo tomará unos segundos</p>
                </div>
            </div>
        </div>
    )
}
