/**
 * Common GSAP Animation Patterns
 * 
 * Reusable animation functions for common use cases
 */

// ===========================================
// ENTRANCE ANIMATIONS
// ===========================================

/**
 * Fade up entrance
 * @param {string|Element} target - CSS selector or element
 * @param {Object} options - Animation options
 */
function fadeUp(target, options = {}) {
  const defaults = {
    y: 60,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    stagger: 0.1
  };
  
  return gsap.from(target, { ...defaults, ...options });
}

/**
 * Scale pop entrance
 */
function scalePop(target, options = {}) {
  return gsap.from(target, {
    scale: 0.8,
    opacity: 0,
    duration: 0.6,
    ease: 'back.out(1.7)',
    ...options
  });
}

/**
 * Slide in from direction
 */
function slideIn(target, direction = 'left', options = {}) {
  const directions = {
    left: { x: -100 },
    right: { x: 100 },
    top: { y: -100 },
    bottom: { y: 100 }
  };
  
  return gsap.from(target, {
    ...directions[direction],
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    ...options
  });
}


// ===========================================
// SCROLL ANIMATIONS
// ===========================================

/**
 * Reveal on scroll
 */
function scrollReveal(target, options = {}) {
  return gsap.from(target, {
    scrollTrigger: {
      trigger: target,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
      ...options.scrollTrigger
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    stagger: 0.1,
    ...options
  });
}

/**
 * Parallax effect
 */
function parallax(target, speed = 0.5, options = {}) {
  return gsap.to(target, {
    yPercent: -50 * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: target,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      ...options.scrollTrigger
    },
    ...options
  });
}


// ===========================================
// HOVER ANIMATIONS
// ===========================================

/**
 * Setup hover scale animation
 */
function hoverScale(target, scale = 1.05) {
  const elements = gsap.utils.toArray(target);
  
  elements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(el, { scale, duration: 0.3, ease: 'power2.out' });
    });
    
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { scale: 1, duration: 0.3, ease: 'power2.out' });
    });
  });
}

/**
 * Magnetic button effect
 */
function magneticButton(target, strength = 0.3) {
  const elements = gsap.utils.toArray(target);
  
  elements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
    });
  });
}


// ===========================================
// TEXT ANIMATIONS
// ===========================================

/**
 * Split text reveal (simplified without SplitText plugin)
 */
function textReveal(target, options = {}) {
  const element = document.querySelector(target);
  const text = element.textContent;
  const chars = text.split('');
  
  element.innerHTML = chars
    .map(char => `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`)
    .join('');
  
  return gsap.from(`${target} .char`, {
    opacity: 0,
    y: 20,
    duration: 0.4,
    stagger: 0.02,
    ease: 'power2.out',
    ...options
  });
}

/**
 * Typewriter effect
 */
function typewriter(target, options = {}) {
  const element = document.querySelector(target);
  const text = element.textContent;
  element.textContent = '';
  
  const tl = gsap.timeline(options);
  
  for (let i = 0; i < text.length; i++) {
    tl.to(element, {
      textContent: text.substring(0, i + 1),
      duration: 0.05,
      ease: 'none'
    });
  }
  
  return tl;
}


// ===========================================
// LOADERS & TRANSITIONS
// ===========================================

/**
 * Loading bar animation
 */
function loadingBar(target, duration = 2) {
  return gsap.to(target, {
    scaleX: 1,
    transformOrigin: 'left center',
    duration,
    ease: 'power1.inOut'
  });
}

/**
 * Page transition wipe
 */
function pageTransition(overlayElement) {
  const tl = gsap.timeline();
  
  tl.to(overlayElement, {
    scaleY: 1,
    transformOrigin: 'bottom',
    duration: 0.5,
    ease: 'power3.inOut'
  })
  .set(overlayElement, { transformOrigin: 'top' })
  .to(overlayElement, {
    scaleY: 0,
    duration: 0.5,
    ease: 'power3.inOut'
  });
  
  return tl;
}


// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Create stagger values for grid animations
 */
function gridStagger(columns, rows) {
  return {
    grid: [rows, columns],
    from: 'center',
    ease: 'power2.out'
  };
}

/**
 * Accessibility-aware animation wrapper
 */
function animate(target, props, options = {}) {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  
  if (prefersReducedMotion) {
    // Set final state immediately
    const { scrollTrigger, ...finalProps } = props;
    return gsap.set(target, { opacity: 1, x: 0, y: 0, scale: 1 });
  }
  
  return gsap.to(target, props);
}


// Export all functions
window.GSAPPatterns = {
  fadeUp,
  scalePop,
  slideIn,
  scrollReveal,
  parallax,
  hoverScale,
  magneticButton,
  textReveal,
  typewriter,
  loadingBar,
  pageTransition,
  gridStagger,
  animate
};
