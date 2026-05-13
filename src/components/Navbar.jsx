import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { Menu, X, Bot, LayoutDashboard, BarChart3, LogOut, ChevronDown, Globe } from 'lucide-react'
import logoImg from '../assets/logo256.png'
import logoSm from '../assets/logo80.png'
import './Navbar.css'

export default function Navbar() {
    const { user, login, logout } = useAuth()
    const { language, toggleLanguage, t } = useLanguage()
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        setMenuOpen(false)
        setUserMenuOpen(false)
    }, [location])

    const isActive = (path) => location.pathname === path

    return (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
            <div className="navbar__container container">
                {/* Logo */}
                <Link to="/" className="navbar__logo">
                    <div className="navbar__logo-icon">
                        <img src={logoSm} alt="Logo" />
                    </div>
                    <span className="navbar__logo-text">TBot</span>
                </Link>

                {/* Desktop Nav Links */}
                <ul className="navbar__links">
                    <li><a href="#features" className="navbar__link">{t('navbar.features')}</a></li>
                    <li><a href="#pricing" className="navbar__link">{t('navbar.pricing')}</a></li>
                    {user && (
                        <>
                            <li>
                                <Link to="/dashboard" className={`navbar__link ${isActive('/dashboard') ? 'navbar__link--active' : ''}`}>
                                    {t('common.dashboard')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin" className={`navbar__link ${isActive('/admin') ? 'navbar__link--active' : ''}`}>
                                    {t('navbar.support')}
                                </Link>
                            </li>
                        </>
                    )}
                </ul>

                {/* Auth Section */}
                <div className="navbar__auth">
                    <button 
                        onClick={toggleLanguage} 
                        className="navbar__lang-toggle"
                        title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
                    >
                        <Globe size={20} />
                        <span>{language.toUpperCase()}</span>
                    </button>

                    {user ? (
                        <div className="navbar__user" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                            <img
                                src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/0.png`}
                                alt={user.username}
                                className="navbar__avatar"
                            />
                            <span className="navbar__username">{user.username}</span>
                            <ChevronDown size={16} className={`navbar__chevron ${userMenuOpen ? 'navbar__chevron--open' : ''}`} />

                            {userMenuOpen && (
                                <div className="navbar__dropdown">
                                    <Link to="/dashboard" className="navbar__dropdown-item">
                                        <LayoutDashboard size={16} /> {t('common.dashboard')}
                                    </Link>
                                    <Link to="/admin" className="navbar__dropdown-item">
                                        <BarChart3 size={16} /> {t('navbar.support')}
                                    </Link>
                                    <div className="navbar__dropdown-divider" />
                                    <button onClick={logout} className="navbar__dropdown-item navbar__dropdown-item--danger">
                                        <LogOut size={16} /> {t('common.logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button onClick={login} className="btn btn-primary btn-sm navbar__login-btn">
                            <svg width="18" height="18" viewBox="0 0 71 55" fill="white">
                                <path d="M60.1 4.9C55.6 2.8 50.8 1.2 45.8.4c-.6 1-1.2 2.4-1.7 3.5-5.3-.8-10.6-.8-15.8 0-.5-1.1-1.2-2.5-1.8-3.5C21.5 1.2 16.7 2.8 12.2 4.9 1.8 20.5-1.1 35.7.4 50.7c6 4.4 11.8 7 17.5 8.7 1.4-1.9 2.7-4 3.8-6.2-2.1-.8-4.1-1.7-6-2.8.5-.4 1-.7 1.5-1.1 11.5 5.3 24 5.3 35.4 0 .5.4 1 .7 1.5 1.1-1.9 1.1-3.9 2-6 2.8 1.1 2.2 2.4 4.3 3.8 6.2 5.7-1.7 11.5-4.3 17.5-8.7 1.7-17.6-2.9-32.7-12.3-47.8zM23.7 41.5c-3.4 0-6.2-3.1-6.2-6.9s2.7-6.9 6.2-6.9 6.3 3.1 6.2 6.9c0 3.8-2.7 6.9-6.2 6.9zm23.6 0c-3.4 0-6.2-3.1-6.2-6.9s2.7-6.9 6.2-6.9 6.3 3.1 6.2 6.9c0 3.8-2.7 6.9-6.2 6.9z" />
                            </svg>
                            {t('common.login')}
                        </button>
                    )}

                    {/* Mobile menu button */}
                    <button
                        className="navbar__menu-btn"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menu"
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="navbar__mobile-menu glass">
                    <a href="#features" className="navbar__mobile-link">{t('navbar.features')}</a>
                    <a href="#pricing" className="navbar__mobile-link">{t('navbar.pricing')}</a>
                    {user && (
                        <>
                            <Link to="/dashboard" className="navbar__mobile-link">{t('common.dashboard')}</Link>
                            <Link to="/admin" className="navbar__mobile-link">{t('navbar.support')}</Link>
                            <button onClick={logout} className="navbar__mobile-link navbar__mobile-link--danger">
                                {t('common.logout')}
                            </button>
                        </>
                    )}
                    {!user && (
                        <button onClick={login} className="btn btn-primary btn-sm" style={{ margin: '0.5rem 1rem' }}>
                            {t('common.login')}
                        </button>
                    )}
                </div>
            )}
        </nav>
    )
}
