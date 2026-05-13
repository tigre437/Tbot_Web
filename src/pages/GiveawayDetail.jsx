import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
    Gift, Clock, Users, Shield, ArrowLeft, 
    CheckCircle2, AlertCircle, Loader2, Sparkles, 
    ExternalLink, Trophy, UserPlus
} from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import './Giveaways.css'

export default function GiveawayDetail() {
    const { id } = useParams()
    const { user, login } = useAuth()
    const [giveaway, setGiveaway] = useState(null)
    const [loading, setLoading] = useState(true)
    const [entering, setEntering] = useState(false)
    const [joined, setJoined] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/giveaways/${id}`)
                setGiveaway(res.data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchDetail()
    }, [id])

    const handleEnter = async () => {
        if (!user) return login()
        setEntering(true)
        setError(null)
        try {
            await api.post(`/giveaways/${id}/enter`)
            setJoined(true)
        } catch (e) {
            setError(e.response?.data?.detail || "Error al participar")
        } finally {
            setEntering(false)
        }
    }

    if (loading) return <div className="loading-screen"><Loader2 className="spin" size={32} /></div>
    if (!giveaway) return <div className="not-found">Giveaway no encontrado</div>

    const isEnded = giveaway.status === 'ended' || giveaway.status === 'rerolled'

    return (
        <div className="giveaway-detail-page">
            <Navbar />
            <div className="container detail-container">
                <Link to="/giveaways" className="back-link">
                    <ArrowLeft size={16} /> Volver a sorteos
                </Link>
                
                <div className="detail-layout">
                    <div className="detail-main">
                        <div className="detail-card">
                            {giveaway.banner_url && (
                                <div className="detail-banner">
                                    <img src={giveaway.banner_url} alt="" />
                                </div>
                            )}
                            
                            <div className="detail-body">
                                <div className="detail-header">
                                    <div className="host-info">
                                        <div className="host-dot"></div>
                                        Organizado por <strong>{giveaway.host_name}</strong>
                                    </div>
                                    <h1 className="detail-title">{giveaway.title}</h1>
                                    <div className="detail-desc">{giveaway.description}</div>
                                </div>

                                <div className="prizes-section">
                                    <h3><Trophy size={20} /> Premios</h3>
                                    <div className="prize-list-detail">
                                        {giveaway.prizes.map((p, i) => (
                                            <div key={i} className="prize-item-detail">
                                                <div className="prize-item-icon"><Gift size={18} /></div>
                                                <div className="prize-item-info">
                                                    <span className="prize-name">{p.name}</span>
                                                    <span className="prize-winners">{p.winner_count} ganadores</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isEnded && giveaway.winners?.length > 0 && (
                            <div className="winners-card">
                                <h3><Sparkles size={20} /> Ganadores</h3>
                                <div className="winners-list">
                                    {giveaway.winners.map(w => (
                                        <div key={w.id} className="winner-user">
                                            <div className="winner-avatar">👤</div>
                                            <div className="winner-details">
                                                <span>{w.username}</span>
                                                <small style={{ opacity: 0.5, marginLeft: '8px' }}>({w.id})</small>
                                            </div>
                                            {user && user.id === w.id && (
                                                <button className="btn btn-primary btn-xs" onClick={async () => {
                                                    try {
                                                        await api.post(`/giveaways/${id}/claim`)
                                                        alert("¡Premio reclamado con éxito!")
                                                    } catch (e) {
                                                        alert(e.response?.data?.detail || "Error al reclamar")
                                                    }
                                                }}>Reclamar Premio</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className="detail-sidebar">
                        <div className="sidebar-card participation-card">
                            {!isEnded ? (
                                <>
                                    <div className="countdown-wrap">
                                        <span className="countdown-label">Termina en:</span>
                                        <div className="countdown-time">
                                            {new Date(giveaway.end_date).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="requirements-box">
                                        <h4>Requisitos para entrar:</h4>
                                        <div className="req-list">
                                            {giveaway.age_requirement !== 'none' && (
                                                <div className="req-item">
                                                    <Shield size={16} />
                                                    <span>Cuenta Discord: {giveaway.age_requirement.replace('_', ' ')}</span>
                                                </div>
                                            )}
                                            {giveaway.requirements.map((r, i) => (
                                                <div key={i} className="req-item">
                                                    <UserPlus size={16} />
                                                    <span>Unirse a servidor</span>
                                                    {r.invite_url && <a href={r.invite_url} target="_blank" rel="noreferrer"><ExternalLink size={12} /></a>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {joined ? (
                                        <div className="joined-badge">
                                            <CheckCircle2 size={20} /> ¡Ya estás participando!
                                        </div>
                                    ) : (
                                        <button 
                                            className="btn btn-primary btn-lg w-full" 
                                            onClick={handleEnter}
                                            disabled={entering}
                                        >
                                            {entering ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
                                            {user ? "Participar ahora" : "Login con Discord"}
                                        </button>
                                    )}

                                    {error && (
                                        <div className="error-notice">
                                            <AlertCircle size={16} />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="ended-notice">
                                    <Trophy size={32} />
                                    <h4>Sorteo Finalizado</h4>
                                    <p>Este sorteo ha concluido. ¡Gracias a todos por participar!</p>
                                </div>
                            )}
                        </div>

                        <div className="sidebar-card host-sidebar-card">
                             <h4>Host Information</h4>
                             <p>Este sorteo es organizado por {giveaway.host_name}.</p>
                             {giveaway.host_invite && (
                                <a href={giveaway.host_invite} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm w-full">
                                    Unirse a su Servidor
                                </a>
                             )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
