import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { LogIn } from 'lucide-react'
import CartIcon from '../cart/CartIcon'
import UserMenu from '../auth/UserMenu'
import AuthModal from '../auth/AuthModal'
import useAuthStore from '../../store/authStore'

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const user = useAuthStore(state => state.user)

  const isConfiguratorPage = location.pathname.includes('configurator')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      style={isConfiguratorPage ? { background: 'transparent', border: 'none', boxShadow: 'none', backdropFilter: 'none' } : {}}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${scrolled && !isConfiguratorPage
        ? 'bg-[#030014]/90 backdrop-blur-xl border-b border-grim-cyan/20 shadow-[0_10px_30px_-10px_rgba(0,240,255,0.1)]'
        : 'bg-transparent py-6'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* FLEX LAYOUT: Robust & Bug-Free */}
        <div className="flex items-center justify-between h-20">

          {/* 1. Left Side: Logo */}
          <div className="flex-shrink-0 z-50">
            <Link to="/" className="flex items-center space-x-2 group relative">
              <div className="absolute inset-0 bg-grim-cyan/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full scale-150 pointer-events-none"></div>
              <span className="text-2xl font-display font-bold text-grim-cyan">
                GRIM
              </span>
              <span className="text-2xl font-display font-bold text-white">
                CAPS
              </span>
            </Link>
          </div>

          {/* 2. Center: Navigation Links (Flex Center in Available Space) */}
          <div className="hidden md:flex flex-1 justify-center px-4 z-40">
            <div className="flex items-center gap-4 lg:gap-8">
              {[
                { name: 'Configurator', path: '/configurator' },
                { name: 'Gallery', path: '/gallery' },
                { name: 'About', path: '/about' },
                { name: 'Contact', path: '/contact' }
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-bold tracking-widest uppercase transition-all duration-200 group flex items-center justify-center whitespace-nowrap ${location.pathname === link.path
                    ? 'text-grim-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]'
                    : 'text-gray-400 hover:text-grim-cyan'
                    }`}
                >
                  <span className="relative z-10">{link.name}</span>

                  {/* Top Left Bracket */}
                  <span className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 transition-all duration-300 ease-out ${location.pathname === link.path
                    ? 'border-grim-cyan opacity-100 translate-x-0 translate-y-0 shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                    : 'border-white/20 opacity-0 -translate-x-2 -translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:border-grim-cyan/50'
                    }`}></span>

                  {/* Top Right Bracket */}
                  <span className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 transition-all duration-300 ease-out ${location.pathname === link.path
                    ? 'border-grim-cyan opacity-100 translate-x-0 translate-y-0 shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                    : 'border-white/20 opacity-0 translate-x-2 -translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:border-grim-cyan/50'
                    }`}></span>

                  {/* Bottom Left Bracket */}
                  <span className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 transition-all duration-300 ease-out ${location.pathname === link.path
                    ? 'border-grim-cyan opacity-100 translate-x-0 translate-y-0 shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                    : 'border-white/20 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:border-grim-cyan/50'
                    }`}></span>

                  {/* Bottom Right Bracket */}
                  <span className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 transition-all duration-300 ease-out ${location.pathname === link.path
                    ? 'border-grim-cyan opacity-100 translate-x-0 translate-y-0 shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                    : 'border-white/20 opacity-0 translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:border-grim-cyan/50'
                    }`}></span>

                  {/* Center Crosshair Dot (Only on Active) */}
                  {location.pathname === link.path && (
                    <span className="absolute top-1/2 left-1/2 w-1 h-1 bg-grim-cyan rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping opacity-50"></span>
                  )}

                </Link>
              ))}
            </div>
          </div>

          {/* 3. Right Side: Auth & Cart */}
          <div className="flex-shrink-0 z-50 flex justify-end">
            {!isConfiguratorPage ? (
              <div className="hidden md:flex items-center gap-6">
                {/* Cart Icon */}
                <div className="transform hover:scale-110 transition-transform duration-300">
                  <CartIcon />
                </div>

                {/* Tech Separator */}
                <div className="h-6 w-[1px] bg-white/10"></div>

                {user ? (
                  <UserMenu />
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="group relative h-9 px-6 flex items-center justify-center overflow-hidden transition-all duration-300"
                  >
                    {/* 1. BRACKETS FRAME */}
                    <div className="absolute inset-0 pointer-events-none transition-all duration-300 group-hover:scale-[1.1] opacity-70 group-hover:opacity-100">
                      {/* Top Left */}
                      <div className="absolute top-0 left-0 w-2 h-[1px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
                      <div className="absolute top-0 left-0 w-[1px] h-2 bg-white group-hover:bg-grim-cyan transition-colors"></div>
                      {/* Top Right */}
                      <div className="absolute top-0 right-0 w-2 h-[1px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
                      <div className="absolute top-0 right-0 w-[1px] h-2 bg-white group-hover:bg-grim-cyan transition-colors"></div>
                      {/* Bottom Left */}
                      <div className="absolute bottom-0 left-0 w-2 h-[1px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
                      <div className="absolute bottom-0 left-0 w-[1px] h-2 bg-white group-hover:bg-grim-cyan transition-colors"></div>
                      {/* Bottom Right */}
                      <div className="absolute bottom-0 right-0 w-2 h-[1px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
                      <div className="absolute bottom-0 right-0 w-[1px] h-2 bg-white group-hover:bg-grim-cyan transition-colors"></div>
                    </div>

                    {/* 2. INNER GLOW & BACKGROUND */}
                    <div className="absolute inset-1 bg-white/[0.02] group-hover:bg-grim-cyan/[0.05] transition-colors duration-300 backdrop-blur-[1px]"></div>

                    {/* 3. TEXT LAYER */}
                    <div className="relative z-10 flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] tracking-[0.2em] uppercase text-white group-hover:text-grim-cyan transition-colors duration-300">
                        Sign In
                      </span>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              /* Placeholder width to balance the logo if needed, or simple spacer */
              <div className="hidden md:block w-8"></div>
            )}

            {/* Mobile Menu Button - Styled */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu - Glassmorphic */}
      <div className={`md:hidden fixed inset-x-0 top-[70px] p-4 transition-all duration-300 origin-top transform ${mobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}>
        <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl space-y-2">
          {[
            { name: 'Configurator', path: '/configurator' },
            { name: 'Gallery', path: '/gallery' },
            { name: 'About', path: '/about' },
            { name: 'Contact', path: '/contact' }
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-4 py-3 rounded-xl text-lg font-medium transition-colors ${location.pathname === link.path
                ? 'bg-grim-accent/10 text-grim-accent border border-grim-accent/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {!user && (
            <div className="pt-4 mt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setAuthModalOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-grim-accent text-black font-bold rounded-xl active:scale-95 transition-transform"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </nav>
  )
}
