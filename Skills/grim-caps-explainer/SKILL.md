---
name: grim-caps-explainer
description: Code documentation and explanation standards for Grim Caps project. Use this skill for all code generation to ensure maintainability by a solo developer. Enforces inline comments, strategic documentation, debugging guidance, and self-explanatory code patterns.
---

# Grim Caps Explainer Skill

Documentation and explanation standards for maintainable, debuggable code that a solo developer can understand and maintain.

## Core Principle

> Every piece of code should answer three questions:
> 1. **WHAT** does this do?
> 2. **WHY** does it exist (strategic purpose)?
> 3. **HOW** do I fix it when it breaks?

## Component Documentation Template

```jsx
/**
 * ComponentName
 * 
 * PURPOSE: One-line description of what this component does
 * 
 * STRATEGIC CONTEXT:
 * - Which business goal does this support?
 * - Which risk does this mitigate? (reference Stage 1/1.5 analysis)
 * 
 * PROPS:
 * @param {type} propName - Description and default value
 * 
 * USAGE EXAMPLE:
 * <ComponentName prop1="value" prop2={123} />
 * 
 * STATE MANAGEMENT:
 * - What context/stores does it consume?
 * - What state does it manage internally?
 * 
 * DEBUGGING GUIDE:
 * - Common issue 1: How to diagnose and fix
 * - Common issue 2: How to diagnose and fix
 * 
 * FUTURE CONSIDERATIONS:
 * - What might change in Phase 2/3/4?
 * - What to watch out for when modifying?
 */
```

## Inline Comment Standards

### Complex Logic (ALWAYS COMMENT)

```javascript
// ✅ GOOD: Explains the WHY
// Apply 20% discount at 4+ items because our unit economics
// show profitability threshold at this volume
if (totalItems >= 4) {
  discountPercent = 20;
}

// ❌ BAD: States the obvious
// Check if total items is greater than or equal to 4
if (totalItems >= 4) {
  discountPercent = 20;
}
```

### Business Rules (ALWAYS COMMENT)

```javascript
/**
 * BUSINESS RULE: Volume Discount Tiers
 * Source: Stage 1.5 Pricing Strategy
 * 
 * Tier 1: 4-8 items = 20% off (covers acquisition cost)
 * Tier 2: 9+ items = 30% off (bulk production efficiency)
 * 
 * IMPORTANT: Discounts apply to entire cart, not per-item
 * This encourages larger orders while maintaining margins
 */
function calculateDiscount(itemCount) {
  if (itemCount >= 9) return 30;
  if (itemCount >= 4) return 20;
  return 0;
}
```

### API Calls (ALWAYS DOCUMENT)

```javascript
/**
 * API: Create Order
 * 
 * ENDPOINT: POST /api/orders
 * 
 * PAYLOAD STRUCTURE:
 * - customer: { email, phone, address }
 * - items: [{ productId, designType, quantity, customDesignUrl }]
 * - totals: { subtotal, discount, finalTotal }
 * 
 * SUCCESS RESPONSE: { orderId, status, estimatedDelivery }
 * ERROR RESPONSES:
 * - 400: Validation error (check payload structure)
 * - 401: Not authenticated (redirect to login)
 * - 500: Server error (show retry message)
 * 
 * RETRY STRATEGY: 3 attempts with exponential backoff
 */
async function createOrder(orderData) {
  // Implementation...
}
```

### State Management (DOCUMENT INTENT)

```javascript
/**
 * CART CONTEXT
 * 
 * PURPOSE: Global cart state accessible throughout app
 * 
 * WHY CONTEXT API (not Redux/Zustand):
 * - Solo developer: simpler mental model
 * - Small state surface: cart is self-contained
 * - Easy debugging: React DevTools shows context
 * 
 * STATE SHAPE:
 * {
 *   items: CartItem[],        // Products added to cart
 *   isLoading: boolean,       // For async operations
 *   error: string | null,     // Error messages
 * }
 * 
 * DERIVED VALUES (computed, not stored):
 * - subtotal: Sum of item prices
 * - discountPercent: Based on item count
 * - total: After discount applied
 * 
 * PERSISTENCE: Saved to localStorage on every change
 */
```

## Error Handling Pattern

```javascript
/**
 * ERROR HANDLING STRATEGY
 * 
 * 1. CATCH at boundaries (pages, forms, API calls)
 * 2. LOG with context (what failed, user action, state)
 * 3. DISPLAY user-friendly message (never raw errors)
 * 4. RECOVER gracefully (retry, fallback, or guide)
 */

try {
  const result = await uploadDesign(file);
} catch (error) {
  // 1. Log for debugging (dev and analytics)
  console.error('[DesignUpload] Upload failed:', {
    fileName: file.name,
    fileSize: file.size,
    error: error.message,
    // Never log full error object in production (security)
  });

  // 2. Identify error type for appropriate response
  if (error.message.includes('too large')) {
    setError('File too large. Please compress to under 5MB.');
    // RECOVERY: Show compression guide link
  } else if (error.message.includes('network')) {
    setError('Upload failed. Please check your connection and try again.');
    // RECOVERY: Show retry button
  } else {
    setError('Something went wrong. Please try again.');
    // RECOVERY: Show contact support link
  }

  // 3. Track for analytics (identify common issues)
  trackEvent('upload_error', { type: error.message });
}
```

## File Organization Guide

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # Generic (Button, Input, Modal)
│   └── features/        # Domain-specific (ProductCard, CartItem)
│
├── pages/               # Route-level components
│   └── [PageName]/      # Page + page-specific components
│
├── context/             # React Context providers
│   └── [Name]Context.jsx # One file per context
│
├── hooks/               # Custom React hooks
│   └── use[Name].js     # One hook per file
│
├── utils/               # Pure utility functions
│   ├── pricing.js       # Cart calculations, discounts
│   ├── validation.js    # File, form validation
│   └── formatting.js    # Currency, dates, strings
│
├── services/            # API and external integrations
│   ├── api.js           # Base API client setup
│   └── [feature].js     # Feature-specific API calls
│
├── data/                # Static data, constants
│   ├── products.js      # Product catalog data
│   └── config.js        # App configuration
│
└── styles/              # Global styles (if not using Tailwind only)
```

## Debugging Checklists

### Component Not Rendering
```
□ Is component exported correctly?
□ Is component imported in parent?
□ Check React DevTools - is it in the tree?
□ Check for conditional rendering (early return)
□ Check for CSS issues (hidden, 0 opacity, 0 height)
```

### State Not Updating
```
□ Is setState/dispatch called correctly?
□ Check React DevTools - is state changing?
□ Is component re-rendering? (add console.log)
□ Are you mutating state directly? (create new object)
□ Is the state scoped correctly? (context boundaries)
```

### API Call Failing
```
□ Check Network tab - is request being made?
□ Check request URL - correct endpoint?
□ Check request payload - correct structure?
□ Check response status code
□ Check CORS - cross-origin issues?
□ Check auth - token expired/invalid?
```

### Styling Not Applied
```
□ Check element exists in DOM (Inspect)
□ Check class names (typos, Tailwind syntax)
□ Check specificity (more specific selector winning)
□ Check media queries (responsive breakpoint)
□ Check parent styles (overflow, display)
```

## Git Commit Message Templates

```bash
# Feature commit
git commit -m "feat: Add ProductCard with pricing display

- Shows 2D/3D prices side-by-side
- Includes hover animation
- Responsive for mobile

Strategic: Transparent pricing (Stage 1 risk mitigation)"

# Bug fix commit
git commit -m "fix: Correct discount at exactly 4 items

- Changed > to >= in tier check
- Added test cases for edge values

Bug: Customers at 4 items weren't getting 20% off"

# Documentation commit
git commit -m "docs: Add inline comments to cart logic

- Explained business rules for discounts
- Added debugging guide
- Documented edge cases

Maintainability: Solo developer needs clear code"
```

## Quick Reference: What to Comment

| Always Comment | Don't Over-Comment |
|----------------|-------------------|
| Business rules | Simple assignments |
| Non-obvious algorithms | Self-explanatory functions |
| External API integrations | Standard React patterns |
| Edge case handling | Obvious conditionals |
| Security-sensitive code | Basic loops |
| Performance optimizations | Standard imports |
| Workarounds/hacks | Simple JSX |
| Magic numbers/strings | Well-named variables |

## Strategic Context Tags

Use these tags in comments to link code to business strategy:

```javascript
// STRATEGY: [Stage 1/1.5 reference]
// RISK: [Which risk this mitigates]
// METRIC: [What we're tracking]
// PHASE: [When this was added/will change]
// TODO-PHASE2: [What to add later]
```

Example:
```javascript
// STRATEGY: Volume discounts encourage larger orders (Stage 1.5)
// RISK: Mitigates thin margins on single-key orders
// METRIC: Track tier distribution to optimize thresholds
// PHASE: 1 (MVP)
// TODO-PHASE2: Add loyalty discount for repeat customers
```

---

*Use this skill alongside frontend-design, gsap-animation, and threejs-r3f skills for all Grim Caps code generation.*
