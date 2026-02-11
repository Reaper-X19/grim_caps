# Easing Guide

Comprehensive easing functions reference for GSAP animations.

## Table of Contents
1. [Built-in Eases](#built-in-eases)
2. [Ease Intensity](#ease-intensity)
3. [When to Use Each Ease](#when-to-use-each-ease)
4. [Custom Eases](#custom-eases)
5. [Ease Visualizer](#ease-visualizer)

---

## Built-in Eases

### Standard Eases
| Ease | Curve | Best For |
|------|-------|----------|
| `none` / `linear` | Straight line | Progress bars, constant movement |
| `power1` | Subtle curve | Subtle, natural movement |
| `power2` | Medium curve | Most UI animations (default) |
| `power3` | Strong curve | Dramatic emphasis |
| `power4` | Very strong | Heavy, impactful motion |

### Specialty Eases
| Ease | Character | Best For |
|------|-----------|----------|
| `back` | Overshoot | Buttons, playful UI elements |
| `elastic` | Springy bounce | Attention-grabbing, cartoonish |
| `bounce` | Ball bounce | Game-like, physical feedback |
| `circ` | Circular | Smooth, organic curves |
| `expo` | Exponential | Fast start/end, dramatic |
| `sine` | Sinusoidal | Gentle, breathing animations |

### Steps Ease
```javascript
// Stepped animation (for sprite sheets, etc.)
gsap.to('.element', {
  x: 500,
  ease: 'steps(12)'  // 12 discrete steps
});
```

---

## Ease Intensity

### Back Ease
```javascript
ease: 'back.out(1.7)'    // Default overshoot
ease: 'back.out(3)'      // More overshoot
ease: 'back.out(1)'      // Minimal overshoot
ease: 'back.inOut(2)'    // Overshoot both ends
```

### Elastic Ease
```javascript
ease: 'elastic.out(1, 0.3)'   // (amplitude, period)
ease: 'elastic.out(1.5, 0.5)' // More amplitude, slower wobble
ease: 'elastic.out(0.5, 0.2)' // Less amplitude, faster wobble
```

### Bounce Intensity
```javascript
// Bounce doesn't have config, but you can fake intensity:
gsap.to('.ball', {
  y: 200,
  ease: 'bounce.out',
  duration: 1.5  // Longer duration = more visible bounces
});
```

---

## When to Use Each Ease

### UI Interactions
```javascript
// Button hover - quick feedback
ease: 'power2.out'

// Modal open - smooth entrance
ease: 'power3.out'

// Modal close - quick exit
ease: 'power2.in'

// Dropdown reveal
ease: 'power2.out'
```

### Page Transitions
```javascript
// Page exit
ease: 'power2.in'

// Page enter
ease: 'power3.out'

// Both directions
ease: 'power2.inOut'
```

### Scroll Animations
```javascript
// Reveal on scroll - smooth
ease: 'power2.out'

// Parallax - constant speed
ease: 'none'

// Sticky sections
ease: 'power1.inOut'
```

### Playful/Branded
```javascript
// Fun button press
ease: 'back.out(1.7)'

// Bouncy notification
ease: 'elastic.out(1, 0.5)'

// Game-like feedback
ease: 'bounce.out'
```

### Natural/Organic
```javascript
// Breathing effect
ease: 'sine.inOut'

// Floating animation
ease: 'sine.inOut'

// Subtle hover
ease: 'power1.out'
```

---

## Direction Cheat Sheet

| Direction | Meaning | Speed Profile |
|-----------|---------|---------------|
| `.out` | Slow at end | Fast start → slow finish (most common) |
| `.in` | Slow at start | Slow start → fast finish |
| `.inOut` | Slow at both | Slow → fast → slow |

### Rule of Thumb
- **Entering view**: `.out` (decelerates into position)
- **Leaving view**: `.in` (accelerates out)
- **State change**: `.inOut` (smooth both ways)

---

## Custom Eases

### CustomEase Plugin
```javascript
// Requires CustomEase plugin
gsap.registerPlugin(CustomEase);

CustomEase.create('myEase', 'M0,0 C0.25,0.1 0.25,1 1,1');

gsap.to('.element', {
  x: 100,
  ease: 'myEase'
});
```

### Rough Ease (Shaky Effect)
```javascript
// Requires RoughEase plugin
gsap.registerPlugin(RoughEase);

gsap.to('.element', {
  x: 100,
  ease: 'rough({ strength: 2, points: 50, taper: "out", clamp: true })'
});
```

### Slow Motion Effect
```javascript
// Requires SlowMo plugin
ease: 'slow(0.7, 0.7, false)'  // (linearRatio, power, yoyoMode)
```

---

## Ease Visualizer

### Mental Model
```
                          .out (decelerates)
╔══════════════════════════════════════════════════╗
║    ·                                             ║
║                ·                                 ║
║                           ·                      ║
║                                   ·              ║
║                                         ·    ·   ║
║═══════════════════════════════════════════════════
   Start                                    End

                          .in (accelerates)
╔══════════════════════════════════════════════════╗
║   ·    ·                                         ║
║              ·                                   ║
║                      ·                           ║
║                                ·                 ║
║                                             ·    ║
║═══════════════════════════════════════════════════
   Start                                    End

                          .inOut (both)
╔══════════════════════════════════════════════════╗
║   ·                                          ·   ║
║        ·                                  ·      ║
║                 ·              ·                 ║
║                        ·                         ║
║                                                  ║
║═══════════════════════════════════════════════════
   Start                                    End
```

### Common Combinations
```javascript
// Awwwards-style hero reveal
{ ease: 'power3.out', duration: 1.2 }

// Smooth modal
{ ease: 'power2.inOut', duration: 0.4 }

// Snappy button
{ ease: 'power2.out', duration: 0.2 }

// Bouncy icon
{ ease: 'back.out(1.7)', duration: 0.5 }

// Elegant hover
{ ease: 'power1.out', duration: 0.3 }
```
