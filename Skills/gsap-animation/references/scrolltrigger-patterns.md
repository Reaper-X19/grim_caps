# ScrollTrigger Patterns

Advanced ScrollTrigger recipes for scroll-based animations.

## Table of Contents
1. [Core Concepts](#core-concepts)
2. [Toggle Actions](#toggle-actions)
3. [Scrub Techniques](#scrub-techniques)
4. [Pin Patterns](#pin-patterns)
5. [Horizontal Scroll](#horizontal-scroll)
6. [Batch Animations](#batch-animations)
7. [Advanced Recipes](#advanced-recipes)

---

## Core Concepts

### Start/End Positions
```javascript
// Format: "trigger-position viewport-position"
ScrollTrigger.create({
  trigger: '.element',
  start: 'top center',      // element top hits viewport center
  end: 'bottom 20%',        // element bottom hits viewport 20%
  
  // Percentage values
  start: 'top 80%',         // 80% down viewport
  
  // Pixel offsets
  start: 'top+=100 center', // 100px below element top
  
  // Relative to end
  end: '+=500',             // 500px after start
  end: '+=100%',            // 100vh after start
});
```

### Markers (Debug)
```javascript
ScrollTrigger.create({
  trigger: '.section',
  start: 'top center',
  end: 'bottom center',
  markers: {
    startColor: 'green',
    endColor: 'red',
    fontSize: '12px',
    indent: 20
  }
});
```

---

## Toggle Actions

### toggleActions Format
`toggleActions: "onEnter onLeave onEnterBack onLeaveBack"`

| Value | Behavior |
|-------|----------|
| play | Play timeline/tween forward |
| pause | Pause timeline/tween |
| resume | Resume from current position |
| reverse | Reverse animation |
| restart | Restart from beginning |
| reset | Reset to original state (no animation) |
| complete | Jump to end |
| none | Do nothing |

### Common Combinations
```javascript
// Play once, never reverse
toggleActions: 'play none none none'

// Play and reverse on scroll
toggleActions: 'play none none reverse'

// Restart each time
toggleActions: 'restart none none reverse'

// Classic reveal (play once)
toggleActions: 'play complete none none'

// Full control
toggleActions: 'play pause resume reverse'
```

### toggleClass
```javascript
ScrollTrigger.create({
  trigger: '.element',
  start: 'top center',
  toggleClass: 'is-visible',
  // Or with targets
  toggleClass: { targets: '.nav', className: 'scrolled' }
});
```

---

## Scrub Techniques

### Basic Scrub
```javascript
gsap.to('.parallax', {
  y: -200,
  scrollTrigger: {
    trigger: '.section',
    scrub: true,    // Instant link to scroll
    scrub: 1,       // 1 second lag (smooth)
    scrub: 0.5,     // 0.5 second lag (snappy)
  }
});
```

### Progress-based Animation
```javascript
gsap.to('.progress-bar', {
  scaleX: 1,
  ease: 'none',
  scrollTrigger: {
    trigger: '.content',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.3
  }
});
```

### Multi-element Parallax
```javascript
gsap.utils.toArray('.parallax-layer').forEach((layer, i) => {
  const speed = layer.dataset.speed || 1;
  
  gsap.to(layer, {
    yPercent: -50 * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: '.parallax-container',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
});
```

---

## Pin Patterns

### Basic Pin
```javascript
ScrollTrigger.create({
  trigger: '.sticky-section',
  start: 'top top',
  end: '+=100%',     // Pin for 1 viewport height
  pin: true,
  pinSpacing: true   // Add space below for scroll
});
```

### Pin with Animation
```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.pinned',
    start: 'top top',
    end: '+=200%',
    pin: true,
    scrub: 1
  }
});

tl.to('.slide-1', { opacity: 0, y: -50 })
  .to('.slide-2', { opacity: 1, y: 0 }, '<')
  .to('.slide-2', { opacity: 0, y: -50 })
  .to('.slide-3', { opacity: 1, y: 0 }, '<');
```

### Pin without Spacing
```javascript
ScrollTrigger.create({
  trigger: '.overlay-section',
  start: 'top top',
  end: 'bottom top',    // Until next section
  pin: true,
  pinSpacing: false,    // No extra space
  anticipatePin: 1      // Prevent jank
});
```

### Nested Pins (Cards Stack)
```javascript
gsap.utils.toArray('.card').forEach((card, i) => {
  ScrollTrigger.create({
    trigger: card,
    start: `top-=${i * 50} top+=100`,
    end: 'bottom top',
    pin: true,
    pinSpacing: false
  });
});
```

---

## Horizontal Scroll

### Basic Horizontal Scroll
```javascript
const sections = gsap.utils.toArray('.panel');

gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: '.horizontal-container',
    pin: true,
    scrub: 1,
    snap: 1 / (sections.length - 1),
    end: () => '+=' + document.querySelector('.horizontal-container').offsetWidth
  }
});
```

### Horizontal with Individual Animations
```javascript
const container = document.querySelector('.horizontal-wrapper');
const sections = gsap.utils.toArray('.horizontal-panel');

const scrollTween = gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: container,
    pin: true,
    scrub: 0.5,
    end: () => '+=' + container.scrollWidth
  }
});

// Animate elements within horizontal scroll
sections.forEach((section, i) => {
  gsap.from(section.querySelector('.content'), {
    opacity: 0,
    y: 50,
    scrollTrigger: {
      trigger: section,
      containerAnimation: scrollTween,  // KEY!
      start: 'left center',
      end: 'center center',
      scrub: true
    }
  });
});
```

---

## Batch Animations

### ScrollTrigger.batch
```javascript
ScrollTrigger.batch('.card', {
  onEnter: (elements) => {
    gsap.from(elements, {
      opacity: 0,
      y: 60,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power3.out'
    });
  },
  onLeave: (elements) => {
    gsap.to(elements, { opacity: 0, y: -60 });
  },
  onEnterBack: (elements) => {
    gsap.to(elements, { opacity: 1, y: 0 });
  },
  start: 'top 85%',
  once: true  // Only trigger once per element
});
```

### Batch with Interval
```javascript
ScrollTrigger.batch('.item', {
  interval: 0.1,  // Group items triggering within 100ms
  batchMax: 5,    // Max items per batch
  onEnter: batch => {
    gsap.to(batch, {
      opacity: 1,
      y: 0,
      stagger: { each: 0.1, from: 'start' }
    });
  }
});
```

---

## Advanced Recipes

### Scroll-linked Progress Indicator
```javascript
gsap.to('.progress-line', {
  scaleX: 1,
  ease: 'none',
  scrollTrigger: {
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.3
  }
});
```

### Reveal on Scroll with Stagger Grid
```javascript
ScrollTrigger.batch('.grid-item', {
  onEnter: elements => {
    gsap.from(elements, {
      opacity: 0,
      scale: 0.9,
      y: 40,
      duration: 0.6,
      stagger: {
        each: 0.08,
        grid: 'auto',
        from: 'start'
      }
    });
  },
  start: 'top 90%',
  once: true
});
```

### Section Snap
```javascript
ScrollTrigger.create({
  snap: {
    snapTo: 'labels',           // Snap to timeline labels
    // OR
    snapTo: [0, 0.25, 0.5, 1],  // Snap to specific progress values
    // OR
    snapTo: 1 / (sections - 1), // Snap to each section
    
    duration: { min: 0.2, max: 0.6 },
    delay: 0.1,
    ease: 'power2.inOut'
  }
});
```

### Scroll Velocity Effects
```javascript
ScrollTrigger.create({
  onUpdate: (self) => {
    const velocity = self.getVelocity();
    const skew = gsap.utils.clamp(-20, 20, velocity / 200);
    
    gsap.to('.skew-element', {
      skewY: skew,
      duration: 0.3,
      ease: 'power2.out'
    });
  }
});
```

### Refresh After DOM Changes
```javascript
// After adding/removing elements
ScrollTrigger.refresh();

// After images load
ScrollTrigger.refresh(true); // Forces recalc

// Async content
imagesLoaded('.container', () => ScrollTrigger.refresh());
```
