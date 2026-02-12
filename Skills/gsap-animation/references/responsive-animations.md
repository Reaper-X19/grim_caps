# Responsive Animations

Breakpoint handling and responsive animation patterns.

## Table of Contents
1. [matchMedia Integration](#matchmedia-integration)
2. [Breakpoint Patterns](#breakpoint-patterns)
3. [Responsive Values](#responsive-values)
4. [ScrollTrigger Responsive](#scrolltrigger-responsive)

---

## matchMedia Integration

### ScrollTrigger.matchMedia
```javascript
ScrollTrigger.matchMedia({
  // Desktop
  "(min-width: 1024px)": function() {
    gsap.to('.hero', { x: 200, scrollTrigger: { trigger: '.hero', scrub: 1 }});
    gsap.to('.parallax', { yPercent: -50, scrollTrigger: { scrub: true }});
  },
  
  // Tablet
  "(min-width: 768px) and (max-width: 1023px)": function() {
    gsap.to('.hero', { x: 100, scrollTrigger: { trigger: '.hero', scrub: 1 }});
  },
  
  // Mobile
  "(max-width: 767px)": function() {
    gsap.from('.mobile-cards', { y: 30, opacity: 0, stagger: 0.1 });
  },
  
  // All sizes
  "all": function() {
    gsap.from('.always-animated', { opacity: 0 });
  }
});
```

### Cleanup on Breakpoint Change
```javascript
ScrollTrigger.matchMedia({
  "(min-width: 1024px)": function() {
    // Animations here are automatically reverted
    // when breakpoint changes
    const tl = gsap.timeline();
    tl.from('.desktop-only', { x: -100 });
    
    // Explicit cleanup (runs on breakpoint exit)
    return () => {
      console.log('Exiting desktop');
      // Additional cleanup if needed
    };
  }
});
```

---

## Breakpoint Patterns

### Context-based Responsive
```javascript
function setupAnimations() {
  const mm = gsap.matchMedia();
  
  mm.add("(min-width: 1024px)", () => {
    // Desktop context
    const ctx = gsap.context(() => {
      gsap.to('.element', { x: 300 });
    });
    return () => ctx.revert();
  });
  
  mm.add("(max-width: 1023px)", () => {
    // Mobile/tablet context
    const ctx = gsap.context(() => {
      gsap.to('.element', { y: 100 });
    });
    return () => ctx.revert();
  });
  
  return mm; // For cleanup
}

// Cleanup
const mm = setupAnimations();
// Later: mm.revert();
```

### React Pattern
```jsx
function AnimatedSection() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const mm = gsap.matchMedia();
    
    mm.add("(min-width: 1024px)", () => {
      const ctx = gsap.context(() => {
        gsap.from('.card', {
          x: -100,
          opacity: 0,
          stagger: 0.2,
          scrollTrigger: { trigger: '.cards', start: 'top 70%' }
        });
      }, containerRef);
      
      return () => ctx.revert();
    });
    
    mm.add("(max-width: 1023px)", () => {
      const ctx = gsap.context(() => {
        gsap.from('.card', {
          y: 50,
          opacity: 0,
          stagger: 0.1,
          scrollTrigger: { trigger: '.cards', start: 'top 85%' }
        });
      }, containerRef);
      
      return () => ctx.revert();
    });
    
    return () => mm.revert();
  }, []);
  
  return <div ref={containerRef}>...</div>;
}
```

---

## Responsive Values

### Dynamic Values
```javascript
function getAnimationValues() {
  const vw = window.innerWidth;
  
  return {
    heroOffset: vw > 1024 ? 200 : vw > 768 ? 100 : 50,
    staggerDelay: vw > 768 ? 0.15 : 0.08,
    duration: vw > 768 ? 0.8 : 0.5
  };
}

const values = getAnimationValues();

gsap.from('.element', {
  x: values.heroOffset,
  duration: values.duration,
  stagger: values.staggerDelay
});
```

### Using CSS Variables
```javascript
// Read from CSS
const style = getComputedStyle(document.documentElement);
const animationDistance = style.getPropertyValue('--animation-distance');

gsap.to('.element', { x: animationDistance });
```

```css
/* CSS */
:root {
  --animation-distance: 100px;
}

@media (min-width: 1024px) {
  :root {
    --animation-distance: 200px;
  }
}
```

### Viewport Units
```javascript
// Use viewport-relative values
gsap.to('.element', {
  x: () => window.innerWidth * 0.5,  // 50vw
  y: () => window.innerHeight * 0.3  // 30vh
});

// GSAP automatically calls functions on resize with invalidateOnRefresh
gsap.to('.element', {
  x: () => window.innerWidth * 0.5,
  scrollTrigger: {
    trigger: '.section',
    invalidateOnRefresh: true  // Recalculate on resize
  }
});
```

---

## ScrollTrigger Responsive

### invalidateOnRefresh
```javascript
gsap.to('.parallax', {
  yPercent: -50,
  scrollTrigger: {
    trigger: '.section',
    scrub: true,
    invalidateOnRefresh: true  // Recalculates values on resize/refresh
  }
});
```

### Responsive Start/End
```javascript
gsap.to('.element', {
  y: 100,
  scrollTrigger: {
    trigger: '.section',
    start: () => window.innerWidth > 768 ? 'top center' : 'top 80%',
    end: () => window.innerWidth > 768 ? 'bottom center' : 'bottom 20%',
    invalidateOnRefresh: true
  }
});
```

### Responsive Pin Spacing
```javascript
ScrollTrigger.create({
  trigger: '.pinned',
  pin: true,
  start: 'top top',
  end: () => `+=${window.innerWidth > 768 ? '100%' : '50%'}`,
  invalidateOnRefresh: true
});
```

### Disable on Mobile
```javascript
const isMobile = window.matchMedia('(max-width: 768px)').matches;

gsap.to('.heavy-animation', {
  x: 200,
  scrollTrigger: {
    trigger: '.section',
    scrub: 1,
    // Disable ScrollTrigger on mobile
    enabled: !isMobile
  }
});

// OR use matchMedia for cleaner approach
ScrollTrigger.matchMedia({
  "(min-width: 769px)": function() {
    // Only creates triggers on desktop
    gsap.to('.heavy-animation', {
      x: 200,
      scrollTrigger: { trigger: '.section', scrub: 1 }
    });
  }
});
```

### Refresh After Resize
```javascript
// Debounced resize handler
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 200);
});
```
