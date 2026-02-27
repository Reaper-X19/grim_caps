import { Link } from 'react-router-dom'
import { Github, Twitter, Instagram, ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-[#050505] border-t border-white/10 overflow-hidden">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-grim-cyan/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

          {/* Brand Section (Span 4) */}
          <div className="md:col-span-4 space-y-6">
            <h3 className="text-2xl font-display font-black italic tracking-tighter text-white uppercase">
              Grim <span className="text-grim-cyan">Caps</span>
              <span className="ml-2 text-[10px] font-mono font-normal not-italic text-gray-600 tracking-widest align-top opacity-50">V.2.0</span>
            </h3>
            <p className="text-gray-500 font-mono text-xs leading-relaxed uppercase tracking-wide max-w-sm">
              Precision-engineered keycaps for the modern operator.
              Forged in darkness, built for performance.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-green-500/80">
                System Operational
              </span>
            </div>
          </div>

          {/* Quick Links (Span 3) */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-sm">
              // Navigation
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Configurator', path: '/configurator' },
                { name: 'Gallery', path: '/gallery' },
                { name: 'About Us', path: '/about' },
                { name: 'Contact', path: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-gray-500 hover:text-grim-cyan transition-colors"
                  >
                    <span className="w-0 group-hover:w-2 transition-all duration-300 h-[1px] bg-grim-cyan"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support (Span 3) */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-sm">
              // Support
            </h4>
            <ul className="space-y-3">
              {['FAQ', 'Shipping', 'Returns', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="group flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-gray-500 hover:text-grim-cyan transition-colors"
                  >
                    <span className="w-0 group-hover:w-2 transition-all duration-300 h-[1px] bg-grim-cyan"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Connect (Span 2) */}
          <div className="md:col-span-2 space-y-6">
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-sm">
              // Connect
            </h4>
            <div className="flex gap-4">
              {[Twitter, Instagram, Github].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-grim-cyan/50 hover:bg-grim-cyan/5 text-gray-500 hover:text-grim-cyan transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-grim-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Icon className="w-4 h-4 relative z-10" />
                </a>
              ))}
            </div>
            <div className="pt-4">
              <p className="font-mono text-[10px] text-gray-700 uppercase tracking-widest">
                Est. 2026
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">
            © 2026 Grim Caps. All rights reserved.
          </p>
          <p className="font-mono text-[10px] text-gray-800 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gray-800 rounded-full"></span>
            Secure Connection Encrypted
          </p>
        </div>
      </div>
    </footer>
  )
}
