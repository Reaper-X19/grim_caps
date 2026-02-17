import { useState } from 'react'
import { Heart, Copy, ShoppingCart, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useCartStore from '../../store/cartStore'
import useConfiguratorStore from '../../store/configuratorStore'
import { likeDesign, incrementCopyCount } from '../../services/supabase'
import { formatPrice } from '../../utils/pricing'

export default function DesignCard({ 
  design, 
  onViewDetails, 
  onLikeToggle, 
  onAuthRequired, 
  isLikedByUser = false 
}) {
  const navigate = useNavigate()
  const addDesign = useCartStore(state => state.addDesign)
  const cartItems = useCartStore(state => state.items)
  const isInCart = cartItems.some(item => item.designId === design.id)

  const [liked, setLiked] = useState(isLikedByUser)
  const [likesCount, setLikesCount] = useState(design.likes_count || 0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleLike = async (e) => {
    e.stopPropagation()
    
    // If auth callbacks provided, use them (from GalleryPage)
    if (onLikeToggle && onAuthRequired) {
      // Check if user is authenticated via parent component
      if (!isLikedByUser && onAuthRequired) {
        // This will be handled by parent - just call the callback
        onLikeToggle(design.id, !liked)
        setLiked(!liked)
        return
      }
    }
    
    // Fallback to local like logic (for standalone use)
    if (liked) return

    try {
      await likeDesign(design.id)
      setLiked(true)
      setLikesCount(prev => prev + 1)
      
      // Notify parent if callback exists
      if (onLikeToggle) {
        onLikeToggle(design.id, true)
      }
    } catch (error) {
      console.error('Error liking design:', error)
    }
  }

  const handleCopyToConfigurator = async (e) => {
    e.stopPropagation()

    try {
      // Increment copy count
      await incrementCopyCount(design.id)

      // Load design into configurator
      const configuratorStore = useConfiguratorStore.getState()

      // Upload texture to active layer
      if (design.texture_url) {
        // Create a blob from the URL
        const response = await fetch(design.texture_url)
        const blob = await response.blob()
        const file = new File([blob], 'texture.png', { type: blob.type })

        configuratorStore.uploadTexture(configuratorStore.activeLayerId, file)
      }

      // Set texture transform
      if (design.texture_settings) {
        configuratorStore.updateTextureTransform(
          configuratorStore.activeLayerId,
          design.texture_settings
        )
      }

      // Set base color
      if (design.base_color) {
        configuratorStore.updateBaseColor(configuratorStore.activeLayerId, design.base_color)
      }

      // Set selected keys
      if (design.selected_keys && design.selected_keys.length > 0) {
        configuratorStore.setSelectedKeys(design.selected_keys)
      }

      // Navigate to configurator
      navigate('/configurator')
    } catch (error) {
      console.error('Error copying to configurator:', error)
      alert('Failed to copy design. Please try again.')
    }
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    setIsAddingToCart(true)

    try {
      addDesign(design, 1)

      // Show brief success feedback
      setTimeout(() => {
        setIsAddingToCart(false)
      }, 1000)
    } catch (error) {
      console.error('Error adding to cart:', error)
      setIsAddingToCart(false)
    }
  }

  return (
    <div
      onClick={() => onViewDetails && onViewDetails(design)}
      className="group relative bg-grim-panel border border-white/5 hover:border-grim-cyan/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-300 clip-path-polygon-[20px_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%,0_20px]"
      style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
    >
      {/* Texture Preview */}
      <div className="relative aspect-square bg-black overflow-hidden border-b border-white/5">
        {design.texture_url ? (
          <img
            src={design.texture_url}
            alt={design.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-800">
            <ShoppingCart className="w-16 h-16 opacity-20" />
          </div>
        )}

        {/* Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20 group-hover:opacity-10 transition-opacity"></div>

        {/* Overlay on Hover - Tactical HUD */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
          <button
            onClick={handleCopyToConfigurator}
            className="p-3 border border-grim-cyan/50 text-grim-cyan hover:bg-grim-cyan hover:text-black transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]"
            title="LOAD_SCHEMATIC"
          >
            <Copy className="w-5 h-5" />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`p-3 border transition-all ${isInCart
                ? 'border-green-500 bg-green-500/20 text-green-500'
                : 'border-white/20 text-white hover:bg-white hover:text-black'
              }`}
            title={isInCart ? 'UNIT_ACQUIRED' : 'ACQUIRE_UNIT'}
          >
            {isAddingToCart ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails && onViewDetails(design)
            }}
            className="p-3 border border-grim-purple/50 text-grim-purple hover:bg-grim-purple hover:text-black transition-all hover:shadow-[0_0_15px_rgba(176,38,255,0.5)]"
            title="ANALYZE_DATA"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Featured Badge */}
        {design.is_featured && (
          <div className="absolute top-0 left-0 px-3 py-1 bg-grim-accent text-black text-[10px] font-black uppercase tracking-widest clip-path-polygon-[0_0,100%_0,calc(100%-10px)_100%,0_100%]"
            style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}>
            FEATURED
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 border border-grim-cyan/30 text-[10px] font-mono text-grim-cyan uppercase tracking-wider backdrop-blur-md">
          {design.category || 'UNK'}
        </div>
      </div>

      {/* Info Panel */}
      <div className="p-5 relative">
        {/* Corner Decor */}
        <div className="absolute top-[-1px] left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-grim-cyan/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <h3 className="font-display font-bold text-lg mb-1 truncate text-white group-hover:text-grim-cyan transition-colors uppercase tracking-wide">
          {design.title}
        </h3>

        <p className="text-[10px] font-mono text-gray-500 mb-4 truncate flex items-center gap-2">
          <span>CREATED_BY:</span>
          <span className="text-gray-300">{design.author_name}</span>
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={handleLike}
            disabled={liked}
            className={`flex items-center justify-center gap-2 py-1 px-2 border text-[10px] font-mono transition-all ${liked
                ? 'border-red-500/50 text-red-500 bg-red-500/10'
                : 'border-white/5 text-gray-500 hover:border-red-500/50 hover:text-red-500'
              }`}
          >
            <Heart className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </button>

          <div className="flex items-center justify-center gap-2 py-1 px-2 border border-white/5 text-[10px] font-mono text-gray-500">
            <Copy className="w-3 h-3" />
            <span>{design.copy_count || 0}</span>
          </div>
        </div>

        {/* Price & Key Count */}
        <div className="flex items-end justify-between pt-3 border-t border-white/5">
          <div>
            <div className="text-[10px] font-mono text-gray-600 mb-0.5">COST_ESTIMATE</div>
            <span className="text-xl font-display font-bold text-grim-cyan">
              {formatPrice(design.total_price)}
            </span>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-gray-600 mb-0.5">UNIT_COUNT</div>
            <span className="text-sm font-mono text-white">{design.key_count} KEYS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
