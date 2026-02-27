import { useEffect, useRef, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ShieldCheck, Plus, Package } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

import * as THREE from 'three'
import GlossyKeyboardHero, { HeroCameraRig } from '../components/3d/GlossyKeyboardHero'

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const ctaRef = useRef(null)
  
  const mouseRef = useRef({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    // Normalize to -1..+1
    mouseRef.current = {
      x: (e.clientX / window.innerWidth  - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    }
  }, [])

  // Bloom settings (production defaults)
  const bloomIntensity = 1.5
  const bloomThreshold = 0.9
  const bloomSmoothing = 0.9

  // Dynamic hero camera — scales keyboard for all screen sizes
  const [heroCam, setHeroCam] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1440
    if (w < 640)  return { pos: [0, 0, 6.5], fov: 62 }  // phones
    if (w < 1024) return { pos: [0, 0, 5.0], fov: 52 }  // tablets / small laptops
    return { pos: [0, 0, 4], fov: 45 }                   // desktops
  })

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 640)       setHeroCam({ pos: [0, 0, 6.5], fov: 62 })
      else if (w < 1024) setHeroCam({ pos: [0, 0, 5.0], fov: 52 })
      else               setHeroCam({ pos: [0, 0, 4],   fov: 45 })
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // GSAP Animations
  useGSAP(() => {
    // Features entrance animation
    const cards = featuresRef.current.querySelectorAll('.feature-card')
    gsap.fromTo(cards,
      { y: 100, opacity: 0, scale: 0.95, filter: 'blur(10px)' },
      {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 75%',
          end: 'bottom bottom',
          toggleActions: 'play none none reverse'
        },
        y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.5, stagger: 0.15, ease: 'expo.out'
      }
    )

    // Title animation
    gsap.fromTo(featuresRef.current.querySelector('.section-title'),
      { y: 30, opacity: 0 },
      {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 85%',
        },
        y: 0, opacity: 1, duration: 1.5, ease: 'power2.out'
      }
    )
  }, { scope: featuresRef })

  return (
    <div ref={heroRef} className="overflow-hidden bg-[#05000a]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden p-6 md:p-12">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 opacity-40" style={{
          background: 'radial-gradient(ellipse at top, rgba(176, 38, 255, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(0, 240, 255, 0.15) 0%, transparent 50%), linear-gradient(180deg, #05000a 0%, #090518 50%, #05000a 100%)'
        }}></div>

        {/* Content Overlay - Pinned to corners, clear of keyboard */}
        <div className="absolute inset-0 z-20 w-full h-full pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-20 sm:py-24 md:py-28">

            {/* Top-Left: Title — pinned high to avoid keyboard */}
            <div className="flex justify-center md:justify-start pointer-events-auto">
              <div className="text-center md:text-left max-w-xl">
                <h1 className="hero-title-line-1 text-4xl sm:text-5xl lg:text-7xl font-display font-black italic leading-[0.9] uppercase tracking-tighter">
                  Your Setup,<br />
                  <span className="text-grim-cyan text-glow">Your<br />Signature</span>
                </h1>
              </div>
            </div>

            {/* Spacer — pushes CTA below keyboard center */}
            <div className="flex-1 min-h-[30vh] sm:min-h-[35vh] md:min-h-[40vh]"></div>

            {/* Bottom-Right: Subtitle & CTA — pinned low */}
            <div className="flex justify-center md:justify-end pointer-events-auto pb-8 sm:pb-4">
              <div className="text-center md:text-right max-w-md">
                <h2 className="hero-subtitle text-xl sm:text-2xl lg:text-3xl font-display font-bold italic mb-3 text-grim-cyan leading-tight">
                  Feel the Power of<br />Customization
                </h2>
                <p className="hero-cta-btn text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                  Get your custom keycaps today and make your dream setup come true
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* 3D Scene */}
        <div 
          className="absolute inset-0 w-full h-full z-10"
          onMouseMove={handleMouseMove}
        >
          <Canvas
            className="w-full h-full"
            gl={{ 
              antialias: true, 
              alpha: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.2
            }}
            dpr={[1, 2]}
          >
            <PerspectiveCamera makeDefault position={heroCam.pos} fov={heroCam.fov} />
            <HeroCameraRig mouse={mouseRef} />
            <Environment files="/hdr/blue-studio.hdr" background={false} environmentIntensity={0.5} />
            <ambientLight intensity={0.4} />
            <hemisphereLight skyColor="#ffffff" groundColor="#666666" intensity={0.3} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} castShadow={false} />
            <pointLight position={[-10, 5, -10]} intensity={0.4} color="#00F0FF" />
            <pointLight position={[10, -5, 10]} intensity={0.3} color="#ffffff" />
            <pointLight position={[0, 10, 0]} intensity={0.3} color="#ffffff" />
            <pointLight position={[0, -10, 0]} intensity={0.2} color="#ffffff" />
            <pointLight position={[-10, 0, 10]} intensity={0.2} color="#ffffff" />
            <pointLight position={[10, 0, -10]} intensity={0.2} color="#ffffff" />
            <directionalLight position={[0, 0, -10]} intensity={0.2} color="#00F0FF" />
            <directionalLight position={[0, 0, 10]} intensity={0.2} color="#ffffff" />
            <GlossyKeyboardHero mouse={mouseRef} />
            <EffectComposer>
              <Bloom intensity={bloomIntensity} luminanceThreshold={bloomThreshold} luminanceSmoothing={bloomSmoothing} />
            </EffectComposer>
          </Canvas>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-grim-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section - CINEMATIC MONOLITH */}
      <section ref={featuresRef} className="py-32 bg-black relative w-full flex flex-col items-center justify-center min-h-screen overflow-hidden">

        {/* Cinematic Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#000000_100%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20"></div>

        <div className="w-full max-w-[95vw] lg:max-w-7xl mx-auto px-4 relative z-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 border-b border-white/10 pb-8">
            <div className="flex flex-col gap-4">
              <h2 className="section-title text-4xl sm:text-6xl md:text-8xl font-display font-black text-white tracking-tighter leading-none uppercase italic">
                WHY <span className="text-white/20">GRiM?</span>
              </h2>
            </div>
            <div className="text-right max-w-sm hidden md:block">
              <p className="text-white/60 font-mono text-xs leading-relaxed tracking-wide">
                Professional quality customized keycaps. <br />
                Direct to your door.
              </p>
            </div>
          </div>

          {/* The Monolith Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-white/10 bg-white/[0.02] backdrop-blur-3xl divide-y lg:divide-y-0 lg:divide-x divide-white/10">

            {/* MODULE 01: LOGISTICS (Speed) */}
            <div className="feature-card group relative min-h-[300px] sm:min-h-[400px] h-auto lg:h-[500px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-700 hover:bg-white/[0.03]">
              {/* Scanline Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,240,255,0.05)_50%,transparent_100%)] h-[200%] w-full animate-scan pointer-events-none opacity-0 group-hover:opacity-100"></div>

              {/* Background Map Effect */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                <div className="absolute right-0 top-0 w-64 h-64 bg-grim-cyan/20 blur-[100px] rounded-full mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-overlay"></div>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <span className="text-grim-cyan font-mono text-xs tracking-[0.2em] uppercase border border-grim-cyan/20 px-2 py-1 bg-grim-cyan/5">
                    SPEED
                  </span>
                  <Zap className="w-5 h-5 text-white/40 group-hover:text-grim-cyan transition-colors" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2 group-hover:text-grim-cyan transition-colors duration-500">
                  LIGHTNING FAST
                </h3>
                <p className="text-white/40 font-mono text-sm leading-relaxed max-w-[200px]">
                  Direct from source. 3-7 days shipping.
                </p>
              </div>

              <div className="relative z-10 border-t border-white/10 pt-6">
                <p className="text-white font-mono text-sm">
                  Zero customs delays. <br /> No hidden fees.
                </p>
              </div>
            </div>

            {/* MODULE 02: ENGINEER (Quality) */}
            <div className="feature-card group relative min-h-[300px] sm:min-h-[400px] h-auto lg:h-[500px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-700 hover:bg-white/[0.03]">
              <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-grim-purple/20 blur-[100px] rounded-full mix-blend-screen"></div>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <span className="text-grim-purple font-mono text-xs tracking-[0.2em] uppercase border border-grim-purple/20 px-2 py-1 bg-grim-purple/5">
                    QUALITY
                  </span>
                  <ShieldCheck className="w-5 h-5 text-white/40 group-hover:text-grim-purple transition-colors" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2 group-hover:text-grim-purple transition-colors duration-500">
                  PREMIUM QUALITY
                </h3>
                <p className="text-white/40 font-mono text-sm leading-relaxed max-w-[200px]">
                  100% PBT. Colors that never fade.
                </p>
              </div>

              {/* Centerpiece Graphic */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-700">
                <div className="w-24 h-24 border border-white/5 rounded-full animate-spin-slow"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-white/20">PBT</span>
                </div>
              </div>

              <div className="relative z-10 border-t border-white/10 pt-6">
                <p className="text-white font-mono text-sm">
                  Dye-sublimated texture. <br /> Built to last.
                </p>
              </div>
            </div>

            {/* MODULE 03: ATELIER (Custom) */}
            <div className="feature-card group relative min-h-[300px] sm:min-h-[400px] h-auto lg:h-[500px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-700 hover:bg-white/[0.03]">
              <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-grim-yellow/10 blur-[100px] rounded-full mix-blend-screen"></div>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <span className="text-grim-yellow font-mono text-xs tracking-[0.2em] uppercase border border-grim-yellow/20 px-2 py-1 bg-grim-yellow/5">
                    CREATE
                  </span>
                  <Plus className="w-5 h-5 text-white/40 group-hover:text-grim-yellow transition-colors" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2 group-hover:text-grim-yellow transition-colors duration-500">
                  UNLIMITED
                </h3>
                <p className="text-white/40 font-mono text-sm leading-relaxed max-w-[200px]">
                  Upload. Zoom. Rotate. Complete creative freedom.
                </p>
              </div>

              <div className="relative z-10 flex flex-col gap-4">
                <Link to="/configurator" className="group/btn relative h-14 w-full flex items-center justify-center overflow-hidden transition-all duration-300 mt-4">
                  {/* 1. BRACKETS FRAME */}
                  <div className="absolute inset-0 pointer-events-none transition-all duration-300 group-hover/btn:scale-[1.02] opacity-70 group-hover/btn:opacity-100">
                    <div className="absolute top-0 left-0 w-3 h-[1px] bg-white group-hover/btn:bg-grim-yellow transition-colors"></div>
                    <div className="absolute top-0 left-0 w-[1px] h-3 bg-white group-hover/btn:bg-grim-yellow transition-colors"></div>
                    <div className="absolute top-0 right-0 w-3 h-[1px] bg-white group-hover/btn:bg-grim-yellow transition-colors"></div>
                    <div className="absolute top-0 right-0 w-[1px] h-3 bg-white group-hover/btn:bg-grim-yellow transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-[1px] bg-white group-hover/btn:bg-grim-yellow transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-[1px] h-3 bg-white group-hover/btn:bg-grim-yellow transition-colors"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-[1px] bg-white group-hover/btn:bg-grim-yellow transition-colors"></div>
                    <div className="absolute bottom-0 right-0 w-[1px] h-3 bg-white group-hover/btn:bg-grim-yellow transition-colors"></div>
                  </div>

                  {/* 2. INNER GLOW */}
                  <div className="absolute inset-1 bg-white/[0.02] group-hover/btn:bg-grim-yellow/[0.1] transition-colors duration-300 backdrop-blur-[1px]"></div>

                  {/* 3. TEXT */}
                  <span className="relative z-10 font-mono font-bold text-xs tracking-[0.2em] uppercase text-white group-hover/btn:text-grim-yellow transition-colors duration-300 flex items-center gap-3">
                    Start Creating
                    <span className="opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300 text-grim-yellow">//</span>
                  </span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section - DARK MATTER AESTHETIC */}
      <section ref={ctaRef} className="py-24 px-4 bg-[#05000a] relative overflow-hidden flex flex-col items-center justify-center pattern-grid-lg grayscale">

        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#FF2A6D] to-transparent transform rotate-45 translate-x-1/2 -translate-y-1/2 opacity-20"></div>
        </div>

        <div className="cta-content max-w-6xl mx-auto text-center relative z-10 flex flex-col items-center">

          <h2 className="text-3xl sm:text-5xl md:text-8xl font-black leading-[0.85] tracking-tighter text-white uppercase transform scale-y-110 mb-6 drop-shadow-2xl italic">
            READY TO CREATE<br />
            SOMETHING UNIQUE
          </h2>

          <p className="hero-cta-p text-base md:text-xl text-grim-cyan font-bold tracking-[0.3em] uppercase mb-16 bg-black/50 px-4 py-2 backdrop-blur-sm border border-grim-cyan/20">
            Don't be nervous. Make it yours.
          </p>

          {/* THE DARK MATTER BUTTON */}
          <Link
            to="/configurator"
            className="group relative inline-flex items-center justify-center w-full md:w-[480px] h-[80px]"
          >
            {/* 1. OUTER FLOATING FRAME (The White Brackets) */}
            <div className="absolute inset-0 pointer-events-none transition-all duration-300 group-hover:scale-[1.02] group-hover:rotate-[0.5deg] z-20">
              {/* Top Left Bracket */}
              <div className="absolute top-0 left-0 w-8 h-[2px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
              <div className="absolute top-0 left-0 w-[2px] h-8 bg-white group-hover:bg-grim-cyan transition-colors"></div>

              {/* Top Right Bracket */}
              <div className="absolute top-0 right-0 w-8 h-[2px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
              <div className="absolute top-0 right-0 w-[2px] h-8 bg-white group-hover:bg-grim-cyan transition-colors"></div>

              {/* Bottom Left Bracket */}
              <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-[2px] h-8 bg-white group-hover:bg-grim-cyan transition-colors"></div>

              {/* Bottom Right Bracket */}
              <div className="absolute bottom-0 right-0 w-8 h-[2px] bg-white group-hover:bg-grim-cyan transition-colors"></div>
              <div className="absolute bottom-0 right-0 w-[2px] h-8 bg-white group-hover:bg-grim-cyan transition-colors"></div>
            </div>

            {/* 2. INNER CORE - DARK MATTER AESTHETIC (Replaces Solid Grey/Red) */}
            <div className="absolute inset-2 bg-black overflow-hidden transform transition-transform duration-300 group-hover:scale-[0.96] flex items-center justify-center">

              {/* A. Animated Aurora Gradient */}
              <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0deg,#B026FF40_120deg,transparent_180deg,#00F0FF40_300deg,transparent_360deg)] animate-[spin_4s_linear_infinite] opacity-40 blur-xl"></div>

              {/* B. Technical Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:16px_16px] z-10"></div>

              {/* C. Scanline Effect */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-white/20 shadow-[0_0_10px_white] animate-[pulse_2s_ease-in-out_infinite] z-20 translate-y-12"></div>

              {/* D. Noise Texture */}
              <div className="absolute inset-0 z-20 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

            </div>

            {/* 3. TEXT LAYER */}
            <div className="relative z-30 flex items-center justify-center gap-3">
              <span className="text-white font-black text-2xl tracking-[0.15em] uppercase italic drop-shadow-md group-hover:tracking-[0.2em] transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400">
                LAUNCH CONFIGURATOR
              </span>
            </div>

            {/* 4. DECORATIVE SIDE GAPS */}
            <div className="absolute top-1/2 left-0 w-[2px] h-[30px] bg-[#05000a] transform -translate-y-1/2 z-20"></div>
            <div className="absolute top-1/2 right-0 w-[2px] h-[30px] bg-[#05000a] transform -translate-y-1/2 z-20"></div>
            <div className="absolute top-0 left-1/2 w-[30px] h-[2px] bg-[#05000a] transform -translate-x-1/2 z-20"></div>
            <div className="absolute bottom-0 left-1/2 w-[30px] h-[2px] bg-[#05000a] transform -translate-x-1/2 z-20"></div>

          </Link>
        </div>
      </section>
    </div>
  )
}
