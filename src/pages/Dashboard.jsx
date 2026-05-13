import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { Search, Crown, Shield, RefreshCw, Plus, Bot, Settings, Wifi, WifiOff } from 'lucide-react'
import api from '../utils/api'
import logoImg from '../assets/logo256.png'
import './Dashboard.css'
import SubscriptionWarning from '../components/SubscriptionWarning'

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
    const { t, language } = useLanguage()
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
                            <span className="badge badge-yellow" title={t('dashboard.server_card.owner')}>
                                <Crown size={11} /> {t('dashboard.server_card.owner')}
                            </span>
                        )}
                        {!server.isOwner && (
                            <span className="badge badge-blurple" title={t('dashboard.server_card.admin')}>
                                <Shield size={11} /> {t('dashboard.server_card.admin')}
                            </span>
                        )}
                    </div>
                </div>
                <div className="server-card__meta">
                    <span className="server-card__members">
                        {server.memberCount?.toLocaleString(language === 'es' ? 'es-ES' : 'en-US')} {t('dashboard.server_card.members')}
                    </span>
                    <span className={`server-card__bot-status ${server.botOnline ? 'server-card__bot-status--online' : ''}`}>
                        {server.botOnline ? <><Wifi size={12} /> {t('dashboard.server_card.active')}</> : <><WifiOff size={12} /> {t('dashboard.server_card.inactive')}</>}
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
                    {t('dashboard.server_card.configure')}
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
                    {t('dashboard.server_card.add_bot')}
                </a>
            )}
        </div>
    )
}

export default function Dashboard() {
    const { user, createPaymentSession } = useAuth()
    const { t } = useLanguage()
    const [servers, setServers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)

    const handleUpgradeClick = (planType) => {
        try {
            createPaymentSession(planType)
        } catch (error) {
            alert(t('common.error'))
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
            <SubscriptionWarning />
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
                                <div className="dashboard__pro-badge" title={t('dashboard.pro_user')}>
                                    <Crown size={16} />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="dashboard__greeting">{t('dashboard.welcome')}</p>
                            <h1 className="dashboard__username">
                                {user?.username || 'User'} 👋
                                {user?.plan === 'pro' && (
                                    <span className="dashboard__pro-text">PRO</span>
                                )}
                            </h1>
                        </div>
                    </div>

                    <div className="dashboard__quick-stats">
                        <div className="dashboard__qs-card">
                            <span className="dashboard__qs-num gradient-text">{servers.length}</span>
                            <span className="dashboard__qs-label">{t('dashboard.servers')}</span>
                        </div>
                        <div className="dashboard__qs-card">
                            <span className="dashboard__qs-num gradient-text-green">{online}</span>
                            <span className="dashboard__qs-label">{t('dashboard.bot_online')}</span>
                        </div>
                        <div className="dashboard__qs-card">
                            <span className="dashboard__qs-num" style={{ color: 'var(--yellow)' }}>
                                {servers.filter(s => s.isOwner).length}
                            </span>
                            <span className="dashboard__qs-label">{t('dashboard.as_owner')}</span>
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
                                    {t('dashboard.upgrade_now')}
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
                            placeholder={t('dashboard.search_placeholder')}
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
                        {t('dashboard.refresh')}
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
                        <h3>{t('dashboard.no_servers_found')}</h3>
                        <p>
                            {search
                                ? t('dashboard.search_no_results')
                                : t('dashboard.no_servers_desc')
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
                                <Plus size={16} /> {t('dashboard.add_bot_btn')}
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
                        <span>{t('dashboard.add_to_another')}</span>
                    </a>
                </div>
            </div>
            
            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t('dashboard.modal.title')}</h3>
                            <button className="modal-close" onClick={() => setShowUpgradeModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="upgrade-options">
                                <div className="upgrade-option" onClick={() => handleUpgradeClick('monthly')}>
                                    <div className="upgrade-option__header">
                                        <h4>{t('dashboard.modal.monthly')}</h4>
                                        <div className="upgrade-option__price">
                                            <span className="price">€3.99</span>
                                            <span className="period">/mes</span>
                                        </div>
                                    </div>
                                    <div className="upgrade-option__features">
                                        <div className="feature-item">✓ {t('dashboard.modal.features.tickets')}</div>
                                        <div className="feature-item">✓ {t('dashboard.modal.features.arrival')}</div>
                                        <div className="feature-item">✓ {t('dashboard.modal.features.voice')}</div>
                                        <div className="feature-item">✓ {t('dashboard.modal.features.support')}</div>
                                    </div>
                                    <button className="btn btn-primary upgrade-btn">{t('dashboard.modal.choose_monthly')}</button>
                                </div>
                                
                                <div className="upgrade-option upgrade-option--annual" onClick={() => handleUpgradeClick('annual')}>
                                    <div className="upgrade-option__badge">{t('dashboard.modal.best_value')}</div>
                                    <div className="upgrade-option__header">
                                        <h4>{t('dashboard.modal.annual')}</h4>
                                        <div className="upgrade-option__price">
                                            <span className="price">€2.99</span>
                                            <span className="period">/mes</span>
                                        </div>
                                    </div>
                                    <div className="upgrade-option__savings">
                                        <span className="savings-badge">{t('dashboard.modal.save_annual')}</span>
                                    </div>
                                    <div className="upgrade-option__features">
                                        <div className="feature-item">✓ {t('dashboard.modal.features.all_monthly')}</div>
                                        <div className="feature-item">✓ {t('dashboard.modal.features.save_12')}</div>
                                        <div className="feature-item">✓ {t('dashboard.modal.features.exclusive')}</div>
                                        <div className="feature-item">✓ {t('dashboard.modal.features.vip')}</div>
                                    </div>
                                    <button 
                                        className="btn btn-primary upgrade-btn upgrade-btn--annual"
                                    >
                                        {t('dashboard.modal.choose_annual')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
