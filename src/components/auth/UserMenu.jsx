import { useState, useRef, useEffect } from 'react'
import { User, LogOut, FileText, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { signOut } from '../../services/auth'
import useAuthStore from '../../store/authStore'

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const menuRef = useRef(null)
  const user = useAuthStore(state => state.user)
  const clearAuth = useAuthStore(state => state.clearAuth)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    if (signingOut) return // Prevent multiple simultaneous sign-outs

    setSigningOut(true)
    try {
      await signOut()
      clearAuth()
      setIsOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setSigningOut(false)
    }
  }

  if (!user) return null

  // Get user display name
  const displayName = user.user_metadata?.name || user.email?.split('@')[0] || 'User'

  // Get user avatar (from Google or generate initials)
  const avatarUrl = user.user_metadata?.avatar_url
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 hover:bg-gray-800/50 rounded-lg transition-colors group"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-grim-accent to-grim-blue flex items-center justify-center text-black font-bold text-sm overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Name (desktop only) */}
        <span className="hidden md:block text-sm font-medium text-gray-300 group-hover:text-grim-accent transition-colors">
          {displayName}
        </span>

        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 glass rounded-lg shadow-xl border border-gray-700/50 overflow-hidden z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-sm font-semibold text-white">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/my-designs"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-grim-accent transition-colors"
            >
              <FileText className="w-4 h-4" />
              My Designs
            </Link>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              {signingOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
