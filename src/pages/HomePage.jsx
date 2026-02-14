import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ShieldCheck, Plus, Package } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useControls } from 'leva'
import * as THREE from 'three'
import GlossyKeyboardHero from '../components/3d/GlossyKeyboardHero'

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const ctaRef = useRef(null)

  // Bloom controls
  const { bloomIntensity, bloomThreshold, bloomSmoothing } = useControls('Bloom Effect', {
    bloomIntensity: { value: 1.5, min: 0, max: 3, step: 0.1 },
    bloomThreshold: { value: 0.9, min: 0, max: 1, step: 0.05 },
    bloomSmoothing: { value: 0.9, min: 0, max: 1, step: 0.05 }
  })

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
    <div ref={heroRef} className="overflow-hidden bg-[#050505]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden p-6 md:p-12" style={{
        background: 'radial-gradient(ellipse at top, rgba(0, 255, 204, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.15) 0%, transparent 50%), linear-gradient(180deg, #0a0a0a 0%, #1a0a1f 50%, #0a1a2f 100%)'
      }}>
        <div className="absolute top-20 left-8 md:top-28 md:left-32 z-20 max-w-xl hidden md:block">
          <h1 className="hero-title-line-1 text-4xl lg:text-5xl xl:text-6xl font-display font-black italic leading-none uppercase tracking-tight">
            Your Setup,<br />
            <span className="text-grim-accent text-glow">Your<br />Signature</span>
          </h1>
        </div>
        <div className="md:hidden absolute top-24 left-1/2 transform -translate-x-1/2 z-20 text-center px-6">
          <h1 className="hero-title-line-1 text-3xl sm:text-4xl font-display font-black italic leading-none uppercase tracking-tight">
            Your Setup,<br />
            <span className="text-grim-accent text-glow">Your<br />Signature</span>
          </h1>
        </div>
        <div className="absolute bottom-32 right-8 md:bottom-40 md:right-40 z-20 max-w-md text-right hidden md:block">
          <h2 className="hero-subtitle text-2xl lg:text-3xl xl:text-4xl font-display font-bold italic mb-3 text-grim-accent leading-tight">
            Feel the Power of<br />Customization
          </h2>
          <p className="hero-cta-btn text-sm lg:text-base text-gray-300 leading-relaxed font-light">
            Get your custom keycaps today and make your dream setup come true
          </p>
        </div>
        <div className="md:hidden absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20 text-center px-6 max-w-sm">
          <h2 className="hero-subtitle text-xl sm:text-2xl font-display font-bold italic mb-3 text-grim-accent leading-tight">
            Feel the Power of<br />Customization
          </h2>
          <p className="hero-cta-btn text-sm text-gray-300 leading-relaxed font-light">
            Get your custom keycaps today and make your dream setup come true
          </p>
        </div>
        <div className="absolute inset-0 w-full h-full">
          <Canvas className="w-full h-full" gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }} dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
            <Environment files="/hdr/blue-studio.hdr" background={false} environmentIntensity={0.5} />
            <ambientLight intensity={0.4} />
            <hemisphereLight skyColor="#ffffff" groundColor="#666666" intensity={0.3} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} castShadow={false} />
            <pointLight position={[-10, 5, -10]} intensity={0.4} color="#00ffcc" />
            <GlossyKeyboardHero />
            <EffectComposer>
              <Bloom intensity={bloomIntensity} luminanceThreshold={bloomThreshold} luminanceSmoothing={bloomSmoothing} />
            </EffectComposer>
          </Canvas>
        </div>
        <div className="scroll-indicator absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-grim-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* Features Section - CINEMATIC MONOLITH */}
      <section ref={featuresRef} className="py-32 bg-black relative w-full flex flex-col items-center justify-center min-h-screen overflow-hidden">

        {/* Cinematic Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#000000_100%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20"></div>

        <div className="w-full max-w-[95vw] lg:max-w-7xl mx-auto px-4 relative z-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 border-b border-white/10 pb-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-6xl md:text-8xl font-display font-black text-white tracking-tighter leading-none">
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
            <div className="group relative h-[500px] p-8 flex flex-col justify-between overflow-hidden cursor-crosshair transition-all duration-700 hover:bg-white/[0.03]">
              {/* Scanline Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,240,255,0.05)_50%,transparent_100%)] h-[200%] w-full animate-[scan_3s_linear_infinite] pointer-events-none opacity-0 group-hover:opacity-100"></div>

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
                <h3 className="text-4xl font-display font-bold text-white mb-2 group-hover:text-grim-cyan transition-colors duration-500">
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
            <div className="group relative h-[500px] p-8 flex flex-col justify-between overflow-hidden cursor-crosshair transition-all duration-700 hover:bg-white/[0.03]">
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
                <h3 className="text-4xl font-display font-bold text-white mb-2 group-hover:text-grim-purple transition-colors duration-500">
                  PREMIUM QUALITY
                </h3>
                <p className="text-white/40 font-mono text-sm leading-relaxed max-w-[200px]">
                  100% PBT. Colors that never fade.
                </p>
              </div>

              {/* Centerpiece Graphic */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-700">
                <div className="w-24 h-24 border border-white/5 rounded-full animate-[spin_20s_linear_infinite]"></div>
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
            <div className="group relative h-[500px] p-8 flex flex-col justify-between overflow-hidden cursor-crosshair transition-all duration-700 hover:bg-white/[0.03]">
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
                <h3 className="text-4xl font-display font-bold text-white mb-2 group-hover:text-grim-yellow transition-colors duration-500">
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
      <section ref={ctaRef} className="py-24 px-4 bg-[#050505] relative overflow-hidden flex flex-col items-center justify-center pattern-grid-lg grayscale">

        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#ff4655] to-transparent transform rotate-45 translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="cta-content max-w-6xl mx-auto text-center relative z-10 flex flex-col items-center">

          <h2 className="text-5xl md:text-8xl font-black leading-[0.85] tracking-tighter text-white uppercase transform scale-y-110 mb-6 drop-shadow-2xl">
            READY TO CREATE<br />
            SOMETHING UNIQUE
          </h2>

          <p className="text-base md:text-xl text-[#ff4655] font-bold tracking-[0.3em] uppercase mb-16 bg-black/50 px-4 py-2 backdrop-blur-sm border border-[#ff4655]/20">
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
              <div className="absolute top-0 left-0 w-8 h-[2px] bg-white group-hover:bg-[#ff4655] transition-colors"></div>
              <div className="absolute top-0 left-0 w-[2px] h-8 bg-white group-hover:bg-[#ff4655] transition-colors"></div>

              {/* Top Right Bracket */}
              <div className="absolute top-0 right-0 w-8 h-[2px] bg-white group-hover:bg-[#ff4655] transition-colors"></div>
              <div className="absolute top-0 right-0 w-[2px] h-8 bg-white group-hover:bg-[#ff4655] transition-colors"></div>

              {/* Bottom Left Bracket */}
              <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-white group-hover:bg-[#ff4655] transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-[2px] h-8 bg-white group-hover:bg-[#ff4655] transition-colors"></div>

              {/* Bottom Right Bracket */}
              <div className="absolute bottom-0 right-0 w-8 h-[2px] bg-white group-hover:bg-[#ff4655] transition-colors"></div>
              <div className="absolute bottom-0 right-0 w-[2px] h-8 bg-white group-hover:bg-[#ff4655] transition-colors"></div>
            </div>

            {/* 2. INNER CORE - DARK MATTER AESTHETIC (Replaces Solid Grey/Red) */}
            <div className="absolute inset-2 bg-black overflow-hidden transform transition-transform duration-300 group-hover:scale-[0.96] flex items-center justify-center">

              {/* A. Animated Aurora Gradient */}
              <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0deg,#ff465540_120deg,transparent_180deg,#00ffcc40_300deg,transparent_360deg)] animate-[spin_4s_linear_infinite] opacity-40 blur-xl"></div>

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
            <div className="absolute top-1/2 left-0 w-[2px] h-[30px] bg-[#050505] transform -translate-y-1/2 z-20"></div>
            <div className="absolute top-1/2 right-0 w-[2px] h-[30px] bg-[#050505] transform -translate-y-1/2 z-20"></div>
            <div className="absolute top-0 left-1/2 w-[30px] h-[2px] bg-[#050505] transform -translate-x-1/2 z-20"></div>
            <div className="absolute bottom-0 left-1/2 w-[30px] h-[2px] bg-[#050505] transform -translate-x-1/2 z-20"></div>

          </Link>
        </div>
      </section>
    </div>
  )
}
