import { useState } from 'react'
import { X, Upload, Check, AlertCircle } from 'lucide-react'
import { saveDesign, uploadTexture } from '../../services/supabase'
import { calculateDesignPrice } from '../../utils/pricing'
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

  // Validation
  const canSave = () => {
    if (!formData.title.trim()) return { valid: false, message: 'Title is required' }
    if (formData.title.length < 3) return { valid: false, message: 'Title must be at least 3 characters' }
    if (!formData.authorName.trim()) return { valid: false, message: 'Author name is required' }
    if (selectedKeys.length === 0) return { valid: false, message: 'Please select at least one key' }
    if (!activeLayer?.textureUrl) return { valid: false, message: 'Please upload a texture' }
    
    // Check auth for private designs
    if (!formData.isPublic && !user) {
      return { valid: false, message: 'Please sign in to save private designs', requiresAuth: true }
    }
    
    return { valid: true }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validation = canSave()
    if (!validation.valid) {
      if (validation.requiresAuth) {
        setShowAuthModal(true)
        return
      }
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
        textureTransform: activeLayer.textureTransform,
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pt-24">
      <div className="glass rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-display font-bold text-grim-accent">
            Save Design
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            disabled={status === 'saving'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {status === 'success' && (
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Design Saved!</h3>
              <p className="text-gray-400 mb-4">
                {formData.isPublic 
                  ? 'Your design has been saved and published to the gallery.'
                  : 'Your design has been saved privately.'}
              </p>
              {formData.isPublic && (
                <a
                  href="/gallery"
                  className="px-6 py-2 bg-grim-accent text-black font-semibold rounded-lg hover:bg-grim-accent/80 transition-colors"
                >
                  View in Gallery
                </a>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        {status !== 'success' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Design Info */}
            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Keys Selected:</span>
                <span className="font-semibold text-grim-accent">{selectedKeys.length} keys</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Estimated Price:</span>
                <span className="font-semibold">
                  {selectedKeys.length > 0 
                    ? `₹${(calculateDesignPrice(selectedKeys.length).totalPrice / 100).toFixed(0)}`
                    : '—'}
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Design Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., WASD Gaming Set"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-grim-accent focus:outline-none transition-colors"
                maxLength={50}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/50 characters</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your design..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-grim-accent focus:outline-none transition-colors resize-none"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200 characters</p>
            </div>

            {/* Author Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-grim-accent focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.authorEmail}
                  onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-grim-accent focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.category === cat.value
                        ? 'border-grim-accent bg-grim-accent/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    <div className="text-xs font-semibold">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="wasd, gaming, red (comma-separated)"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-grim-accent focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-gray-600 text-grim-accent focus:ring-grim-accent focus:ring-offset-0"
              />
              <div className="flex-1">
                <label htmlFor="isPublic" className="block font-semibold cursor-pointer">
                  Publish to Community Gallery
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Share your design with the community. You can change this later.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                disabled={status === 'saving'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'saving' || !canSave().valid}
                className="flex-1 px-6 py-3 bg-grim-accent text-black font-semibold rounded-lg hover:bg-grim-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'saving' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Save Design
                  </>
                )}
              </button>
            </div>
          </form>
        )}
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
