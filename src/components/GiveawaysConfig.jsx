import { useState, useEffect } from 'react'
import { 
    Plus, Trash2, Calendar, Gift, Users, Shield, 
    Bell, Image as ImageIcon, Link as LinkIcon, 
    Info, Clock, Save, X, Loader2, Sparkles, ChevronDown, Settings
} from 'lucide-react'
import api from '../utils/api'

export default function GiveawaysConfig({ guildId, plan }) {
    const [giveaways, setGiveaways] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)

    // Form state
    const [form, setForm] = useState({
        host_name: '',
        host_invite: '',
        host_id: '',
        title: '',
        description: '',
        banner_url: '',
        start_date: '',
        end_date: '',
        prizes: [{ name: '', winner_count: 1, claim_requirement: '' }],
        requirements: [],
        age_requirement: 'none',
        points_enabled: false,
        dm_winners: true,
        require_claim: true,
        claim_expiration_hours: 24,
        signup_mode: false,
        webhook_url: ''
    })

    const fetchGiveaways = async () => {
        try {
            const res = await api.get(`/servers/${guildId}/giveaways`)
            setGiveaways(res.data)
        } catch (e) {
            console.error("Error fetching giveaways", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGiveaways()
    }, [guildId])

    const handleAddPrize = () => {
        setForm({
            ...form,
            prizes: [...form.prizes, { name: '', winner_count: 1, claim_requirement: '' }]
        })
    }

    const handleRemovePrize = (index) => {
        const newPrizes = form.prizes.filter((_, i) => i !== index)
        setForm({ ...form, prizes: newPrizes })
    }

    const handleAddRequirement = () => {
        setForm({
            ...form,
            requirements: [...form.requirements, { type: 'guild_join', value: '', points: 1, invite_url: '' }]
        })
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await api.post(`/servers/${guildId}/giveaways`, form)
            setShowForm(false)
            fetchGiveaways()
        } catch (e) {
            alert("Error al guardar el sorteo")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="mod-loading"><Loader2 className="spin" /> Cargando sorteos...</div>

    return (
        <div className="mod-section">
            <div className="mod-block">
                <div className="mod-block__header">
                    <h4>Gestión de Sorteos</h4>
                    <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Nuevo Sorteo</>}
                    </button>
                </div>

                {showForm ? (
                    <div className="giveaway-form">
                        <div className="form-section">
                            <h5><Users size={16} /> Información del Host</h5>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label>Nombre del Host</label>
                                    <input 
                                        type="text" 
                                        className="config-input" 
                                        value={form.host_name}
                                        onChange={e => setForm({...form, host_name: e.target.value})}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Invitación del Servidor</label>
                                    <input 
                                        type="text" 
                                        className="config-input" 
                                        value={form.host_invite}
                                        onChange={e => setForm({...form, host_invite: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h5><ImageIcon size={16} /> Apariencia</h5>
                            <div className="form-field">
                                <label>Título</label>
                                <input 
                                    type="text" 
                                    className="config-input" 
                                    value={form.title}
                                    onChange={e => setForm({...form, title: e.target.value})}
                                />
                            </div>
                            <div className="form-field">
                                <label>Descripción</label>
                                <textarea 
                                    className="config-textarea" 
                                    value={form.description}
                                    onChange={e => setForm({...form, description: e.target.value})}
                                />
                            </div>
                            <div className="form-field">
                                <label>URL del Banner</label>
                                <input 
                                    type="text" 
                                    className="config-input" 
                                    value={form.banner_url}
                                    onChange={e => setForm({...form, banner_url: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h5><Calendar size={16} /> Duración</h5>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label>Fecha Inicio (UTC)</label>
                                    <input 
                                        type="datetime-local" 
                                        className="config-input" 
                                        value={form.start_date}
                                        onChange={e => setForm({...form, start_date: e.target.value})}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Fecha Fin (UTC)</label>
                                    <input 
                                        type="datetime-local" 
                                        className="config-input" 
                                        value={form.end_date}
                                        onChange={e => setForm({...form, end_date: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <div className="section-header">
                                <h5><Gift size={16} /> Premios</h5>
                                <button className="btn btn-secondary btn-xs" onClick={handleAddPrize}>+ Añadir Premio</button>
                            </div>
                            {form.prizes.map((prize, idx) => (
                                <div key={idx} className="prize-card">
                                    <div className="form-grid">
                                        <input 
                                            placeholder="Nombre del premio"
                                            className="config-input"
                                            value={prize.name}
                                            onChange={e => {
                                                const newPrizes = [...form.prizes]
                                                newPrizes[idx].name = e.target.value
                                                setForm({...form, prizes: newPrizes})
                                            }}
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Ganadores"
                                            className="config-input"
                                            value={prize.winner_count}
                                            onChange={e => {
                                                const newPrizes = [...form.prizes]
                                                newPrizes[idx].winner_count = parseInt(e.target.value)
                                                setForm({...form, prizes: newPrizes})
                                            }}
                                        />
                                        {form.prizes.length > 1 && (
                                            <button className="btn-icon text-red" onClick={() => handleRemovePrize(idx)}><Trash2 size={16} /></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="form-actions">
                            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />} Guardar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="giveaway-list">
                        {giveaways.length === 0 ? (
                            <div className="mod-empty">
                                <Sparkles size={32} style={{ opacity: 0.3 }} />
                                <p>No hay sorteos activos.</p>
                            </div>
                        ) : (
                            <div className="panel-list">
                                {giveaways.map(g => (
                                    <div key={g._id} className="panel-item">
                                        <div className="panel-item__icon"><Gift size={18} /></div>
                                        <div className="panel-item__info">
                                            <span className="panel-item__title">{g.title}</span>
                                            <span className="panel-item__meta">
                                                <span className="badge badge-blurple">{g.status}</span>
                                                <span>{new Date(g.end_date).toLocaleDateString()}</span>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
