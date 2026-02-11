# Timeline Orchestration

Complex timeline choreography patterns for professional animations.

## Table of Contents
1. [Timeline Fundamentals](#timeline-fundamentals)
2. [Position Parameters](#position-parameters)
3. [Nested Timelines](#nested-timelines)
4. [Label System](#label-system)
5. [Timeline Control](#timeline-control)
6. [Choreography Patterns](#choreography-patterns)

---

## Timeline Fundamentals

### Creating Timelines
```javascript
// Basic timeline
const tl = gsap.timeline();

// With defaults (applied to all children)
const tl = gsap.timeline({
  defaults: {
    duration: 0.6,
    ease: 'power2.out'
  }
});

// Paused (for manual control)
const tl = gsap.timeline({ paused: true });
```

### Timeline Options
```javascript
const tl = gsap.timeline({
  defaults: { duration: 0.5, ease: 'power2.out' },
  paused: false,
  repeat: -1,           // Infinite loop
  repeatDelay: 1,       // Delay between repeats
  yoyo: true,           // Reverse on repeat
  smoothChildTiming: true,
  onComplete: () => console.log('Done!'),
  onUpdate: () => console.log(tl.progress()),
  onRepeat: () => console.log('Looped!')
});
```

---

## Position Parameters

### Position Syntax
```javascript
const tl = gsap.timeline();

// Absolute time
tl.to('.a', { x: 100 })           // Starts at 0
  .to('.b', { x: 100 }, 1)        // Starts at 1 second
  .to('.c', { x: 100 }, '+=0.5')  // 0.5s after previous ends
  .to('.d', { x: 100 }, '-=0.3')  // 0.3s before previous ends (overlap)
  .to('.e', { x: 100 }, '<')      // Same time as previous start
  .to('.f', { x: 100 }, '<0.2')   // 0.2s after previous starts
  .to('.g', { x: 100 }, '>')      // Same time as previous end
  .to('.h', { x: 100 }, '>-0.1'); // 0.1s before previous ends
```

### Visual Timeline
```
|--A--|
      |--B--|
   |--C--|           (overlap with -=)
|--D--|              (starts at <)
   |--E--|           (starts at <0.2)
         |--F--|     (starts at >)
       |--G--|       (starts at >-0.1)
```

### Percentage-based Positioning
```javascript
tl.to('.a', { x: 100, duration: 1 })
  .to('.b', { y: 100 }, '<50%')  // 50% through A's duration
```

---

## Nested Timelines

### Master Timeline Pattern
```javascript
function createHeroAnimation() {
  const tl = gsap.timeline();
  return tl
    .from('.hero-title', { y: 80, opacity: 0 })
    .from('.hero-subtitle', { y: 40, opacity: 0 }, '-=0.3')
    .from('.hero-cta', { scale: 0.8, opacity: 0 }, '-=0.2');
}

function createCardsAnimation() {
  const tl = gsap.timeline();
  return tl.from('.card', {
    y: 60,
    opacity: 0,
    stagger: 0.1
  });
}

// Master timeline orchestrates nested timelines
const master = gsap.timeline();
master
  .add(createHeroAnimation())
  .add(createCardsAnimation(), '-=0.3')
  .add(createFooterAnimation(), '<0.5');
```

### Nested Timeline with Labels
```javascript
const master = gsap.timeline();

master
  .add('intro')
  .add(introAnimation(), 'intro')
  .add(logoAnimation(), 'intro+=0.2')
  
  .add('main', '+=0.5')
  .add(contentAnimation(), 'main')
  .add(sidebarAnimation(), 'main+=0.3')
  
  .add('outro', '+=1')
  .add(ctaAnimation(), 'outro');
```

---

## Label System

### Adding Labels
```javascript
const tl = gsap.timeline();

tl.add('start')
  .from('.element-a', { opacity: 0 })
  .add('middle')
  .from('.element-b', { opacity: 0 })
  .add('end')
  .from('.element-c', { opacity: 0 });

// Jump to label
tl.play('middle');
tl.seek('start');
tl.tweenTo('end');
```

### Labels with Position
```javascript
tl.addLabel('section1', 0)
  .addLabel('section2', 2)
  .addLabel('section3', 4)
  
  .to('.item1', { x: 100 }, 'section1')
  .to('.item2', { x: 100 }, 'section2')
  .to('.item3', { x: 100 }, 'section3');
```

---

## Timeline Control

### Playback Control
```javascript
const tl = gsap.timeline({ paused: true });

tl.play();              // Play from current
tl.pause();             // Pause
tl.resume();            // Resume from paused state
tl.reverse();           // Play backwards
tl.restart();           // Start from beginning
tl.seek(2);             // Jump to 2 seconds
tl.seek('labelName');   // Jump to label
tl.progress(0.5);       // Jump to 50%
tl.timeScale(2);        // 2x speed
tl.kill();              // Destroy timeline
```

### Smooth Transitions
```javascript
// Animate to a position
tl.tweenTo('section2', { duration: 0.5, ease: 'power2.inOut' });
tl.tweenFromTo('section1', 'section3', { duration: 1 });
```

### Interactive Control
```javascript
// Scrubber slider
slider.addEventListener('input', (e) => {
  tl.progress(e.target.value / 100);
});

// Button controls
playBtn.onclick = () => tl.play();
pauseBtn.onclick = () => tl.pause();
reverseBtn.onclick = () => tl.reverse();
```

---

## Choreography Patterns

### Staggered Entrance
```javascript
const tl = gsap.timeline();

tl.from('.word', {
  opacity: 0,
  y: 50,
  rotationX: -90,
  stagger: {
    each: 0.05,
    ease: 'power2.out'
  },
  duration: 0.6,
  ease: 'back.out(1.7)'
});
```

### Wave Effect
```javascript
const items = gsap.utils.toArray('.item');

tl.from(items, {
  y: 100,
  opacity: 0,
  stagger: {
    each: 0.08,
    from: 'center',   // Wave from center
    grid: [4, 5],     // 4 rows, 5 columns
    ease: 'sine.inOut'
  }
});
```

### Layered Motion
```javascript
// Background → Middle → Foreground
const tl = gsap.timeline();

tl.from('.background', { opacity: 0, scale: 1.2, duration: 1.5 })
  .from('.midground', { opacity: 0, y: 30 }, '-=1')
  .from('.foreground', { opacity: 0, y: 50 }, '-=0.7')
  .from('.text', { opacity: 0, y: 20 }, '-=0.5');
```

### Reveal and Hold Pattern
```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.section',
    start: 'top center',
    end: '+=200%',
    pin: true,
    scrub: 1
  }
});

// Phase 1: Reveal
tl.from('.title', { opacity: 0, y: 50 })
  .from('.content', { opacity: 0 }, '-=0.3')
  
  // Hold (add duration without animation)
  .to({}, { duration: 1 })
  
  // Phase 2: Exit
  .to('.title', { opacity: 0, y: -50 })
  .to('.content', { opacity: 0 }, '<');
```

### Typewriter Effect
```javascript
function typewriter(element, duration = 2) {
  const text = element.textContent;
  const chars = text.split('');
  element.textContent = '';
  
  const tl = gsap.timeline();
  
  chars.forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.opacity = 0;
    element.appendChild(span);
    
    tl.to(span, {
      opacity: 1,
      duration: duration / chars.length
    });
  });
  
  return tl;
}
```

### Loading Sequence
```javascript
function createLoadingSequence() {
  const tl = gsap.timeline();
  
  return tl
    // Logo animation
    .from('.logo-icon', {
      scale: 0,
      rotation: -180,
      duration: 0.8,
      ease: 'back.out(1.7)'
    })
    .from('.logo-text .char', {
      opacity: 0,
      y: 20,
      stagger: 0.03
    }, '-=0.3')
    
    // Progress bar
    .to('.progress-bar', {
      scaleX: 1,
      duration: 1.5,
      ease: 'power1.inOut'
    })
    
    // Reveal content
    .to('.loader', {
      yPercent: -100,
      duration: 0.6,
      ease: 'power3.inOut'
    })
    .from('.content', {
      opacity: 0,
      y: 30,
      duration: 0.5
    }, '-=0.2');
}
```

### Repeating Ambient Animation
```javascript
function createAmbientAnimation() {
  const tl = gsap.timeline({ repeat: -1 });
  
  return tl
    .to('.floating-element', {
      y: -20,
      duration: 2,
      ease: 'sine.inOut'
    })
    .to('.floating-element', {
      y: 0,
      duration: 2,
      ease: 'sine.inOut'
    })
    .to('.glow', {
      opacity: 0.8,
      duration: 1.5,
      ease: 'sine.inOut'
    }, 0)
    .to('.glow', {
      opacity: 0.4,
      duration: 1.5,
      ease: 'sine.inOut'
    }, 1.5);
}
```
