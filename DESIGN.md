# Grim Caps Design System

## 1. Brand Identity

**Grim Caps** is a premium custom mechanical keyboard keycap brand that celebrates individuality and craftsmanship. The design system embodies:
- **Minimal Elegance**: Clean, uncluttered interfaces that let customization shine
- **Dark Sophistication**: Deep blacks with vibrant accent colors
- **Precision**: Sharp edges, clear typography, intentional spacing
- **Power**: Highlighting the infinite possibilities of customization

---

## 2. Color Palette

### Primary Colors
```
Background Dark:    #050505 (Almost black, deep space)
Background:         #0a0a0a (Primary dark background)
Surface:            #1a1a1a (Cards, panels)
Surface Elevated:   #2a2a2a (Hover states, elevated elements)
```

### Accent Colors
```
Primary Accent:     #00ffcc (Cyan glow - represents creativity)
Secondary Accent:   #9333ea (Purple - represents premium quality)
Tertiary Accent:    #3b82f6 (Blue - represents technology)
```

### Semantic Colors
```
Success:            #10b981 (Green)
Warning:            #f59e0b (Amber)
Error:              #ef4444 (Red)
Info:               #06b6d4 (Cyan)
```

### Text Colors
```
Primary Text:       #ffffff (White)
Secondary Text:     #a3a3a3 (Gray 400)
Muted Text:         #737373 (Gray 500)
Disabled Text:      #525252 (Gray 600)
```

---

## 3. Typography

### Font Families
```
Display Font:       'Orbitron' (Headings, bold statements)
Body Font:          'Inter' (Body text, UI elements)
Monospace:          'JetBrains Mono' (Code, technical details)
```

### Type Scale
```
Hero:               text-6xl (60px) font-display font-bold
H1:                 text-5xl (48px) font-display font-bold
H2:                 text-4xl (36px) font-display font-semibold
H3:                 text-3xl (30px) font-display font-semibold
H4:                 text-2xl (24px) font-display font-medium
H5:                 text-xl (20px) font-body font-semibold
Body Large:         text-lg (18px) font-body
Body:               text-base (16px) font-body
Body Small:         text-sm (14px) font-body
Caption:            text-xs (12px) font-body
```

---

## 4. Spacing System

```
xs:     4px     (0.25rem)
sm:     8px     (0.5rem)
md:     16px    (1rem)
lg:     24px    (1.5rem)
xl:     32px    (2rem)
2xl:    48px    (3rem)
3xl:    64px    (4rem)
4xl:    96px    (6rem)
5xl:    128px   (8rem)
```

---

## 5. Component Patterns

### Buttons
```
Primary Button:
- Background: gradient from #00ffcc to #3b82f6
- Text: #0a0a0a (dark text on bright background)
- Padding: px-8 py-4
- Border Radius: rounded-lg
- Hover: scale-105 + glow effect
- Font: font-display font-semibold

Secondary Button:
- Background: transparent
- Border: 2px solid #00ffcc
- Text: #00ffcc
- Padding: px-8 py-4
- Hover: background #00ffcc, text #0a0a0a

Ghost Button:
- Background: transparent
- Text: #ffffff
- Hover: background rgba(255,255,255,0.1)
```

### Cards
```
Standard Card:
- Background: #1a1a1a
- Border: 1px solid rgba(255,255,255,0.1)
- Border Radius: rounded-xl
- Padding: p-6
- Hover: border-color #00ffcc, translate-y-[-4px]

Glass Card:
- Background: rgba(26,26,26,0.7)
- Backdrop Filter: blur(10px)
- Border: 1px solid rgba(255,255,255,0.1)
- Border Radius: rounded-xl
```

### Inputs
```
Text Input:
- Background: #1a1a1a
- Border: 1px solid #3a3a3a
- Focus: border-color #00ffcc, ring-2 ring-#00ffcc/20
- Padding: px-4 py-3
- Border Radius: rounded-lg
```

---

## 6. Design System Notes for Stitch Generation

When generating screens with Stitch, use this exact design language:

**Color Scheme:**
- Primary background: `#050505` to `#0a0a0a` gradient
- Card backgrounds: `#1a1a1a` with subtle borders `rgba(255,255,255,0.1)`
- Accent color: Cyan `#00ffcc` for CTAs, highlights, and interactive elements
- Secondary accent: Purple `#9333ea` for premium features
- Text: White `#ffffff` for primary, `#a3a3a3` for secondary

**Typography:**
- Use 'Orbitron' font for all headings (bold, futuristic)
- Use 'Inter' font for body text (clean, readable)
- Large, bold headings with generous spacing
- Text should have subtle glow effects on accent elements

**Layout:**
- Generous whitespace (minimum 64px between sections)
- Max content width: 1280px, centered
- Sections should be full-width with dark backgrounds
- Use grid layouts: 3 columns for features, 2 columns for content

**Interactive Elements:**
- All buttons should have hover effects (scale, glow)
- Cards should lift on hover (translateY -4px)
- Smooth transitions (300ms ease-out)
- Glowing borders on focus states

**Imagery:**
- High-contrast images with dark overlays
- 3D rendered keycaps as hero elements
- Minimal, clean product photography
- Generous padding around images

**Animations:**
- Fade-in on scroll for sections
- Stagger animations for card grids
- Smooth parallax effects for backgrounds
- Glowing pulse animations for CTAs

**Navigation:**
- Sticky header with glass morphism effect
- Logo on left, nav links centered, CTA button on right
- Mobile: Hamburger menu with slide-out panel
- Minimal, clean design

**Footer:**
- Dark background (#050505)
- 4-column grid: About, Links, Social, Newsletter
- Subtle divider line at top
- Copyright and legal links at bottom

**Call-to-Actions:**
- Large, prominent buttons with gradient backgrounds
- "Start Designing" as primary CTA
- Secondary CTAs in outline style
- Always include visual hierarchy

**Sections to Include:**
- Hero: Full viewport height, 3D element, bold headline, CTA
- Features: 3-column grid with icons
- Process: Step-by-step with visuals
- Gallery: Masonry or grid layout
- Testimonials: Cards with user photos
- CTA: Final conversion section

**Key Principles:**
1. **Minimal & Elegant**: Remove unnecessary elements
2. **Dark & Sophisticated**: Deep blacks, vibrant accents
3. **Highlight Customization**: Show the power of personalization
4. **Jaw-Dropping**: Use 3D elements, animations, and premium aesthetics
5. **Clear Hierarchy**: Guide the eye with size, color, and spacing

---

## 7. Accessibility

- Minimum contrast ratio: 4.5:1 for body text
- Focus indicators: 2px cyan outline
- Keyboard navigation: All interactive elements accessible
- Screen reader: Semantic HTML, ARIA labels
- Motion: Respect `prefers-reduced-motion`

---

## 8. Responsive Breakpoints

```
Mobile:     < 640px
Tablet:     640px - 1024px
Desktop:    1024px - 1280px
Wide:       > 1280px
```

---

## 9. Animation Timing

```
Fast:       150ms (micro-interactions)
Normal:     300ms (hover, focus)
Slow:       500ms (page transitions)
Very Slow:  1000ms (scroll reveals)
```

---

## 10. Shadows & Glows

```
Card Shadow:        0 4px 6px rgba(0,0,0,0.3)
Elevated Shadow:    0 10px 15px rgba(0,0,0,0.4)
Glow Effect:        0 0 20px rgba(0,255,204,0.3)
Strong Glow:        0 0 30px rgba(0,255,204,0.5)
```
