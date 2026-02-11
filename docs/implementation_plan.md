# Grim Caps: Technical Implementation Plan

> **Status:** Awaiting User Approval  
> **Target:** Campus Testing MVP in 2 weeks  
> **Developer:** Solo  
> **Strategic Context:** Stage 1 & 1.5 analysis complete, risks identified

---

## User Review Required

> [!IMPORTANT]
> **Pre-Implementation Prerequisites (From Stage 1.5):**
> 1. Unit economics validation with real prints
> 2. Bank account + Razorpay setup initiated
> 3. 5-10 sample keycaps photographed
> 
> The website build assumes these are in progress. Phase 2 (checkout) requires Razorpay approval.

> [!WARNING]
> **Scope Decision Required:**
> - This plan builds the **frontend + contact form MVP** for campus testing
> - Full payment/checkout is **Phase 2** (requires Razorpay approval)
> - 3D preview is **Phase 4** (nice-to-have, not MVP)

---

## Tech Stack Decisions

### Frontend: Vite + React

| Aspect | Choice | Strategic Reason |
|--------|--------|------------------|
| **Framework** | Vite + React | Fast HMR for rapid iteration; React knowledge is transferable; large ecosystem |
| **Styling** | Tailwind CSS | Utility-first = faster development; consistent design system; mobile-first |
| **Routing** | React Router v6 | Standard, well-documented; supports future nested routes |
| **State** | Context API + useReducer | Simple for cart-sized state; no extra dependencies; easy debugging |
| **Animations** | GSAP | Premium feel; scroll triggers; per gsap-animation skill |

**Trade-offs accepted:**
- No SSR (SEO less important for initial campus testing)
- No TypeScript in MVP (faster iteration, add in Phase 2)

### Backend: Supabase

| Aspect | Choice | Strategic Reason |
|--------|--------|------------------|
| **Database** | Supabase PostgreSQL | Relational for orders; built-in auth; real-time for admin |
| **Auth** | Supabase Auth | Email + magic link (no password friction) |
| **Storage** | Cloudinary | Image optimization; transformation APIs; generous free tier |
| **Admin** | Supabase Dashboard + Custom | Quick MVP; custom admin in Phase 3 |

**Why Supabase over Firebase:**
- PostgreSQL for complex order queries
- Row Level Security for admin data
- SQL familiarity for debugging
- Better for Indian market (faster in Asia-Pacific region)

### Payments: Razorpay

| Aspect | Choice | Strategic Reason |
|--------|--------|------------------|
| **Gateway** | Razorpay Standard Checkout | UPI + Cards + Wallets; Indian-friendly; simple integration |
| **Implementation** | Phase 2 | Requires business verification (2-7 days) |

### Hosting: Vercel

| Aspect | Choice | Strategic Reason |
|--------|--------|------------------|
| **Frontend** | Vercel | Git-based deploys; preview URLs; fast global CDN |
| **Domain** | grimcaps.in (later) | Indian TLD for local trust |

---

## Project Structure

```
grim-caps/
├── .gitignore              # Node modules, env files, build output
├── .env.example            # Template for environment variables
├── README.md               # Project documentation
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
│
├── public/
│   ├── favicon.ico
│   ├── og-image.jpg        # Social sharing image
│   └── images/             # Static images (logo, icons)
│
├── src/
│   ├── main.jsx            # App entry point
│   ├── App.jsx             # Root component with routing
│   ├── index.css           # Tailwind imports + global styles
│   │
│   ├── components/
│   │   ├── ui/             # Generic reusable components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Toast.jsx
│   │   │
│   │   ├── layout/         # Layout components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.jsx
│   │   │
│   │   └── features/       # Domain-specific components
│   │       ├── ProductCard.jsx
│   │       ├── ProductGrid.jsx
│   │       ├── DesignUpload.jsx
│   │       ├── CartItem.jsx
│   │       ├── CartSummary.jsx
│   │       ├── DiscountProgress.jsx
│   │       └── ContactForm.jsx
│   │
│   ├── pages/              # Route-level components
│   │   ├── HomePage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── HowItWorksPage.jsx
│   │   ├── ContactPage.jsx
│   │   └── ThankYouPage.jsx
│   │
│   ├── context/            # React Context providers
│   │   └── CartContext.jsx
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useCart.js
│   │   ├── useLocalStorage.js
│   │   └── useAnalytics.js
│   │
│   ├── utils/              # Pure utility functions
│   │   ├── pricing.js      # Discount calculations
│   │   ├── validation.js   # File, form validation
│   │   └── formatting.js   # Currency, dates
│   │
│   ├── services/           # External integrations
│   │   ├── supabase.js     # Supabase client setup
│   │   ├── cloudinary.js   # Cloudinary upload
│   │   └── analytics.js    # PostHog tracking
│   │
│   └── data/               # Static data
│       ├── products.js     # Product catalog
│       └── config.js       # App configuration
│
└── docs/                   # Project documentation
    ├── grim_caps_strategic_analysis.md
    └── grim_caps_action_plan.md
```

**Scalability Notes:**
- `components/features/` will expand for gallery, admin in Phase 3
- New product types (mousepads) get their own data files
- `services/` will add razorpay.js in Phase 2

---

## Proposed Changes

### Phase 1 MVP (Week 1-2)

#### Foundation (Day 1)

##### [NEW] Project initialization with Vite + React

```bash
# Create project
npm create vite@latest grim-caps -- --template react
cd grim-caps
npm install

# Install dependencies
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Analytics
npm install posthog-js

# Initialize Git
git init
```

##### [NEW] [tailwind.config.js](file:///home/phantom/Antigravity/Grim_Caps_Upgraded/grim-caps/tailwind.config.js)

Grim Caps brand theme with "maker aesthetic":
- Dark background (#0a0a0a)
- Accent colors (industrial green, mechanical blue)
- Typography (bold, technical feel)

##### [NEW] [src/index.css](file:///home/phantom/Antigravity/Grim_Caps_Upgraded/grim-caps/src/index.css)

Global styles:
- Tailwind directives
- Custom font imports
- CSS custom properties for theme

---

#### Core Layout (Day 2)

##### [NEW] [src/components/layout/Navbar.jsx](file:///home/phantom/Antigravity/Grim_Caps_Upgraded/grim-caps/src/components/layout/Navbar.jsx)

**Purpose:** Primary navigation with cart indicator

**Features:**
- Logo with home link
- Navigation links (Products, How It Works, Contact)
- Cart icon with live item count
- Mobile hamburger menu with slide-out panel
- Sticky on scroll

**Strategic Context:**
- Professional nav builds immediate trust (Stage 1)
- Cart indicator shows progress, reduces abandonment

##### [NEW] [src/components/layout/Footer.jsx](file:///home/phantom/Antigravity/Grim_Caps_Upgraded/grim-caps/src/components/layout/Footer.jsx)

**Purpose:** Footer with contact and social links

**Features:**
- Contact info (email, phone, WhatsApp)
- Social links (Instagram, Discord, Reddit)
- "Made for makers" tagline
- Navigation links

---

#### Product Display (Day 3)

##### [NEW] [src/data/products.js](file:///home/phantom/Antigravity/Grim_Caps_Upgraded/grim-caps/src/data/products.js)

Product catalog with keycap sizes:
- 1U keys: ₹159 (2D) / ₹249 (3D)
- Modifier keys (1.25U-2U): ₹249 (2D) / ₹399 (3D)
- Spacebar (6.25U): ₹399 (2D) / ₹699 (3D)

##### [NEW] [src/components/features/ProductCard.jsx](file:///home/phantom/Antigravity/Grim_Caps_Upgraded/grim-caps/src/components/features/ProductCard.jsx)

**Purpose:** Display single product with pricing

**Features:**
- Product image
- Name and size badge
- 2D/3D price display side-by-side
- Hover effect (scale, shadow)
- "Customize" CTA button

**Strategic Context:**
- Transparent pricing reduces cart abandonment (Stage 1 risk)
- Side-by-side pricing shows options clearly

##### [NEW] [src/components/features/ProductGrid.jsx](file:///home/phantom/Antigravity/Grim_Caps_Upgraded/grim-caps/src/components/features/ProductGrid.jsx)

**Purpose:** Responsive grid of products

**Features:**
- 3 columns on desktop, 2 on tablet, 1 on mobile
- Filter by size and design type
- "No results" state

---

#### Design Upload (Day 4)

##### [NEW] [src/components/features/DesignUpload.jsx](file:///home/phantom/Antigravity/Grim_Caps_Upgraded/grim-caps/src/components/features/DesignUpload.jsx)

**Purpose:** Custom design submission with validation

**Features:**
- Clear guidelines display (before upload)
- Drag-and-drop zone
- File browser button
- Real-time validation:
  - File type: JPG, PNG, SVG only
  - Size: Max 10MB
  - Dimensions: Min 300x300px recommended
- Preview with position/scale controls
- Error messages with recovery guidance

**Strategic Context:**
- Addresses Risk #4: Design file compatibility
- Clear guidelines prevent bad submissions
- Preview builds confidence

##### [NEW] [src/utils/validation.js](file:///home/phantom/Antigravity/Grim_Caps_Upgraded/grim-caps/src/utils/validation.js)

File validation utilities:
- `validateFileType(file)` - Check MIME type
- `validateFileSize(file, maxMB)` - Check size
- `validateImageDimensions(file, minPx)` - Check dimensions
- `validateDesignFile(file)` - Combined validation

---

#### Cart System (Day 5)

##### [NEW] [src/context/CartContext.jsx](file:///home/phantom/Antigravity/Grim_Caps_Upgraded/grim-caps/src/context/CartContext.jsx)

**Purpose:** Global cart state

**State Shape:**
```javascript
{
  items: [
    {
      id: string,
      productId: string,
      size: '1u' | 'modifier' | 'spacebar',
      designType: '2d' | '3d',
      price: number,
      quantity: number,
      customDesignUrl: string | null,
      customDesignPreview: string | null
    }
  ],
  isLoading: boolean,
  error: string | null
}
```

**Actions:**
- `addToCart(item)`
- `removeFromCart(itemId)`
- `updateQuantity(itemId, quantity)`
- `clearCart()`

**Persistence:**
- Save to localStorage on every change
- Load from localStorage on mount

##### [NEW] [src/utils/pricing.js](file:///home/phantom/Antigravity/Grim_Caps_Upgraded/grim-caps/src/utils/pricing.js)

**Purpose:** Cart calculation logic

**Functions:**
- `calculateCartTotals(items)` - Returns subtotal, discount, total
- `getDiscountTier(itemCount)` - Returns tier info
- `formatCurrency(amount)` - INR formatting

**Business Rules:**
```javascript
// Volume discounts (from Stage 1.5)
// 4-8 items: 20% off
// 9+ items: 30% off
```

##### [NEW] [src/components/features/DiscountProgress.jsx](file:///home/phantom/Antigravity/Grim_Caps_Upgraded/grim-caps/src/components/features/DiscountProgress.jsx)

**Purpose:** Visual discount tier progress

**Features:**
- Progress bar showing current tier
- "Add X more for Y% off" message
- Color-coded tiers (gray → blue → green)
- Savings amount display

**Strategic Context:**
- Nudges toward larger orders
- Transparency reduces cart abandonment

---

#### Pre-Checkout & Contact (Day 6)

##### [NEW] [src/pages/CartPage.jsx](file:///home/phantom/Antigravity/Grim_Caps_Upgraded/grim-caps/src/pages/CartPage.jsx)

**Purpose:** Cart review before inquiry

**Features:**
- Cart item list with quantity controls
- Pricing breakdown (subtotal, discount, total)
- Discount progress indicator
- "Continue Shopping" and "Contact to Order" CTAs
- Empty cart state

##### [NEW] [src/components/features/ContactForm.jsx](file:///home/phantom/Antigravity/Grim_Caps_Upgraded/grim-caps/src/components/features/ContactForm.jsx)

**Purpose:** Order inquiry form (pre-Razorpay)

**Fields:**
- Name (required)
- Email (required)
- Phone (required)
- Message (pre-filled with cart summary)

**Submission:**
- Save to Supabase `inquiries` table
- Send email notification (Supabase edge function)
- Show success message

**Strategic Context:**
- Enable revenue collection before Razorpay approved
- Capture leads for follow-up

---

#### Polish & Deploy (Day 7)

##### Mobile Responsiveness Audit

All components responsive:
- Navigation works on mobile
- Product grid adapts
- Cart is usable
- Forms are touch-friendly

##### Loading States

- Skeleton loaders for product grid
- Button loading state
- Form submission spinner

##### Analytics Integration

Track events:
- Page views
- Product views
- Add to cart
- Design uploads
- Form submissions

---

## Database Schema

### Supabase Tables

```sql
-- Inquiries table (Phase 1 - before Razorpay)
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  cart_summary JSONB,
  status TEXT DEFAULT 'new', -- new, contacted, converted, closed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Admin can read all
CREATE POLICY "Admin can read inquiries" ON inquiries
  FOR SELECT USING (auth.role() = 'authenticated');

-- Anyone can insert (public form)
CREATE POLICY "Anyone can create inquiry" ON inquiries
  FOR INSERT WITH CHECK (true);
```

### Phase 2 Tables (for reference)

```sql
-- Customers (Phase 2)
-- Orders (Phase 2)
-- Order Items (Phase 2)
-- Custom Designs (Phase 2)
```

---

## Verification Plan

### Manual Testing Checklist

After each phase, verify these manually on deployed site:

#### Navigation & Layout
```
□ Logo links to homepage
□ All nav links work
□ Mobile menu opens/closes
□ Footer links work
□ Page transitions are smooth
□ Scroll to top on page change
```

#### Product Browsing
```
□ Product grid loads all products
□ Products display correct prices (2D and 3D)
□ Size filter works correctly
□ Design type filter works correctly
□ Clear filters button resets
□ "No results" state shows when filters empty
□ Product cards are clickable
□ Hover effects work
```

#### Product Detail
```
□ Correct product info displays
□ 2D/3D toggle updates price
□ Design upload appears
□ Add to cart works
□ Toast notification shows
```

#### Design Upload
```
□ Guidelines are visible before upload
□ Drag-and-drop works
□ File browser works
□ JPG uploads successfully
□ PNG uploads successfully
□ SVG uploads successfully
□ PDF rejected with clear error
□ >10MB file rejected with clear error
□ Small image shows warning
□ Preview displays after upload
□ Can replace uploaded design
```

#### Cart Functionality
```
□ Cart icon shows correct count
□ Cart page shows all items
□ Quantity +/- works
□ Remove item works
□ Subtotal calculates correctly
□ At 4 items, 20% discount applies
□ At 8 items, still 20% discount
□ At 9 items, 30% discount applies
□ Discount progress shows correctly
□ "Add X more for Y% off" message accurate
□ Empty cart shows helpful message
□ Continue shopping link works
```

#### Discount Edge Cases
```
□ 1 item: No discount, "Add 3 more for 20% off"
□ 3 items: No discount, "Add 1 more for 20% off"
□ 4 items: 20% discount, "Add 5 more for 30% off"
□ 8 items: 20% discount, "Add 1 more for 30% off"
□ 9 items: 30% discount, "Best discount" message
□ 20 items: 30% discount still works
```

#### Contact Form
```
□ Form displays with cart summary
□ Name validation (required)
□ Email validation (format + required)
□ Phone validation (required)
□ Submit works
□ Loading state during submit
□ Success message shows
□ Inquiry appears in Supabase
□ Error handling (network failure)
```

#### Mobile Testing (Physical Device)
```
□ All text readable (no tiny fonts)
□ All buttons tappable (44x44px min)
□ Nav menu works with touch
□ Product cards fit screen
□ Cart is usable
□ Forms are usable
□ No horizontal scroll
□ Upload works on mobile
```

#### Performance
```
□ Page loads in <3 seconds
□ Images optimized
□ No console errors
□ No layout shift
```

### Browser Testing

Test on:
- [ ] Chrome (Windows/Mac)
- [ ] Safari (Mac/iOS)
- [ ] Firefox
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

---

## Week 1 Git Workflow

### Day 1 Commits

```bash
# 1. Initialize project
git init
git add .
git commit -m "Initial commit: Empty project structure"

# 2. After Vite setup
git add .
git commit -m "setup: Initialize Vite React project

- React 18 with Vite
- Fast HMR for development
- Modern ES modules"

# 3. After Tailwind setup
git add .
git commit -m "config: Add Tailwind CSS with Grim Caps theme

- Dark maker aesthetic colors
- Custom font configuration
- Mobile-first breakpoints"

# 4. After folder structure
git add .
git commit -m "chore: Create organized folder structure

- components/ (ui, layout, features)
- pages/ for routes
- utils/ for functions
- context/ for state
- services/ for APIs"
```

### Push to GitHub

```bash
# Create repo on GitHub first (don't initialize with README)
git remote add origin https://github.com/[username]/grim-caps.git
git branch -M main
git push -u origin main
```

---

## Timeline Summary

| Day | Focus | Deliverables |
|-----|-------|--------------|
| 1 | Foundation | Git, Vite, Tailwind, folder structure |
| 2 | Layout | Navbar, Footer, Layout, routing |
| 3 | Products | ProductCard, ProductGrid, filtering |
| 4 | Upload | DesignUpload with validation |
| 5 | Cart | CartContext, pricing, discount display |
| 6 | Contact | Cart page, contact form, trust signals |
| 7 | Deploy | Mobile polish, analytics, Vercel deploy |

**End of Week 1:** Deployed MVP ready for campus testing

---

## Next Phases (For Reference)

### Phase 2: E-commerce (Week 3-4)
- Razorpay checkout integration
- Order confirmation flow
- User accounts
- Basic admin panel

### Phase 3: Operations (Week 5-6)
- Full admin dashboard
- Order queue management
- Design approval workflow
- Customer communication

### Phase 4: Advanced (Week 7+)
- 3D keycap preview (Three.js/R3F)
- Design templates
- Gallery
- Product expansion
