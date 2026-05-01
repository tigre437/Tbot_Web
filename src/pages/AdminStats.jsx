import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
    Bot, Server, Users, Zap, TrendingUp, Clock, Activity,
    MessageSquare, Ticket, Bell, Shield, Mic2, BarChart3,
    Calendar, ArrowUp, ArrowDown, RefreshCw, Cpu, Database
} from 'lucide-react'
import api from '../utils/api'
import './AdminStats.css'

// Mock stats data
const MOCK_STATS = {
    bot: {
        uptime: '12d 5h 32m',
        ping: 42,
        guilds: 3,
        users: 2146,
        commands_today: 247,
        commands_total: 18432,
        status: 'online',
    },
    activity: [
        { day: 'Lun', commands: 180, tickets: 12 },
        { day: 'Mar', commands: 240, tickets: 18 },
        { day: 'Mié', commands: 195, tickets: 9 },
        { day: 'Jue', commands: 310, tickets: 22 },
        { day: 'Vie', commands: 280, tickets: 16 },
        { day: 'Sáb', commands: 190, tickets: 8 },
        { day: 'Dom', commands: 247, tickets: 11 },
    ],
    modules: [
        { name: 'Tickets', usage: 84, color: '#5865F2', icon: Ticket },
        { name: 'Autoroles', usage: 67, color: '#57F287', icon: Users },
        { name: 'Bienvenida', usage: 91, color: '#FEE75C', icon: Bell },
        { name: 'Voz', usage: 43, color: '#EB459E', icon: Mic2 },
        { name: 'Admin Chat', usage: 56, color: '#00d4ff', icon: MessageSquare },
        { name: 'Moderación', usage: 38, color: '#FF6B6B', icon: Shield },
    ],
    top_servers: [
        { name: 'Urban Network', members: 1247, commands: 9823 },
        { name: 'Gaming Community', members: 843, commands: 5614 },
        { name: 'Dev Server', members: 56, commands: 2995 },
    ],
    recent_events: [
        { type: 'ticket', msg: 'Nuevo ticket creado en Urban Network', time: '2m' },
        { type: 'join', msg: '3 nuevos miembros en Gaming Community', time: '15m' },
        { type: 'cmd', msg: '!sincronizar ejecutado en Dev Server', time: '1h' },
        { type: 'ticket', msg: 'Ticket #24 cerrado en Urban Network', time: '2h' },
        { type: 'join', msg: '1 nuevo miembro en Urban Network', time: '3h' },
    ]
}

function StatCard({ icon: Icon, label, value, sub, color, trend }) {
    return (
        <div className="stat-card" style={{ '--sc': color }}>
            <div className="stat-card__icon"><Icon size={20} /></div>
            <div className="stat-card__body">
                <p className="stat-card__label">{label}</p>
                <p className="stat-card__value">{value}</p>
                {sub && <p className="stat-card__sub">{sub}</p>}
            </div>
            {trend !== undefined && (
                <div className={`stat-card__trend ${trend >= 0 ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
                    {trend >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
    )
}

function ActivityChart({ data }) {
    const maxCmds = Math.max(...data.map(d => d.commands))
    return (
        <div className="activity-chart">
            <div className="activity-chart__bars">
                {data.map((d, i) => (
                    <div key={i} className="activity-chart__col">
                        <div className="activity-chart__bar-wrap">
                            <div
                                className="activity-chart__bar"
                                style={{ height: `${(d.commands / maxCmds) * 100}%` }}
                                title={`${d.commands} comandos`}
                            />
                        </div>
                        <span className="activity-chart__label">{d.day}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ModuleUsage({ modules }) {
    return (
        <div className="module-usage">
            {modules.map((m, i) => (
                <div key={i} className="module-usage__item">
                    <div className="module-usage__header">
                        <div className="module-usage__icon" style={{ color: m.color, background: `${m.color}18` }}>
                            <m.icon size={14} />
                        </div>
                        <span className="module-usage__name">{m.name}</span>
                        <span className="module-usage__pct" style={{ color: m.color }}>{m.usage}%</span>
                    </div>
                    <div className="module-usage__bar">
                        <div
                            className="module-usage__fill"
                            style={{ width: `${m.usage}%`, background: m.color }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

function EventIcon({ type }) {
    const icons = { ticket: Ticket, join: Users, cmd: Zap }
    const colors = { ticket: '#5865F2', join: '#57F287', cmd: '#FEE75C' }
    const Icon = icons[type] || Activity
    return (
        <div className="event-icon" style={{ background: `${colors[type]}18`, color: colors[type] }}>
            <Icon size={14} />
        </div>
    )
}

export default function AdminStats() {
    const { user } = useAuth()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchStats = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true)
        try {
            const res = await api.get('/admin/stats')
            setStats(res.data)
        } catch {
            setStats(MOCK_STATS)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => { fetchStats() }, [])

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
            </div>
        )
    }

    const s = stats?.bot

    return (
        <div className="admin-stats page-enter">
            <div className="admin-stats__hero">
                <div className="admin-stats__hero-glow" />
                <div className="container">
                    <div className="admin-stats__header">
                        <div>
                            <div className="badge badge-blurple" style={{ marginBottom: '0.75rem' }}>
                                <BarChart3 size={12} /> Panel de Administración
                            </div>
                            <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '0.35rem', fontSize: '2rem' }}>
                                Estadísticas de TBot
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Vista general del rendimiento y actividad del bot
                            </p>
                        </div>
                        <div className="admin-stats__header-right">
                            <div className={`admin-stats__status ${s?.status === 'online' ? 'admin-stats__status--online' : ''}`}>
                                <span className="admin-stats__status-dot" />
                                {s?.status === 'online' ? 'Bot Online' : 'Bot Offline'}
                            </div>
                            <button
                                className={`btn btn-secondary btn-sm ${refreshing ? 'refreshing' : ''}`}
                                onClick={() => fetchStats(true)}
                                disabled={refreshing}
                            >
                                <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
                                Actualizar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container admin-stats__body">
                {/* Top Stats */}
                <div className="stats-grid">
                    <StatCard icon={Server} label="Servidores" value={s?.guilds} color="#5865F2" trend={12} />
                    <StatCard icon={Users} label="Usuarios totales" value={s?.users?.toLocaleString()} color="#57F287" trend={8} />
                    <StatCard icon={Zap} label="Comandos hoy" value={s?.commands_today} color="#FEE75C" trend={-3} />
                    <StatCard icon={Activity} label="Ping" value={`${s?.ping}ms`} color="#EB459E" />
                    <StatCard icon={Clock} label="Uptime" value={s?.uptime} color="#00d4ff" />
                    <StatCard icon={Database} label="Total comandos" value={s?.commands_total?.toLocaleString()} color="#FF6B6B" trend={15} />
                </div>

                <div className="stats-row">
                    {/* Activity Chart */}
                    <div className="stats-block stats-block--chart">
                        <div className="stats-block__header">
                            <TrendingUp size={18} style={{ color: 'var(--blurple-light)' }} />
                            <h3>Actividad esta semana</h3>
                        </div>
                        <ActivityChart data={stats?.activity || []} />
                        <div className="activity-legend">
                            <span><span style={{ background: 'var(--blurple)', opacity: 0.8 }} />Comandos</span>
                        </div>
                    </div>

                    {/* Module Usage */}
                    <div className="stats-block">
                        <div className="stats-block__header">
                            <Cpu size={18} style={{ color: 'var(--blurple-light)' }} />
                            <h3>Uso de módulos</h3>
                        </div>
                        <ModuleUsage modules={stats?.modules || []} />
                    </div>
                </div>

                <div className="stats-row">
                    {/* Top Servers */}
                    <div className="stats-block">
                        <div className="stats-block__header">
                            <Server size={18} style={{ color: 'var(--blurple-light)' }} />
                            <h3>Top Servidores</h3>
                        </div>
                        <div className="top-servers">
                            {stats?.top_servers?.map((srv, i) => (
                                <div key={i} className="top-server-item">
                                    <div className="top-server-rank">#{i + 1}</div>
                                    <div className="top-server-icon">{srv.name.charAt(0)}</div>
                                    <div className="top-server-info">
                                        <span className="top-server-name">{srv.name}</span>
                                        <span className="top-server-meta">{srv.members.toLocaleString()} miembros</span>
                                    </div>
                                    <div className="top-server-cmds">
                                        <Zap size={12} />
                                        {srv.commands.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Events */}
                    <div className="stats-block">
                        <div className="stats-block__header">
                            <Calendar size={18} style={{ color: 'var(--blurple-light)' }} />
                            <h3>Actividad reciente</h3>
                        </div>
                        <div className="recent-events">
                            {stats?.recent_events?.map((ev, i) => (
                                <div key={i} className="event-item">
                                    <EventIcon type={ev.type} />
                                    <span className="event-msg">{ev.msg}</span>
                                    <span className="event-time">hace {ev.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
