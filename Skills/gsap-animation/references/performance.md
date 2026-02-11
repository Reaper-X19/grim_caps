# Performance Optimization

Strategies for 60fps GSAP animations.

## Table of Contents
1. [GPU-Accelerated Properties](#gpu-accelerated-properties)
2. [Memory Management](#memory-management)
3. [ScrollTrigger Performance](#scrolltrigger-performance)
4. [Debugging Performance](#debugging-performance)
5. [Mobile Optimization](#mobile-optimization)

---

## GPU-Accelerated Properties

### The Fast Properties
Only these properties are GPU-accelerated (composite-only):

```javascript
// ✅ FAST - GPU accelerated
x, y                    // translateX/Y
xPercent, yPercent      // percentage translation
rotation, rotationX, rotationY, rotationZ
scale, scaleX, scaleY
opacity

// ❌ SLOW - Trigger layout/paint
width, height           // Layout thrashing
top, left, right, bottom
margin, padding
border-width
font-size
```

### Transform vs Position
```javascript
// ❌ Bad: Layout recalculation
gsap.to('.element', { left: '100px', top: '50px' });

// ✅ Good: GPU transform
gsap.to('.element', { x: 100, y: 50 });
```

### Using xPercent/yPercent
```javascript
// Move 100% of element's width to the right
gsap.to('.element', { xPercent: 100 });

// Center an element
gsap.set('.element', { xPercent: -50, yPercent: -50, left: '50%', top: '50%' });
```

### will-change
```javascript
// Apply sparingly, only for complex animations
gsap.set('.complex-animated', { willChange: 'transform, opacity' });

// Remove after animation
gsap.to('.element', {
  x: 100,
  onComplete: () => {
    gsap.set('.complex-animated', { willChange: 'auto' });
  }
});
```

---

## Memory Management

### Killing Animations
```javascript
// Kill specific tween
const tween = gsap.to('.element', { x: 100 });
tween.kill();

// Kill all tweens on an element
gsap.killTweensOf('.element');

// Kill with specific properties
gsap.killTweensOf('.element', 'x,y');
```

### Timeline Cleanup
```javascript
const tl = gsap.timeline();
// ... add animations ...

// Kill entire timeline
tl.kill();

// Clear timeline but keep it
tl.clear();
```

### ScrollTrigger Cleanup
```javascript
// Kill specific trigger
const trigger = ScrollTrigger.create({ ... });
trigger.kill();

// Kill all triggers
ScrollTrigger.getAll().forEach(t => t.kill());

// React cleanup pattern
useEffect(() => {
  const triggers = [];
  
  triggers.push(ScrollTrigger.create({ ... }));
  triggers.push(ScrollTrigger.create({ ... }));
  
  return () => {
    triggers.forEach(t => t.kill());
  };
}, []);
```

### GSAP Context (React)
```javascript
// Recommended: Auto-cleanup with context
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.to('.element', { x: 100 });
    ScrollTrigger.create({ ... });
    // All animations scoped and auto-killed
  }, containerRef);
  
  return () => ctx.revert(); // Cleans everything
}, []);
```

### Overwrite Modes
```javascript
// Prevent animation conflicts
gsap.to('.element', {
  x: 100,
  overwrite: true,        // Kill all existing tweens on this target
  // OR
  overwrite: 'auto'       // Only kill conflicting properties
});

// Global default
gsap.defaults({ overwrite: 'auto' });
```

---

## ScrollTrigger Performance

### Debounce Scroll Events
```javascript
ScrollTrigger.config({
  limitCallbacks: true,    // Only fire callbacks when truly in view
  syncInterval: 40,        // Check every 40ms instead of every frame
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
});
```

### Use scrub Number
```javascript
// ❌ Bad: scrub: true (jerky)
scrub: true

// ✅ Good: Smooth with lag
scrub: 0.5  // 0.5 second smooth lag
scrub: 1    // 1 second lag (very smooth)
```

### Batch Instead of Individual
```javascript
// ❌ Bad: One trigger per element
items.forEach(item => {
  ScrollTrigger.create({ trigger: item, ... });
});

// ✅ Good: Batch elements together
ScrollTrigger.batch('.item', {
  onEnter: elements => gsap.to(elements, { opacity: 1, stagger: 0.1 })
});
```

### Lazy Refresh
```javascript
// Defer recalculation
ScrollTrigger.refresh(true);  // Lazy refresh

// Manual control
ScrollTrigger.config({
  autoRefreshEvents: 'none'  // Disable auto-refresh
});
// Then manually refresh when needed
window.addEventListener('resize', () => ScrollTrigger.refresh());
```

---

## Debugging Performance

### Chrome DevTools
1. Open Performance panel
2. Record during animation
3. Look for:
   - Long green bars (paint)
   - Long purple bars (layout)
   - Red frames (jank)

### GSAP Ticker
```javascript
// Monitor GSAP performance
gsap.ticker.add(() => {
  console.log('FPS:', gsap.ticker.fps);
});

// Limit FPS for testing
gsap.ticker.fps(30);
```

### Force GPU Layer
```javascript
// Force hardware acceleration
gsap.set('.element', { 
  force3D: true,
  rotation: 0.01  // Tiny rotation forces GPU layer
});
```

### Identify Slow Animations
```javascript
// Log slow tweens
gsap.globalTimeline.eventCallback('onUpdate', () => {
  const active = gsap.globalTimeline.getChildren(true, true, true, true);
  active.forEach(tween => {
    if (tween.targets && tween.targets()[0]) {
      console.log(tween.targets()[0], tween.vars);
    }
  });
});
```

---

## Mobile Optimization

### Reduce Animation Complexity
```javascript
const isMobile = window.matchMedia('(max-width: 768px)').matches;

gsap.to('.element', {
  x: isMobile ? 50 : 100,
  duration: isMobile ? 0.3 : 0.6,
  ease: isMobile ? 'power2.out' : 'elastic.out(1, 0.5)'
});
```

### Disable Expensive Animations
```javascript
// Skip heavy animations on mobile
if (!isMobile) {
  gsap.to('.parallax-bg', { yPercent: -50, scrollTrigger: { scrub: true }});
  gsap.to('.complex-3d', { rotationY: 360, repeat: -1 });
}
```

### Simpler ScrollTrigger Config
```javascript
const scrollConfig = isMobile
  ? { scrub: true }   // No smooth lag on mobile
  : { scrub: 1 };     // Smooth on desktop
```

### Touch Performance
```javascript
// Pointer events for touch
ScrollTrigger.config({
  ignoreMobileResize: true  // Ignore resize from address bar hide
});
```

### Accessibility: Reduced Motion
```javascript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // Instant animations
  gsap.globalTimeline.timeScale(20);
  
  // Or skip animations entirely
  gsap.set('.animated-element', { opacity: 1, y: 0 });
}
```
