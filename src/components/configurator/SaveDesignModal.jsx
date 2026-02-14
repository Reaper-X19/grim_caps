import { useState, useEffect, useRef } from 'react'
import { X, Upload, Check, AlertCircle, RefreshCw, PlusCircle } from 'lucide-react'
import { saveDesign, updateDesign, uploadTexture, supabase } from '../../services/supabase'
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

  const [status, setStatus] = useState('idle') // idle | choosing | saving | success | error
  const [error, setError] = useState(null)
  const [savedDesignId, setSavedDesignId] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [saveMode, setSaveMode] = useState(null) // null | 'overwrite' | 'new'

  // Get auth state
  const user = useAuthStore(state => state.user)

  // Get configurator state
  const activeLayerId = useConfiguratorStore(state => state.activeLayerId)
  const layers = useConfiguratorStore(state => state.layers)
  const selectedKeys = useConfiguratorStore(state => state.selectedKeys)
  const keyCustomizations = useConfiguratorStore(state => state.keyCustomizations)
  const loadedDesignId = useConfiguratorStore(state => state.loadedDesignId)
  const loadedDesignMeta = useConfiguratorStore(state => state.loadedDesignMeta)
  const clearLoadedDesign = useConfiguratorStore(state => state.clearLoadedDesign)
  const setLoadedDesign = useConfiguratorStore(state => state.setLoadedDesign)

  const activeLayer = layers.find(l => l.id === activeLayerId)

  // When modal opens, decide whether to show choice prompt
  useEffect(() => {
    if (isOpen) {
      if (loadedDesignId && loadedDesignMeta) {
        // This is an existing design — show the choice prompt
        setStatus('choosing')
        setSaveMode(null)
      } else {
        // Fresh design — go straight to form
        setStatus('idle')
        setSaveMode('new')
      }
    }
  }, [isOpen, loadedDesignId, loadedDesignMeta])

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

  // When user picks "overwrite", pre-fill from loaded meta
  const handleChooseOverwrite = () => {
    setSaveMode('overwrite')
    setStatus('idle')
    // Pre-fill form from loaded design meta
    if (loadedDesignMeta) {
      setFormData(prev => ({
        ...prev,
        title: loadedDesignMeta.title || '',
        description: loadedDesignMeta.description || '',
        category: loadedDesignMeta.category || 'custom',
        tags: Array.isArray(loadedDesignMeta.tags) ? loadedDesignMeta.tags.join(', ') : '',
        isPublic: loadedDesignMeta.isPublic || false
      }))
    }
  }

  const handleChooseNew = () => {
    setSaveMode('new')
    setStatus('idle')
    // Clear form for new design
    setFormData(prev => ({
      ...prev,
      title: '',
      description: '',
      category: 'custom',
      tags: '',
      isPublic: false
    }))
  }

  // Validation
  const canSave = () => {
    if (!formData.title.trim()) return { valid: false, message: 'Title is required' }
    if (formData.title.length < 3) return { valid: false, message: 'Title must be at least 3 characters' }
    if (!formData.authorName.trim()) return { valid: false, message: 'Author name is required' }
    if (selectedKeys.length === 0) return { valid: false, message: 'Please select at least one key' }
    if (!activeLayer?.textureUrl) return { valid: false, message: 'Please upload a texture' }

    return { valid: true }
  }

  // Prepare texture URL (upload blob if needed)
  const prepareTextureUrl = async () => {
    let textureUrl = activeLayer.textureUrl
    if (textureUrl && textureUrl.startsWith('blob:')) {
      const response = await fetch(textureUrl)
      const blob = await response.blob()
      const file = new File([blob], 'texture.png', { type: blob.type })
      const tempDesignId = crypto.randomUUID()
      textureUrl = await uploadTexture(file, tempDesignId)
    }
    return textureUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check auth FIRST for private designs
    if (!formData.isPublic && !user) {
      setShowAuthModal(true)
      return
    }

    // Then validate form
    const validation = canSave()
    if (!validation.valid) {
      setError(validation.message)
      return
    }

    setStatus('saving')
    setError(null)

    try {
      const pricing = calculateDesignPrice(selectedKeys.length)
      const textureUrl = await prepareTextureUrl()

      if (saveMode === 'overwrite' && loadedDesignId) {
        // ── UPDATE EXISTING DESIGN ──
        const updates = {
          name: formData.title.trim(),
          description: formData.description.trim() || null,
          author_name: formData.authorName.trim(),
          author_email: formData.authorEmail.trim() || null,
          texture_url: textureUrl,
          texture_config: {
            ...activeLayer.textureTransform,
            ...(activeLayer.boundingBox && {
              boundsMin: { x: activeLayer.boundingBox.min.x, y: activeLayer.boundingBox.min.y },
              boundsMax: { x: activeLayer.boundingBox.max.x, y: activeLayer.boundingBox.max.y }
            })
          },
          selected_keys: selectedKeys,
          key_group: selectedKeys,
          base_color: activeLayer.baseColor,
          key_count: selectedKeys.length,
          price_per_key: pricing.pricePerKey,
          total_price: pricing.totalPrice,
          is_public: formData.isPublic,
          category: formData.category,
          tags: formData.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
        }

        const updated = await updateDesign(loadedDesignId, updates)
        setSavedDesignId(updated.id)

        // Update the loaded design metadata to reflect changes
        setLoadedDesign(updated.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || '',
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
          isPublic: formData.isPublic
        })
      } else {
        // ── SAVE AS NEW DESIGN ──
        const designData = {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          authorName: formData.authorName.trim(),
          authorEmail: formData.authorEmail.trim() || null,
          textureUrl: textureUrl,
          textureTransform: {
            ...activeLayer.textureTransform,
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
          userId: user?.id || null
        }

        const saved = await saveDesign(designData)
        setSavedDesignId(saved.id)

        // Track this design so next save will show overwrite prompt
        setLoadedDesign(saved.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || '',
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
          isPublic: formData.isPublic
        })
      }

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
    setSaveMode(null)
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

        {/* ── CHOICE PROMPT (existing design detected) ── */}
        {status === 'choosing' && (
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-gray-300 text-lg mb-1">
                You're editing an existing design
              </p>
              <p className="text-grim-accent font-semibold text-xl">
                "{loadedDesignMeta?.title}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Update Existing */}
              <button
                onClick={handleChooseOverwrite}
                className="group p-6 rounded-xl border-2 border-gray-700 hover:border-grim-accent bg-gray-900/50 hover:bg-grim-accent/5 transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-grim-accent/20 flex items-center justify-center group-hover:bg-grim-accent/30 transition-colors">
                    <RefreshCw className="w-5 h-5 text-grim-accent" />
                  </div>
                  <h3 className="font-bold text-lg">Update Existing</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Overwrite the current design with your latest changes
                </p>
              </button>

              {/* Save as New */}
              <button
                onClick={handleChooseNew}
                className="group p-6 rounded-xl border-2 border-gray-700 hover:border-grim-accent bg-gray-900/50 hover:bg-grim-accent/5 transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <PlusCircle className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-lg">Save as New</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Create a separate copy as a brand new design
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {saveMode === 'overwrite' ? 'Design Updated!' : 'Design Saved!'}
              </h3>
              <p className="text-gray-400 mb-4">
                {saveMode === 'overwrite'
                  ? 'Your existing design has been updated successfully.'
                  : formData.isPublic
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

        {/* Form (shown for both 'idle' with saveMode set, and 'error') */}
        {(status === 'idle' || status === 'error' || status === 'saving') && saveMode && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Save mode indicator */}
            {saveMode === 'overwrite' && loadedDesignMeta && (
              <div className="flex items-center gap-3 p-3 bg-grim-accent/10 border border-grim-accent/30 rounded-lg">
                <RefreshCw className="w-4 h-4 text-grim-accent flex-shrink-0" />
                <p className="text-sm text-grim-accent">
                  Updating existing design: <span className="font-semibold">"{loadedDesignMeta.title}"</span>
                </p>
              </div>
            )}

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
                    className={`p-3 rounded-lg border-2 transition-all ${formData.category === cat.value
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
                    {saveMode === 'overwrite' ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    {saveMode === 'overwrite' ? (
                      <RefreshCw className="w-5 h-5" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                    {saveMode === 'overwrite' ? 'Update Design' : 'Save Design'}
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
