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
  
  // Hide Start Designing button on configurator page
  const isConfiguratorPage = location.pathname === '/configurator'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-300 ${
      scrolled ? 'glass shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 pointer-events-auto">
            <span className="text-2xl font-display font-bold text-grim-accent">
              GRIM
            </span>
            <span className="text-2xl font-display font-bold">
              CAPS
            </span>
          </Link>

          {/* Desktop Navigation - CENTERED */}
          <div className="hidden md:flex items-center space-x-6 pointer-events-auto absolute left-1/2 transform -translate-x-1/2">
            <Link to="/configurator" className={`text-sm font-medium transition-colors ${
              isConfiguratorPage ? 'text-grim-accent' : 'text-white hover:text-grim-accent'
            }`}>
              Configurator
            </Link>
            <Link to="/gallery" className="text-sm font-medium text-white hover:text-grim-accent transition-colors">
              Gallery
            </Link>
            <Link to="/about" className="text-sm font-medium text-white hover:text-grim-accent transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-white hover:text-grim-accent transition-colors">
              Contact
            </Link>
          </div>

          {/* Right Side - Auth & Cart */}
          <div className="hidden md:flex items-center gap-3 pointer-events-auto">
            {user ? (
              <UserMenu />
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-grim-accent to-grim-blue text-black font-semibold rounded-lg hover:scale-105 transition-all duration-300"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
            <CartIcon />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/configurator" className="block px-3 py-2 text-white hover:text-grim-accent">
              Configurator
            </Link>
            <Link to="/gallery" className="block px-3 py-2 text-white hover:text-grim-accent">
              Gallery
            </Link>
            <Link to="/about" className="block px-3 py-2 text-white hover:text-grim-accent">
              About
            </Link>
            <Link to="/contact" className="block px-3 py-2 text-white hover:text-grim-accent">
              Contact
            </Link>
            
            {/* Mobile Auth */}
            {!user && (
              <button
                onClick={() => {
                  setAuthModalOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-grim-accent hover:bg-gray-800/50 rounded-lg"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </nav>
  )
}
