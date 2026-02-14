import { useState, useEffect, useRef } from 'react'
import { X, Upload, Check, AlertCircle } from 'lucide-react'
import { saveDesign, uploadTexture, supabase } from '../../services/supabase'
import { calculateDesignPrice } from '../../utils/pricing'
import { calculateKeysBoundingBox } from '../../shaders/KeycapShader'
import useConfiguratorStore from '../../store/configuratorStore'
import useAuthStore from '../../store/authStore'
import AuthModal from '../auth/AuthModal'

const CATEGORIES = [
  { value: 'gaming', label: 'Gaming', emoji: '🎮' },
  { value: 'minimal', label: 'Minimal', emoji: '✨' },
  { value: 'anime', label: 'Anime', emoji: '🎌' },
  { value: 'abstract', label: 'Abstract', emoji: '🌀' },
  { value: 'custom', label: 'Custom', emoji: '🎨' }
]

export default function SaveDesignModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    authorName: '',
    authorEmail: '',
    category: 'custom',
    tags: '',
    isPublic: false
  })

  const [status, setStatus] = useState('idle') // idle | saving | success | error
  const [error, setError] = useState(null)
  const [savedDesignId, setSavedDesignId] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Get auth state
  const user = useAuthStore(state => state.user)

  // Get configurator state
  const activeLayerId = useConfiguratorStore(state => state.activeLayerId)
  const layers = useConfiguratorStore(state => state.layers)
  const selectedKeys = useConfiguratorStore(state => state.selectedKeys)
  const keyCustomizations = useConfiguratorStore(state => state.keyCustomizations)

  const activeLayer = layers.find(l => l.id === activeLayerId)

  // Auto-fill name and email when user is signed in
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && isOpen) {
        // Try to fetch profile name from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single()

        setFormData(prev => ({
          ...prev,
          authorName: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || '',
          authorEmail: user.email || ''
        }))
      }
    }

    fetchUserProfile()
  }, [user, isOpen])

  // Validation
  // Validation for enabling the save button
  const canSave = () => {
    if (!formData.title.trim()) return { valid: false, message: 'Title is required' }
    if (formData.title.length < 3) return { valid: false, message: 'Title must be at least 3 characters' }
    if (!formData.authorName.trim()) return { valid: false, message: 'Author name is required' }
    if (selectedKeys.length === 0) return { valid: false, message: 'Please select at least one key' }
    if (!activeLayer?.textureUrl) return { valid: false, message: 'Please upload a texture' }

    return { valid: true }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log('SaveDesignModal - handleSubmit called')
    console.log('formData.isPublic:', formData.isPublic)
    console.log('user:', user)

    // Check auth FIRST for private designs
    if (!formData.isPublic && !user) {
      console.log('Private design requires auth - showing auth modal')
      setShowAuthModal(true)
      return
    }

    // Then validate form
    const validation = canSave()
    console.log('validation result:', validation)

    if (!validation.valid) {
      setError(validation.message)
      return
    }

    setStatus('saving')
    setError(null)

    try {
      // Calculate pricing
      const pricing = calculateDesignPrice(selectedKeys.length)

      // Upload texture to Supabase storage if it's a blob URL
      let textureUrl = activeLayer.textureUrl
      if (textureUrl && textureUrl.startsWith('blob:')) {
        try {
          // Fetch the blob
          const response = await fetch(textureUrl)
          const blob = await response.blob()

          // Create a File object from the blob
          const file = new File([blob], 'texture.png', { type: blob.type })

          // Generate a temporary design ID for the upload path
          const tempDesignId = crypto.randomUUID()

          // Upload to Supabase storage
          textureUrl = await uploadTexture(file, tempDesignId)
        } catch (uploadError) {
          console.error('Error uploading texture:', uploadError)
          throw new Error('Failed to upload texture. Please try again.')
        }
      }

      // Prepare design data
      const designData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        authorName: formData.authorName.trim(),
        authorEmail: formData.authorEmail.trim() || null,
        textureUrl: textureUrl,
        textureTransform: {
          ...activeLayer.textureTransform,
          // Include bounding box for consistent texture mapping on reload
          ...(activeLayer.boundingBox && {
            boundsMin: { x: activeLayer.boundingBox.min.x, y: activeLayer.boundingBox.min.y },
            boundsMax: { x: activeLayer.boundingBox.max.x, y: activeLayer.boundingBox.max.y }
          })
        },
        selectedKeys: selectedKeys,
        keyGroup: selectedKeys,
        baseColor: activeLayer.baseColor,
        keyCount: selectedKeys.length,
        pricePerKey: pricing.pricePerKey,
        totalPrice: pricing.totalPrice,
        isPublic: formData.isPublic,
        category: formData.category,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        userId: user?.id || null // Include user_id if authenticated
      }

      // Save to database
      const savedDesign = await saveDesign(designData)

      setSavedDesignId(savedDesign.id)
      setStatus('success')

      // Reset form after 2 seconds
      setTimeout(() => {
        handleClose()
      }, 2000)

    } catch (err) {
      console.error('Error saving design:', err)
      setError(err.message || 'Failed to save design. Please try again.')
      setStatus('error')
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      authorName: '',
      authorEmail: '',
      category: 'custom',
      tags: '',
      isPublic: false
    })
    setStatus('idle')
    setError(null)
    setSavedDesignId(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-grim-void/95 backdrop-blur-xl pt-24">
      <div className="relative bg-grim-panel border border-grim-purple/30 w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-[0_0_50px_rgba(188,19,254,0.2)] flex flex-col clip-path-polygon-[20px_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%,0_20px]"
        style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>

        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-grim-cyan via-grim-purple to-grim-pink"></div>
        <div className="absolute top-0 left-0 w-1/3 h-[4px] bg-grim-cyan blur-[2px]"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-4">
            <div className="p-2 border border-grim-cyan/50 bg-grim-cyan/10 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              <Upload className="w-5 h-5 text-grim-cyan" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-widest uppercase leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                Save Configuration
              </h2>
              <p className="text-[10px] text-grim-cyan/70 font-mono mt-1 uppercase tracking-widest">System Archive Protocol // <span className="text-grim-purple animate-pulse">V.2.0</span></p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/5 transition-colors text-gray-500 hover:text-white border border-transparent hover:border-white/20 group"
            disabled={status === 'saving'}
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 bg-grim-panel relative">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(rgba(188, 19, 254, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.2) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
          </div>

          {/* Success State */}
          {status === 'success' && (
            <div className="p-12 flex flex-col items-center justify-center text-center h-full relative z-10">
              <div className="w-24 h-24 border-2 border-grim-green flex items-center justify-center mb-8 relative shadow-[0_0_30px_rgba(10,255,100,0.2)]">
                <div className="absolute inset-0 bg-grim-green/10 animate-pulse"></div>
                <Check className="w-12 h-12 text-grim-green" />
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-2 h-2 bg-grim-green"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-grim-green"></div>
                <div className="absolute top-0 right-0 w-2 h-2 bg-grim-green"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-grim-green"></div>
              </div>
              <h3 className="text-3xl font-display font-bold text-white mb-2 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(10,255,100,0.5)]">MISSION SUCCESS</h3>
              <p className="text-gray-400 mb-12 max-w-sm font-mono text-xs uppercase tracking-wide">
                {formData.isPublic
                  ? 'Configuration uploaded to public mainframe.'
                  : 'Configuration secured in private vault.'}
              </p>
              {formData.isPublic && (
                <a
                  href="/gallery"
                  className="px-12 py-4 bg-grim-cyan text-black font-black uppercase tracking-widest hover:bg-white transition-colors clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px] shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                  style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                >
                  Access Gallery
                </a>
              )}
            </div>
          )}

          {/* Form */}
          {status !== 'success' && (
            <form onSubmit={handleSubmit} className="p-8 space-y-8 relative z-10">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-4 p-4 bg-grim-alert/10 border-l-4 border-grim-alert shadow-[0_0_20px_rgba(255,42,109,0.2)]">
                  <AlertCircle className="w-5 h-5 text-grim-alert flex-shrink-0 animate-pulse" />
                  <p className="text-xs text-grim-alert font-bold uppercase tracking-wider">{error}</p>
                </div>
              )}

              {/* Design Info Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-black/40 border border-white/5 flex flex-col group hover:border-grim-cyan/50 transition-colors">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 group-hover:text-grim-cyan transition-colors">Active Units</span>
                  <span className="text-3xl font-display font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{selectedKeys.length}</span>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 flex flex-col group hover:border-grim-pink/50 transition-colors">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 group-hover:text-grim-pink transition-colors">Est. Value</span>
                  <span className="text-3xl font-display font-bold text-grim-pink drop-shadow-[0_0_10px_rgba(255,0,85,0.5)]">
                    {selectedKeys.length > 0
                      ? `₹${(calculateDesignPrice(selectedKeys.length).totalPrice / 100).toFixed(0)}`
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2 group">
                <label className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold group-focus-within:text-grim-cyan transition-colors">
                  <span>Design Designation</span>
                  <span className="text-grim-pink">*REQUIRED</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ENTER_DESIGN_CODENAME"
                  className="w-full px-4 py-4 bg-black/50 border border-white/10 focus:border-grim-cyan focus:ring-1 focus:ring-grim-cyan/50 focus:outline-none transition-all placeholder-gray-700 text-white font-mono text-sm uppercase shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                  maxLength={50}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold group-focus-within:text-grim-purple transition-colors">
                  Manifest Data (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ADDITIONAL_SYSTEM_NOTES..."
                  rows={2}
                  className="w-full px-4 py-4 bg-black/50 border border-white/10 focus:border-grim-purple focus:ring-1 focus:ring-grim-purple/50 focus:outline-none transition-all placeholder-gray-700 text-white font-mono text-sm uppercase resize-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                  maxLength={200}
                />
              </div>

              {/* Author Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <label className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold group-focus-within:text-white transition-colors">
                    <span>Operator ID</span>
                    <span className="text-grim-pink">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    placeholder="OPERATOR_NAME"
                    className="w-full px-4 py-4 bg-black/50 border border-white/10 focus:border-grim-cyan focus:ring-1 focus:ring-grim-cyan/50 focus:outline-none transition-all placeholder-gray-700 text-white font-mono text-sm uppercase shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                    required
                  />
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold group-focus-within:text-white transition-colors">
                    Comms Link
                  </label>
                  <input
                    type="email"
                    value={formData.authorEmail}
                    onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                    placeholder="EMAIL_ADDRESS"
                    className="w-full px-4 py-4 bg-black/50 border border-white/10 focus:border-grim-cyan focus:ring-1 focus:ring-grim-cyan/50 focus:outline-none transition-all placeholder-gray-700 text-white font-mono text-sm uppercase shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">
                  Classification
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`p-3 border transition-all flex flex-col items-center justify-center gap-1 ${formData.category === cat.value
                        ? 'border-grim-cyan bg-grim-cyan/10 text-grim-cyan shadow-[0_0_15px_-5px_#00F0FF]'
                        : 'border-white/5 bg-black/20 text-gray-600 hover:border-white/20 hover:text-gray-400'
                        }`}
                    >
                      <div className="text-lg filter grayscale opacity-80">{cat.emoji}</div>
                      <div className="text-[8px] font-bold uppercase tracking-widest">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-4 p-4 border border-white/10 bg-black/20 group hover:border-grim-purple/50 transition-colors">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-5 h-5 rounded-none border-gray-600 bg-black text-grim-purple focus:ring-offset-0 focus:ring-0 checked:bg-grim-purple"
                />
                <div className="flex-1">
                  <label htmlFor="isPublic" className="block text-xs font-bold text-white cursor-pointer uppercase tracking-widest group-hover:text-grim-purple transition-colors">
                    Broadcast to Network
                  </label>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">
                    Design will be indexed in public gallery.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-4 bg-transparent border border-white/10 hover:bg-white/5 text-gray-500 hover:text-white font-bold uppercase tracking-widest transition-colors text-xs"
                  disabled={status === 'saving'}
                >
                  Terminate
                </button>
                <button
                  type="submit"
                  disabled={status === 'saving' || !canSave().valid}
                  className="px-6 py-4 bg-gradient-to-r from-grim-cyan to-grim-purple text-black font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 text-xs clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px]"
                  style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                >
                  {status === 'saving' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      INITIALIZE SAVE
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="signin"
      />
    </div>
  )
}
