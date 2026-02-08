import { X, Heart, Copy, ShoppingCart, User, Calendar } from 'lucide-react'
import { formatPrice } from '../../utils/pricing'
import { useState } from 'react'
import { likeDesign } from '../../services/supabase'
import useCartStore from '../../store/cartStore'

export default function ViewDetailsModal({ design, onClose, onCopyToConfigurator, onLikeUpdate }) {
  const [liked, setLiked] = useState(false)
  const addDesign = useCartStore(state => state.addDesign)
  const isInCart = useCartStore(state => state.isInCart(design.id))

  const handleLike = async () => {
    if (liked) return
    
    try {
      await likeDesign(design.id)
      setLiked(true)
      // Notify parent to update the design in the list
      if (onLikeUpdate) {
        onLikeUpdate(design.id)
      }
    } catch (error) {
      console.error('Error liking design:', error)
    }
  }

  const handleAddToCart = () => {
    try {
      addDesign(design, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass rounded-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-800/50 hover:bg-gray-700 rounded-lg transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-3xl font-display font-bold">{design.name || design.title}</h2>
              <span className="px-3 py-1 bg-grim-accent/20 text-grim-accent text-sm font-semibold rounded-full capitalize">
                {design.category || 'Custom'}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{design.author_name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(design.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Texture Preview */}
            <div className="aspect-square bg-gray-900 rounded-xl overflow-hidden">
              {design.texture_url ? (
                <img
                  src={design.texture_url}
                  alt={design.name || design.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <ShoppingCart className="w-24 h-24" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between">
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-300">
                  {design.description || 'No description provided.'}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass p-4 rounded-lg">
                  <div className="text-2xl font-bold text-grim-accent">{design.key_count || 0}</div>
                  <div className="text-sm text-gray-400">Keys</div>
                </div>
                <div className="glass p-4 rounded-lg">
                  <div className="text-2xl font-bold text-grim-accent">{design.likes_count || 0}</div>
                  <div className="text-sm text-gray-400">Likes</div>
                </div>
                <div className="glass p-4 rounded-lg">
                  <div className="text-2xl font-bold text-grim-accent">{design.copies_count || 0}</div>
                  <div className="text-sm text-gray-400">Copies</div>
                </div>
                <div className="glass p-4 rounded-lg">
                  <div className="text-2xl font-bold text-grim-accent">{formatPrice(design.price_per_key)}</div>
                  <div className="text-sm text-gray-400">Per Key</div>
                </div>
              </div>

              {/* Price */}
              <div className="glass p-6 rounded-xl mb-6">
                <div className="text-sm text-gray-400 mb-1">Total Price</div>
                <div className="text-4xl font-bold text-grim-accent">
                  {formatPrice(design.total_price)}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onCopyToConfigurator}
              className="flex-1 min-w-[200px] px-6 py-4 bg-gradient-to-r from-grim-accent to-grim-blue text-black font-bold rounded-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Copy className="w-5 h-5" />
              Copy to Configurator
            </button>
            
            <button
              onClick={handleAddToCart}
              disabled={isInCart}
              className={`flex-1 min-w-[200px] px-6 py-4 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                isInCart
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {isInCart ? 'In Cart' : 'Add to Cart'}
            </button>
            
            <button
              onClick={handleLike}
              disabled={liked}
              className={`px-6 py-4 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                liked
                  ? 'bg-red-500 text-white cursor-not-allowed'
                  : 'glass hover:bg-red-500/20 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              {liked ? 'Liked' : 'Like'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
