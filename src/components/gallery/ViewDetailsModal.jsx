import { X, Heart, Copy, ShoppingCart, User, Calendar } from 'lucide-react'
import { formatPrice } from '../../utils/pricing'
import { useState } from 'react'
import { likeDesign } from '../../services/supabase'
import useCartStore from '../../store/cartStore'

export default function ViewDetailsModal({ design, onClose, onCopyToConfigurator, onLikeUpdate, currentLikeState, onAuthRequired }) {
  const [liked, setLiked] = useState(currentLikeState || false)
  const addDesign = useCartStore(state => state.addDesign)
  const cartItems = useCartStore(state => state.items)
  const isInCart = cartItems.some(item => item.designId === design.id)

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-grim-void/90 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-grim-panel border border-grim-cyan shadow-[0_0_50px_rgba(0,0,0,0.8)] clip-path-polygon-[20px_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%,0_20px]"
        style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-grim-cyan hover:text-white hover:rotate-90 transition-all duration-300 z-10"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="p-6 md:p-10">
          {/* Header */}
          <div className="mb-8 border-b border-grim-cyan/20 pb-6 relative">
            <div className="absolute bottom-[-1px] left-0 w-20 h-[3px] bg-grim-cyan"></div>

            <div className="flex items-start justify-between mb-4">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white uppercase tracking-widest relative inline-block">
                {design.name || design.title}
                <span className="absolute -top-4 -right-4 text-[10px] text-grim-cyan font-mono animate-pulse">V.1.0</span>
              </h2>
              <span className="px-3 py-1 bg-grim-cyan/10 border border-grim-cyan text-grim-cyan text-xs font-bold uppercase tracking-widest hidden md:block">
                {design.category || 'CLASSIFIED'}
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono text-gray-400 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-grim-purple" />
                <span>ARCHITECT: <span className="text-white">{design.author_name || 'UNKNOWN'}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-grim-purple" />
                <span>DATE_LOG: <span className="text-white">{formatDate(design.created_at)}</span></span>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Texture Preview */}
            <div className="aspect-square bg-black border border-white/10 relative group overflow-hidden">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-grim-cyan z-10"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-grim-cyan z-10"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-grim-cyan z-10"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-grim-cyan z-10"></div>

              {design.texture_url ? (
                <img
                  src={design.texture_url}
                  alt={design.name || design.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-800">
                  <ShoppingCart className="w-24 h-24 opacity-20" />
                </div>
              )}

              {/* Scanline */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.05)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between">
              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xs font-mono text-grim-cyan mb-2 uppercase tracking-widest">[ SYSTEM_DESCRIPTION ]</h3>
                <p className="text-gray-300 font-sans leading-relaxed border-l-2 border-white/10 pl-4">
                  {design.description || 'No additional data available for this unit.'}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-black/40 border border-white/10 p-3 relative group hover:border-grim-cyan/50 transition-colors">
                  <div className="text-3xl font-display font-bold text-white group-hover:text-grim-cyan transition-colors">{design.key_count || 0}</div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">UNIT_COUNT</div>
                </div>
                <div className="bg-black/40 border border-white/10 p-3 relative group hover:border-grim-pink/50 transition-colors">
                  <div className="text-3xl font-display font-bold text-white group-hover:text-grim-pink transition-colors">{design.likes_count || 0}</div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">APPROVAL_RATING</div>
                </div>
                <div className="bg-black/40 border border-white/10 p-3 relative group hover:border-grim-purple/50 transition-colors">
                  <div className="text-3xl font-display font-bold text-white group-hover:text-grim-purple transition-colors">{design.copies_count || 0}</div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">REPLICATIONS</div>
                </div>
                <div className="bg-black/40 border border-white/10 p-3 relative group hover:border-grim-yellow/50 transition-colors">
                  <div className="text-3xl font-display font-bold text-white group-hover:text-grim-yellow transition-colors">{formatPrice(design.price_per_key)}</div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">UNIT_COST</div>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-grim-cyan/5 border border-grim-cyan/20 p-5 mb-8 flex justify-between items-center group hover:bg-grim-cyan/10 transition-colors">
                <div className="text-[10px] font-mono text-grim-cyan uppercase tracking-widest">ESTIMATED_TOTAL_COST</div>
                <div className="text-4xl font-display font-bold text-white group-hover:text-grim-cyan text-glow transition-all">
                  {formatPrice(design.total_price)}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-white/10">
            <button
              onClick={onCopyToConfigurator}
              className="group flex-grow min-w-[200px] relative px-8 py-4 bg-grim-cyan hover:bg-white text-black font-black uppercase tracking-widest text-sm transition-all overflow-hidden clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px]"
              style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                <Copy className="w-5 h-5" />
                <span>INITIALIZE_IN_EDITOR</span>
              </div>
              <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-300"></div>
            </button>

            <button
              onClick={handleAddToCart}
              disabled={isInCart}
              className={`flex-1 min-w-[150px] px-6 py-4 font-bold border rounded-none uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${isInCart
                  ? 'border-green-500 bg-green-500/10 text-green-500 cursor-not-allowed'
                  : 'border-white/20 text-white hover:bg-white hover:text-black hover:border-white'
                }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {isInCart ? 'ACQUIRED' : 'ACQUIRE'}
            </button>

            <button
              onClick={handleLike}
              disabled={liked}
              className={`px-6 py-4 font-bold border rounded-none uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${liked
                  ? 'border-red-500 bg-red-500/10 text-red-500 cursor-not-allowed'
                  : 'border-white/20 text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10'
                }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {liked ? 'APPROVED' : 'APPROVE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
