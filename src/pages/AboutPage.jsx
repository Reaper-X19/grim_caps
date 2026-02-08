import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function AboutPage() {
  const pageRef = useRef(null)

  // Add your custom animations here

  return (
    <div ref={pageRef} className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden" style={{
        background: 'radial-gradient(ellipse at top left, rgba(251, 146, 60, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(0, 255, 204, 0.12) 0%, transparent 50%), linear-gradient(180deg, #0a0a0a 0%, #1f0f0a 50%, #0a1a1f 100%)'
      }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-grim-accent/10 rounded-full blur-3xl top-20 right-20 animate-pulse"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="about-hero-title text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
            Crafted with <span className="text-grim-accent text-glow">Passion</span>
          </h1>
          <p className="about-hero-subtitle text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            We're on a mission to make custom keycaps accessible to every keyboard enthusiast in India.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section py-24 px-4 bg-grim-dark">
        <div className="story-content max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 text-center">
            Our <span className="text-grim-accent">Story</span>
          </h2>
          <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
            <p>
              Grim Caps was born from a simple frustration: why should Indian keyboard enthusiasts wait weeks 
              for custom keycaps from overseas, paying hefty customs fees and dealing with uncertain delivery times?
            </p>
            <p>
              We set out to change that. By bringing dye sublimation printing technology to India, we've made it 
              possible to get premium, custom-printed keycaps delivered to your doorstep in just 3-7 days.
            </p>
            <p className="text-grim-accent font-semibold">
              No more waiting. No more customs. Just pure customization, made in India.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section py-24 px-4 bg-gradient-to-b from-grim-dark to-grim-darker">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-16 text-center">
            What We <span className="text-grim-accent">Stand For</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="value-card glass p-8 rounded-xl hover:border-grim-accent transition-all duration-300 hover:-translate-y-4 group">
              <div className="w-16 h-16 bg-gradient-to-r from-grim-accent to-grim-blue rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                <svg className="w-8 h-8 text-grim-darker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4 group-hover:text-grim-accent transition-colors">Quality First</h3>
              <p className="text-gray-400">
                We use only premium PBT keycaps and professional dye sublimation for colors that never fade.
              </p>
            </div>

            {/* Value 2 */}
            <div className="value-card glass p-8 rounded-xl hover:border-grim-accent transition-all duration-300 hover:-translate-y-4 group">
              <div className="w-16 h-16 bg-gradient-to-r from-grim-purple to-grim-accent rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                <svg className="w-8 h-8 text-grim-darker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4 group-hover:text-grim-accent transition-colors">Speed Matters</h3>
              <p className="text-gray-400">
                Your time is valuable. We ship within 3-7 days, no exceptions, no excuses.
              </p>
            </div>

            {/* Value 3 */}
            <div className="value-card glass p-8 rounded-xl hover:border-grim-accent transition-all duration-300 hover:-translate-y-4 group">
              <div className="w-16 h-16 bg-gradient-to-r from-grim-blue to-grim-purple rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                <svg className="w-8 h-8 text-grim-darker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4 group-hover:text-grim-accent transition-colors">Community Driven</h3>
              <p className="text-gray-400">
                Built by enthusiasts, for enthusiasts. Your feedback shapes our products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section py-24 px-4 bg-grim-dark">
        <div className="team-content max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">
            Made in <span className="text-grim-accent">India</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            We're a small team of keyboard enthusiasts based in India, dedicated to bringing 
            world-class customization to the Indian mechanical keyboard community.
          </p>
          <Link 
            to="/contact" 
            className="inline-block px-10 py-5 bg-gradient-to-r from-grim-accent to-grim-blue text-grim-darker font-display font-bold text-lg rounded-lg hover:scale-110 hover:shadow-2xl hover:shadow-grim-accent/50 transition-all duration-300"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}
