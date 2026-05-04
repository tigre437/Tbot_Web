import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    Ticket, Shield, Bell, Mic2, MessageSquare, Users,
    Star, CheckCircle2, Zap, ArrowRight, Bot, Sparkles,
    Globe, TrendingUp, Lock, ChevronRight
} from 'lucide-react'
import logoImg from '../assets/logo256.png'
import logoSm from '../assets/logo80.png'
import './Landing.css'

/* ─── HERO ─── */
function Hero() {
    const { user, login } = useAuth()

    return (
        <section className="hero">
            {/* Glow blobs */}
            <div className="hero__blob hero__blob--1" />
            <div className="hero__blob hero__blob--2" />
            <div className="hero__blob hero__blob--3" />

            <div className="container hero__content">
                <div className="hero__badge badge badge-blurple">
                    <Sparkles size={12} /> Versión 2.0 — Más potente que nunca
                </div>

                <h1 className="hero__title">
                    El bot de Discord<br />
                    que tu servidor<br />
                    <span className="gradient-text">necesitaba</span>
                </h1>

                <p className="hero__subtitle">
                    TBot lleva la gestión de tu servidor al siguiente nivel. Tickets inteligentes,
                    roles automáticos, bienvenidas personalizadas y mucho más, todo centralizado
                    en un dashboard moderno.
                </p>

                <div className="hero__cta">
                    {user ? (
                        <Link to="/dashboard" className="btn btn-primary btn-lg">
                            Ir al Dashboard <ArrowRight size={18} />
                        </Link>
                    ) : (
                        <button onClick={login} className="btn btn-primary btn-lg hero__discord-btn">
                            <svg width="22" height="22" viewBox="0 0 71 55" fill="white" style={{ flexShrink: 0 }}>
                                <path d="M60.1 4.9C55.6 2.8 50.8 1.2 45.8.4c-.6 1-1.2 2.4-1.7 3.5-5.3-.8-10.6-.8-15.8 0-.5-1.1-1.2-2.5-1.8-3.5C21.5 1.2 16.7 2.8 12.2 4.9 1.8 20.5-1.1 35.7.4 50.7c6 4.4 11.8 7 17.5 8.7 1.4-1.9 2.7-4 3.8-6.2-2.1-.8-4.1-1.7-6-2.8.5-.4 1-.7 1.5-1.1 11.5 5.3 24 5.3 35.4 0 .5.4 1 .7 1.5 1.1-1.9 1.1-3.9 2-6 2.8 1.1 2.2 2.4 4.3 3.8 6.2 5.7-1.7 11.5-4.3 17.5-8.7 1.7-17.6-2.9-32.7-12.3-47.8zM23.7 41.5c-3.4 0-6.2-3.1-6.2-6.9s2.7-6.9 6.2-6.9 6.3 3.1 6.2 6.9c0 3.8-2.7 6.9-6.2 6.9zm23.6 0c-3.4 0-6.2-3.1-6.2-6.9s2.7-6.9 6.2-6.9 6.3 3.1 6.2 6.9c0 3.8-2.7 6.9-6.2 6.9z" />
                            </svg>
                            Añadir a Discord — Es gratis
                        </button>
                    )}
                    <a href="#features" className="btn btn-secondary btn-lg">
                        Ver funciones <ChevronRight size={18} />
                    </a>
                </div>

                <div className="hero__stats">
                    <div className="hero__stat">
                        <span className="hero__stat-num gradient-text">500+</span>
                        <span className="hero__stat-label">Servidores</span>
                    </div>
                    <div className="hero__stat-divider" />
                    <div className="hero__stat">
                        <span className="hero__stat-num gradient-text">50k+</span>
                        <span className="hero__stat-label">Usuarios</span>
                    </div>
                    <div className="hero__stat-divider" />
                    <div className="hero__stat">
                        <span className="hero__stat-num gradient-text">99.9%</span>
                        <span className="hero__stat-label">Uptime</span>
                    </div>
                </div>
            </div>

            {/* Dashboard preview */}
            <div className="container hero__preview-wrapper">
                <div className="hero__preview">
                    <div className="hero__preview-bar">
                        <div className="hero__preview-dots">
                            <span style={{ background: '#ED4245' }} />
                            <span style={{ background: '#FEE75C' }} />
                            <span style={{ background: '#57F287' }} />
                        </div>
                        <span className="hero__preview-url">tbot-dashboard.app/dashboard</span>
                    </div>
                    <div className="hero__preview-body">
                        <DashboardPreview />
                    </div>
                </div>
                <div className="hero__preview-glow" />
            </div>
        </section>
    )
}

function DashboardPreview() {
    return (
        <div className="dp">
            <div className="dp__sidebar">
                <div className="dp__sidebar-logo"><img src={logoSm} alt="Logo" /></div>
                <div className="dp__sidebar-icon dp__sidebar-icon--active"><Ticket size={16} /></div>
                <div className="dp__sidebar-icon"><Users size={16} /></div>
                <div className="dp__sidebar-icon"><Bell size={16} /></div>
                <div className="dp__sidebar-icon"><Shield size={16} /></div>
            </div>
            <div className="dp__main">
                <div className="dp__header">
                    <div className="dp__header-text">
                        <div className="dp__skeleton dp__skeleton--title" />
                        <div className="dp__skeleton dp__skeleton--subtitle" />
                    </div>
                    <div className="dp__badge badge badge-green" style={{ fontSize: '0.65rem' }}>
                        <span className="dp__dot" /> Online
                    </div>
                </div>
                <div className="dp__cards">
                    {[
                        { color: '#5865F2', label: 'Tickets', val: '24' },
                        { color: '#57F287', label: 'Miembros', val: '1.2k' },
                        { color: '#EB459E', label: 'Comandos', val: '847' },
                    ].map(c => (
                        <div key={c.label} className="dp__card" style={{ '--c': c.color }}>
                            <div className="dp__card-val">{c.val}</div>
                            <div className="dp__card-label">{c.label}</div>
                            <div className="dp__card-bar" />
                        </div>
                    ))}
                </div>
                <div className="dp__chart">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div key={i} className="dp__bar" style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ─── FEATURES ─── */
const features = [
    {
        icon: Ticket,
        color: '#5865F2',
        title: 'Sistema de Tickets',
        description: 'Panel de soporte completo con categorías, transcripciones, prioridades y asignación de staff.'
    },
    {
        icon: Users,
        color: '#57F287',
        title: 'Autoroles',
        description: 'Asigna roles automáticamente cuando alguien entra al servidor, reacciona a un mensaje o selecciona opciones.'
    },
    {
        icon: Bell,
        color: '#FEE75C',
        title: 'Bienvenidas',
        description: 'Mensajes de bienvenida totalmente personalizables con imágenes, embeds y variables dinámicas.'
    },
    {
        icon: Mic2,
        color: '#EB459E',
        title: 'Canales de Voz',
        description: 'Canales de voz temporales que se crean y eliminan automáticamente según la demanda.'
    },
    {
        icon: MessageSquare,
        color: '#00d4ff',
        title: 'Chat Admin',
        description: 'Canal de comunicación privado y seguro para tu equipo de administración.'
    },
    {
        icon: Shield,
        color: '#FF6B6B',
        title: 'Moderación',
        description: 'Limpia mensajes, silencia usuarios, gestiona permisos y mantén el orden en tu servidor.'
    },
]

function Features() {
    return (
        <section className="section features" id="features">
            <div className="container">
                <div className="badge badge-blurple" style={{ margin: '0 auto 1rem', display: 'table' }}>
                    <Zap size={12} /> Funcionalidades
                </div>
                <h2 className="section-title">
                    Todo lo que necesitas,<br />
                    <span className="gradient-text">sin complicaciones</span>
                </h2>
                <p className="section-subtitle">
                    TBot viene con todas las herramientas para gestionar tu comunidad de Discord de forma profesional.
                </p>

                <div className="features__grid">
                    {features.map((f, i) => (
                        <div key={i} className="feature-card" style={{ '--accent': f.color }}>
                            <div className="feature-card__icon">
                                <f.icon size={22} />
                            </div>
                            <h3 className="feature-card__title">{f.title}</h3>
                            <p className="feature-card__desc">{f.desc || f.description}</p>
                            <div className="feature-card__glow" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ─── HOW IT WORKS ─── */
function HowItWorks() {
    const steps = [
        { icon: Bot, title: 'Añade TBot', desc: 'Invita el bot a tu servidor de Discord con un solo click.' },
        { icon: Globe, title: 'Abre el Dashboard', desc: 'Inicia sesión con tu cuenta de Discord y accede al panel.' },
        { icon: Zap, title: 'Configura', desc: 'Personaliza cada módulo a tu gusto desde la interfaz.' },
        { icon: TrendingUp, title: 'Disfruta', desc: 'Tu servidor funciona solo. Monitoriza las estadísticas.' },
    ]

    return (
        <section className="section how-it-works">
            <div className="container">
                <h2 className="section-title">¿Cómo funciona?</h2>
                <p className="section-subtitle">Configura TBot en minutos, sin necesidad de conocimientos técnicos.</p>

                <div className="hiw__steps">
                    {steps.map((s, i) => (
                        <div key={i} className="hiw__step">
                            <div className="hiw__step-num">{i + 1}</div>
                            <div className="hiw__step-icon">
                                <s.icon size={24} />
                            </div>
                            <h3 className="hiw__step-title">{s.title}</h3>
                            <p className="hiw__step-desc">{s.desc}</p>
                            {i < steps.length - 1 && <div className="hiw__step-arrow" />}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ─── PRICING ─── */
const plans = [
    {
        name: 'Gratuito',
        price: '0€',
        period: '/mes',
        highlight: false,
        badge: null,
        features: [
            'Sistema de tickets básico',
            'Autoroles simples',
            'Mensajes de bienvenida',
            'Soporte por Discord',
        ],
        cta: 'Empezar gratis',
        ctaClass: 'btn-secondary',
    },
    {
        name: 'Pro',
        price: '4.99€',
        period: '/mes',
        highlight: true,
        badge: '⭐ Popular',
        features: [
            'Tickets avanzados + transcripciones',
            'Autoroles ilimitados',
            'Bienvenidas con imágenes',
            'Canales de voz dinámicos',
            'Soporte prioritario',
            'Estadísticas avanzadas',
        ],
        cta: 'Próximamente',
        ctaClass: 'btn-primary',
        disabled: true,
    },
    {
        name: 'Enterprise',
        price: '14.99€',
        period: '/mes',
        highlight: false,
        badge: null,
        features: [
            'Todo lo de Pro',
            'API personalizada',
            'Módulos exclusivos',
            'Bot personalizado (nombre/avatar)',
            'Soporte 24/7 dedicado',
            'SLA garantizado',
        ],
        cta: 'Próximamente',
        ctaClass: 'btn-secondary',
        disabled: true,
    },
]

function Pricing() {
    const { login } = useAuth()

    return (
        <section className="section pricing" id="pricing">
            <div className="container">
                <div className="badge badge-green" style={{ margin: '0 auto 1rem', display: 'table' }}>
                    <Star size={12} /> Planes
                </div>
                <h2 className="section-title">
                    Simple y <span className="gradient-text-green">transparente</span>
                </h2>
                <p className="section-subtitle">
                    Sin sorpresas ni costes ocultos. Elige el plan que mejor se adapte a tu comunidad.
                </p>

                <div className="pricing__grid">
                    {plans.map((plan, i) => (
                        <div key={i} className={`pricing-card ${plan.highlight ? 'pricing-card--highlight' : ''}`}>
                            {plan.badge && <div className="pricing-card__badge">{plan.badge}</div>}
                            <div className="pricing-card__header">
                                <h3 className="pricing-card__name">{plan.name}</h3>
                                <div className="pricing-card__price">
                                    <span className="pricing-card__amount">{plan.price}</span>
                                    <span className="pricing-card__period">{plan.period}</span>
                                </div>
                            </div>
                            <ul className="pricing-card__features">
                                {plan.features.map((f, j) => (
                                    <li key={j} className="pricing-card__feature">
                                        <CheckCircle2 size={16} className="pricing-card__check" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button 
                                onClick={login} 
                                className={`btn ${plan.ctaClass} pricing-card__cta`}
                                disabled={plan.disabled}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ─── CTA FINAL ─── */
function CTASection() {
    const { user, login } = useAuth()

    return (
        <section className="cta-section">
            <div className="cta-section__glow" />
            <div className="container cta-section__content">
                <div className="cta-section__icon animate-float">
                    <img src={logoImg} alt="Logo" />
                </div>
                <h2 className="section-title">
                    ¿Listo para llevar tu servidor<br />
                    al <span className="gradient-text">siguiente nivel</span>?
                </h2>
                <p className="section-subtitle">
                    Únete a más de 500 servidores que ya confían en TBot para gestionar su comunidad.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {!user && (
                        <button onClick={login} className="btn btn-primary btn-lg">
                            <svg width="20" height="20" viewBox="0 0 71 55" fill="white">
                                <path d="M60.1 4.9C55.6 2.8 50.8 1.2 45.8.4c-.6 1-1.2 2.4-1.7 3.5-5.3-.8-10.6-.8-15.8 0-.5-1.1-1.2-2.5-1.8-3.5C21.5 1.2 16.7 2.8 12.2 4.9 1.8 20.5-1.1 35.7.4 50.7c6 4.4 11.8 7 17.5 8.7 1.4-1.9 2.7-4 3.8-6.2-2.1-.8-4.1-1.7-6-2.8.5-.4 1-.7 1.5-1.1 11.5 5.3 24 5.3 35.4 0 .5.4 1 .7 1.5 1.1-1.9 1.1-3.9 2-6 2.8 1.1 2.2 2.4 4.3 3.8 6.2 5.7-1.7 11.5-4.3 17.5-8.7 1.7-17.6-2.9-32.7-12.3-47.8zM23.7 41.5c-3.4 0-6.2-3.1-6.2-6.9s2.7-6.9 6.2-6.9 6.3 3.1 6.2 6.9c0 3.8-2.7 6.9-6.2 6.9zm23.6 0c-3.4 0-6.2-3.1-6.2-6.9s2.7-6.9 6.2-6.9 6.3 3.1 6.2 6.9c0 3.8-2.7 6.9-6.2 6.9z" />
                            </svg>
                            Añadir TBot gratis
                        </button>
                    )}
                    <a href="#features" className="btn btn-secondary btn-lg">
                        Ver más funciones <ArrowRight size={18} />
                    </a>
                </div>
            </div>
        </section>
    )
}

/* ─── FOOTER ─── */
function Footer() {
    return (
        <footer className="footer">
            <div className="container footer__content">
                <div className="footer__brand">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                        <div className="navbar__logo-icon" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                            <img src={logoSm} alt="Logo" />
                        </div>
                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.1rem' }}>TBot</span>
                    </div>
                    <p className="footer__desc">El bot de Discord definitivo para gestionar tu servidor.</p>
                </div>

                <div className="footer__links">
                    <div className="footer__col">
                        <h4>Producto</h4>
                        <a href="#features">Funciones</a>
                        <a href="#pricing">Planes</a>
                    </div>
                    <div className="footer__col">
                        <h4>Soporte</h4>
                        <a href="#">Documentación</a>
                        <a href="#">Discord</a>
                    </div>
                    <div className="footer__col">
                        <h4>Legal</h4>
                        <a href="#">Privacidad</a>
                        <a href="#">Términos</a>
                    </div>
                </div>
            </div>
            <div className="footer__bottom container">
                <span>© 2026 TBot. Todos los derechos reservados.</span>
                <div className="footer__bottom-links">
                    <Lock size={12} /> Conexión segura
                </div>
            </div>
        </footer>
    )
}

/* ─── MAIN EXPORT ─── */
export default function Landing() {
    return (
        <div className="landing page-enter">
            <Hero />
            <Features />
            <HowItWorks />
            <Pricing />
            <CTASection />
            <Footer />
        </div>
    )
}
