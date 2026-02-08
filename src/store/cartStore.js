/**
 * Cart Store - Zustand
 * 
 * Global state management for shopping cart with:
 * - Add/remove/update items
 * - Volume discount calculations
 * - localStorage persistence
 * - Cart totals
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateCartTotals, getNextDiscountThreshold } from '../utils/pricing'

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      
      // ================================================================
      // ACTIONS
      // ================================================================
      
      /**
       * Add design to cart
       * @param {Object} design - Design object from database
       * @param {number} quantity - Quantity to add (default: 1)
       */
      addDesign: (design, quantity = 1) => {
        set((state) => {
          // Check if design already in cart
          const existingItem = state.items.find(item => item.designId === design.id)
          
          if (existingItem) {
            // Update quantity
            return {
              items: state.items.map(item =>
                item.designId === design.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            }
          } else {
            // Add new item
            return {
              items: [
                ...state.items,
                {
                  id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  designId: design.id,
                  design: {
                    title: design.title,
                    description: design.description,
                    textureUrl: design.texture_url,
                    keyCount: design.key_count,
                    pricePerKey: design.price_per_key,
                    totalPrice: design.total_price,
                    category: design.category,
                    authorName: design.author_name
                  },
                  quantity
                }
              ]
            }
          }
        })
      },
      
      /**
       * Remove item from cart
       * @param {string} itemId - Cart item ID
       */
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId)
        }))
      },
      
      /**
       * Update item quantity
       * @param {string} itemId - Cart item ID
       * @param {number} quantity - New quantity
       */
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId
              ? { ...item, quantity }
              : item
          )
        }))
      },
      
      /**
       * Clear entire cart
       */
      clearCart: () => {
        set({ items: [] })
      },
      
      // ================================================================
      // COMPUTED VALUES
      // ================================================================
      
      /**
       * Get total number of items (sum of quantities)
       */
      getTotalItems: () => {
        const state = get()
        return state.items.reduce((sum, item) => sum + item.quantity, 0)
      },
      
      /**
       * Get total number of unique designs
       */
      getTotalDesigns: () => {
        const state = get()
        return state.items.length
      },
      
      /**
       * Get total number of keys across all designs
       */
      getTotalKeys: () => {
        const state = get()
        return state.items.reduce((sum, item) => {
          return sum + (item.design.keyCount * item.quantity)
        }, 0)
      },
      
      /**
       * Get cart totals with discounts
       */
      getCartTotals: () => {
        const state = get()
        return calculateCartTotals(state.items)
      },
      
      /**
       * Get next discount threshold info
       */
      getNextDiscount: () => {
        const state = get()
        const totalDesigns = state.items.reduce((sum, item) => sum + item.quantity, 0)
        return getNextDiscountThreshold(totalDesigns)
      },
      
      /**
       * Check if a design is in cart
       * @param {string} designId - Design ID
       */
      isInCart: (designId) => {
        const state = get()
        return state.items.some(item => item.designId === designId)
      },
      
      /**
       * Get cart item by design ID
       * @param {string} designId - Design ID
       */
      getCartItem: (designId) => {
        const state = get()
        return state.items.find(item => item.designId === designId)
      }
    }),
    {
      name: 'grim-caps-cart', // localStorage key
      version: 1,
      // Only persist items, computed values will be recalculated
      partialize: (state) => ({ items: state.items })
    }
  )
)

export default useCartStore
