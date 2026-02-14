import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react'
import { signInWithGoogle, signInWithEmail, signUpWithEmail, validatePassword } from '../../services/auth'
import useAuthStore from '../../store/authStore'

export default function AuthModal({ isOpen, onClose, defaultTab = 'signin' }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  })

  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const setSession = useAuthStore(state => state.setSession)
  const setAuthLoading = useAuthStore(state => state.setLoading)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
      // OAuth will redirect, so we don't need to do anything here
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { session, user } = await signInWithEmail(signInData.email, signInData.password)
      setSession(session)
      setAuthLoading(false)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to sign in')
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    const passwordValidation = validatePassword(signUpData.password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.message)
      setLoading(false)
      return
    }

    try {
      const { session, user } = await signUpWithEmail(
        signUpData.email,
        signUpData.password,
        { name: signUpData.name }
      )

      if (session) {
        setSession(session)
        setAuthLoading(false)
        onClose()
      } else {
        // Email confirmation required
        setError('Please check your email to confirm your account')
        setLoading(false)
      }
    } catch (err) {
      setError(err.message || 'Failed to sign up')
      setLoading(false)
    }
  }

  const getPasswordStrength = () => {
    if (!signUpData.password) return { strength: 0, color: 'bg-gray-600' }

    const validation = validatePassword(signUpData.password)
    const strength = validation.strength

    if (strength < 40) return { strength, color: 'bg-red-500', label: 'Weak' }
    if (strength < 70) return { strength, color: 'bg-yellow-500', label: 'Fair' }
    if (strength < 100) return { strength, color: 'bg-blue-500', label: 'Good' }
    return { strength, color: 'bg-green-500', label: 'Strong' }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/90 backdrop-blur-md">
      <div className="flex min-h-full items-center justify-center p-4 py-8">
        <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">

          {/* Modal Corner Brackets (Decorators) */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/20"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20"></div>

          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-grim-cyan/50 to-transparent"></div>

          {/* Header */}
          <div className="flex items-center justify-between p-8 pb-0">
            <div>
              <h2 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase mb-1">
                Welcome <span className="text-grim-cyan">Back</span>
              </h2>
              <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
              // Access Terminal
              </p>
            </div>
            <button
              onClick={onClose}
              className="group p-2 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/5 mt-8 mx-8">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-4 font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'signin'
                ? 'text-grim-cyan border-b border-grim-cyan bg-grim-cyan/5'
                : 'text-gray-600 hover:text-gray-400 hover:bg-white/[0.02]'
                }`}
              disabled={loading}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-4 font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'signup'
                ? 'text-grim-cyan border-b border-grim-cyan bg-grim-cyan/5'
                : 'text-gray-600 hover:text-gray-400 hover:bg-white/[0.02]'
                }`}
              disabled={loading}
            >
              Register
            </button>
          </div>

          <div className="p-8 pt-6">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-500 font-mono text-xs uppercase tracking-wide flex items-center justify-center">
                [!] {error}
              </div>
            )}

            {/* Sign In Form */}
            {activeTab === 'signin' && (
              <form onSubmit={handleEmailSignIn} className="space-y-6">
                <div className="space-y-4">
                  {/* Email Input */}
                  <div className="group">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-grim-cyan transition-colors">
                      Identity // Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        className="w-full pl-4 pr-4 py-3 bg-[#050505] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-grim-cyan transition-colors placeholder-gray-800"
                        placeholder="OPERATOR@GRIM.COM"
                        required
                        disabled={loading}
                      />
                      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/10"></div>
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="group">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-grim-cyan transition-colors">
                      Security // Password
                    </label>
                    <div className="relative bg-[#050505] border border-white/10 group-focus-within:border-grim-cyan transition-colors">
                      {!showPassword && signInData.password && (
                        <div className="absolute inset-0 flex items-center pl-4 pr-12 text-sm font-mono text-white pointer-events-none z-0 tracking-widest">
                          {'*'.repeat(signInData.password.length)}
                        </div>
                      )}
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        className={`w-full pl-4 pr-12 py-3 bg-transparent border-none focus:ring-0 font-mono text-sm focus:outline-none transition-colors placeholder-gray-800 tracking-widest z-10 relative ${!showPassword && signInData.password ? 'text-transparent' : 'text-white'}`}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 bottom-0 px-3 text-gray-600 hover:text-white transition-colors border-l border-white/10"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTON (Bracket Style) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative h-14 w-full flex items-center justify-center overflow-hidden transition-all duration-300 mt-8"
                >
                  {/* 1. BRACKETS FRAME (Scaled for Button) */}
                  <div className="absolute inset-0 pointer-events-none transition-all duration-300 group-hover:scale-[1.02] opacity-70 group-hover:opacity-100">
                    <div className="absolute top-0 left-0 w-3 h-[1px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
                    <div className="absolute top-0 left-0 w-[1px] h-3 bg-white group-hover:bg-grim-cyan transition-colors"></div>
                    <div className="absolute top-0 right-0 w-3 h-[1px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
                    <div className="absolute top-0 right-0 w-[1px] h-3 bg-white group-hover:bg-grim-cyan transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-[1px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-[1px] h-3 bg-white group-hover:bg-grim-cyan transition-colors"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-[1px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
                    <div className="absolute bottom-0 right-0 w-[1px] h-3 bg-white group-hover:bg-grim-cyan transition-colors"></div>
                  </div>

                  {/* 2. INNER GLOW */}
                  <div className="absolute inset-1 bg-white/[0.02] group-hover:bg-grim-cyan/[0.1] transition-colors duration-300 backdrop-blur-[1px]"></div>

                  {/* 3. TEXT */}
                  <span className="relative z-10 font-mono font-bold text-xs tracking-[0.2em] uppercase text-white group-hover:text-grim-cyan transition-colors duration-300 flex items-center gap-3">
                    {loading ? 'AUTHENTICATING...' : 'INITIALIZE SESSION'}
                    <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-grim-cyan">//</span>
                  </span>
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-[#0a0a0a] text-[10px] font-mono uppercase tracking-widest text-gray-600">
                      Or Connect With
                    </span>
                  </div>
                </div>

                {/* Google Button (Minimal) */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  type="button"
                  className="w-full py-3 bg-transparent border border-white/10 text-white font-mono text-xs uppercase tracking-wider rounded-none hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <svg className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google Account
                </button>
              </form>
            )}

            {/* Sign Up Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleEmailSignUp} className="space-y-6">
                <div className="space-y-4">
                  {/* Name Input */}
                  <div className="group">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-grim-cyan transition-colors">
                      Identity // Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                        className="w-full pl-4 pr-4 py-3 bg-[#050505] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-grim-cyan transition-colors placeholder-gray-800"
                        placeholder="AGENT NAME"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="group">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-grim-cyan transition-colors">
                      Identity // Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        className="w-full pl-4 pr-4 py-3 bg-[#050505] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-grim-cyan transition-colors placeholder-gray-800"
                        placeholder="OPERATOR@GRIM.COM"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="group">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-grim-cyan transition-colors">
                      Security // Password
                    </label>
                    <div className="relative bg-[#050505] border border-white/10 group-focus-within:border-grim-cyan transition-colors">
                      {!showPassword && signUpData.password && (
                        <div className="absolute inset-0 flex items-center pl-4 pr-12 text-sm font-mono text-white pointer-events-none z-0 tracking-widest">
                          {'*'.repeat(signUpData.password.length)}
                        </div>
                      )}
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        className={`w-full pl-4 pr-12 py-3 bg-transparent border-none focus:ring-0 font-mono text-sm focus:outline-none transition-colors placeholder-gray-800 tracking-widest z-10 relative ${!showPassword && signUpData.password ? 'text-transparent' : 'text-white'}`}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 bottom-0 px-3 text-gray-600 hover:text-white transition-colors border-l border-white/10"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="group">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-grim-cyan transition-colors">
                      Security // Confirm
                    </label>
                    <div className="relative bg-[#050505] border border-white/10 group-focus-within:border-grim-cyan transition-colors">
                      {!showPassword && signUpData.confirmPassword && (
                        <div className="absolute inset-0 flex items-center pl-4 pr-4 text-sm font-mono text-white pointer-events-none z-0 tracking-widest">
                          {'*'.repeat(signUpData.confirmPassword.length)}
                        </div>
                      )}
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        className={`w-full pl-4 pr-4 py-3 bg-transparent border-none focus:ring-0 font-mono text-sm focus:outline-none transition-colors placeholder-gray-800 tracking-widest z-10 relative ${!showPassword && signUpData.confirmPassword ? 'text-transparent' : 'text-white'}`}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTON (Bracket Style) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative h-14 w-full flex items-center justify-center overflow-hidden transition-all duration-300 mt-8"
                >
                  {/* 1. BRACKETS FRAME (Scaled for Button) */}
                  <div className="absolute inset-0 pointer-events-none transition-all duration-300 group-hover:scale-[1.02] opacity-70 group-hover:opacity-100">
                    <div className="absolute top-0 left-0 w-3 h-[1px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
                    <div className="absolute top-0 left-0 w-[1px] h-3 bg-white group-hover:bg-grim-cyan transition-colors"></div>
                    <div className="absolute top-0 right-0 w-3 h-[1px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
                    <div className="absolute top-0 right-0 w-[1px] h-3 bg-white group-hover:bg-grim-cyan transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-[1px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-[1px] h-3 bg-white group-hover:bg-grim-cyan transition-colors"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-[1px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
                    <div className="absolute bottom-0 right-0 w-[1px] h-3 bg-white group-hover:bg-grim-cyan transition-colors"></div>
                  </div>

                  {/* 2. INNER GLOW */}
                  <div className="absolute inset-1 bg-white/[0.02] group-hover:bg-grim-cyan/[0.1] transition-colors duration-300 backdrop-blur-[1px]"></div>

                  {/* 3. TEXT */}
                  <span className="relative z-10 font-mono font-bold text-xs tracking-[0.2em] uppercase text-white group-hover:text-grim-cyan transition-colors duration-300 flex items-center gap-3">
                    {loading ? 'PROCESSING...' : 'CREATE IDENTITY'}
                    <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-grim-cyan">//</span>
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
    , document.body)
}
