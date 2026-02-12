---
name: gsap-animation
description: Master-level GSAP animation expertise for creating Awwwards-quality web animations. Use this skill when building scroll-triggered animations, timeline choreography, SVG animations, page transitions, parallax effects, text reveals, micro-interactions, or any motion design work. Triggers on requests involving GSAP, GreenSock, ScrollTrigger, timeline animations, stagger effects, smooth scrolling, animated landing pages, hero animations, or professional web motion design.
---

# GSAP Animation Master

Expert-level guidance for creating award-winning, production-grade web animations with GSAP (GreenSock Animation Platform).

## Quick Reference

| Task | Approach |
|------|----------|
| Scroll reveal | ScrollTrigger + stagger + fromTo |
| Parallax | ScrollTrigger scrub + yPercent |
| Page transition | Timeline with overlapping tweens |
| Hero animation | Master timeline with nested timelines |
| Text reveal | SplitText concept + stagger from chars |
| Hover effect | gsap.to with overwrite: 'auto' |
| Pinned section | ScrollTrigger pin + scrub |

## CDN Setup

```html
<!-- Core GSAP -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>

<!-- ScrollTrigger -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

<!-- Register plugin -->
<script>gsap.registerPlugin(ScrollTrigger);</script>
```

## Core Methods Decision Tree

```
What are you animating?
├── Single property change → gsap.to() / gsap.from()
├── Defined start AND end → gsap.fromTo()
├── Multiple sequential tweens → gsap.timeline()
├── Scroll-based → ScrollTrigger
├── Repeating/looping → gsap.to() with repeat: -1
└── Staggered elements → stagger property or gsap.utils.toArray()
```

## Essential Patterns

### Basic Tweens
```javascript
// Animate TO a state
gsap.to('.element', {
  x: 100,
  opacity: 1,
  duration: 1,
  ease: 'power2.out'
});

// Animate FROM a state (element snaps to current, animates from defined)
gsap.from('.element', {
  y: 50,
  opacity: 0,
  duration: 0.8,
  ease: 'power3.out'
});

// Define BOTH start and end
gsap.fromTo('.element',
  { opacity: 0, y: 30 },
  { opacity: 1, y: 0, duration: 0.6 }
);
```

### Timeline Basics
```javascript
const tl = gsap.timeline({
  defaults: { ease: 'power2.out', duration: 0.6 }
});

tl.from('.title', { y: 50, opacity: 0 })
  .from('.subtitle', { y: 30, opacity: 0 }, '-=0.3')  // overlap
  .from('.cta', { scale: 0.8, opacity: 0 }, '<0.2');  // after previous starts + 0.2s
```

### Stagger Animations
```javascript
gsap.from('.card', {
  y: 60,
  opacity: 0,
  duration: 0.8,
  stagger: {
    each: 0.15,           // delay between each
    from: 'start',        // 'start', 'end', 'center', 'edges', 'random'
    ease: 'power2.out'
  }
});
```

For advanced patterns, see [references/timeline-orchestration.md](references/timeline-orchestration.md).

## ScrollTrigger Essentials

### Basic Scroll Animation
```javascript
gsap.from('.section', {
  scrollTrigger: {
    trigger: '.section',
    start: 'top 80%',     // trigger top hits viewport 80%
    end: 'bottom 20%',
    toggleActions: 'play none none reverse',
    // markers: true      // debug mode
  },
  y: 100,
  opacity: 0,
  duration: 1
});
```

### Scrub (Scroll-linked)
```javascript
gsap.to('.parallax-element', {
  scrollTrigger: {
    trigger: '.container',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1             // smooth scrubbing (1 = 1s lag)
  },
  yPercent: -50          // parallax effect
});
```

### Pin Section
```javascript
ScrollTrigger.create({
  trigger: '.pinned-section',
  start: 'top top',
  end: '+=100%',         // pin for 100vh of scrolling
  pin: true,
  pinSpacing: true
});
```

For comprehensive ScrollTrigger recipes, see [references/scrolltrigger-patterns.md](references/scrolltrigger-patterns.md).

## React Integration

### useGSAP Hook (Recommended)
```jsx
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function AnimatedComponent() {
  const containerRef = useRef(null);
  
  useGSAP(() => {
    // All animations scoped to container
    gsap.from('.title', { y: 50, opacity: 0 });
    gsap.from('.cards', { 
      y: 30, 
      opacity: 0, 
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.cards',
        start: 'top 80%'
      }
    });
  }, { scope: containerRef }); // Auto-cleanup!
  
  return <div ref={containerRef}>...</div>;
}
```

### Manual Context (Without Hook)
```jsx
useEffect(() => {
  const ctx = gsap.context(() => {
    // animations here
  }, containerRef);
  
  return () => ctx.revert(); // CRITICAL: cleanup
}, []);
```

## Performance Rules

1. **Use transforms** - x, y, scale, rotation (GPU accelerated)
2. **Avoid layout properties** - width, height, top, left, padding, margin
3. **Opacity is cheap** - fade effects are performant
4. **will-change sparingly** - only for complex animations
5. **Kill old animations** - prevent memory leaks

```javascript
// Performance-optimized properties
gsap.to('.element', {
  x: 100,           // ✅ transform
  y: 50,            // ✅ transform
  scale: 1.2,       // ✅ transform
  rotation: 45,     // ✅ transform
  opacity: 0.5,     // ✅ composite only
  // width: '200px' // ❌ triggers layout
});
```

For comprehensive optimization, see [references/performance.md](references/performance.md).

## Accessibility

```javascript
// Respect user motion preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  gsap.globalTimeline.timeScale(100); // Instant animations
  // OR disable ScrollTrigger scrub
  ScrollTrigger.defaults({ scrub: false });
}

// Better: check per-animation
gsap.to('.element', {
  y: prefersReducedMotion ? 0 : 50,
  opacity: 0,
  duration: prefersReducedMotion ? 0 : 0.6
});
```

## Common Pitfalls

| Issue | Solution |
|-------|----------|
| Animation not running | Check if element exists, use gsap.context in React |
| Jittery scroll animation | Use scrub with number (e.g., scrub: 0.5), not boolean |
| Memory leaks | Always kill/revert in cleanup, especially ScrollTriggers |
| Layout thrashing | Only animate transform and opacity |
| Flash of unstyled content | Set initial state in CSS, not just JS |
| ScrollTrigger firing wrong | Call ScrollTrigger.refresh() after DOM changes |

## Cleanup Pattern

```javascript
// Store references for cleanup
const animations = [];
const triggers = [];

animations.push(gsap.to('.el', { x: 100 }));
triggers.push(ScrollTrigger.create({ trigger: '.section' }));

// Cleanup
function cleanup() {
  animations.forEach(anim => anim.kill());
  triggers.forEach(trigger => trigger.kill());
  ScrollTrigger.getAll().forEach(t => t.kill());
}
```

## Resources

### References
- [scrolltrigger-patterns.md](references/scrolltrigger-patterns.md) - Advanced ScrollTrigger recipes
- [timeline-orchestration.md](references/timeline-orchestration.md) - Complex choreography
- [easing-guide.md](references/easing-guide.md) - Easing functions reference
- [svg-animation.md](references/svg-animation.md) - SVG and path animations
- [motion-principles.md](references/motion-principles.md) - Awwwards-level motion design
- [performance.md](references/performance.md) - Optimization strategies
- [responsive-animations.md](references/responsive-animations.md) - Breakpoint handling

### Assets
- [assets/templates/](assets/templates/) - Boilerplate templates and patterns
