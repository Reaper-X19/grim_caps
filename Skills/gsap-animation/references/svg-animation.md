# SVG Animation

SVG-specific animation techniques and path animations.

## Table of Contents
1. [SVG Basics](#svg-basics)
2. [Path Drawing](#path-drawing)
3. [Morphing](#morphing)
4. [SVG Transforms](#svg-transforms)
5. [Complex SVG Animations](#complex-svg-animations)

---

## SVG Basics

### Animatable SVG Properties
```javascript
// Position and transform
gsap.to('svg rect', {
  x: 100,
  y: 50,
  rotation: 45,
  transformOrigin: 'center center'
});

// Styling
gsap.to('svg path', {
  fill: '#ff0000',
  stroke: '#000000',
  strokeWidth: 2,
  opacity: 0.8
});

// Morphing (with MorphSVG plugin)
gsap.to('path', {
  morphSVG: '#targetPath'
});
```

### Transform Origin in SVG
```javascript
// CRITICAL: Set transform origin properly
gsap.set('svg .element', {
  transformOrigin: 'center center'
});

// For specific origin point
gsap.set('svg .element', {
  transformOrigin: '50% 50%'  // Percentage of element
});

// Pixel values (relative to SVG viewBox)
gsap.set('svg .element', {
  transformOrigin: '100 200'  // x=100, y=200
});
```

---

## Path Drawing

### DrawSVG Concept (Without Plugin)
```javascript
// Get path length
const path = document.querySelector('.draw-path');
const length = path.getTotalLength();

// Set initial state
gsap.set(path, {
  strokeDasharray: length,
  strokeDashoffset: length
});

// Animate drawing
gsap.to(path, {
  strokeDashoffset: 0,
  duration: 2,
  ease: 'power2.inOut'
});
```

### Draw Multiple Paths
```javascript
const paths = gsap.utils.toArray('.draw-path');

paths.forEach(path => {
  const length = path.getTotalLength();
  gsap.set(path, {
    strokeDasharray: length,
    strokeDashoffset: length
  });
});

gsap.to(paths, {
  strokeDashoffset: 0,
  duration: 2,
  stagger: 0.2,
  ease: 'power2.inOut'
});
```

### Reverse Draw (Erase)
```javascript
const length = path.getTotalLength();

// Draw in
gsap.fromTo(path, 
  { strokeDashoffset: length },
  { 
    strokeDashoffset: 0,
    duration: 1,
    ease: 'power2.out'
  }
);

// Erase out
gsap.to(path, {
  strokeDashoffset: -length,  // Negative to erase from start
  duration: 1,
  ease: 'power2.in'
});
```

### Draw with Fill Reveal
```javascript
const tl = gsap.timeline();
const path = document.querySelector('.logo-path');
const length = path.getTotalLength();

gsap.set(path, {
  strokeDasharray: length,
  strokeDashoffset: length,
  fill: 'transparent'
});

tl.to(path, {
  strokeDashoffset: 0,
  duration: 2,
  ease: 'power2.inOut'
})
.to(path, {
  fill: '#000000',
  stroke: 'transparent',
  duration: 0.5
}, '-=0.3');
```

---

## Morphing

### Basic Morph (Concept)
```javascript
// Note: Requires MorphSVG plugin for true morphing
// This is a conceptual example

gsap.to('#shape1', {
  morphSVG: '#shape2',
  duration: 1,
  ease: 'power2.inOut'
});

// With configuration
gsap.to('#shape1', {
  morphSVG: {
    shape: '#shape2',
    shapeIndex: 'auto',  // Best match point
    type: 'rotational'   // or 'linear'
  }
});
```

### CSS-based Shape Transition
```javascript
// For simple shapes, use clip-path
gsap.to('.element', {
  clipPath: 'circle(50% at 50% 50%)',
  duration: 0.8
});

gsap.to('.element', {
  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  duration: 0.8
});
```

---

## SVG Transforms

### Group Animations
```javascript
// Animate SVG group
gsap.from('svg g.icon-group', {
  scale: 0,
  rotation: -180,
  transformOrigin: 'center center',
  duration: 0.8,
  ease: 'back.out(1.7)'
});
```

### Individual Element Stagger
```javascript
// Animate each path in an icon
gsap.from('svg.icon path', {
  opacity: 0,
  scale: 0,
  transformOrigin: 'center center',
  stagger: {
    each: 0.1,
    from: 'center'
  },
  duration: 0.5,
  ease: 'back.out(1.7)'
});
```

### SVG Viewbox Animation
```javascript
// Zoom into SVG
gsap.to('svg', {
  attr: { viewBox: '100 100 200 200' },
  duration: 2,
  ease: 'power2.inOut'
});
```

---

## Complex SVG Animations

### Animated Icon
```javascript
function animateIcon(icon) {
  const tl = gsap.timeline({ paused: true });
  const paths = icon.querySelectorAll('path');
  
  tl.to(paths, {
    scale: 1.2,
    transformOrigin: 'center center',
    duration: 0.2,
    stagger: 0.05
  })
  .to(paths, {
    scale: 1,
    duration: 0.3,
    ease: 'elastic.out(1, 0.5)'
  });
  
  return tl;
}

// Trigger on hover
icon.addEventListener('mouseenter', () => iconTl.play());
icon.addEventListener('mouseleave', () => iconTl.reverse());
```

### Animated Loading Spinner
```javascript
const spinner = document.querySelector('.spinner-circle');
const length = spinner.getTotalLength();

gsap.set(spinner, {
  strokeDasharray: length,
  strokeDashoffset: length * 0.75
});

gsap.to(spinner, {
  rotation: 360,
  duration: 1,
  ease: 'none',
  repeat: -1,
  transformOrigin: 'center center'
});
```

### Animated Chart
```javascript
function animateBarChart() {
  const bars = gsap.utils.toArray('.bar');
  
  bars.forEach(bar => {
    const height = bar.getAttribute('data-value');
    gsap.set(bar, { scaleY: 0, transformOrigin: 'bottom center' });
    
    gsap.to(bar, {
      scaleY: 1,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: bar,
        start: 'top 80%'
      }
    });
  });
}
```

### Animated Illustration
```javascript
function animateIllustration() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.illustration',
      start: 'top 70%'
    }
  });
  
  // Background elements first
  tl.from('.bg-elements path', {
    opacity: 0,
    scale: 0.8,
    stagger: 0.1,
    duration: 0.6
  })
  // Main character
  .from('.character', {
    opacity: 0,
    y: 30,
    duration: 0.8
  }, '-=0.3')
  // Details last
  .from('.details path', {
    opacity: 0,
    scale: 0,
    transformOrigin: 'center center',
    stagger: 0.05,
    duration: 0.4
  }, '-=0.4');
  
  return tl;
}
```
