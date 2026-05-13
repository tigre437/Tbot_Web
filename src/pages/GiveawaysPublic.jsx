import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Gift, Clock, Users, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import api from '../utils/api'
import { useLanguage } from '../context/LanguageContext'
import Navbar from '../components/Navbar'
import './Giveaways.css'

export default function GiveawaysPublic() {
    const { t } = useLanguage()
    const [giveaways, setGiveaways] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPublic = async () => {
            try {
                const res = await api.get('/giveaways/public')
                setGiveaways(res.data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchPublic()
    }, [])

    if (loading) return (
        <div className="loading-screen">
            <Loader2 className="spin" size={32} />
        </div>
    )

    return (
        <div className="public-portal">
            <Navbar />
            <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
                <div className="portal-header">
                    <div className="badge badge-blurple"><Sparkles size={12} /> Giveaways Portal</div>
                    <h1>Sorteos Activos</h1>
                    <p>Participa en los mejores sorteos de la comunidad y gana increíbles premios.</p>
                </div>

                {giveaways.length === 0 ? (
                    <div className="mod-empty" style={{ background: 'var(--card-bg)', borderRadius: '20px', padding: '4rem' }}>
                        <Gift size={48} style={{ opacity: 0.2 }} />
                        <p>No hay sorteos activos en este momento. ¡Vuelve pronto!</p>
                    </div>
                ) : (
                    <div className="giveaway-grid">
                        {giveaways.map(g => (
                            <Link to={`/giveaways/${g._id}`} key={g._id} className="giveaway-card">
                                {g.banner_url && (
                                    <div className="giveaway-card__banner">
                                        <img src={g.banner_url} alt={g.title} />
                                    </div>
                                )}
                                <div className="giveaway-card__content">
                                    <div className="giveaway-card__host">
                                        <div className="host-dot"></div>
                                        {g.host_name}
                                    </div>
                                    <h3 className="giveaway-card__title">{g.title}</h3>
                                    <div className="giveaway-card__prizes">
                                        <Gift size={14} />
                                        <span>{g.prizes.map(p => p.name).join(', ')}</span>
                                    </div>
                                    <div className="giveaway-card__footer">
                                        <div className="giveaway-card__stat">
                                            <Clock size={14} />
                                            <span>{new Date(g.end_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="giveaway-card__btn">
                                            Participar <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
