import { useState, useEffect } from 'react'
import { 
    Plus, Trash2, Calendar, Gift, Users, Shield, 
    Bell, Image as ImageIcon, Link as LinkIcon, 
    Info, Clock, Save, X, Loader2, Sparkles, ChevronDown, Settings
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import api from '../utils/api'

export default function GiveawaysConfig({ guildId, plan }) {
    const { t } = useLanguage()
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
            alert("Error saving giveaway")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="mod-loading"><Loader2 className="spin" /> {t('common.loading')}</div>

    return (
        <div className="mod-section">
            <div className="mod-block">
                <div className="mod-block__header">
                    <h4>{t('server_config.modules.giveaways.label')}</h4>
                    <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? <><X size={14} /> {t('common.cancel')}</> : <><Plus size={14} /> Nuevo Sorteo</>}
                    </button>
                </div>

                {showForm ? (
                    <div className="giveaway-form">
                        {/* Host Section */}
                        <div className="form-section">
                            <h5><Users size={16} /> Información del Host</h5>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label>Host Name</label>
                                    <input 
                                        type="text" 
                                        className="config-input" 
                                        value={form.host_name}
                                        onChange={e => setForm({...form, host_name: e.target.value})}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Host Server Invite</label>
                                    <input 
                                        type="text" 
                                        className="config-input" 
                                        value={form.host_invite}
                                        onChange={e => setForm({...form, host_invite: e.target.value})}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Host Discord ID</label>
                                    <input 
                                        type="text" 
                                        className="config-input" 
                                        value={form.host_id}
                                        onChange={e => setForm({...form, host_id: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Appearance Section */}
                        <div className="form-section">
                            <h5><ImageIcon size={16} /> Apariencia</h5>
                            <div className="form-field">
                                <label>Title</label>
                                <input 
                                    type="text" 
                                    className="config-input" 
                                    value={form.title}
                                    onChange={e => setForm({...form, title: e.target.value})}
                                />
                            </div>
                            <div className="form-field">
                                <label>Description</label>
                                <textarea 
                                    className="config-textarea" 
                                    value={form.description}
                                    onChange={e => setForm({...form, description: e.target.value})}
                                />
                            </div>
                            <div className="form-field">
                                <label>Banner URL</label>
                                <input 
                                    type="text" 
                                    className="config-input" 
                                    value={form.banner_url}
                                    onChange={e => setForm({...form, banner_url: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Duration Section */}
                        <div className="form-section">
                            <h5><Calendar size={16} /> Duración</h5>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label>Start Date (UTC)</label>
                                    <input 
                                        type="datetime-local" 
                                        className="config-input" 
                                        value={form.start_date}
                                        onChange={e => setForm({...form, start_date: e.target.value})}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>End Date (UTC)</label>
                                    <input 
                                        type="datetime-local" 
                                        className="config-input" 
                                        value={form.end_date}
                                        onChange={e => setForm({...form, end_date: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Prizes Section */}
                        <div className="form-section">
                            <div className="section-header">
                                <h5><Gift size={16} /> Premios</h5>
                                <button className="btn btn-secondary btn-xs" onClick={handleAddPrize}>+ Add Prize</button>
                            </div>
                            <div className="prizes-container">
                                {form.prizes.map((prize, idx) => (
                                    <div key={idx} className="prize-card">
                                        <div className="form-grid">
                                            <div className="form-field">
                                                <label>Prize Name</label>
                                                <input 
                                                    className="config-input"
                                                    value={prize.name}
                                                    onChange={e => {
                                                        const newPrizes = [...form.prizes]
                                                        newPrizes[idx].name = e.target.value
                                                        setForm({...form, prizes: newPrizes})
                                                    }}
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>Winner Count</label>
                                                <input 
                                                    type="number" 
                                                    className="config-input"
                                                    value={prize.winner_count}
                                                    onChange={e => {
                                                        const newPrizes = [...form.prizes]
                                                        newPrizes[idx].winner_count = parseInt(e.target.value)
                                                        setForm({...form, prizes: newPrizes})
                                                    }}
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>Claim Requirement (Optional)</label>
                                                <input 
                                                    className="config-input"
                                                    placeholder="Ej: Suscribirse a YT"
                                                    value={prize.claim_requirement}
                                                    onChange={e => {
                                                        const newPrizes = [...form.prizes]
                                                        newPrizes[idx].claim_requirement = e.target.value
                                                        setForm({...form, prizes: newPrizes})
                                                    }}
                                                />
                                            </div>
                                            {form.prizes.length > 1 && (
                                                <button className="btn-icon text-red remove-prize" onClick={() => handleRemovePrize(idx)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Requirements Section */}
                        <div className="form-section">
                            <div className="section-header">
                                <h5><Shield size={16} /> Requisitos de Discord</h5>
                                <button className="btn btn-secondary btn-xs" onClick={handleAddRequirement}>+ Add Server Requirement</button>
                            </div>
                            
                            <div className="requirements-list">
                                <div className="form-field">
                                    <label>Discord Account Age</label>
                                    <select 
                                        className="config-select"
                                        value={form.age_requirement}
                                        onChange={e => setForm({...form, age_requirement: e.target.value})}
                                    >
                                        <option value="none">None</option>
                                        <option value="7_days">7 days</option>
                                        <option value="30_days">30 days</option>
                                        <option value="90_days">90 days</option>
                                        <option value="custom">Custom days</option>
                                    </select>
                                </div>
                                
                                {form.age_requirement === 'custom' && (
                                    <div className="form-field">
                                        <label>Custom Days</label>
                                        <input 
                                            type="number" 
                                            className="config-input"
                                            value={form.custom_age_days}
                                            onChange={e => setForm({...form, custom_age_days: parseInt(e.target.value)})}
                                        />
                                    </div>
                                )}

                                {form.requirements.map((req, idx) => (
                                    <div key={idx} className="requirement-item">
                                        <div className="form-grid">
                                            <div className="form-field">
                                                <label>Server Invite URL</label>
                                                <input 
                                                    className="config-input"
                                                    value={req.invite_url}
                                                    onChange={e => {
                                                        const newReqs = [...form.requirements]
                                                        newReqs[idx].invite_url = e.target.value
                                                        setForm({...form, requirements: newReqs})
                                                    }}
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>Points (Weight)</label>
                                                <input 
                                                    type="number"
                                                    className="config-input"
                                                    value={req.points}
                                                    onChange={e => {
                                                        const newReqs = [...form.requirements]
                                                        newReqs[idx].points = parseInt(e.target.value)
                                                        setForm({...form, requirements: newReqs})
                                                    }}
                                                />
                                            </div>
                                            <button className="btn-icon text-red" onClick={() => {
                                                const newReqs = form.requirements.filter((_, i) => i !== idx)
                                                setForm({...form, requirements: newReqs})
                                            }}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Extra Settings Section */}
                        <div className="form-section">
                            <h5><Settings size={16} /> Configuración Avanzada</h5>
                            <div className="toggle-list">
                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-label">Sistema de Puntos (Weighted)</span>
                                        <span className="toggle-desc">Más puntos = más probabilidad de ganar</span>
                                    </div>
                                    <div 
                                        className={`sc__module-toggle ${form.points_enabled ? 'sc__module-toggle--on' : ''}`}
                                        onClick={() => setForm({...form, points_enabled: !form.points_enabled})}
                                    />
                                </div>
                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-label">Enviar DM a Ganadores</span>
                                        <span className="toggle-desc">El bot avisará automáticamente</span>
                                    </div>
                                    <div 
                                        className={`sc__module-toggle ${form.dm_winners ? 'sc__module-toggle--on' : ''}`}
                                        onClick={() => setForm({...form, dm_winners: !form.dm_winners})}
                                    />
                                </div>
                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-label">Reclamar Premio (Claim)</span>
                                        <span className="toggle-desc">Los ganadores deben reclamar el premio</span>
                                    </div>
                                    <div 
                                        className={`sc__module-toggle ${form.require_claim ? 'sc__module-toggle--on' : ''}`}
                                        onClick={() => setForm({...form, require_claim: !form.require_claim})}
                                    />
                                </div>
                            </div>
                            
                            <div className="form-field">
                                <label>Webhook URL (Discord Events)</label>
                                <input 
                                    type="text" 
                                    className="config-input" 
                                    placeholder="https://discord.com/api/webhooks/..."
                                    value={form.webhook_url}
                                    onChange={e => setForm({...form, webhook_url: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />} {t('common.save')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="giveaway-list">
                        {giveaways.length === 0 ? (
                            <div className="mod-empty">
                                <Sparkles size={32} style={{ opacity: 0.3 }} />
                                <p>No hay sorteos creados.</p>
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
