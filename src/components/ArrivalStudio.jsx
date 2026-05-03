import { useState, useRef } from 'react'
import {
    Layout, Palette, Type, Layers, Plus, Trash2,
    Move, Maximize2, Zap, RotateCcw, Eye, EyeOff,
    MoreVertical, ArrowUp, ArrowDown, Sparkles, Image as ImageIcon
} from 'lucide-react'
import './ArrivalStudio.css'

const LAYOUTS = [
    { id: 'hero', name: 'Hero Card', desc: 'Diseño impactante y centrado' },
    { id: 'profile', name: 'Profile Badge', desc: 'Compacto estilo perfil' },
    { id: 'ticket', name: 'Event Ticket', desc: 'Estilo entrada de evento' },
    { id: 'split', name: 'Split Panel', desc: 'División vertical limpia' },
    { id: 'glass', name: 'Minimal Glass', desc: 'Transparencias y desenfoque' },
    { id: 'rank', name: 'Rank Reveal', desc: 'Estilo tarjeta de nivel' },
]

const THEMES = [
    { id: 'blurple', name: 'Deep Space', colors: ['#5865F2', '#1a1a2e'] },
    { id: 'emerald', name: 'Emerald Forest', colors: ['#57F287', '#1a2e1a'] },
    { id: 'ruby', name: 'Neon Ruby', colors: ['#eb459e', '#2e1a26'] },
    { id: 'sunset', name: 'Golden Hour', colors: ['#fee75c', '#2e2e1a'] },
    { id: 'midnight', name: 'Midnight', colors: ['#2c2f33', '#090a0b'] },
]

export default function ArrivalStudio({ config, onChange }) {
    const [activeTab, setActiveTab] = useState('layouts')
    
    // Si no hay config (ej: cargando), no renderizar o usar defaults
    const selectedLayout = config?.layout || 'hero'
    const selectedTheme = config?.theme || 'blurple'
    const textData = config?.text_data || {
        title: '¡BIENVENIDO!',
        subtitle: 'Esperamos que disfrutes de tu estancia',
        footer: 'Eres el miembro #1,234'
    }
    const layers = config?.layers || []

    // Helper para actualizar el estado del padre
    const updateConfig = (updates) => {
        onChange({ ...config, ...updates })
    }

    const addLayer = () => {
        if (layers.length >= 30) return
        const newLayer = {
            id: Date.now(),
            name: `Capa ${layers.length + 1}`,
            type: 'text',
            content: 'Texto personalizado',
            x: 50,
            y: 50,
            z: layers.length + 1,
            opacity: 100,
            color: '#ffffff',
            size: 24,
            visible: true
        }
        updateConfig({ layers: [...layers, newLayer] })
    }

    const removeLayer = (id) => updateConfig({ layers: layers.filter(l => l.id !== id) })

    const updateLayer = (id, data) => {
        updateConfig({ layers: layers.map(l => l.id === id ? { ...l, ...data } : l) })
    }

    const currentTheme = THEMES.find(t => t.id === selectedTheme)

    return (
        <div className="as-container page-enter">
            {/* --- SIDEBAR --- */}
            <aside className="as-sidebar">
                <div className="as-sidebar__header">
                    <h2 className="as-sidebar__title">Arrival Studio <span>PRO</span></h2>
                </div>

                <div className="as-tabs">
                    <button className={`as-tab ${activeTab === 'layouts' ? 'as-tab--active' : ''}`} onClick={() => setActiveTab('layouts')}>
                        <Layout size={14} /> Layouts
                    </button>
                    <button className={`as-tab ${activeTab === 'themes' ? 'as-tab--active' : ''}`} onClick={() => setActiveTab('themes')}>
                        <Palette size={14} /> Temas
                    </button>
                    <button className={`as-tab ${activeTab === 'text' ? 'as-tab--active' : ''}`} onClick={() => setActiveTab('text')}>
                        <Type size={14} /> Textos
                    </button>
                </div>

                <div className="as-content">
                    {activeTab === 'layouts' && (
                        <div className="as-grid">
                            {LAYOUTS.map(l => (
                                <div
                                    key={l.id}
                                    className={`as-item-card ${selectedLayout === l.id ? 'as-item-card--active' : ''}`}
                                    onClick={() => updateConfig({ layout: l.id })}
                                >
                                    <div className="as-item-card__icon" />
                                    <span className="as-item-card__name">{l.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'themes' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {THEMES.map(t => (
                                <div
                                    key={t.id}
                                    className={`as-item-card as-theme-card ${selectedTheme === t.id ? 'as-item-card--active' : ''}`}
                                    onClick={() => updateConfig({ theme: t.id })}
                                >
                                    <div className="as-theme-colors">
                                        {t.colors.map(c => <div key={c} className="as-theme-dot" style={{ background: c }} />)}
                                    </div>
                                    <span className="as-item-card__name">{t.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'text' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-field">
                                <label>Título principal</label>
                                <input
                                    className="config-input"
                                    value={textData.title}
                                    onChange={e => updateConfig({ text_data: { ...textData, title: e.target.value } })}
                                />
                            </div>
                            <div className="form-field">
                                <label>Subtítulo / Mensaje</label>
                                <textarea
                                    className="config-textarea"
                                    rows={3}
                                    value={textData.subtitle}
                                    onChange={e => updateConfig({ text_data: { ...textData, subtitle: e.target.value } })}
                                />
                            </div>
                            <div className="form-field">
                                <label>Pie de página</label>
                                <input
                                    className="config-input"
                                    value={textData.footer}
                                    onChange={e => updateConfig({ text_data: { ...textData, footer: e.target.value } })}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* --- PREVIEW & LAYERS --- */}
            <div className="as-preview-area">
                <div className="as-canvas-wrap">
                    <div className="as-canvas" style={{ background: currentTheme?.colors[1] }}>
                        <div className={`card-base layout-${selectedLayout}`} style={{ '--card-accent': currentTheme?.colors[0] }}>
                            {/* Base Elements depending on layout */}
                            <div className="card-avatar" />
                            <div className="card-info">
                                <h2 className="card-title">{textData.title}</h2>
                                <p className="card-subtitle">{textData.subtitle}</p>
                                {selectedLayout === 'ticket' && <div className="card-footer" style={{ marginTop: '20px', borderTop: '2px dashed var(--card-accent)', paddingTop: '10px' }}>{textData.footer}</div>}
                            </div>

                            {/* CUSTOM LAYERS */}
                            {layers.map(layer => layer.visible && (
                                <div
                                    key={layer.id}
                                    className="canvas-layer"
                                    style={{
                                        left: `${layer.x}%`,
                                        top: `${layer.y}%`,
                                        zIndex: layer.z,
                                        opacity: layer.opacity / 100,
                                        color: layer.color,
                                        fontSize: `${layer.size}px`,
                                    }}
                                >
                                    {layer.content}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="as-layers">
                    <div className="as-layers__header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Layers size={18} className="gradient-text" />
                            <h3 style={{ margin: 0, fontSize: '0.9rem' }}>Layered Editor</h3>
                            <span className="badge" style={{ fontSize: '0.65rem' }}>{layers.length}/30</span>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={addLayer} disabled={layers.length >= 30}>
                            <Plus size={14} /> Add Layer
                        </button>
                    </div>

                    <div className="as-layers__list">
                        {layers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <Sparkles size={32} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                <p style={{ fontSize: '0.8rem' }}>No hay capas personalizadas. Añade una para empezar.</p>
                            </div>
                        ) : (
                            layers.map(layer => (
                                <div key={layer.id} className="as-layer-item">
                                    <div className="as-layer-item__drag"><Move size={14} /></div>
                                    <div className="as-layer-item__main">
                                        <span className="as-layer-item__type">Custom Text</span>
                                        <input
                                            className="as-layer-item__name"
                                            style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, outline: 'none' }}
                                            value={layer.content}
                                            onChange={e => updateLayer(layer.id, { content: e.target.value })}
                                        />
                                    </div>
                                    <div className="as-layer-controls">
                                        <div className="as-control-group">
                                            <span className="as-control-label">X</span>
                                            <input type="number" className="as-control-input" value={layer.x} onChange={e => updateLayer(layer.id, { x: parseInt(e.target.value) })} />
                                        </div>
                                        <div className="as-control-group">
                                            <span className="as-control-label">Y</span>
                                            <input type="number" className="as-control-input" value={layer.y} onChange={e => updateLayer(layer.id, { y: parseInt(e.target.value) })} />
                                        </div>
                                        <div className="as-control-group">
                                            <span className="as-control-label">Z</span>
                                            <input type="number" className="as-control-input" value={layer.z} onChange={e => updateLayer(layer.id, { z: parseInt(e.target.value) })} />
                                        </div>
                                        <div className="as-control-group">
                                            <span className="as-control-label">A</span>
                                            <input type="number" className="as-control-input" value={layer.opacity} onChange={e => updateLayer(layer.id, { opacity: parseInt(e.target.value) })} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <button className="btn btn-secondary btn-sm" style={{ padding: '4px' }} onClick={() => updateLayer(layer.id, { visible: !layer.visible })}>
                                                {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                            </button>
                                            <button className="btn btn-secondary btn-sm" style={{ padding: '4px', color: 'var(--red)' }} onClick={() => removeLayer(layer.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
