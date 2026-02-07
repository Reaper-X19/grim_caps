import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Environment, useGLTF } from '@react-three/drei'
import { useControls } from 'leva'





gsap.registerPlugin(ScrollTrigger)

// Keyboard 3D Model Component
function KeyboardModel({ groupRef }) {
  const { scene } = useGLTF('/models/Keyboard_60percent.gltf')
  
  // Leva controls for position and rotation
  const { position, rotation, scale } = useControls('Keyboard Transform', {
    position: {
      value: [0, 0, 0],
      step: 0.1,
      label: 'Position (X, Y, Z)'
    },
    rotation: {
      value: [0, 0, 0],
      step: 0.01,
      label: 'Rotation (X, Y, Z)'
    },
    scale: {
      value: 2.5,
      min: 0.5,
      max: 5,
      step: 0.1,
      label: 'Scale'
    }
  })

  return (
    <group ref={groupRef}>
      <primitive 
        object={scene} 
        scale={scale} 
        position={position}
        rotation={rotation}
      />
    </group>
  )
}


export default function HomePage() {
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const ctaRef = useRef(null)
  const keyboardGroupRef = useRef(null)

  useGSAP(() => {
    // Set initial states and animate
    const heroTl = gsap.timeline({
      defaults: { ease: 'power3.out' }
    })

    heroTl
      .to('.hero-title-line-1', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power4.out'
      })
      .to('.hero-subtitle', {
        y: 0,
        opacity: 1,
        duration: 0.8
      }, '-=0.5')
      .to('.hero-cta-btn', {
        y: 0,
        opacity: 1,
        duration: 0.6
      }, '-=0.4')
      .to('.scroll-indicator', {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, '-=0.3')

    // Feature cards
    gsap.to('.feature-card', {
      scrollTrigger: {
        trigger: featuresRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 0,
      opacity: 1,
      rotateX: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out'
    })

    // Feature icons
    gsap.to('.feature-icon', {
      scrollTrigger: {
        trigger: featuresRef.current,
        start: 'top 80%',
      },
      scale: 1,
      rotation: 0,
      duration: 0.8,
      ease: 'back.out(1.7)',
      stagger: 0.2
    })

    // Section heading
    gsap.to('.section-heading', {
      scrollTrigger: {
        trigger: featuresRef.current,
        start: 'top 85%',
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out'
    })

    // CTA section
    gsap.to('.cta-content', {
      scrollTrigger: {
        trigger: ctaRef.current,
        start: 'top 85%',
      },
      scale: 1,
      opacity: 1,
      duration: 1,
      ease: 'power3.out'
    })

  }, { scope: heroRef })

  return (
    <div ref={heroRef} className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden p-6 md:p-12" style={{
        background: 'radial-gradient(ellipse at top, rgba(0, 255, 204, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.15) 0%, transparent 50%), linear-gradient(180deg, #0a0a0a 0%, #1a0a1f 50%, #0a1a2f 100%)'
      }}>
        {/* Top Left Heading - Desktop */}
        <div className="absolute top-20 left-8 md:top-28 md:left-32 z-20 max-w-xl hidden md:block">
          <h1 className="hero-title-line-1 text-4xl lg:text-5xl xl:text-6xl font-display font-black italic leading-none uppercase tracking-tight">
            Your Setup,<br />
            <span className="text-grim-accent text-glow">Your<br />Signature</span>
          </h1>
        </div>

        {/* Mobile Centered Heading */}
        <div className="md:hidden absolute top-24 left-1/2 transform -translate-x-1/2 z-20 text-center px-6">
          <h1 className="hero-title-line-1 text-3xl sm:text-4xl font-display font-black italic leading-none uppercase tracking-tight">
            Your Setup,<br />
            <span className="text-grim-accent text-glow">Your<br />Signature</span>
          </h1>
        </div>

        {/* Bottom Right Tagline - Desktop */}
        <div className="absolute bottom-32 right-8 md:bottom-40 md:right-40 z-20 max-w-md text-right hidden md:block">
          <h2 className="hero-subtitle text-2xl lg:text-3xl xl:text-4xl font-display font-bold italic mb-3 text-grim-accent leading-tight">
            Feel the Power of<br />Customization
          </h2>
          <p className="hero-cta-btn text-sm lg:text-base text-gray-300 leading-relaxed font-light">
            Get your custom keycaps today and make your dream setup come true
          </p>
        </div>

        {/* Mobile Bottom Tagline */}
        <div className="md:hidden absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20 text-center px-6 max-w-sm">
          <h2 className="hero-subtitle text-xl sm:text-2xl font-display font-bold italic mb-3 text-grim-accent leading-tight">
            Feel the Power of<br />Customization
          </h2>
          <p className="hero-cta-btn text-sm text-gray-300 leading-relaxed font-light">
            Get your custom keycaps today and make your dream setup come true
          </p>
        </div>

        {/* Full Screen 3D Canvas */}
        <div className="absolute inset-0 w-full h-full">
          <Canvas
            className="w-full h-full"
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
          >
            <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
            <Environment files="/hdr/blue-studio.hdr" />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <KeyboardModel groupRef={keyboardGroupRef} />
          </Canvas>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-grim-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 px-4 bg-grim-dark relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-heading text-4xl md:text-5xl font-display font-bold text-center mb-16">
            Why Choose <span className="text-grim-accent">Grim Caps</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="feature-card glass p-8 rounded-xl hover:border-grim-accent transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl hover:shadow-grim-accent/20 group">
              <div className="feature-icon w-16 h-16 bg-gradient-to-r from-grim-accent to-grim-blue rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <svg className="w-8 h-8 text-grim-darker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4 group-hover:text-grim-accent transition-colors">Lightning Fast</h3>
              <p className="text-gray-400">
                3-7 day delivery. No customs, no waiting weeks. Designed and shipped from India.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card glass p-8 rounded-xl hover:border-grim-accent transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl hover:shadow-grim-purple/20 group">
              <div className="feature-icon w-16 h-16 bg-gradient-to-r from-grim-purple to-grim-accent rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <svg className="w-8 h-8 text-grim-darker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4 group-hover:text-grim-accent transition-colors">Premium Quality</h3>
              <p className="text-gray-400">
                Dye sublimation on PBT keycaps. Vibrant colors that never fade. Professional finish.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card glass p-8 rounded-xl hover:border-grim-accent transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl hover:shadow-grim-blue/20 group">
              <div className="feature-icon w-16 h-16 bg-gradient-to-r from-grim-blue to-grim-purple rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <svg className="w-8 h-8 text-grim-darker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4 group-hover:text-grim-accent transition-colors">Unlimited Designs</h3>
              <p className="text-gray-400">
                Upload any image. Adjust position, zoom, rotation. Make it truly yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-24 px-4 bg-gradient-to-b from-grim-dark to-grim-darker relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-r from-grim-accent/5 to-grim-purple/5"></div>
        
        <div className="cta-content max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Ready to Create Something <span className="text-grim-accent">Unique</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join hundreds of keyboard enthusiasts who've made their setups truly their own.
          </p>
          <Link 
            to="/configurator" 
            className="inline-block px-12 py-6 bg-gradient-to-r from-grim-accent to-grim-blue text-grim-darker font-display font-bold text-xl rounded-lg hover:scale-110 hover:shadow-2xl hover:shadow-grim-accent/50 transition-all duration-300"
          >
            Launch Configurator
          </Link>
        </div>
      </section>
    </div>
  )
}
