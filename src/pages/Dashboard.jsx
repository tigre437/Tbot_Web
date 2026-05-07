import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Search, Crown, Shield, RefreshCw, Plus, Bot, Settings, Wifi, WifiOff } from 'lucide-react'
import api from '../utils/api'
import logoImg from '../assets/logo256.png'
import './Dashboard.css'

// Mock data for development (remove when API is ready)
const MOCK_SERVERS = [
    {
        id: '1445771489952530615',
        name: 'Urban Network',
        icon: null,
        memberCount: 1247,
        botOnline: true,
        isOwner: true,
        permissions: ['ADMINISTRATOR'],
        plan: 'pro'
    },
    {
        id: '987654321098765432',
        name: 'Gaming Community',
        icon: null,
        memberCount: 843,
        botOnline: true,
        isOwner: false,
        permissions: ['ADMINISTRATOR'],
        plan: 'free'
    },
    {
        id: '876543210987654321',
        name: 'Dev Server',
        icon: null,
        memberCount: 56,
        botOnline: false,
        isOwner: true,
        permissions: ['ADMINISTRATOR'],
        plan: 'free'
    },
]

function ServerCard({ server }) {
    const navigate = useNavigate()
    const initial = server.name.charAt(0).toUpperCase()
    const iconUrl = server.icon
        ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png?size=128`
        : null

    const addBotUrl =
        `https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_BOT_CLIENT_ID}` +
        `&permissions=8&scope=bot+applications.commands&guild_id=${server.id}&disable_guild_select=true`

    return (
        <div className={`server-card ${!server.botOnline ? 'server-card--no-bot' : ''}`}>
            {/* Icon */}
            <div className="server-card__icon">
                {iconUrl
                    ? <img src={iconUrl} alt={server.name} />
                    : <span className="server-card__initial">{initial}</span>
                }
                <div className={`server-card__status ${server.botOnline ? 'server-card__status--online' : 'server-card__status--offline'}`} />
            </div>

            {/* Info */}
            <div className="server-card__info">
                <div className="server-card__header">
                    <h3 className="server-card__name">{server.name}</h3>
                    <div className="server-card__badges">
                        {server.isOwner && (
                            <span className="badge badge-yellow" title="Eres el dueño">
                                <Crown size={11} /> Dueño
                            </span>
                        )}
                        {!server.isOwner && (
                            <span className="badge badge-blurple" title="Administrador">
                                <Shield size={11} /> Admin
                            </span>
                        )}
                    </div>
                </div>
                <div className="server-card__meta">
                    <span className="server-card__members">
                        {server.memberCount?.toLocaleString('es-ES')} miembros
                    </span>
                    <span className={`server-card__bot-status ${server.botOnline ? 'server-card__bot-status--online' : ''}`}>
                        {server.botOnline ? <><Wifi size={12} /> Bot activo</> : <><WifiOff size={12} /> Sin TBot</>}
                    </span>
                </div>
            </div>

            {/* CTA Button */}
            {server.botOnline ? (
                <button
                    className="server-card__cta server-card__cta--config"
                    onClick={() => navigate(`/dashboard/${server.id}`)}
                >
                    <Settings size={15} />
                    Configurar
                </button>
            ) : (
                <a
                    href={addBotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="server-card__cta server-card__cta--add"
                    onClick={e => e.stopPropagation()}
                >
                    <Plus size={15} />
                    Añadir bot
                </a>
            )}
        </div>
    )
}

export default function Dashboard() {
    const { user, createPaymentSession } = useAuth()
    const [servers, setServers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)

    const handleUpgradeClick = (planType) => {
        try {
            createPaymentSession(planType)
        } catch (error) {
            alert('Error al iniciar el proceso de pago. Por favor, inténtalo de nuevo.')
        }
    }

    const fetchServers = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true)
        try {
            const res = await api.get('/servers/mine')
            setServers(res.data)
        } catch {
            // Use mock data if API not available
            setServers(MOCK_SERVERS)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => { fetchServers() }, [])

    const filtered = servers
        .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            // Prioritize servers with the bot online
            if (a.botOnline !== b.botOnline) {
                return a.botOnline ? -1 : 1
            }
            // Secondary sort: Alphabetical
            return a.name.localeCompare(b.name)
        })

    const online = servers.filter(s => s.botOnline).length

    return (
        <div className="dashboard page-enter">
            <div className="dashboard__hero">
                <div className="dashboard__hero-glow" />
                <div className="container">
                    <div className="dashboard__welcome">
                        <div className="dashboard__avatar-container">
                            <img
                                src={user?.avatar
                                    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                                    : `https://cdn.discordapp.com/embed/avatars/0.png`
                                }
                                alt={user?.username}
                                className="dashboard__avatar"
                            />
                            {user?.plan === 'pro' && (
                                <div className="dashboard__pro-badge" title="Usuario Pro">
                                    <Crown size={16} />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="dashboard__greeting">Bienvenido de vuelta,</p>
                            <h1 className="dashboard__username">
                                {user?.username || 'Usuario'} 👋
                                {user?.plan === 'pro' && (
                                    <span className="dashboard__pro-text">PRO</span>
                                )}
                            </h1>
                        </div>
                    </div>

                    <div className="dashboard__quick-stats">
                        <div className="dashboard__qs-card">
                            <span className="dashboard__qs-num gradient-text">{servers.length}</span>
                            <span className="dashboard__qs-label">Servidores</span>
                        </div>
                        <div className="dashboard__qs-card">
                            <span className="dashboard__qs-num gradient-text-green">{online}</span>
                            <span className="dashboard__qs-label">Bot activo</span>
                        </div>
                        <div className="dashboard__qs-card">
                            <span className="dashboard__qs-num" style={{ color: 'var(--yellow)' }}>
                                {servers.filter(s => s.isOwner).length}
                            </span>
                            <span className="dashboard__qs-label">Como dueño</span>
                        </div>
                        {user?.plan === 'free' && (
                            <div className="dashboard__qs-card dashboard__qs-card--upgrade">
                                <span className="dashboard__qs-num" style={{ color: 'var(--blurple)' }}>
                                    <Crown size={16} />
                                </span>
                                <button 
                                    onClick={() => setShowUpgradeModal(true)}
                                    className="dashboard__upgrade-btn"
                                >
                                    Mejorar ahora
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container dashboard__body">
                {/* Toolbar */}
                <div className="dashboard__toolbar">
                    <div className="dashboard__search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Buscar servidor..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="dashboard__search-input"
                        />
                    </div>
                    <button
                        className={`btn btn-secondary btn-sm ${refreshing ? 'refreshing' : ''}`}
                        onClick={() => fetchServers(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
                        Actualizar
                    </button>
                </div>

                {/* Server list */}
                {loading ? (
                    <div className="dashboard__loading">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="server-card-skeleton" />
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="dashboard__servers">
                        {filtered.map(server => (
                            <ServerCard key={server.id} server={server} />
                        ))}
                    </div>
                ) : (
                    <div className="dashboard__empty">
                        <img src={logoImg} alt="Logo" />
                        <h3>No se encontraron servidores</h3>
                        <p>
                            {search
                                ? 'Ningún servidor coincide con tu búsqueda.'
                                : 'No tienes servidores con TBot donde seas administrador o dueño.'
                            }
                        </p>
                        {!search && (
                            <a
                                href={`https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_BOT_CLIENT_ID}&permissions=8&scope=bot+applications.commands`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-primary"
                                style={{ marginTop: '1rem' }}
                            >
                                <Plus size={16} /> Añadir TBot a un servidor
                            </a>
                        )}
                    </div>
                )}

                {/* Add bot CTA */}
                <div className="dashboard__add-server">
                    <a
                        href={`https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_BOT_CLIENT_ID}&permissions=8&scope=bot+applications.commands`}
                        target="_blank"
                        rel="noreferrer"
                        className="add-server-btn"
                    >
                        <div className="add-server-btn__icon">
                            <Plus size={22} />
                        </div>
                        <span>Añadir TBot a otro servidor</span>
                    </a>
                </div>
            </div>
            
            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Elige tu plan Pro</h3>
                            <button className="modal-close" onClick={() => setShowUpgradeModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="upgrade-options">
                                <div className="upgrade-option" onClick={() => handleUpgradeClick('monthly')}>
                                    <div className="upgrade-option__header">
                                        <h4>Plan Mensual</h4>
                                        <div className="upgrade-option__price">
                                            <span className="price">€3.99</span>
                                            <span className="period">/mes</span>
                                        </div>
                                    </div>
                                    <div className="upgrade-option__features">
                                        <div className="feature-item">✓ Paneles de tickets ilimitados</div>
                                        <div className="feature-item">✓ Arrival Studio desbloqueado</div>
                                        <div className="feature-item">✓ Canales de voz dinámicos</div>
                                        <div className="feature-item">✓ Soporte prioritario</div>
                                    </div>
                                    <button className="btn btn-primary upgrade-btn">Elegir Mensual</button>
                                </div>
                                
                                <div className="upgrade-option upgrade-option--annual">
                                    <div className="upgrade-option__badge">MEJOR VALOR</div>
                                    <div className="upgrade-option__header">
                                        <h4>Plan Anual</h4>
                                        <div className="upgrade-option__price">
                                            <span className="price">€2.99</span>
                                            <span className="period">/mes</span>
                                        </div>
                                    </div>
                                    <div className="upgrade-option__savings">
                                        <span className="savings-badge">Ahorra €12 al año</span>
                                        <span className="savings-text">25% de descuento</span>
                                    </div>
                                    <div className="upgrade-option__features">
                                        <div className="feature-item">✓ Todo lo del plan mensual</div>
                                        <div className="feature-item">✓ Ahorro de €12 anuales</div>
                                        <div className="feature-item">✓ Funciones exclusivas</div>
                                        <div className="feature-item">✓ Soporte VIP</div>
                                    </div>
                                    <button className="btn btn-primary upgrade-btn upgrade-btn--annual">Elegir Anual</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
