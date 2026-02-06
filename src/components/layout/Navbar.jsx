import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-display font-bold text-grim-accent">
              GRIM
            </span>
            <span className="text-2xl font-display font-bold">
              CAPS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/configurator" className="text-white hover:text-grim-accent transition-colors">
              Configurator
            </Link>
            <Link to="/gallery" className="text-white hover:text-grim-accent transition-colors">
              Gallery
            </Link>
            <Link to="/about" className="text-white hover:text-grim-accent transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-white hover:text-grim-accent transition-colors">
              Contact
            </Link>
          </div>

          {/* CTA Button */}
          <Link 
            to="/configurator" 
            className="hidden md:block px-6 py-3 bg-gradient-to-r from-grim-accent to-grim-blue text-grim-darker font-display font-semibold rounded-lg hover:scale-105 transition-transform"
          >
            Start Designing
          </Link>

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
          </div>
        </div>
      )}
    </nav>
  )
}
