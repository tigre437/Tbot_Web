import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    ChevronLeft, ChevronDown, Ticket, Users, Bell, Mic2, MessageSquare, Shield,
    Save, ToggleLeft, ToggleRight, Plus, Trash2, Pencil,
    CheckCircle2, AlertCircle, Loader2, Bot, Hash, X, Info, Clock, BookOpen, Star, Sparkles
} from 'lucide-react'
import api from '../utils/api'
import logoImg from '../assets/logo256.png'
import ArrivalStudio from '../components/ArrivalStudio'
import './ServerConfig.css'

const MODULES = [
    { id: 'tickets', icon: Ticket, label: 'Tickets', color: '#5865F2', desc: 'Paneles de soporte' },
    { id: 'autoroles', icon: Users, label: 'Autoroles', color: '#57F287', desc: 'Paneles de rol y entrada' },
    { id: 'welcome', icon: Bell, label: 'Bienvenida', color: '#FEE75C', desc: 'Mensajes de bienvenida' },
    { id: 'voice', icon: Mic2, label: 'Canales de Voz', color: '#EB459E', desc: 'Canales dinámicos' },
    { id: 'admin_chat', icon: MessageSquare, label: 'Admin Chat', color: '#00d4ff', desc: 'Chat privado admins' },
    { id: 'moderation', icon: Shield, label: 'Moderación', color: '#FF6B6B', desc: 'Herramientas mod' },
    { id: 'levels', icon: Star, label: 'Niveles & XP', color: '#f5c518', desc: 'Roles por tiempo' },
]

const WELCOME_VARS = [
    { tag: '{{user}}', label: 'Mención usuario', desc: 'Menciona al usuario que entra. Ej: @TBot' },
    { tag: '{{nombre_canal}}', label: 'Canal principal', desc: 'Canal de sistema o #general del servidor' },
    { tag: '{{server}}', label: 'Nombre servidor', desc: 'Nombre del servidor de Discord' },
    { tag: '{{members}}', label: 'Nº miembros', desc: 'Total de miembros actuales del servidor' },
]

const TICKET_VARS = [
    { tag: '{{user}}', label: 'Mención usuario', desc: 'Menciona al usuario que abrió el ticket' },
    { tag: '{{ticket}}', label: 'Nº Ticket', desc: 'El número autoincremental del ticket (Ej: 14)' },
    { tag: '{{panel}}', label: 'Nombre panel', desc: 'Nombre del panel actual' },
]

// ─── COLOR UTILS ──────────────────────────────────────────────────────────────
/** Convert a Discord role color integer to a CSS hex string. Returns null if no color (0). */
function colorToHex(n) {
    if (!n || n === 0) return null
    return `#${n.toString(16).padStart(6, '0')}`
}

// ─── ROLE DOT ─────────────────────────────────────────────────────────────────
/** Small colored circle representing a Discord role color */
function RoleDot({ color, size = 9 }) {
    const hex = colorToHex(color)
    return (
        <span
            className="role-dot"
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: hex || 'var(--text-muted)',
                flexShrink: 0,
                display: 'inline-block',
                boxShadow: hex ? `0 0 4px ${hex}88` : 'none',
            }}
        />
    )
}

// ─── ROLE PICKER (single-select, custom dropdown with colors) ─────────────────
function RolePicker({ roles, value, onChange, placeholder = 'Selecciona un rol...' }) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const ref = useRef(null)
    const inputRef = useRef(null)

    const selected = roles.find(r => r.id === value)

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    useEffect(() => {
        if (open && inputRef.current) { setSearch(''); inputRef.current.focus() }
    }, [open])

    const filtered = search
        ? roles.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
        : roles

    return (
        <div className="role-picker" ref={ref}>
            <button type="button" className="role-picker__trigger" onClick={() => setOpen(o => !o)}>
                {selected ? (
                    <><RoleDot color={selected.color} size={10} /> <span style={{ color: `${colorToHex(selected.color) || 'var(--text-primary)'}` }}>@{selected.name}</span></>
                ) : (
                    <span className="role-picker__placeholder">{placeholder}</span>
                )}
                <ChevronDown size={14} className={`role-picker__chevron ${open ? 'role-picker__chevron--open' : ''}`} />
            </button>

            {open && (
                <div className="role-picker__dropdown">
                    <div className="role-picker__search-wrap">
                        <input
                            ref={inputRef}
                            className="role-picker__search"
                            placeholder="Buscar rol..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="role-picker__list">
                        <button type="button" className="role-picker__item" onClick={() => { onChange(''); setOpen(false) }}>
                            <span className="role-picker__none">— Ninguno —</span>
                        </button>
                        {filtered.map(r => {
                            const hex = colorToHex(r.color)
                            return (
                                <button type="button" key={r.id}
                                    className={`role-picker__item ${value === r.id ? 'role-picker__item--selected' : ''}`}
                                    onClick={() => { onChange(r.id); setOpen(false) }}>
                                    <RoleDot color={r.color} size={10} />
                                    <span style={{ color: hex || 'var(--text-primary)', fontWeight: 600 }}>@{r.name}</span>
                                    {value === r.id && <CheckCircle2 size={13} style={{ marginLeft: 'auto', color: 'var(--green)' }} />}
                                </button>
                            )
                        })}
                        {filtered.length === 0 && <p className="role-picker__empty">Sin resultados</p>}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── ROLE MULTI-CHIP (multi-select with colors) ───────────────────────────────
function RoleMultiPicker({ roles, selected, onChange, label }) {
    const toggle = (rid) => {
        onChange(selected.includes(rid) ? selected.filter(x => x !== rid) : [...selected, rid])
    }
    return (
        <div className="config-roles">
            {roles.map(r => {
                const isSelected = selected.includes(r.id)
                const hex = colorToHex(r.color)
                return (
                    <button
                        key={r.id}
                        type="button"
                        className={`config-role-chip ${isSelected ? 'config-role-chip--selected' : ''}`}
                        style={isSelected && hex ? { borderColor: hex, color: hex, background: `${hex}18` } : {}}
                        onClick={() => toggle(r.id)}
                    >
                        <RoleDot color={r.color} size={8} />
                        @{r.name}
                        {isSelected && <CheckCircle2 size={11} />}
                    </button>
                )
            })}
        </div>
    )
}

// ─── TOOLTIP ──────────────────────────────────────────────────────────────────
function Tooltip({ text, children }) {
    const [visible, setVisible] = useState(false)
    const timerRef = useRef(null)
    const handleEnter = () => { timerRef.current = setTimeout(() => setVisible(true), 600) }
    const handleLeave = () => { clearTimeout(timerRef.current); setVisible(false) }
    return (
        <span className="tooltip-wrap" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            {children}
            {visible && <span className="tooltip-box"><Info size={11} /> {text}</span>}
        </span>
    )
}

// ─── EMBED LIMITS (Discord spec) ─────────────────────────────────────────────
const EMBED_LIMITS = {
    title: 256,
    description: 4096,
    footer: 2048,
    author: 256,
    field_name: 256,
    field_value: 1024,
    message: 2000,   // plain Discord message
}

// ─── CHAR COUNTER ─────────────────────────────────────────────────────────────
function CharCounter({ current, max }) {
    const pct = current / max
    const color = pct >= 1
        ? 'var(--red)'
        : pct >= 0.90
            ? '#FEE75C'
            : 'var(--text-muted)'
    return (
        <span className="char-counter" style={{ color }}>
            {current}<span style={{ opacity: 0.5 }}>/{max}</span>
        </span>
    )
}

// ─── TOAST HELPER ─────────────────────────────────────────────────────────────
function Toast({ toast }) {
    if (!toast) return null
    return (
        <div className={`mod-toast mod-toast--${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {toast.msg}
        </div>
    )
}

function useToast() {
    const [toast, setToast] = useState(null)
    const show = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }
    return [toast, show]
}

// ─── TRANSCRIPTS LIST ──────────────────────────────────────────────────────────
function TranscriptsList({ guildId }) {
    const [transcripts, setTranscripts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get(`/servers/${guildId}/transcripts`)
            .then(res => setTranscripts(res.data))
            .catch(() => setTranscripts([]))
            .finally(() => setLoading(false))
    }, [guildId])

    const viewTranscript = (id) => {
        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/transcripts/${id}`, '_blank')
    }

    if (loading) return <div className="mod-loading"><Loader2 size={20} className="spin" /> Cargando transcripciones...</div>
    if (transcripts.length === 0) return <div className="mod-empty"><Bot size={32} style={{ opacity: 0.3 }} /><p>No hay transcripciones guardadas aún.</p></div>

    return (
        <div className="panel-list">
            {transcripts.map(t => (
                <div key={t.id} className="panel-item">
                    <div className="panel-item__icon" style={{ background: 'rgba(235, 69, 158, 0.12)', color: '#EB459E' }}><Bot size={18} /></div>
                    <div className="panel-item__info">
                        <span className="panel-item__title">Ticket: {t.ticket_name}</span>
                        <span className="panel-item__meta">
                            <span className="badge badge-blurple" style={{ fontSize: '0.65rem' }}>🎫 {t.author_id}</span>
                            <span className="panel-item__ch">Cerrado por: {t.closed_by_name}</span>
                            <span className="panel-item__counter">📅 {new Date(t.created_at).toLocaleDateString()}</span>
                        </span>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => viewTranscript(t.id)}>
                        Ver chat
                    </button>
                </div>
            ))}
        </div>
    )
}

// ─── TICKETS MODULE ───────────────────────────────────────────────────────────
function TicketsConfig({ guildId, channels, roles }) {
    const [tab, setTab] = useState('panels')
    const [panels, setPanels] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [deleting, setDeleting] = useState(null)
    const [saving, setSaving] = useState(false)
    const [toast, showToast] = useToast()
    const [form, setForm] = useState({
        channel_id: '', titulo: '', descripcion: '', tipo: 'boton',
        category_id: '', color: '#5865F2', log_channel_id: '',
        allowed_role_ids: [], mention_role_ids: [], image_url: '', footer_text: ''
    })

    // ── Embed editor state ──
    const [editEmbedPanel, setEditEmbedPanel] = useState(null)  // panel id being edited
    const [embedForm, setEmbedForm] = useState({})
    const [embedSaving, setEmbedSaving] = useState(false)

    // ── Schedule state ──
    const [scheduleForm, setScheduleForm] = useState({
        enabled: false, dias: [0, 1, 2, 3, 4],
        hora_inicio: '09:00', hora_fin: '18:00', timezone: 'Europe/Madrid',
        mensaje: 'Nuestro horario de soporte ha finalizado. Te responderemos lo antes posible cuando volvamos a estar operativos.'
    })
    const [scheduleSaving, setScheduleSaving] = useState(false)

    const openEmbedEditor = (p) => {
        if (editEmbedPanel === p.id_panel) { setEditEmbedPanel(null); return }
        setEmbedForm({
            message_title: p.message_title || '',
            message_description: p.message_description || '',
            message_color: p.message_color || '#5865F2',
            message_image_url: p.message_image_url || '',
            message_thumbnail_url: p.message_thumbnail_url || '',
            message_footer_text: p.message_footer_text || '',
            message_footer_icon: p.message_footer_icon || '',
        })
        setEditEmbedPanel(p.id_panel)
    }

    const handleSaveEmbed = async (panelId) => {
        setEmbedSaving(true)
        try {
            await api.patch(`/servers/${guildId}/tickets/${panelId}/message`, embedForm)
            showToast('✅ Embed del ticket guardado.')
            setEditEmbedPanel(null)
            load()
        } catch (e) { showToast(e.response?.data?.detail || 'Error al guardar.', 'error') }
        finally { setEmbedSaving(false) }
    }

    const load = async () => {
        try { const res = await api.get(`/servers/${guildId}/tickets`); setPanels(res.data) }
        catch { setPanels([]) }

        try { const res = await api.get(`/servers/${guildId}/tickets/schedule`); setScheduleForm(res.data) }
        catch { }
        finally { setLoading(false) }
    }
    useEffect(() => { load() }, [guildId])

    const handleSaveSchedule = async () => {
        setScheduleSaving(true)
        try {
            await api.post(`/servers/${guildId}/tickets/schedule`, scheduleForm)
            showToast('✅ Horario de soporte guardado correctamente.')
        } catch (e) { showToast('Error al guardar el horario.', 'error') }
        finally { setScheduleSaving(false) }
    }

    const handleCreate = async () => {
        if (!form.channel_id || !form.titulo) return showToast('Canal y título son obligatorios.', 'error')
        setSaving(true)
        try {
            await api.post(`/servers/${guildId}/tickets`, form)
            showToast('✅ Panel enviado a Discord y guardado.')
            setShowForm(false)
            setForm({ channel_id: '', titulo: '', descripcion: '', tipo: 'boton', category_id: '', color: '#5865F2', log_channel_id: '', allowed_role_ids: [], mention_role_ids: [], image_url: '', footer_text: '' })
            load()
        } catch (e) { showToast(e.response?.data?.detail || 'Error al crear el panel.', 'error') }
        finally { setSaving(false) }
    }

    const handleDelete = async (panelId) => {
        setDeleting(panelId)
        try { await api.delete(`/servers/${guildId}/tickets/${panelId}`); showToast('🗑️ Panel eliminado.'); load() }
        catch (e) { showToast(e.response?.data?.detail || 'Error al eliminar.', 'error') }
        finally { setDeleting(null) }
    }

    const textChannels = channels?.text || []
    const categories = channels?.categories || []

    return (
        <div className="mod-section">
            <Toast toast={toast} />

            <div className="mod-tabs">
                <button className={`mod-tab ${tab === 'panels' ? 'mod-tab--active' : ''}`} onClick={() => setTab('panels')}>Paneles</button>
                <button className={`mod-tab ${tab === 'transcripts' ? 'mod-tab--active' : ''}`} onClick={() => setTab('transcripts')}>Transcripciones</button>
                <button className={`mod-tab ${tab === 'schedule' ? 'mod-tab--active' : ''}`} onClick={() => setTab('schedule')}>Horarios</button>
            </div>

            {tab === 'panels' ? (
                <>
                    <div className="mod-block">
                        <div className="mod-block__header">
                            <h4>Paneles configurados</h4>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>
                                {showForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Nuevo panel</>}
                            </button>
                        </div>
                        {loading ? <div className="mod-loading"><Loader2 size={20} className="spin" /> Cargando paneles...</div>
                            : panels.length === 0 ? <div className="mod-empty"><Ticket size={32} style={{ opacity: 0.3 }} /><p>No hay paneles configurados aún.</p></div>
                                : <div className="panel-list">
                                    {panels.map(p => (
                                        <div key={p.id_panel}>
                                            <div className="panel-item">
                                                <div className="panel-item__icon" style={{ background: 'rgba(88,101,242,0.12)', color: 'var(--blurple-light)' }}><Ticket size={18} /></div>
                                                <div className="panel-item__info">
                                                    <span className="panel-item__title">{p.ticket_title}</span>
                                                    <span className="panel-item__meta">
                                                        <span className={`badge ${p.type === 'dropdown' ? 'badge-blurple' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>{p.type === 'dropdown' ? 'Desplegable' : 'Botón'}</span>
                                                        {p.channel_name && <span className="panel-item__ch"><Hash size={11} />{p.channel_name}</span>}
                                                        <span className="panel-item__counter">🎫 {p.ticket_counter} tickets</span>
                                                        {p.options?.length > 0 && <span className="panel-item__opts">{p.options.length} opciones</span>}
                                                    </span>
                                                </div>
                                                <button
                                                    className={`panel-item__edit ${editEmbedPanel === p.id_panel ? 'panel-item__edit--active' : ''}`}
                                                    onClick={() => openEmbedEditor(p)}
                                                    title="Configurar embed del ticket"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button className="panel-item__delete" onClick={() => handleDelete(p.id_panel)} disabled={deleting === p.id_panel} title="Borrar panel y mensaje de Discord">
                                                    {deleting === p.id_panel ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />}
                                                </button>
                                            </div>

                                            {/* ── EMBED EDITOR ── */}
                                            {editEmbedPanel === p.id_panel && (
                                                <div className="embed-editor">
                                                    <p className="embed-editor__hint">Este embed se envía <strong>dentro del canal del ticket</strong> al abrirlo.</p>
                                                    <div className="embed-editor__body">
                                                        <div className="embed-editor__fields">
                                                            <div className="form-grid">
                                                                <div className="form-field">
                                                                    <div className="form-field__label-row">
                                                                        <label>Título</label>
                                                                        <CharCounter current={embedForm.message_title.length} max={EMBED_LIMITS.title} />
                                                                    </div>
                                                                    <input className="config-input" value={embedForm.message_title} maxLength={EMBED_LIMITS.title}
                                                                        onChange={e => setEmbedForm(f => ({ ...f, message_title: e.target.value }))}
                                                                        placeholder="Ej: Tu ticket ha sido creado" />
                                                                </div>
                                                                <div className="form-field">
                                                                    <label>Color del embed</label>
                                                                    <div className="color-picker-wrap">
                                                                        <input type="color" className="color-picker" value={embedForm.message_color}
                                                                            onChange={e => setEmbedForm(f => ({ ...f, message_color: e.target.value }))} />
                                                                        <span className="color-picker-value">{embedForm.message_color.toUpperCase()}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="form-field form-field--full">
                                                                    <div className="form-field__label-row">
                                                                        <label>Descripción</label>
                                                                        <CharCounter current={embedForm.message_description.length} max={EMBED_LIMITS.description} />
                                                                    </div>
                                                                    <textarea className="config-textarea" rows={3} value={embedForm.message_description} maxLength={EMBED_LIMITS.description}
                                                                        onChange={e => setEmbedForm(f => ({ ...f, message_description: e.target.value }))}
                                                                        placeholder="Describe el proceso del ticket, normas, etc." />

                                                                    {/* TICKET EMBED TAGS */}
                                                                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '0.3rem' }}>Etiquetas:</span>
                                                                        {TICKET_VARS.map(v => (
                                                                            <Tooltip key={v.tag} text={v.desc}>
                                                                                <button type="button"
                                                                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '3px', background: 'rgba(88,101,242,0.15)', color: 'var(--blurple-light)', border: '1px solid rgba(88,101,242,0.3)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500 }}
                                                                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(88,101,242,0.3)'}
                                                                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(88,101,242,0.15)'}
                                                                                    onClick={() => {
                                                                                        const newDesc = embedForm.message_description + (embedForm.message_description ? ' ' : '') + v.tag;
                                                                                        if (newDesc.length <= EMBED_LIMITS.description) {
                                                                                            setEmbedForm(f => ({ ...f, message_description: newDesc }));
                                                                                        }
                                                                                    }}>
                                                                                    {v.tag}
                                                                                </button>
                                                                            </Tooltip>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="form-field">
                                                                    <label>URL imagen</label>
                                                                    <input className="config-input" value={embedForm.message_image_url}
                                                                        onChange={e => setEmbedForm(f => ({ ...f, message_image_url: e.target.value }))}
                                                                        placeholder="https://..." />
                                                                </div>
                                                                <div className="form-field">
                                                                    <label>URL miniatura</label>
                                                                    <input className="config-input" value={embedForm.message_thumbnail_url}
                                                                        onChange={e => setEmbedForm(f => ({ ...f, message_thumbnail_url: e.target.value }))}
                                                                        placeholder="https://..." />
                                                                </div>
                                                                <div className="form-field">
                                                                    <div className="form-field__label-row">
                                                                        <label>Pie de página</label>
                                                                        <CharCounter current={embedForm.message_footer_text.length} max={EMBED_LIMITS.footer} />
                                                                    </div>
                                                                    <input className="config-input" value={embedForm.message_footer_text} maxLength={EMBED_LIMITS.footer}
                                                                        onChange={e => setEmbedForm(f => ({ ...f, message_footer_text: e.target.value }))}
                                                                        placeholder="Ej: Soporte disponible 24/7" />
                                                                </div>
                                                                <div className="form-field">
                                                                    <label>Icono del pie</label>
                                                                    <input className="config-input" value={embedForm.message_footer_icon}
                                                                        onChange={e => setEmbedForm(f => ({ ...f, message_footer_icon: e.target.value }))}
                                                                        placeholder="https://..." />
                                                                </div>
                                                            </div>
                                                            <div className="form-actions" style={{ marginTop: '0.75rem' }}>
                                                                <button className="btn btn-secondary btn-sm" onClick={() => setEditEmbedPanel(null)}>Cancelar</button>
                                                                <button className="btn btn-primary btn-sm" onClick={() => handleSaveEmbed(p.id_panel)} disabled={embedSaving}>
                                                                    {embedSaving ? <><Loader2 size={14} className="spin" /> Guardando...</> : <><Save size={14} /> Guardar embed</>}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* ── Discord embed preview ── */}
                                                        <div className="embed-preview">
                                                            <p className="embed-preview__label">Vista previa</p>
                                                            <div className="embed-preview__card" style={{ '--embed-color': embedForm.message_color }}>
                                                                {embedForm.message_thumbnail_url && (
                                                                    <img className="embed-preview__thumb" src={embedForm.message_thumbnail_url}
                                                                        alt="thumb" onError={e => e.target.style.display = 'none'} />
                                                                )}
                                                                {embedForm.message_title && (
                                                                    <div className="embed-preview__title">
                                                                        {embedForm.message_title.replace(/\{\{user\}\}/g, '@TBot').replace(/\{\{ticket\}\}/g, '0014').replace(/\{\{panel\}\}/g, p.ticket_title)}
                                                                    </div>
                                                                )}
                                                                {embedForm.message_description && (
                                                                    <div className="embed-preview__desc">
                                                                        {embedForm.message_description.replace(/\{\{user\}\}/g, '@TBot').replace(/\{\{ticket\}\}/g, '0014').replace(/\{\{panel\}\}/g, p.ticket_title)}
                                                                    </div>
                                                                )}
                                                                {embedForm.message_image_url && (
                                                                    <img className="embed-preview__img" src={embedForm.message_image_url}
                                                                        alt="embed img" onError={e => e.target.style.display = 'none'} />
                                                                )}
                                                                {embedForm.message_footer_text && (
                                                                    <div className="embed-preview__footer">
                                                                        {embedForm.message_footer_icon && (
                                                                            <img src={embedForm.message_footer_icon} alt="" className="embed-preview__footer-icon"
                                                                                onError={e => e.target.style.display = 'none'} />
                                                                        )}
                                                                        {embedForm.message_footer_text}
                                                                    </div>
                                                                )}
                                                                {!embedForm.message_title && !embedForm.message_description && !embedForm.message_footer_text && (
                                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>El embed aparecerá aquí...</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>}
                    </div>

                    {showForm && (
                        <div className="mod-block mod-block--form">
                            <h4 className="mod-block__form-title">Crear nuevo panel de tickets</h4>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label>Canal donde enviar el panel *</label>
                                    <select className="config-select" value={form.channel_id} onChange={e => setForm(p => ({ ...p, channel_id: e.target.value }))}>
                                        <option value="">Selecciona un canal...</option>
                                        {textChannels.map(c => <option key={c.id} value={c.id}># {c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <div className="form-field__label-row">
                                        <label>Título del panel *</label>
                                        <CharCounter current={form.titulo.length} max={EMBED_LIMITS.title} />
                                    </div>
                                    <input className="config-input" value={form.titulo} maxLength={EMBED_LIMITS.title}
                                        onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} placeholder="Ej: Soporte General" />
                                </div>
                                <div className="form-field">
                                    <label>Tipo de panel</label>
                                    <div className="form-radio-group">
                                        {['boton', 'dropdown'].map(t => (
                                            <button key={t} type="button" className={`form-radio ${form.tipo === t ? 'form-radio--active' : ''}`} onClick={() => setForm(p => ({ ...p, tipo: t }))}>
                                                {t === 'boton' ? '🔘 Botón' : '📋 Desplegable'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>Categoría de tickets *</label>
                                    <select className="config-select" value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                                        <option value="">Selecciona categoría...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>📁 {c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-field form-field--full">
                                    <div className="form-field__label-row">
                                        <label>Descripción del panel</label>
                                        <CharCounter current={form.descripcion.length} max={EMBED_LIMITS.description} />
                                    </div>
                                    <textarea className="config-textarea" rows={3} value={form.descripcion} maxLength={EMBED_LIMITS.description}
                                        onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Describe el propósito del panel..." />
                                </div>
                                <div className="form-field">
                                    <label>Color del embed</label>
                                    <div className="color-picker-wrap">
                                        <input type="color" className="color-picker" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} />
                                        <span className="color-picker-value">{form.color.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>Canal de logs (transcripciones)</label>
                                    <select className="config-select" value={form.log_channel_id} onChange={e => setForm(p => ({ ...p, log_channel_id: e.target.value }))}>
                                        <option value="">Ninguno</option>
                                        {textChannels.map(c => <option key={c.id} value={c.id}># {c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>URL imagen (opcional)</label>
                                    <input className="config-input" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />
                                </div>
                                <div className="form-field">
                                    <div className="form-field__label-row">
                                        <label>Texto pie de página</label>
                                        <CharCounter current={form.footer_text.length} max={EMBED_LIMITS.footer} />
                                    </div>
                                    <input className="config-input" value={form.footer_text} maxLength={EMBED_LIMITS.footer}
                                        onChange={e => setForm(p => ({ ...p, footer_text: e.target.value }))} placeholder="Ej: Tiempo de respuesta: 24h" />
                                </div>
                                <div className="form-field form-field--full">
                                    <label>Roles con acceso a tickets</label>
                                    <RoleMultiPicker roles={roles} selected={form.allowed_role_ids}
                                        onChange={v => setForm(p => ({ ...p, allowed_role_ids: v }))} />
                                </div>
                                <div className="form-field form-field--full">
                                    <label>Roles a notificar al abrir ticket</label>
                                    <RoleMultiPicker roles={roles} selected={form.mention_role_ids}
                                        onChange={v => setForm(p => ({ ...p, mention_role_ids: v }))} />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
                                <button className="btn btn-primary btn-sm" onClick={handleCreate} disabled={saving}>
                                    {saving ? <><Loader2 size={14} className="spin" /> Enviando...</> : <><Plus size={14} /> Crear y enviar a Discord</>}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : tab === 'transcripts' ? (
                <div className="mod-block">
                    <div className="mod-block__header">
                        <h4>Historial de Tickets</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                        Aquí puedes revisar de forma segura el chat de todos los tickets que se han cerrado en el servidor.
                    </p>
                    <TranscriptsList guildId={guildId} />
                </div>
            ) : (
                <div className="mod-block">
                    <div className="mod-block__header">
                        <div className="mod-block__title-group">
                            <Clock size={20} className="mod-block__icon" />
                            <h4>Horario de Soporte</h4>
                        </div>
                        <div className="mod-switch">
                            <label className="switch">
                                <input type="checkbox" checked={scheduleForm.enabled} onChange={e => setScheduleForm(s => ({ ...s, enabled: e.target.checked }))} />
                                <span className="slider round"></span>
                            </label>
                            <span className="switch-label">{scheduleForm.enabled ? 'Activado' : 'Desactivado'}</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
                        Configura un horario de atención al cliente. Si un usuario abre un ticket fuera de este horario o en días no laborables, el bot contestará de forma automática.
                    </p>

                    <div className={`form-grid ${!scheduleForm.enabled ? 'disabled-section' : ''}`}>
                        <div className="form-field form-field--full">
                            <label>Días de la semana operativos</label>
                            <div className="form-radio-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className={`form-radio ${scheduleForm.dias.includes(idx) ? 'form-radio--active' : ''}`}
                                        style={{ minWidth: '40px', padding: '0.5rem' }}
                                        onClick={() => {
                                            const activeDays = new Set(scheduleForm.dias);
                                            activeDays.has(idx) ? activeDays.delete(idx) : activeDays.add(idx);
                                            setScheduleForm(s => ({ ...s, dias: Array.from(activeDays).sort() }))
                                        }}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Hora de Apertura</label>
                            <input type="time" className="config-input"
                                value={scheduleForm.hora_inicio}
                                onChange={e => setScheduleForm(s => ({ ...s, hora_inicio: e.target.value }))} />
                        </div>
                        <div className="form-field">
                            <label>Hora de Cierre</label>
                            <input type="time" className="config-input"
                                value={scheduleForm.hora_fin}
                                onChange={e => setScheduleForm(s => ({ ...s, hora_fin: e.target.value }))} />
                        </div>
                        <div className="form-field form-field--full">
                            <label>Zona Horaria</label>
                            <select className="config-select" value={scheduleForm.timezone} onChange={e => setScheduleForm(s => ({ ...s, timezone: e.target.value }))}>
                                <option value="Europe/Madrid">España (Península) - Europe/Madrid</option>
                                <option value="Atlantic/Canary">España (Canarias) - Atlantic/Canary</option>
                                <option value="America/Mexico_City">México - America/Mexico_City</option>
                                <option value="America/Bogota">Colombia - America/Bogota</option>
                                <option value="America/Argentina/Buenos_Aires">Argentina - America/Argentina/Buenos_Aires</option>
                                <option value="America/Santiago">Chile - America/Santiago</option>
                                <option value="Europe/London">Reino Unido - Europe/London</option>
                                <option value="America/New_York">EEUU (Este) - America/New_York</option>
                                <option value="America/Los_Angeles">EEUU (Oeste) - America/Los_Angeles</option>
                            </select>
                        </div>
                        <div className="form-field form-field--full">
                            <label>Mensaje automático (Fuera de horario)</label>
                            <textarea className="config-textarea" rows={3} value={scheduleForm.mensaje}
                                onChange={e => setScheduleForm(s => ({ ...s, mensaje: e.target.value }))} />
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <button className="btn btn-primary" onClick={handleSaveSchedule} disabled={scheduleSaving}>
                            {scheduleSaving ? <><Loader2 size={16} className="spin" /> Guardando...</> : <><Save size={16} /> Guardar Horario</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── AUTOROLES MODULE ─────────────────────────────────────────────────────────
function AutorolesConfig({ guildId, roles, channels }) {
    const [tab, setTab] = useState('panels')
    const [toast, showToast] = useToast()

    // --- Panels ---
    const [panels, setPanels] = useState([])
    const [panelsLoading, setPanelsLoading] = useState(true)
    const [showPanelForm, setShowPanelForm] = useState(false)
    const [panelSaving, setPanelSaving] = useState(false)
    const [panelDeleting, setPanelDeleting] = useState(null)
    const [panelForm, setPanelForm] = useState({
        channel_id: '', titulo: '', descripcion: '', color: '#5865F2',
        role_id: '', role_name: '', button_label: '', image_url: ''
    })
    const [addBtnPanel, setAddBtnPanel] = useState(null)
    const [addBtnRole, setAddBtnRole] = useState('')
    const [addBtnLabel, setAddBtnLabel] = useState('')
    const [addBtnSaving, setAddBtnSaving] = useState(false)

    // --- Join ---
    const [joinRoles, setJoinRoles] = useState([])
    const [joinLoading, setJoinLoading] = useState(true)
    const [joinSelected, setJoinSelected] = useState('')
    const [joinSaving, setJoinSaving] = useState(false)
    const [joinDeleting, setJoinDeleting] = useState(null)

    const textChannels = channels?.text || []

    const loadPanels = async () => {
        try { const res = await api.get(`/servers/${guildId}/autoroles/panels`); setPanels(res.data) }
        catch { setPanels([]) } finally { setPanelsLoading(false) }
    }
    const loadJoin = async () => {
        try { const res = await api.get(`/servers/${guildId}/autoroles/join`); setJoinRoles(res.data) }
        catch { setJoinRoles([]) } finally { setJoinLoading(false) }
    }
    useEffect(() => { loadPanels(); loadJoin() }, [guildId])

    // Panel CRUD
    const handleCreatePanel = async () => {
        if (!panelForm.channel_id || !panelForm.titulo || !panelForm.role_id)
            return showToast('Canal, título y rol son obligatorios.', 'error')
        setPanelSaving(true)
        try {
            await api.post(`/servers/${guildId}/autoroles/panels`, panelForm)
            showToast('✅ Panel enviado a Discord y guardado.')
            setShowPanelForm(false)
            setPanelForm({ channel_id: '', titulo: '', descripcion: '', color: '#5865F2', role_id: '', role_name: '', button_label: '', image_url: '' })
            loadPanels()
        } catch (e) { showToast(e.response?.data?.detail || 'Error al crear.', 'error') }
        finally { setPanelSaving(false) }
    }

    const handleDeletePanel = async (msgId) => {
        setPanelDeleting(msgId)
        try { await api.delete(`/servers/${guildId}/autoroles/panels/${msgId}`); showToast('🗑️ Panel eliminado.'); loadPanels() }
        catch (e) { showToast(e.response?.data?.detail || 'Error al eliminar.', 'error') }
        finally { setPanelDeleting(null) }
    }

    const handleAddButton = async (msgId) => {
        if (!addBtnRole) return showToast('Selecciona un rol.', 'error')
        const role = roles.find(r => r.id === addBtnRole)
        setAddBtnSaving(true)
        try {
            await api.post(`/servers/${guildId}/autoroles/panels/${msgId}/buttons`, {
                role_id: addBtnRole, role_name: role?.name || addBtnRole,
                button_label: addBtnLabel || undefined
            })
            showToast('✅ Botón añadido al panel.')
            setAddBtnPanel(null); setAddBtnRole(''); setAddBtnLabel('')
            loadPanels()
        } catch (e) { showToast(e.response?.data?.detail || 'Error al añadir botón.', 'error') }
        finally { setAddBtnSaving(false) }
    }

    // Join CRUD
    const configuredJoinIds = new Set(joinRoles.map(r => r.role_id))
    const availableJoinRoles = roles.filter(r => !configuredJoinIds.has(r.id))

    const handleAddJoin = async () => {
        if (!joinSelected) return
        const role = roles.find(r => r.id === joinSelected)
        setJoinSaving(true)
        try {
            await api.post(`/servers/${guildId}/autoroles/join`, { role_id: role.id, role_name: role.name })
            showToast(`✅ Autorole @${role.name} añadido.`); setJoinSelected(''); loadJoin()
        } catch (e) { showToast(e.response?.data?.detail || 'Error.', 'error') }
        finally { setJoinSaving(false) }
    }

    const handleDeleteJoin = async (roleId) => {
        setJoinDeleting(roleId)
        try { await api.delete(`/servers/${guildId}/autoroles/join/${roleId}`); showToast('🗑️ Eliminado.'); loadJoin() }
        catch { showToast('Error al eliminar.', 'error') }
        finally { setJoinDeleting(null) }
    }

    return (
        <div className="mod-section">
            <Toast toast={toast} />

            <div className="mod-tabs">
                <button className={`mod-tab ${tab === 'panels' ? 'mod-tab--active' : ''}`} onClick={() => setTab('panels')}>
                    <Hash size={14} /> Paneles de rol
                </button>
                <button className={`mod-tab ${tab === 'join' ? 'mod-tab--active' : ''}`} onClick={() => setTab('join')}>
                    <Users size={14} /> Al entrar al servidor
                </button>
            </div>

            {/* ── PANELES ── */}
            {tab === 'panels' && <>
                <div className="mod-block">
                    <div className="mod-block__header">
                        <div>
                            <h4>Paneles de roles</h4>
                            <p className="mod-hint" style={{ margin: '0.2rem 0 0' }}>Mensajes con botones en un canal. Los usuarios hacen clic para obtener o quitar un rol.</p>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowPanelForm(s => !s)}>
                            {showPanelForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Nuevo panel</>}
                        </button>
                    </div>

                    {panelsLoading ? <div className="mod-loading"><Loader2 size={20} className="spin" /> Cargando...</div>
                        : panels.length === 0 ? <div className="mod-empty"><Users size={32} style={{ opacity: 0.3 }} /><p>No hay paneles de rol configurados.</p></div>
                            : <div className="panel-list">
                                {panels.map(p => (
                                    <div key={p.message_id}>
                                        <div className="panel-item">
                                            <div className="panel-item__icon" style={{ background: 'rgba(87,242,135,0.12)', color: 'var(--green)' }}><Users size={16} /></div>
                                            <div className="panel-item__info">
                                                <span className="panel-item__title">{p.titulo}</span>
                                                <span className="panel-item__meta">
                                                    {p.channel_name && <span className="panel-item__ch"><Hash size={11} />{p.channel_name}</span>}
                                                    {p.buttons?.map(b => {
                                                        const role = roles.find(r => r.id === b.role_id)
                                                        const hex = colorToHex(role?.color)
                                                        return (
                                                            <span key={b.role_id} className="badge"
                                                                style={{ fontSize: '0.62rem', background: hex ? `${hex}20` : 'rgba(87,242,135,0.12)', color: hex || 'var(--green)', border: `1px solid ${hex || 'var(--green)'}40` }}>
                                                                <RoleDot color={role?.color} size={7} />
                                                                &nbsp;{b.label || b.role_name}
                                                            </span>
                                                        )
                                                    })}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <Tooltip text={`Añadir otro rol al panel «${p.titulo}»`}>
                                                    <button type="button"
                                                        className="panel-item__add"
                                                        style={{ color: 'var(--blurple-light)' }}
                                                        onClick={() => setAddBtnPanel(addBtnPanel === p.message_id ? null : p.message_id)}
                                                        disabled={(p.buttons?.length || 0) >= 5}
                                                    ><Plus size={15} /></button>
                                                </Tooltip>
                                                <button type="button" className="panel-item__delete" onClick={() => handleDeletePanel(p.message_id)} disabled={panelDeleting === p.message_id}>
                                                    {panelDeleting === p.message_id ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />}
                                                </button>
                                            </div>
                                        </div>
                                        {addBtnPanel === p.message_id && (
                                            <div className="panel-expand-form">
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--blurple-light)' }}>
                                                    <Plus size={12} /> Añadir botón a «{p.titulo}»
                                                </span>
                                                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.7rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    <div style={{ flex: '1', minWidth: '160px' }}>
                                                        <RolePicker
                                                            roles={roles.filter(r => !p.buttons?.some(b => b.role_id === r.id))}
                                                            value={addBtnRole}
                                                            onChange={setAddBtnRole}
                                                            placeholder="Selecciona rol..."
                                                        />
                                                    </div>
                                                    <input className="config-input" style={{ maxWidth: '180px' }}
                                                        placeholder="Etiqueta botón (opcional)"
                                                        value={addBtnLabel} onChange={e => setAddBtnLabel(e.target.value)} />
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleAddButton(p.message_id)} disabled={addBtnSaving || !addBtnRole}>
                                                        {addBtnSaving ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Añadir
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>}
                </div>

                {showPanelForm && (
                    <div className="mod-block mod-block--form">
                        <h4 className="mod-block__form-title">Crear nuevo panel de autoroles</h4>
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Canal *</label>
                                <select className="config-select" value={panelForm.channel_id} onChange={e => setPanelForm(p => ({ ...p, channel_id: e.target.value }))}>
                                    <option value="">Selecciona canal...</option>
                                    {textChannels.map(c => <option key={c.id} value={c.id}># {c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <div className="form-field__label-row">
                                    <label>Título del embed *</label>
                                    <CharCounter current={panelForm.titulo.length} max={EMBED_LIMITS.title} />
                                </div>
                                <input className="config-input" value={panelForm.titulo} maxLength={EMBED_LIMITS.title}
                                    onChange={e => setPanelForm(p => ({ ...p, titulo: e.target.value }))} placeholder="Ej: Elige tus roles" />
                            </div>
                            <div className="form-field">
                                <label>Primer rol (botón inicial) *</label>
                                <RolePicker
                                    roles={roles}
                                    value={panelForm.role_id}
                                    onChange={rid => {
                                        const role = roles.find(r => r.id === rid)
                                        setPanelForm(p => ({ ...p, role_id: rid, role_name: role?.name || '' }))
                                    }}
                                />
                            </div>
                            <div className="form-field">
                                <label>Etiqueta del botón</label>
                                <input className="config-input" value={panelForm.button_label} maxLength={80}
                                    onChange={e => setPanelForm(p => ({ ...p, button_label: e.target.value }))} placeholder="Por defecto: nombre del rol" />
                            </div>
                            <div className="form-field form-field--full">
                                <div className="form-field__label-row">
                                    <label>Descripción</label>
                                    <CharCounter current={panelForm.descripcion.length} max={EMBED_LIMITS.description} />
                                </div>
                                <textarea className="config-textarea" rows={2} value={panelForm.descripcion} maxLength={EMBED_LIMITS.description}
                                    onChange={e => setPanelForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Haz clic en el botón para obtener tu rol..." />
                            </div>
                            <div className="form-field">
                                <label>Color del embed</label>
                                <div className="color-picker-wrap">
                                    <input type="color" className="color-picker" value={panelForm.color} onChange={e => setPanelForm(p => ({ ...p, color: e.target.value }))} />
                                    <span className="color-picker-value">{panelForm.color.toUpperCase()}</span>
                                </div>
                            </div>
                            <div className="form-field">
                                <label>URL imagen (opcional)</label>
                                <input className="config-input" value={panelForm.image_url} onChange={e => setPanelForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowPanelForm(false)}>Cancelar</button>
                            <button className="btn btn-primary btn-sm" onClick={handleCreatePanel} disabled={panelSaving}>
                                {panelSaving ? <><Loader2 size={14} className="spin" /> Enviando...</> : <><Plus size={14} /> Crear y enviar a Discord</>}
                            </button>
                        </div>
                    </div>
                )}
            </>}

            {/* ── JOIN AUTOROLES ── */}
            {tab === 'join' && <>
                <div className="mod-block">
                    <div className="mod-block__header"><h4>Añadir autorole de entrada</h4></div>
                    <p className="mod-hint">Se asigna automáticamente a cualquier usuario que entre al servidor.</p>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1', minWidth: '200px' }}>
                            <RolePicker roles={availableJoinRoles} value={joinSelected} onChange={setJoinSelected} placeholder="Selecciona un rol..." />
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={handleAddJoin} disabled={joinSaving || !joinSelected}>
                            {joinSaving ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Añadir
                        </button>
                    </div>
                </div>
                <div className="mod-block">
                    <div className="mod-block__header"><h4>Roles de entrada configurados</h4><span className="mod-count">{joinRoles.length}</span></div>
                    {joinLoading ? <div className="mod-loading"><Loader2 size={20} className="spin" /> Cargando...</div>
                        : joinRoles.length === 0 ? <div className="mod-empty"><Users size={32} style={{ opacity: 0.3 }} /><p>No hay autoroles de entrada configurados.</p></div>
                            : <div className="panel-list">
                                {joinRoles.map(a => {
                                    const role = roles.find(r => r.id === a.role_id)
                                    const hex = colorToHex(role?.color)
                                    return (
                                        <div key={a.role_id} className="panel-item">
                                            <div className="panel-item__icon" style={{ background: hex ? `${hex}20` : 'rgba(87,242,135,0.12)', color: hex || 'var(--green)' }}>
                                                <RoleDot color={role?.color} size={14} />
                                            </div>
                                            <div className="panel-item__info">
                                                <span className="panel-item__title" style={{ color: hex || 'inherit' }}>@{a.role_name}</span>
                                                <span className="panel-item__meta"><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Se asigna al entrar al servidor</span></span>
                                            </div>
                                            <button className="panel-item__delete" onClick={() => handleDeleteJoin(a.role_id)} disabled={joinDeleting === a.role_id}>
                                                {joinDeleting === a.role_id ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>}
                </div>
            </>}
        </div>
    )
}

// ─── WELCOME MODULE ───────────────────────────────────────────────────────────
function WelcomeConfig({ guildId, channels }) {
    const [config, setConfig] = useState({ enabled: true, tipo: 'canal', canal_id: '', mensaje: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showStudio, setShowStudio] = useState(false)
    const [toast, showToast] = useToast()
    const textareaRef = useRef(null)
    const textChannels = channels?.text || []

    useEffect(() => {
        api.get(`/servers/${guildId}/welcome`)
            .then(res => {
                const d = res.data
                setConfig({ enabled: d.enabled ?? true, tipo: d.tipo || 'canal', canal_id: d.canal_id ? String(d.canal_id) : '', mensaje: d.mensaje || '' })
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [guildId])

    const insertTag = (tag) => {
        const el = textareaRef.current
        if (!el) return
        const s = el.selectionStart, e = el.selectionEnd
        setConfig(p => ({ ...p, mensaje: p.mensaje.slice(0, s) + tag + p.mensaje.slice(e) }))
        setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = s + tag.length }, 0)
    }

    const handleSave = async () => {
        setSaving(true)
        try { await api.post(`/servers/${guildId}/welcome`, config); showToast('✅ Bienvenida guardada.') }
        catch (e) { showToast(e.response?.data?.detail || 'Error al guardar.', 'error') }
        finally { setSaving(false) }
    }

    if (loading) return <div className="mod-loading"><Loader2 size={20} className="spin" /> Cargando...</div>

    return (
        <div className="mod-section">
            <Toast toast={toast} />
            <div className="mod-block">
                <label className="config-toggle">
                    <div>
                        <span style={{ fontWeight: 600 }}>Bienvenida activa</span>
                        <p className="mod-hint" style={{ margin: 0 }}>Activa o desactiva el mensaje de bienvenida.</p>
                    </div>
                    <button type="button" className={`toggle-btn ${config.enabled ? 'toggle-btn--on' : ''}`} onClick={() => setConfig(p => ({ ...p, enabled: !p.enabled }))}>
                        {config.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                </label>
            </div>
            <div className="mod-block">
                <h4 className="config-panel__section-title">Enviar por</h4>
                <div className="form-radio-group" style={{ marginBottom: '1rem' }}>
                    {[['canal', '📢 Canal de texto'], ['dm', '💬 Mensaje privado (DM)']].map(([val, lbl]) => (
                        <button key={val} type="button" className={`form-radio ${config.tipo === val ? 'form-radio--active' : ''}`} onClick={() => setConfig(p => ({ ...p, tipo: val }))}>
                            {lbl}
                        </button>
                    ))}
                </div>
                {config.tipo === 'canal' && (
                    <div className="form-field">
                        <label>Canal de bienvenida</label>
                        <select className="config-select" value={config.canal_id} onChange={e => setConfig(p => ({ ...p, canal_id: e.target.value }))}>
                            <option value="">Selecciona un canal...</option>
                            {textChannels.map(c => <option key={c.id} value={c.id}># {c.name}</option>)}
                        </select>
                    </div>
                )}
            </div>
            <div className="mod-block">
                <div className="mod-block__header">
                    <h4 className="config-panel__section-title" style={{ margin: 0 }}>Tarjeta de imagen</h4>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowStudio(true)}>
                        <Sparkles size={14} /> Arrival Studio
                    </button>
                </div>
                <p className="mod-hint" style={{ marginBottom: '1rem' }}>Diseña una tarjeta personalizada que se enviará junto al mensaje.</p>
                
                <div className="welcome-preview">
                    <span className="welcome-preview__label"><img src={logoImg} alt="Logo" /> Vista previa del mensaje</span>
                    <p className="welcome-preview__text">
                        {config.mensaje.replace('{{user}}', '@TBot').replace('{{server}}', 'Tu Servidor').replace('{{members}}', '1.2k').replace('{{nombre_canal}}', '#general')}
                    </p>
                </div>
            </div>

            {showStudio && (
                <div className="studio-modal">
                    <div className="studio-modal__content">
                        <div className="studio-modal__header">
                            <div className="studio-modal__title">
                                <Sparkles size={20} className="gradient-text" />
                                <h3>Arrival Studio</h3>
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowStudio(false)}>
                                <X size={18} /> Cerrar Editor
                            </button>
                        </div>
                        <ArrivalStudio />
                    </div>
                </div>
            )}

            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 size={15} className="spin" /> Guardando...</> : <><Save size={15} /> Guardar bienvenida</>}
            </button>
        </div>
    )
}

// ─── VOICE CONFIG ─────────────────────────────────────────────────────────────
function VoiceConfig({ guildId, channels }) {
    const [config, setConfig] = useState({ enabled: true, channel_id: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, showToast] = useToast()
    const voiceChannels = channels?.voice || []

    useEffect(() => {
        api.get(`/servers/${guildId}/voice`)
            .then(res => {
                const d = res.data
                setConfig({ enabled: d.enabled ?? true, channel_id: d.channel_id ? String(d.channel_id) : '' })
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [guildId])

    const handleSave = async () => {
        setSaving(true)
        try { await api.post(`/servers/${guildId}/voice`, config); showToast('✅ Configuración de voz guardada.') }
        catch (e) { showToast(e.response?.data?.detail || 'Error al guardar.', 'error') }
        finally { setSaving(false) }
    }

    if (loading) return <div className="mod-loading"><Loader2 size={20} className="spin" /> Cargando...</div>

    return (
        <div className="mod-section">
            <Toast toast={toast} />
            <div className="mod-block">
                <label className="config-toggle">
                    <div>
                        <span style={{ fontWeight: 600 }}>Canales Dinámicos Activos</span>
                        <p className="mod-hint" style={{ margin: 0 }}>Si está activado, los usuarios podrán crear canales temporales uniéndose al canal configurado.</p>
                    </div>
                    <button type="button" className={`toggle-btn ${config.enabled ? 'toggle-btn--on' : ''}`} onClick={() => setConfig(p => ({ ...p, enabled: !p.enabled }))}>
                        {config.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                </label>
            </div>
            {config.enabled && (
                <div className="mod-block">
                    <h4 className="config-panel__section-title">Canal generador</h4>
                    <p className="mod-hint" style={{ marginBottom: '1rem' }}>Selecciona el canal de voz al que los usuarios deben unirse para crear su propio canal temporal.</p>
                    <div className="form-field">
                        <label>Canal de voz generador</label>
                        <select className="config-select" value={config.channel_id} onChange={e => setConfig(p => ({ ...p, channel_id: e.target.value }))}>
                            <option value="">Selecciona un canal de voz...</option>
                            {voiceChannels.map(c => <option key={c.id} value={c.id}>🔊 {c.name}</option>)}
                        </select>
                    </div>
                </div>
            )}
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 size={15} className="spin" /> Guardando...</> : <><Save size={15} /> Guardar configuración</>}
            </button>
        </div>
    )
}


// ─── LEVELS CONFIG ─────────────────────────────────────────────────────────────
function LevelsConfig({ guildId, channels, roles }) {
    const [tab, setTab] = useState('leaderboard')
    const [toast, showToast] = useToast()

    // ── Leaderboard ──
    const [lb, setLb] = useState([])
    const [lbLoading, setLbLoading] = useState(true)

    // ── Level Roles ──
    const [levelRoles, setLevelRoles] = useState({})   // {"1": "roleId", ...}
    const [newLevel, setNewLevel] = useState('')
    const [newRole, setNewRole] = useState('')
    const [lrSaving, setLrSaving] = useState(false)

    // ── Config ──
    const [cfg, setCfg] = useState({ levels_enabled: true, level_channel_id: '' })
    const [cfgSaving, setCfgSaving] = useState(false)
    const [cfgLoading, setCfgLoading] = useState(true)

    const textChannels = channels?.text || []

    // Fórmula XP igual que el bot
    const xpForLevel = (lvl) => Math.round(100 * Math.pow(lvl, 1.5))

    const loadLeaderboard = async () => {
        setLbLoading(true)
        try { const r = await api.get(`/servers/${guildId}/levels/leaderboard?limit=15`); setLb(r.data) }
        catch { setLb([]) }
        finally { setLbLoading(false) }
    }

    const loadConfig = async () => {
        setCfgLoading(true)
        try {
            const r = await api.get(`/servers/${guildId}/levels/config`)
            setCfg({ levels_enabled: r.data.levels_enabled ?? true, level_channel_id: r.data.level_channel_id || '' })
            setLevelRoles(r.data.level_roles || {})
        } catch { }
        finally { setCfgLoading(false) }
    }

    useEffect(() => { loadLeaderboard(); loadConfig() }, [guildId])

    const handleAddLevelRole = async () => {
        if (!newLevel || !newRole) return showToast('Indica nivel y rol.', 'error')
        const lvl = parseInt(newLevel)
        if (isNaN(lvl) || lvl < 1) return showToast('El nivel debe ser mayor que 0.', 'error')
        setLrSaving(true)
        const updated = { ...levelRoles, [String(lvl)]: newRole }
        try {
            await api.post(`/servers/${guildId}/levels/config`, {
                ...cfg, level_roles: updated, level_channel_id: cfg.level_channel_id || null
            })
            setLevelRoles(updated); setNewLevel(''); setNewRole('')
            showToast(`✅ Rol asignado al Nivel ${lvl}.`)
        } catch (e) { showToast(e.response?.data?.detail || 'Error al guardar.', 'error') }
        finally { setLrSaving(false) }
    }

    const handleRemoveLevelRole = async (lvl) => {
        const updated = { ...levelRoles }
        delete updated[lvl]
        try {
            await api.post(`/servers/${guildId}/levels/config`, {
                ...cfg, level_roles: updated, level_channel_id: cfg.level_channel_id || null
            })
            setLevelRoles(updated); showToast(`🗑️ Recompensa del Nivel ${lvl} eliminada.`)
        } catch { showToast('Error al eliminar.', 'error') }
    }

    const handleSaveConfig = async () => {
        setCfgSaving(true)
        try {
            await api.post(`/servers/${guildId}/levels/config`, {
                ...cfg, level_roles: levelRoles, level_channel_id: cfg.level_channel_id || null
            })
            showToast('✅ Configuración guardada.')
        } catch (e) { showToast(e.response?.data?.detail || 'Error al guardar.', 'error') }
        finally { setCfgSaving(false) }
    }

    return (
        <div className="mod-section">
            <Toast toast={toast} />
            <div className="mod-tabs">
                <button className={`mod-tab ${tab === 'leaderboard' ? 'mod-tab--active' : ''}`} onClick={() => setTab('leaderboard')}>
                    🏆 Leaderboard
                </button>
                <button className={`mod-tab ${tab === 'roles' ? 'mod-tab--active' : ''}`} onClick={() => setTab('roles')}>
                    🎖️ Roles por Nivel
                </button>
                <button className={`mod-tab ${tab === 'config' ? 'mod-tab--active' : ''}`} onClick={() => setTab('config')}>
                    ⚙️ Configuración
                </button>
            </div>

            {/* ── LEADERBOARD ── */}
            {tab === 'leaderboard' && (
                <div className="mod-block">
                    <div className="mod-block__header">
                        <h4>Top jugadores</h4>
                        <button className="btn btn-secondary btn-sm" onClick={loadLeaderboard} disabled={lbLoading}>
                            {lbLoading ? <Loader2 size={14} className="spin" /> : '↻'} Actualizar
                        </button>
                    </div>
                    {lbLoading
                        ? <div className="mod-loading"><Loader2 size={20} className="spin" /> Cargando ranking...</div>
                        : lb.length === 0
                            ? <div className="mod-empty"><Star size={32} style={{ opacity: 0.3 }} /><p>Nadie ha enviado mensajes aún.</p></div>
                            : <div className="lb-list">
                                {lb.map((u, i) => {
                                    const nextXp = xpForLevel(u.level + 1)
                                    const pct = Math.min(100, Math.round((u.xp / nextXp) * 100))
                                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                                    return (
                                        <div key={u.user_id} className="lb-row">
                                            <span className="lb-rank">{medal || `#${i + 1}`}</span>
                                            <div className="lb-avatar">
                                                {u.avatar
                                                    ? <img src={u.avatar} alt={u.username} />
                                                    : <span>{u.username.charAt(0)}</span>}
                                            </div>
                                            <div className="lb-info">
                                                <span className="lb-name">{u.username}</span>
                                                <div className="lb-bar-wrap">
                                                    <div className="lb-bar" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="lb-xp">{u.xp.toLocaleString()} / {nextXp.toLocaleString()} XP</span>
                                            </div>
                                            <div className="lb-badges">
                                                <span className="badge badge-blurple">Nv. {u.level}</span>
                                                <span className="badge" style={{ background: 'rgba(87,242,135,0.12)', color: 'var(--green)' }}>
                                                    ✉️ {u.messages_count.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                    }
                </div>
            )}

            {/* ── ROLES POR NIVEL ── */}
            {tab === 'roles' && (
                <>
                    <div className="mod-block">
                        <div className="mod-block__header"><h4>Añadir recompensa</h4></div>
                        <p className="mod-hint" style={{ marginBottom: '1rem' }}>
                            Al alcanzar el nivel indicado, el bot asignará automáticamente el rol elegido (acumulativo, no quita los anteriores).
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                                type="number" min="1" max="999"
                                className="config-input" style={{ width: '100px' }}
                                placeholder="Nivel"
                                value={newLevel} onChange={e => setNewLevel(e.target.value)}
                            />
                            <div style={{ flex: 1, minWidth: '180px' }}>
                                <RolePicker roles={roles} value={newRole} onChange={setNewRole} placeholder="Selecciona un rol..." />
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={handleAddLevelRole} disabled={lrSaving || !newLevel || !newRole}>
                                {lrSaving ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Añadir
                            </button>
                        </div>
                    </div>
                    <div className="mod-block">
                        <div className="mod-block__header">
                            <h4>Recompensas configuradas</h4>
                            <span className="mod-count">{Object.keys(levelRoles).length}</span>
                        </div>
                        {Object.keys(levelRoles).length === 0
                            ? <div className="mod-empty"><Star size={28} style={{ opacity: 0.3 }} /><p>No hay recompensas configuradas.</p></div>
                            : <div className="panel-list">
                                {Object.entries(levelRoles)
                                    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                                    .map(([lvl, roleId]) => {
                                        const role = roles.find(r => r.id === roleId)
                                        const hex = role ? (role.color ? `#${role.color.toString(16).padStart(6, '0')}` : null) : null
                                        return (
                                            <div key={lvl} className="panel-item">
                                                <div className="panel-item__icon" style={{ background: 'rgba(245,197,24,0.12)', color: '#f5c518', fontWeight: 700, fontSize: '1rem' }}>
                                                    {lvl}
                                                </div>
                                                <div className="panel-item__info">
                                                    <span className="panel-item__title">Nivel {lvl}</span>
                                                    <span className="panel-item__meta">
                                                        {role
                                                            ? <span className="badge" style={{ fontSize: '0.7rem', background: hex ? `${hex}20` : 'rgba(88,101,242,0.12)', color: hex || 'var(--blurple-light)', border: `1px solid ${hex || 'var(--blurple)'}40` }}>
                                                                @{role.name}
                                                            </span>
                                                            : <span className="badge" style={{ fontSize: '0.7rem' }}>ID: {roleId}</span>
                                                        }
                                                    </span>
                                                </div>
                                                <button className="panel-item__delete" onClick={() => handleRemoveLevelRole(lvl)} title="Eliminar recompensa">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        )
                                    })}
                            </div>
                        }
                    </div>
                </>
            )}

            {/* ── CONFIGURACIÓN ── */}
            {tab === 'config' && (
                cfgLoading
                    ? <div className="mod-loading"><Loader2 size={20} className="spin" /> Cargando...</div>
                    : <>
                        <div className="mod-block">
                            <label className="config-toggle">
                                <div>
                                    <span style={{ fontWeight: 600 }}>Sistema de Niveles Activo</span>
                                    <p className="mod-hint" style={{ margin: 0 }}>
                                        Si está desactivado, los usuarios no ganarán XP por sus mensajes.
                                    </p>
                                </div>
                                <button type="button" className={`toggle-btn ${cfg.levels_enabled ? 'toggle-btn--on' : ''}`}
                                    onClick={() => setCfg(c => ({ ...c, levels_enabled: !c.levels_enabled }))}>
                                    {cfg.levels_enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                </button>
                            </label>
                        </div>
                        <div className="mod-block">
                            <h4 className="config-panel__section-title">Canal de notificaciones</h4>
                            <p className="mod-hint" style={{ marginBottom: '1rem' }}>
                                Canal donde se anunciarán las subidas de nivel. Si no seleccionas ninguno, el aviso aparecerá en el mismo canal donde el usuario escribe.
                            </p>
                            <div className="form-field">
                                <label>Canal de subida de nivel</label>
                                <select className="config-select" value={cfg.level_channel_id}
                                    onChange={e => setCfg(c => ({ ...c, level_channel_id: e.target.value }))}>
                                    <option value="">Mismo canal donde escribe el usuario</option>
                                    {textChannels.map(c => <option key={c.id} value={c.id}># {c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={handleSaveConfig} disabled={cfgSaving}>
                            {cfgSaving ? <><Loader2 size={15} className="spin" /> Guardando...</> : <><Save size={15} /> Guardar configuración</>}
                        </button>
                    </>
            )}
        </div>
    )
}

// ─── GENERIC PLACEHOLDER ──────────────────────────────────────────────────────
function GenericConfig({ module }) {
    return (
        <div className="config-panel config-panel--empty">
            <module.icon size={40} style={{ color: module.color, opacity: 0.4 }} />
            <h3>Configuración de {module.label}</h3>
            <p>Este módulo se puede configurar próximamente desde el dashboard. Por ahora usa los comandos de Discord.</p>
        </div>
    )
}

// ─── CONFIG RENDERER ──────────────────────────────────────────────────────────
function ConfigRenderer({ moduleId, guildId, channels, roles }) {
    const mod = MODULES.find(m => m.id === moduleId)
    switch (moduleId) {
        case 'tickets': return <TicketsConfig guildId={guildId} channels={channels} roles={roles} />
        case 'autoroles': return <AutorolesConfig guildId={guildId} roles={roles} channels={channels} />
        case 'welcome': return <WelcomeConfig guildId={guildId} channels={channels} />
        case 'voice': return <VoiceConfig guildId={guildId} channels={channels} />
        case 'levels': return <LevelsConfig guildId={guildId} channels={channels} roles={roles} />
        default: return <GenericConfig module={mod} />
    }
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ServerConfig() {
    const { serverId } = useParams()
    const [server, setServer] = useState(null)
    const [activeModule, setActiveModule] = useState('tickets')
    const [channels, setChannels] = useState({ text: [], categories: [], voice: [] })
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [enabledModules, setEnabledModules] = useState({
        tickets: true, autoroles: true, welcome: true,
        voice: true, admin_chat: true, moderation: false
    })

    useEffect(() => {
        const load = async () => {
            try {
                const [sRes, cRes, rRes] = await Promise.all([
                    api.get(`/servers/${serverId}`),
                    api.get(`/servers/${serverId}/channels`),
                    api.get(`/servers/${serverId}/roles`),
                ])
                setServer(sRes.data); setChannels(cRes.data); setRoles(rRes.data)
                if (sRes.data.enabledModules && Object.keys(sRes.data.enabledModules).length > 0) {
                    setEnabledModules(prev => ({ ...prev, ...sRes.data.enabledModules }))
                }
            } catch {
                setServer({ id: serverId, name: 'Servidor', icon: null })
                setChannels({ text: [], categories: [] }); setRoles([])
            } finally { setLoading(false) }
        }
        load()
    }, [serverId])

    const toggleModule = (id) => {
        setEnabledModules(prev => {
            const next = { ...prev, [id]: !prev[id] }
            api.post(`/servers/${serverId}/modules`, { enabled_modules: next }).catch(() => {})
            return next
        })
    }

    if (loading) return (
        <div className="sc-loading">
            <Loader2 size={32} className="spin" style={{ color: 'var(--blurple)' }} />
            <p>Cargando configuración...</p>
        </div>
    )

    const initial = server?.name?.charAt(0) || '?'
    const iconUrl = server?.icon ? `https://cdn.discordapp.com/icons/${serverId}/${server.icon}.png?size=64` : null

    return (
        <div className="sc page-enter">
            <div className="sc__header">
                <div className="container sc__header-inner">
                    <Link to="/dashboard" className="sc__back"><ChevronLeft size={18} /> Dashboard</Link>
                    <div className="sc__server-info">
                        <div className="sc__server-icon">
                            {iconUrl ? <img src={iconUrl} alt={server.name} /> : <span>{initial}</span>}
                        </div>
                        <div>
                            <h1 className="sc__server-name">{server?.name}</h1>
                            {server?.memberCount && <p className="sc__server-meta">{server.memberCount.toLocaleString('es-ES')} miembros</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container sc__body">
                <aside className="sc__sidebar">
                    <p className="sc__sidebar-label">Módulos</p>
                    {MODULES.map(mod => (
                        <div key={mod.id}
                            className={`sc__module-item ${activeModule === mod.id ? 'sc__module-item--active' : ''}`}
                            onClick={() => setActiveModule(mod.id)}>
                            <div className="sc__module-icon" style={{ '--mc': mod.color }}><mod.icon size={18} /></div>
                            <div className="sc__module-info">
                                <span className="sc__module-name">{mod.label}</span>
                                <span className="sc__module-desc">{mod.desc}</span>
                            </div>
                            <div
                                className={`sc__module-toggle ${enabledModules[mod.id] ? 'sc__module-toggle--on' : ''}`}
                                onClick={e => { e.stopPropagation(); toggleModule(mod.id) }}
                                title={enabledModules[mod.id] ? 'Desactivar' : 'Activar'}
                            />
                        </div>
                    ))}
                </aside>

                <main className="sc__content">
                    {(() => {
                        const mod = MODULES.find(m => m.id === activeModule)
                        return (
                            <>
                                <div className="sc__content-header">
                                    <div className="sc__content-title-wrap">
                                        <div className="sc__content-icon" style={{ '--mc': mod?.color }}>
                                            {mod && <mod.icon size={20} />}
                                        </div>
                                        <div>
                                            <h2 className="sc__content-title">{mod?.label}</h2>
                                            <p className="sc__content-desc">{mod?.desc}</p>
                                        </div>
                                    </div>
                                    <div className={`sc__enabled-badge ${enabledModules[activeModule] ? 'sc__enabled-badge--on' : ''}`}>
                                        {enabledModules[activeModule] ? 'Activado' : 'Desactivado'}
                                    </div>
                                </div>
                                {enabledModules[activeModule] ? (
                                    <ConfigRenderer moduleId={activeModule} guildId={serverId} channels={channels} roles={roles} />
                                ) : (
                                    <div className="sc__disabled-notice">
                                        <img src={logoImg} alt="Logo" />
                                        <p>Este módulo está desactivado. Actívalo desde el panel lateral.</p>
                                    </div>
                                )}
                            </>
                        )
                    })()}
                </main>
            </div>
        </div>
    )
}
