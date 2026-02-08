/**
 * Grim Caps Pricing Configuration
 * 
 * Centralized pricing logic with configurable tiers.
 * Based on strategic analysis recommendations for sustainable margins.
 * 
 * All prices in paise (₹1 = 100 paise) for precision.
 */

// ============================================================================
// PRICING CONFIGURATION (Easy to update)
// ============================================================================

export const PRICING_CONFIG = {
  // Base pricing tiers by key count
  tiers: {
    single: {
      name: 'Single Key Sampler',
      min: 1,
      max: 1,
      pricePerKey: 24900, // ₹249 (gateway product, proves quality)
      description: 'Perfect for testing quality before larger orders'
    },
    wasd: {
      name: 'WASD Pack',
      min: 2,
      max: 4,
      pricePerKey: 27475, // ₹274.75 per key (₹1,099 for 4 keys)
      description: 'Most popular - gaming essentials',
      featured: true
    },
    cluster: {
      name: 'Cluster Pack',
      min: 5,
      max: 9,
      pricePerKey: 14433, // ₹144.33 per key (₹1,299 for 9 keys)
      description: 'Great value for larger designs'
    },
    large: {
      name: 'Large Set',
      min: 10,
      max: 20,
      pricePerKey: 9975, // ₹99.75 per key (₹1,995 for 20 keys)
      description: 'Best value for full custom sets'
    },
    bulk: {
      name: 'Bulk Order',
      min: 21,
      max: Infinity,
      pricePerKey: 7900, // ₹79 per key
      description: 'Maximum savings for complete keyboards'
    }
  },

  // Cart volume discounts (applied on top of tier pricing)
  cartDiscounts: {
    enabled: true,
    tiers: [
      {
        minDesigns: 4,
        maxDesigns: 8,
        percent: 20,
        label: '20% off 4-8 designs'
      },
      {
        minDesigns: 9,
        maxDesigns: Infinity,
        percent: 30,
        label: '30% off 9+ designs'
      }
    ]
  },

  // Special offers
  offers: {
    firstTimeCustomer: {
      enabled: false, // Enable for launch promotion
      discount: 1500, // ₹15 off in paise
      minPurchase: 50000, // ₹500 minimum
      label: 'First Order Special'
    }
  },

  // Fees
  fees: {
    shipping: 0, // Free shipping (included in price)
    paymentGateway: 0.025 // 2.5% Razorpay fee (absorbed by business)
  }
}

// ============================================================================
// PRICING CALCULATION FUNCTIONS
// ============================================================================

/**
 * Get pricing tier for a given key count
 * @param {number} keyCount - Number of keys in design
 * @returns {Object} Tier information
 */
export function getPricingTier(keyCount) {
  const tier = Object.values(PRICING_CONFIG.tiers).find(
    t => keyCount >= t.min && keyCount <= t.max
  )
  
  if (!tier) {
    // Fallback to bulk pricing
    return PRICING_CONFIG.tiers.bulk
  }
  
  return tier
}

/**
 * Calculate price for a single design
 * @param {number} keyCount - Number of keys
 * @returns {Object} Price breakdown
 */
export function calculateDesignPrice(keyCount) {
  if (!keyCount || keyCount < 1) {
    throw new Error('Key count must be at least 1')
  }

  const tier = getPricingTier(keyCount)
  const pricePerKey = tier.pricePerKey
  const totalPrice = keyCount * pricePerKey

  return {
    keyCount,
    pricePerKey,
    totalPrice,
    tierName: tier.name,
    tierDescription: tier.description,
    featured: tier.featured || false,
    // Calculate savings vs single key price
    savings: keyCount > 1 
      ? (PRICING_CONFIG.tiers.single.pricePerKey - pricePerKey) * keyCount 
      : 0
  }
}

/**
 * Calculate cart totals with volume discounts
 * @param {Array} cartItems - Array of { designId, design, quantity }
 * @returns {Object} Cart totals
 */
export function calculateCartTotals(cartItems) {
  if (!cartItems || cartItems.length === 0) {
    return {
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      total: 0,
      totalDesigns: 0,
      totalKeys: 0,
      savings: 0
    }
  }

  // Calculate subtotal and counts
  const subtotal = cartItems.reduce((sum, item) => {
    const designPrice = item.design?.totalPrice || 0
    return sum + (designPrice * item.quantity)
  }, 0)

  const totalDesigns = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalKeys = cartItems.reduce((sum, item) => {
    const keyCount = item.design?.keyCount || 0
    return sum + (keyCount * item.quantity)
  }, 0)

  // Calculate tier-based savings
  const tierSavings = cartItems.reduce((sum, item) => {
    const savings = item.design?.savings || 0
    return sum + (savings * item.quantity)
  }, 0)

  // Apply cart volume discount
  let discountPercent = 0
  let discountLabel = ''

  if (PRICING_CONFIG.cartDiscounts.enabled) {
    const applicableDiscount = PRICING_CONFIG.cartDiscounts.tiers
      .reverse() // Check highest discount first
      .find(tier => totalDesigns >= tier.minDesigns && totalDesigns <= tier.maxDesigns)

    if (applicableDiscount) {
      discountPercent = applicableDiscount.percent
      discountLabel = applicableDiscount.label
    }
  }

  const discountAmount = Math.round(subtotal * (discountPercent / 100))
  const total = subtotal - discountAmount

  return {
    subtotal,
    discountPercent,
    discountAmount,
    discountLabel,
    total,
    totalDesigns,
    totalKeys,
    tierSavings,
    totalSavings: tierSavings + discountAmount
  }
}

/**
 * Get next discount threshold info
 * @param {number} currentDesignCount - Current number of designs in cart
 * @returns {Object|null} Next threshold info or null
 */
export function getNextDiscountThreshold(currentDesignCount) {
  if (!PRICING_CONFIG.cartDiscounts.enabled) return null

  const nextTier = PRICING_CONFIG.cartDiscounts.tiers.find(
    tier => currentDesignCount < tier.minDesigns
  )

  if (!nextTier) return null

  return {
    designsNeeded: nextTier.minDesigns - currentDesignCount,
    discountPercent: nextTier.percent,
    label: nextTier.label
  }
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format price in paise to rupees string
 * @param {number} paise - Price in paise
 * @param {boolean} showDecimals - Show decimal places
 * @returns {string} Formatted price (e.g., "₹1,099")
 */
export function formatPrice(paise, showDecimals = false) {
  const rupees = paise / 100
  
  if (showDecimals) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(rupees)
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(rupees)
}

/**
 * Format discount percentage
 * @param {number} percent - Discount percentage
 * @returns {string} Formatted discount (e.g., "20% OFF")
 */
export function formatDiscount(percent) {
  return `${percent}% OFF`
}

/**
 * Get price range for display
 * @returns {string} Price range string
 */
export function getPriceRange() {
  const tiers = Object.values(PRICING_CONFIG.tiers)
  const minPrice = Math.min(...tiers.map(t => t.pricePerKey))
  const maxPrice = Math.max(...tiers.map(t => t.pricePerKey))
  
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)} per key`
}

// ============================================================================
// ADMIN/ANALYTICS HELPERS
// ============================================================================

/**
 * Calculate business metrics for an order
 * @param {Object} order - Order object with items
 * @returns {Object} Business metrics
 */
export function calculateOrderMetrics(order) {
  const totals = calculateCartTotals(order.items)
  
  // Estimated costs (for internal use only)
  const estimatedCosts = {
    materials: totals.totalKeys * 5000, // ₹50 per key (PBT + ink + consumables)
    labor: order.items.length * 5000, // ₹50 per design (10 min @ ₹300/hr)
    overhead: totals.total * 0.15, // 15% overhead
    paymentFee: totals.total * PRICING_CONFIG.fees.paymentGateway
  }

  const totalCost = Object.values(estimatedCosts).reduce((sum, cost) => sum + cost, 0)
  const grossProfit = totals.total - totalCost
  const grossMargin = (grossProfit / totals.total) * 100

  return {
    revenue: totals.total,
    estimatedCosts,
    totalCost,
    grossProfit,
    grossMargin: Math.round(grossMargin * 10) / 10 // Round to 1 decimal
  }
}

/**
 * Export pricing configuration for admin panel
 * @returns {Object} Pricing config
 */
export function exportPricingConfig() {
  return {
    ...PRICING_CONFIG,
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  }
}
