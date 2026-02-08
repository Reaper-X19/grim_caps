import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
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
      <div className="min-h-screen pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">
              Start designing custom keycaps or browse the community gallery
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/configurator"
                className="px-8 py-3 bg-grim-accent text-black font-semibold rounded-lg hover:bg-grim-accent/80 transition-colors"
              >
                Create Design
              </Link>
              <Link
                to="/gallery"
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 font-semibold rounded-lg transition-colors"
              >
                Browse Gallery
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Shopping Cart</h1>
            <p className="text-gray-400">
              {totals.totalDesigns} {totals.totalDesigns === 1 ? 'design' : 'designs'} • {totals.totalKeys} keys total
            </p>
          </div>
          <button
            onClick={clearCart}
            className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="glass rounded-xl p-6">
                <div className="flex gap-6">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    {item.design.textureUrl ? (
                      <img
                        src={item.design.textureUrl}
                        alt={item.design.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold mb-1 truncate">{item.design.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">
                      {item.design.keyCount} keys • {item.design.category}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      by {item.design.authorName}
                    </p>

                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-800 rounded transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-800 rounded transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-grim-accent">
                      {formatPrice(item.design.totalPrice * item.quantity)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {formatPrice(item.design.pricePerKey)}/key
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-xl p-6 sticky top-32">
              <h2 className="text-xl font-display font-bold mb-6">Order Summary</h2>

              {/* Discount Progress */}
              {nextDiscount && (
                <div className="mb-6 p-4 bg-grim-accent/10 border border-grim-accent/30 rounded-lg">
                  <p className="text-sm font-semibold text-grim-accent mb-2">
                    Add {nextDiscount.designsNeeded} more {nextDiscount.designsNeeded === 1 ? 'design' : 'designs'} for {nextDiscount.discountPercent}% off!
                  </p>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-grim-accent h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (totals.totalDesigns / nextDiscount.designsNeeded) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-semibold">{formatPrice(totals.subtotal)}</span>
                </div>

                {totals.tierSavings > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Tier Savings</span>
                    <span>-{formatPrice(totals.tierSavings)}</span>
                  </div>
                )}

                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Volume Discount ({totals.discountPercent}%)</span>
                    <span>-{formatPrice(totals.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className="font-semibold text-green-400">FREE</span>
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-grim-accent">
                      {formatPrice(totals.total)}
                    </span>
                  </div>
                </div>

                {totals.totalSavings > 0 && (
                  <p className="text-xs text-green-400 text-center">
                    You're saving {formatPrice(totals.totalSavings)}!
                  </p>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full px-6 py-4 bg-grim-accent text-black font-bold rounded-lg hover:bg-grim-accent/80 transition-colors flex items-center justify-center gap-2 mb-4"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link
                to="/gallery"
                className="block text-center text-sm text-gray-400 hover:text-grim-accent transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
