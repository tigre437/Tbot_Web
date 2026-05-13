import { useState, useEffect } from 'react'
import { 
    Plus, Trash2, Calendar, Gift, Users, Shield, 
    Bell, Image as ImageIcon, Link as LinkIcon, 
    Info, Clock, Save, X, Loader2, Sparkles, ChevronDown, Settings, Globe, Search, Hash
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import api from '../utils/api'

export default function GiveawaysConfig({ guildId, plan }) {
    const { t } = useLanguage()
    const [giveaways, setGiveaways] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [activeSection, setActiveSection] = useState('basic')
    
    // Announce Modal States
    const [showAnnounceModal, setShowAnnounceModal] = useState(false)
    const [channels, setChannels] = useState([])
    const [loadingChannels, setLoadingChannels] = useState(false)
    const [channelSearch, setChannelSearch] = useState('')
    const [selectedGiveaway, setSelectedGiveaway] = useState(null)
    const [announcing, setAnnouncing] = useState(false)

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

    const fetchChannels = async () => {
        setLoadingChannels(true)
        try {
            const res = await api.get(`/servers/${guildId}/channels`)
            // El backend devuelve { text: [], categories: [], voice: [] }
            setChannels(res.data.text || [])
        } catch (e) {
            console.error("Error fetching channels", e)
        } finally {
            setLoadingChannels(false)
        }
    }

    useEffect(() => {
        fetchGiveaways()
    }, [guildId])

    const handleOpenAnnounce = (giveaway) => {
        setSelectedGiveaway(giveaway)
        setShowAnnounceModal(true)
        if (channels.length === 0) fetchChannels()
    }

    const handleConfirmAnnounce = async (channelId) => {
        setAnnouncing(true)
        try {
            await api.post(`/giveaways/${selectedGiveaway._id}/announce`, { channel_id: channelId })
            alert("¡Sorteo anunciado con éxito en Discord!")
            setShowAnnounceModal(false)
            fetchGiveaways()
        } catch (e) {
            alert("Error al anunciar el sorteo.")
        } finally {
            setAnnouncing(false)
        }
    }

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
            if (!form.title || !form.end_date || form.prizes.some(p => !p.name)) {
                alert("Por favor rellena el título, la fecha de fin y al menos un premio.")
                setSaving(false)
                return
            }
            await api.post(`/servers/${guildId}/giveaways`, form)
            setShowForm(false)
            fetchGiveaways()
        } catch (e) {
            alert(t('common.error') || "Error al guardar")
        } finally {
            setSaving(false)
        }
    }

    const filteredChannels = channels.filter(c => 
        c.name.toLowerCase().includes(channelSearch.toLowerCase())
    )

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
                    <div className="giveaway-form page-enter">
                        <div className="as-tabs" style={{ marginBottom: '1.5rem' }}>
                            <button className={`as-tab ${activeSection === 'basic' ? 'as-tab--active' : ''}`} onClick={() => setActiveSection('basic')}>
                                <Info size={14} /> Principal
                            </button>
                            <button className={`as-tab ${activeSection === 'prizes' ? 'as-tab--active' : ''}`} onClick={() => setActiveSection('prizes')}>
                                <Gift size={14} /> Premios
                            </button>
                            <button className={`as-tab ${activeSection === 'reqs' ? 'as-tab--active' : ''}`} onClick={() => setActiveSection('reqs')}>
                                <Shield size={14} /> Requisitos
                            </button>
                            <button className={`as-tab ${activeSection === 'advanced' ? 'as-tab--active' : ''}`} onClick={() => setActiveSection('advanced')}>
                                <Settings size={14} /> Avanzado
                            </button>
                        </div>

                        {activeSection === 'basic' && (
                            <div className="form-grid-wrap">
                                <div className="form-section">
                                    <h5><ImageIcon size={16} /> Contenido</h5>
                                    <div className="form-field">
                                        <label>Título del Sorteo *</label>
                                        <input type="text" className="config-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ej: ¡Sorteo de 5.000 Monedas!" />
                                    </div>
                                    <div className="form-field">
                                        <label>Descripción / Instrucciones</label>
                                        <textarea className="config-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} placeholder="Describe qué deben hacer los participantes..." />
                                    </div>
                                    <div className="form-field">
                                        <label>URL de Imagen/Banner</label>
                                        <input type="text" className="config-input" value={form.banner_url} onChange={e => setForm({...form, banner_url: e.target.value})} placeholder="https://..." />
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h5><Calendar size={16} /> Planificación (UTC)</h5>
                                    <div className="form-grid">
                                        <div className="form-field">
                                            <label>Fecha de Inicio</label>
                                            <input type="datetime-local" className="config-input" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
                                        </div>
                                        <div className="form-field">
                                            <label>Fecha de Finalización *</label>
                                            <input type="datetime-local" className="config-input" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h5><Users size={16} /> Información del Host</h5>
                                    <div className="form-grid">
                                        <div className="form-field">
                                            <label>Nombre del Host</label>
                                            <input type="text" className="config-input" value={form.host_name} onChange={e => setForm({...form, host_name: e.target.value})} placeholder="Ej: Staff TBot" />
                                        </div>
                                        <div className="form-field">
                                            <label>Invitación de Discord</label>
                                            <input type="text" className="config-input" value={form.host_invite} onChange={e => setForm({...form, host_invite: e.target.value})} placeholder="discord.gg/invite" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'prizes' && (
                            <div className="form-section">
                                <div className="section-header">
                                    <h5><Gift size={16} /> Gestión de Premios</h5>
                                    <button className="btn btn-secondary btn-xs" onClick={handleAddPrize}>+ Añadir otro premio</button>
                                </div>
                                {form.prizes.map((prize, idx) => (
                                    <div key={idx} className="prize-card-edit" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr auto' }}>
                                            <div className="form-field">
                                                <label>Nombre del Premio</label>
                                                <input className="config-input" value={prize.name} onChange={e => {
                                                    const newPrizes = [...form.prizes]
                                                    newPrizes[idx].name = e.target.value
                                                    setForm({...form, prizes: newPrizes})
                                                }} placeholder="Nitro, Dinero, Rol..." />
                                            </div>
                                            <div className="form-field">
                                                <label>Ganadores</label>
                                                <input type="number" className="config-input" value={prize.winner_count} onChange={e => {
                                                    const newPrizes = [...form.prizes]
                                                    newPrizes[idx].winner_count = parseInt(e.target.value)
                                                    setForm({...form, prizes: newPrizes})
                                                }} min={1} />
                                            </div>
                                            <div className="form-field" style={{ alignSelf: 'center', marginTop: '1.5rem' }}>
                                                {form.prizes.length > 1 && (
                                                    <button className="btn-icon text-red" onClick={() => handleRemovePrize(idx)}><Trash2 size={16} /></button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeSection === 'reqs' && (
                            <div className="form-section">
                                <h5><Shield size={16} /> Requisitos de Entrada</h5>
                                <div className="form-field">
                                    <label>Antigüedad de la cuenta de Discord</label>
                                    <select className="config-select" value={form.age_requirement} onChange={e => setForm({...form, age_requirement: e.target.value})}>
                                        <option value="none">Sin requisito</option>
                                        <option value="7_days">Mínimo 7 días</option>
                                        <option value="30_days">Mínimo 30 días</option>
                                        <option value="90_days">Mínimo 90 días</option>
                                    </select>
                                </div>
                                
                                <div className="section-header" style={{ marginTop: '1.5rem' }}>
                                    <label>Servidores requeridos (Joins)</label>
                                    <button className="btn btn-secondary btn-xs" onClick={handleAddRequirement}>+ Añadir Servidor</button>
                                </div>
                                {form.requirements.map((req, idx) => (
                                    <div key={idx} className="req-item" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <input className="config-input" placeholder="ID del Servidor" value={req.value} onChange={e => {
                                            const newReqs = [...form.requirements]
                                            newReqs[idx].value = e.target.value
                                            setForm({...form, requirements: newReqs})
                                        }} />
                                        <input className="config-input" placeholder="Invitación URL" value={req.invite_url} onChange={e => {
                                            const newReqs = [...form.requirements]
                                            newReqs[idx].invite_url = e.target.value
                                            setForm({...form, requirements: newReqs})
                                        }} />
                                        <button className="btn-icon text-red" onClick={() => {
                                            const newReqs = form.requirements.filter((_, i) => i !== idx)
                                            setForm({...form, requirements: newReqs})
                                        }}><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeSection === 'advanced' && (
                            <div className="form-section">
                                <h5><Settings size={16} /> Configuración Avanzada</h5>
                                <div className="toggle-list">
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-label">Mensaje Directo (DM) a ganadores</span>
                                            <span className="toggle-desc">Envía un mensaje privado automático a los ganadores.</span>
                                        </div>
                                        <div className={`sc__module-toggle ${form.dm_winners ? 'sc__module-toggle--on' : ''}`} onClick={() => setForm({...form, dm_winners: !form.dm_winners})} />
                                    </div>
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-label">Requerir Reclamo (Claim)</span>
                                            <span className="toggle-desc">Los ganadores deben pulsar un botón para reclamar su premio.</span>
                                        </div>
                                        <div className={`sc__module-toggle ${form.require_claim ? 'sc__module-toggle--on' : ''}`} onClick={() => setForm({...form, require_claim: !form.require_claim})} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="form-actions" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? <><Loader2 className="spin" size={16} /> Guardando...</> : <><Save size={16} /> Guardar Sorteo</>}
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
                                        <div className="panel-item__icon" style={{ background: 'rgba(255, 215, 0, 0.12)', color: '#FFD700' }}><Gift size={18} /></div>
                                        <div className="panel-item__info">
                                            <span className="panel-item__title">{g.title}</span>
                                            <div className="panel-item__meta">
                                                <span className={`badge ${g.status === 'active' ? 'badge-green' : 'badge-blurple'}`}>{g.status.toUpperCase()}</span>
                                                <span className="panel-item__counter"><Clock size={12} /> {new Date(g.end_date).toLocaleDateString()}</span>
                                                <span className="panel-item__ch"><Users size={12} /> {g.winners?.length || 0} ganadores</span>
                                            </div>
                                        </div>
                                        <div className="panel-item__actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                                className="btn btn-primary btn-xs"
                                                onClick={() => handleOpenAnnounce(g)}
                                                title="Anunciar en Discord"
                                            >
                                                <Bell size={14} /> Anunciar
                                            </button>
                                            <button className="btn btn-secondary btn-xs"><Settings size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Anuncio */}
            {showAnnounceModal && (
                <div className="modal-overlay" onClick={() => setShowAnnounceModal(false)}>
                    <div className="modal-content modal-content--sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><Bell size={18} /> Anunciar Sorteo</h3>
                            <button className="modal-close" onClick={() => setShowAnnounceModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                                Selecciona el canal donde quieres publicar el anuncio del sorteo <b>{selectedGiveaway?.title}</b>.
                            </p>
                            
                            <div className="dashboard__search" style={{ marginBottom: '1rem', width: '100%' }}>
                                <Search size={16} />
                                <input 
                                    type="text" 
                                    className="dashboard__search-input" 
                                    placeholder="Buscar canal..." 
                                    value={channelSearch}
                                    onChange={e => setChannelSearch(e.target.value)}
                                />
                            </div>

                            <div className="channel-select-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {loadingChannels ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="spin" /></div>
                                ) : filteredChannels.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No se encontraron canales.</div>
                                ) : (
                                    filteredChannels.map(channel => (
                                        <div 
                                            key={channel.id} 
                                            className="channel-select-item"
                                            onClick={() => handleConfirmAnnounce(channel.id)}
                                            style={{ 
                                                padding: '0.75rem', 
                                                borderRadius: '8px', 
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Hash size={16} style={{ opacity: 0.5 }} />
                                            <span>{channel.name}</span>
                                            {announcing && <Loader2 size={14} className="spin" style={{ marginLeft: 'auto' }} />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
