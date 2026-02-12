/**
 * GSAP React Integration Template
 * 
 * Production-ready patterns for using GSAP with React
 * Includes ScrollTrigger, cleanup, and accessibility
 */

import { useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Hero Section with entrance animation
 */
export function AnimatedHero() {
  const containerRef = useRef(null);
  
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }});
    
    tl.from('.hero-title', { y: 80, opacity: 0, duration: 1 })
      .from('.hero-subtitle', { y: 40, opacity: 0, duration: 0.8 }, '-=0.5')
      .from('.hero-cta', { 
        scale: 0.8, 
        opacity: 0, 
        duration: 0.6,
        ease: 'back.out(1.7)'
      }, '-=0.3');
      
  }, { scope: containerRef });
  
  return (
    <section ref={containerRef} className="hero">
      <h1 className="hero-title">Welcome</h1>
      <p className="hero-subtitle">Smooth animations with GSAP</p>
      <button className="hero-cta">Get Started</button>
    </section>
  );
}

/**
 * Scroll-triggered reveal component
 */
export function ScrollReveal({ children, className }) {
  const elementRef = useRef(null);
  
  useGSAP(() => {
    gsap.from(elementRef.current, {
      scrollTrigger: {
        trigger: elementRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });
  }, { scope: elementRef });
  
  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

/**
 * Staggered cards animation
 */
export function AnimatedCards({ cards }) {
  const containerRef = useRef(null);
  
  useGSAP(() => {
    gsap.from('.card', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      },
      y: 50,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }, { scope: containerRef });
  
  return (
    <div ref={containerRef} className="cards-grid">
      {cards.map((card, i) => (
        <div key={i} className="card">
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Manual context pattern (without useGSAP hook)
 */
export function ManualContextExample() {
  const containerRef = useRef(null);
  
  useLayoutEffect(() => {
    // Create GSAP context scoped to container
    const ctx = gsap.context(() => {
      // All selectors are scoped to containerRef
      gsap.from('.element', { x: -100, opacity: 0 });
      
      ScrollTrigger.create({
        trigger: '.scroll-section',
        start: 'top center',
        onEnter: () => console.log('Entered!'),
      });
    }, containerRef);
    
    // CRITICAL: Cleanup on unmount
    return () => ctx.revert();
  }, []);
  
  return <div ref={containerRef}>...</div>;
}

/**
 * Hover animation component
 */
export function HoverScale({ children, scale = 1.05 }) {
  const elementRef = useRef(null);
  
  const handleEnter = () => {
    gsap.to(elementRef.current, {
      scale,
      duration: 0.3,
      ease: 'power2.out'
    });
  };
  
  const handleLeave = () => {
    gsap.to(elementRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  };
  
  return (
    <div 
      ref={elementRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}

/**
 * Reduced motion hook
 */
export function useReducedMotion() {
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false
  );
  
  return prefersReducedMotion.current;
}

/**
 * Example usage with reduced motion
 */
export function AccessibleAnimation() {
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  
  useGSAP(() => {
    if (prefersReducedMotion) {
      // Skip animations, just show content
      gsap.set('.animated', { opacity: 1, y: 0 });
      return;
    }
    
    gsap.from('.animated', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1
    });
  }, { scope: containerRef, dependencies: [prefersReducedMotion] });
  
  return <div ref={containerRef}>...</div>;
}

export default {
  AnimatedHero,
  ScrollReveal,
  AnimatedCards,
  HoverScale,
  useReducedMotion
};
