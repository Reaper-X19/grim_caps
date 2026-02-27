import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Terminal, ShoppingCart } from 'lucide-react'
import useCartStore from '../store/cartStore'
import { formatPrice } from '../utils/pricing'

export default function CartPage() {
  const navigate = useNavigate()
  const items = useCartStore(state => state.items)
  const removeItem = useCartStore(state => state.removeItem)
  const updateQuantity = useCartStore(state => state.updateQuantity)
  const clearCart = useCartStore(state => state.clearCart)
  const getCartTotals = useCartStore(state => state.getCartTotals)
  const getNextDiscount = useCartStore(state => state.getNextDiscount)

  const totals = getCartTotals()
  const nextDiscount = getNextDiscount()

  const handleCheckout = () => {
    // Navigate to contact page with cart data
    navigate('/contact', { state: { fromCart: true, cartData: { items, totals } } })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-grim-void overflow-hidden relative selection:bg-grim-cyan selection:text-black pt-32 pb-20 px-4">
        {/* Cyber-Void Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                   linear-gradient(rgba(176, 38, 255, 0.1) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
                 `,
              backgroundSize: '50px 50px',
            }}>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030014_100%)]"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="bg-grim-panel/40 border border-white/5 backdrop-blur-sm p-16 text-center relative overflow-hidden clip-path-polygon-[30px_0,100%_0,100%_calc(100%-30px),calc(100%-30px)_100%,0_100%,0_30px]"
            style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}>
            
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.02)_50%)] bg-[length:100%_4px]"></div>
            
            <div className="w-24 h-24 bg-black border border-grim-cyan/30 rounded-full flex items-center justify-center mx-auto mb-8 relative group">
              <div className="absolute inset-0 bg-grim-cyan/20 blur-xl rounded-full animate-pulse"></div>
              <ShoppingBag className="w-10 h-10 text-grim-cyan relative z-10" />
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-display font-black text-white uppercase tracking-widest mb-4">CART_EMPTY</h2>
            <p className="text-gray-500 font-mono text-sm mb-12 uppercase tracking-[0.2em]">No equipment detected in staging area</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/configurator"
                className="px-10 py-4 bg-grim-cyan text-black font-black uppercase tracking-widest text-xs hover:bg-white hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px]"
                style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
              >
                INITIALIZE_DESIGN
              </Link>
              <Link
                to="/gallery"
                className="px-10 py-4 bg-black/40 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 hover:border-white/30 transition-all clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px]"
                style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
              >
                BROWSE_COMMUNITY
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grim-void overflow-hidden relative selection:bg-grim-cyan selection:text-black pt-32 pb-20 px-4">
      {/* 1. Cyber-Void Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
                 linear-gradient(rgba(176, 38, 255, 0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
               `,
            backgroundSize: '50px 50px',
          }}>
        </div>
        <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-grim-cyan/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-grim-purple/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030014_100%)]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-block mb-4 px-4 py-1 bg-grim-cyan/10 border border-grim-cyan/30 rounded-none transform skew-x-[-10deg]">
              <span className="font-mono text-grim-cyan text-xs tracking-[0.3em] font-bold transform skew-x-[10deg] inline-block uppercase">STAGING_AREA // UNIT_MANIFEST</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tighter italic leading-none">
              SHOPPING <span className="text-transparent bg-clip-text bg-gradient-to-r from-grim-cyan to-grim-purple">CART</span>
            </h1>
            <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.25em] mt-4 flex items-center gap-3">
              <span>MANIFEST_COUNT: {totals.totalDesigns} UNITS</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span>TOTAL_HARDWARE: {totals.totalKeys} KEYS</span>
            </p>
          </div>
          <button
            onClick={clearCart}
            className="group flex items-center gap-2 px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-500 font-mono text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 className="w-3 h-3" />
            PURGE_ALL_DATA
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="group relative bg-grim-panel border border-white/5 hover:border-white/20 transition-all duration-300 clip-path-polygon-[20px_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%,0_20px]"
                style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                
                <div className="flex flex-col sm:flex-row gap-8 p-6">
                  {/* Thumbnail */}
                  <div className="w-full sm:w-32 h-32 bg-black border border-white/10 overflow-hidden flex-shrink-0 relative">
                    {item.design.textureUrl ? (
                      <img
                        src={item.design.textureUrl}
                        alt={item.design.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-800">
                        <Terminal className="w-10 h-10 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.05)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider mb-1 truncate group-hover:text-grim-cyan transition-colors">
                        {item.design.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">
                        <span>UNIT_TYPE: {item.design.category}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10"></span>
                        <span>HARDWARE: {item.design.keyCount} KEYS</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-black/60 border border-white/10 p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-mono text-sm font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-600 hover:text-red-500 text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        TERMINATE
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right sm:border-l border-white/5 sm:pl-8 flex flex-col justify-center">
                    <div className="text-[10px] font-mono text-gray-600 uppercase mb-1">TOTAL_VALUE</div>
                    <div className="text-2xl font-display font-bold text-grim-cyan text-glow">
                      {formatPrice(item.design.totalPrice * item.quantity)}
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 mt-1">
                      {formatPrice(item.design.pricePerKey)} / KEY
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-grim-panel border border-grim-cyan/20 p-4 sm:p-6 lg:p-8 lg:sticky lg:top-32 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-grim-cyan via-grim-purple to-grim-cyan"></div>
              
              <h2 className="text-2xl font-display font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                <Terminal className="w-5 h-5 text-grim-cyan" />
                SUMMARY
              </h2>

              {/* Discount Progress */}
              {nextDiscount && (
                <div className="mb-10 p-5 bg-grim-cyan/5 border border-grim-cyan/20 relative group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-grim-cyan"></div>
                  <p className="text-[10px] font-mono font-bold text-grim-cyan mb-3 uppercase tracking-widest">
                    BONUS_OBJECTIVE: Add {nextDiscount.designsNeeded} more for {nextDiscount.discountPercent}% off!
                  </p>
                  <div className="w-full bg-black/60 h-1.5 border border-white/5 overflow-hidden">
                    <div
                      className="bg-grim-cyan h-full transition-all duration-1000 ease-out shadow-[0_0_10px_#00F0FF]"
                      style={{
                        width: `${Math.min(100, (totals.totalDesigns / (totals.totalDesigns + nextDiscount.designsNeeded)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-4 mb-10 font-mono">
                <div className="flex justify-between text-[11px] uppercase tracking-wider">
                  <span className="text-gray-500 text-xs">SUBTOTAL_VALUE</span>
                  <span className="text-white font-bold">{formatPrice(totals.subtotal)}</span>
                </div>

                {totals.tierSavings > 0 && (
                  <div className="flex justify-between text-[11px] uppercase tracking-wider text-grim-cyan">
                    <span className="text-xs">TIER_REDUCTION</span>
                    <span className="font-bold">-{formatPrice(totals.tierSavings)}</span>
                  </div>
                )}

                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-[11px] uppercase tracking-wider text-grim-purple">
                    <span className="text-xs">VOLUME_REDUCTION ({totals.discountPercent}%)</span>
                    <span className="font-bold">-{formatPrice(totals.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[11px] uppercase tracking-wider text-green-500">
                  <span className="text-xs">LOGISTICS_COST</span>
                  <span className="font-bold">FREE_BYPASS</span>
                </div>

                <div className="border-t border-white/10 pt-6 mt-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-gray-600 uppercase mb-1">TOTAL_REQUISTION</div>
                      <span className="text-3xl font-display font-black text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] tracking-tighter">
                        {formatPrice(totals.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {totals.totalSavings > 0 && (
                  <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] uppercase tracking-widest text-center font-bold">
                    CREDITS_RETAINED: {formatPrice(totals.totalSavings)}
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="group relative w-full h-16 bg-white hover:bg-grim-cyan text-black font-black uppercase tracking-widest text-sm transition-all duration-300 overflow-hidden clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px]"
                style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <span>EXECUTE_ORDER</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              </button>

              <Link
                to="/gallery"
                className="block text-center text-[10px] font-mono text-gray-600 hover:text-white mt-6 uppercase tracking-[0.3em] transition-colors"
              >
                // RETURN_TO_DATABASE
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
