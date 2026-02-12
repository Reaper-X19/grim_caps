# Motion Design Principles

Professional motion design principles for Awwwards-level animations.

## Table of Contents
1. [Core Principles](#core-principles)
2. [Timing and Rhythm](#timing-and-rhythm)
3. [Choreography Rules](#choreography-rules)
4. [Visual Hierarchy Through Motion](#visual-hierarchy-through-motion)
5. [Signature Moments](#signature-moments)
6. [Anti-Patterns](#anti-patterns)

---

## Core Principles

### The 12 Principles (Animation Fundamentals)

| Principle | Web Application |
|-----------|-----------------|
| **Timing** | Duration choices (200ms for micro, 400-800ms for transitions) |
| **Spacing** | Easing curves (power2.out vs elastic) |
| **Anticipation** | Slight pull-back before action (scale: 0.95 → 1.1 → 1) |
| **Follow-through** | Overshoot and settle (back.out ease) |
| **Overlapping** | Staggered animations, elements don't move in unison |
| **Slow in/out** | Easing at start and end (.inOut eases) |
| **Arcs** | Curved motion paths instead of linear |
| **Secondary action** | Background elements respond to primary action |
| **Squash & stretch** | Scale changes for impact (scaleY on landing) |
| **Exaggeration** | Emphasize key moments |
| **Staging** | Direct attention through motion |
| **Appeal** | Polished, intentional, delightful |

### The Purpose Test
Every animation should answer "yes" to at least one:
1. Does it provide **feedback**? (Button click response)
2. Does it show **state change**? (Modal open/close)
3. Does it guide **attention**? (New notification)
4. Does it build **brand personality**? (Signature loading)
5. Does it reduce **cognitive load**? (Smooth transition vs. jarring cut)

---

## Timing and Rhythm

### Duration Guidelines
| Animation Type | Duration | Reason |
|----------------|----------|--------|
| Micro-interaction | 150-250ms | Quick feedback |
| State change | 200-400ms | Noticeable but not slow |
| Page transition | 400-800ms | Smooth context change |
| Reveal sequence | 800-1500ms | Tell a story |
| Ambient loop | 2000-4000ms | Background, don't distract |

### Rhythm Patterns
```javascript
// Consistent rhythm (predictable, calm)
stagger: 0.1  // Same delay between each

// Accelerating rhythm (building energy)
stagger: {
  each: 0.08,
  ease: 'power2.in'  // Speeds up
}

// Decelerating rhythm (settling down)
stagger: {
  each: 0.08,
  ease: 'power2.out'  // Slows down
}
```

### The 200ms Rule
- Under 200ms: Feels instantaneous
- 200-500ms: Feels responsive
- Over 500ms: Feels intentional/dramatic
- Over 1000ms: Needs visual progress indicator

---

## Choreography Rules

### Rule 1: One Thing at a Time
Don't animate everything simultaneously. Create a clear sequence.

```javascript
// ❌ Bad: Everything at once
gsap.from('.title, .subtitle, .image, .button', {
  opacity: 0,
  y: 50
});

// ✅ Good: Orchestrated sequence
const tl = gsap.timeline();
tl.from('.title', { opacity: 0, y: 50 })
  .from('.subtitle', { opacity: 0, y: 30 }, '-=0.3')
  .from('.image', { opacity: 0, scale: 0.9 }, '-=0.2')
  .from('.button', { opacity: 0, y: 20 }, '-=0.2');
```

### Rule 2: Lead with the Hero
The most important element should animate first or most prominently.

```javascript
tl.from('.hero-image', { 
  opacity: 0, 
  scale: 1.1, 
  duration: 1.2  // Longer, more prominent
})
.from('.supporting-text', { 
  opacity: 0, 
  y: 20, 
  duration: 0.6  // Shorter, subordinate
}, '-=0.5');
```

### Rule 3: Shared Motion Direction
Elements should move in harmonious directions.

```javascript
// ✅ Good: All moving upward (cohesive)
tl.from('.el-1', { y: 50, opacity: 0 })
  .from('.el-2', { y: 40, opacity: 0 })
  .from('.el-3', { y: 30, opacity: 0 });

// ❌ Bad: Conflicting directions (chaotic)
tl.from('.el-1', { y: 50, opacity: 0 })
  .from('.el-2', { x: -50, opacity: 0 })
  .from('.el-3', { y: -30, opacity: 0 });
```

### Rule 4: Overlap, Don't Queue
Pure sequential animations feel robotic. Overlap for natural flow.

```javascript
// ❌ Robotic
tl.from('.a', { opacity: 0 })
  .from('.b', { opacity: 0 })
  .from('.c', { opacity: 0 });

// ✅ Natural (30% overlap)
tl.from('.a', { opacity: 0, duration: 0.6 })
  .from('.b', { opacity: 0 }, '-=0.2')
  .from('.c', { opacity: 0 }, '-=0.2');
```

---

## Visual Hierarchy Through Motion

### Attention Through Delay
Later elements get more attention.

```javascript
// User's eye follows the sequence
tl.from('.logo', { opacity: 0 })           // Seen first
  .from('.headline', { opacity: 0 })       // Then this
  .from('.cta-button', { opacity: 0 });    // Maximum attention (last)
```

### Attention Through Contrast
Different motion = more attention.

```javascript
tl.from('.cards', { 
  opacity: 0, 
  y: 30,
  stagger: 0.1,
  ease: 'power2.out'  // Standard
})
.from('.special-card', { 
  opacity: 0, 
  scale: 0.8,
  rotation: 10,
  ease: 'back.out(1.7)'  // Different = attention
}, '-=0.2');
```

### Attention Through Duration
Longer duration = more important.

```javascript
// Hero gets most time
tl.from('.hero', { opacity: 0, duration: 1.2 })
  .from('.secondary', { opacity: 0, duration: 0.6 })
  .from('.tertiary', { opacity: 0, duration: 0.4 });
```

---

## Signature Moments

### Hero Entrance
```javascript
function heroEntrance() {
  const tl = gsap.timeline();
  
  // Split effect words would go here
  tl.from('.hero-title', {
    opacity: 0,
    y: 80,
    duration: 1,
    ease: 'power3.out'
  })
  .from('.hero-subtitle', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=0.5')
  .from('.hero-cta', {
    opacity: 0,
    scale: 0.9,
    duration: 0.6,
    ease: 'back.out(1.7)'
  }, '-=0.3')
  .from('.hero-image', {
    opacity: 0,
    scale: 1.1,
    duration: 1.2,
    ease: 'power2.out'
  }, '-=0.8');
  
  return tl;
}
```

### Page Transition
```javascript
function pageTransition() {
  const tl = gsap.timeline();
  
  // Exit current
  tl.to('.page-content', {
    opacity: 0,
    y: -30,
    duration: 0.4,
    ease: 'power2.in'
  })
  // Transition element
  .to('.transition-layer', {
    scaleY: 1,
    transformOrigin: 'bottom',
    duration: 0.5,
    ease: 'power3.inOut'
  })
  // Enter new
  .set('.page-content', { opacity: 0, y: 30 })
  .to('.transition-layer', {
    scaleY: 0,
    transformOrigin: 'top',
    duration: 0.5,
    ease: 'power3.inOut'
  })
  .to('.page-content', {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.3');
  
  return tl;
}
```

### Hover Micro-interaction
```javascript
function buttonHover(button) {
  const tl = gsap.timeline({ paused: true });
  
  tl.to(button, {
    scale: 1.05,
    duration: 0.3,
    ease: 'power2.out'
  })
  .to(button.querySelector('.icon'), {
    x: 5,
    duration: 0.3
  }, 0);
  
  button.addEventListener('mouseenter', () => tl.play());
  button.addEventListener('mouseleave', () => tl.reverse());
}
```

---

## Anti-Patterns

### ❌ Linear Easing Everywhere
```javascript
// Bad: Robotic, unnatural
ease: 'linear'
ease: 'none'

// Good: Natural deceleration
ease: 'power2.out'
```

### ❌ Too Long Duration
```javascript
// Bad: User waiting
duration: 2

// Good: Respect user's time
duration: 0.6
```

### ❌ Too Many Properties
```javascript
// Bad: Visual overload
gsap.from('.el', {
  x: 100, y: 50, rotation: 45, scale: 0, opacity: 0, skewX: 10
});

// Good: Focused motion
gsap.from('.el', { y: 50, opacity: 0 });
```

### ❌ Animation Without Purpose
```javascript
// Bad: Animating for decoration
gsap.to('.random-element', { rotation: 360, repeat: -1 });

// Good: Animation with meaning
gsap.to('.loading-indicator', { rotation: 360, repeat: -1 });
```

### ❌ Simultaneous Competing Motion
```javascript
// Bad: Everything moves, nothing stands out
gsap.from('.all-elements', { y: 50, opacity: 0 });

// Good: Choreographed with hierarchy
tl.from('.primary', { y: 50, opacity: 0 })
  .from('.secondary', { y: 30, opacity: 0 }, '-=0.2');
```
