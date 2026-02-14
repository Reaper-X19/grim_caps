import { useState, useEffect } from 'react'
import { Heart, Copy, ShoppingCart, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useCartStore from '../../store/cartStore'
import useConfiguratorStore from '../../store/configuratorStore'
import useAuthStore from '../../store/authStore'
import { toggleLike, incrementCopyCount } from '../../services/supabase'
import { formatPrice } from '../../utils/pricing'

export default function DesignCard({ design, onViewDetails, onLikeToggle, onAuthRequired, isLikedByUser }) {
  const navigate = useNavigate()
  const addDesign = useCartStore(state => state.addDesign)
  const isInCart = useCartStore(state => state.isInCart(design.id))
  const user = useAuthStore(state => state.user)
  
  const [liked, setLiked] = useState(isLikedByUser || false)
  const [likesCount, setLikesCount] = useState(design.likes_count || 0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Sync liked state when prop changes
  useEffect(() => {
    setLiked(isLikedByUser || false)
  }, [isLikedByUser])

  // Sync likes count when design prop changes
  useEffect(() => {
    setLikesCount(design.likes_count || 0)
  }, [design.likes_count])

  const handleLike = async (e) => {
    e.stopPropagation()
    
    console.log('DesignCard handleLike:', { user, userId: user?.id, liked, designId: design.id })
    
    // Check authentication
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired()
      }
      return
    }
    
    try {
      await toggleLike(design.id, user.id, liked)
      const newLikedState = !liked
      setLiked(newLikedState)
      setLikesCount(prev => newLikedState ? prev + 1 : prev - 1)
      
      // Notify parent component
      if (onLikeToggle) {
        onLikeToggle(design.id, newLikedState)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleCopyToConfigurator = async (e) => {
    e.stopPropagation()
    
    // Check authentication
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired()
      }
      return
    }
    
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
      className="glass rounded-xl overflow-hidden group cursor-pointer hover:border-grim-accent/50 transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Texture Preview */}
      <div className="relative aspect-square bg-gray-900 overflow-hidden">
        {design.texture_url ? (
          <img
            src={design.texture_url}
            alt={design.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <ShoppingCart className="w-16 h-16" />
          </div>
        )}
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={handleCopyToConfigurator}
            className="p-3 bg-grim-accent text-black rounded-lg hover:bg-grim-accent/80 transition-colors"
            title="Copy to Configurator"
          >
            <Copy className="w-5 h-5" />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`p-3 rounded-lg transition-colors ${
              isInCart
                ? 'bg-green-500 text-white'
                : 'bg-white text-black hover:bg-gray-200'
            }`}
            title={isInCart ? 'In Cart' : 'Add to Cart'}
          >
            {isAddingToCart ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails && onViewDetails(design)
            }}
            className="p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Featured Badge */}
        {design.is_featured && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-grim-accent text-black text-xs font-bold rounded-full">
            FEATURED
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 glass text-xs font-semibold rounded-full capitalize">
          {design.category}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 truncate group-hover:text-grim-accent transition-colors">
          {design.title}
        </h3>
        
        <p className="text-sm text-gray-400 mb-3 truncate">
          by {design.author_name}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors ${
                liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
              }`}
              title={user ? (liked ? 'Unlike' : 'Like') : 'Sign in to like'}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>
            <div className="flex items-center gap-1 text-gray-400">
              <Copy className="w-4 h-4" />
              <span>{design.copy_count || 0}</span>
            </div>
          </div>
          <div className="text-gray-400">
            {design.key_count} {design.key_count === 1 ? 'key' : 'keys'}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <span className="text-2xl font-bold text-grim-accent">
            {formatPrice(design.total_price)}
          </span>
          <span className="text-sm text-gray-400">
            {formatPrice(design.price_per_key)}/key
          </span>
        </div>
      </div>
    </div>
  )
}
