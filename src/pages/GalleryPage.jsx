import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function GalleryPage() {
  const pageRef = useRef(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'anime', 'minimal', 'abstract', 'custom']

  const galleryItems = [
    { id: 1, category: 'anime', title: 'Demon Slayer Set', description: 'Custom anime-themed keycaps' },
    { id: 2, category: 'minimal', title: 'Monochrome Elegance', description: 'Clean black and white design' },
    { id: 3, category: 'abstract', title: 'Neon Dreams', description: 'Vibrant abstract patterns' },
    { id: 4, category: 'custom', title: 'Personal Logo', description: 'Custom brand keycaps' },
    { id: 5, category: 'anime', title: 'One Piece Theme', description: 'Pirate-inspired design' },
    { id: 6, category: 'minimal', title: 'Nordic Frost', description: 'Minimalist winter theme' },
    { id: 7, category: 'abstract', title: 'Cosmic Waves', description: 'Space-themed abstract' },
    { id: 8, category: 'custom', title: 'Gaming Clan', description: 'Esports team branding' },
  ]

  const filteredItems = selectedCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory)

  useGSAP(() => {
    // Hero entrance - use timeline
    const heroTl = gsap.timeline({
      defaults: { ease: 'power3.out' }
    })

    heroTl
      .to('.gallery-hero-title', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power4.out'
      })
      .to('.gallery-hero-subtitle', {
        y: 0,
        opacity: 1,
        duration: 0.8
      }, '-=0.5')

    // Category filters
    gsap.to('.category-btn', {
      scrollTrigger: {
        trigger: '.filters-section',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    })

    // Gallery items - re-animate when filtered items change
    gsap.to('.gallery-item', {
      scrollTrigger: {
        trigger: '.gallery-grid',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    })
  }, { scope: pageRef, dependencies: [filteredItems] })

  return (
    <div ref={pageRef} className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden" style={{
        background: 'radial-gradient(ellipse at top, rgba(236, 72, 153, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.15) 0%, transparent 50%), linear-gradient(180deg, #0a0a0a 0%, #1f0a1f 50%, #0a0a1f 100%)'
      }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-grim-purple/10 rounded-full blur-3xl bottom-20 left-20 animate-pulse"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="gallery-hero-title text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
            Design <span className="text-grim-accent text-glow">Gallery</span>
          </h1>
          <p className="gallery-hero-subtitle text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Explore stunning custom keycap designs created by our community.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="filters-section py-12 px-4 bg-grim-dark border-b border-grim-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`category-btn px-6 py-3 rounded-lg font-display font-semibold text-sm uppercase tracking-wider transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-grim-accent to-grim-blue text-grim-darker scale-105 shadow-lg shadow-grim-accent/50'
                    : 'glass text-gray-300 hover:text-grim-accent hover:border-grim-accent'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-24 px-4 bg-gradient-to-b from-grim-dark to-grim-darker">
        <div className="max-w-7xl mx-auto">
          <div className="gallery-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="gallery-item glass rounded-xl overflow-hidden hover:border-grim-accent transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-grim-accent/20 group cursor-pointer"
              >
                {/* Placeholder image area */}
                <div className="aspect-square bg-gradient-to-br from-grim-gray-800 to-grim-gray-700 flex items-center justify-center group-hover:from-grim-accent/20 group-hover:to-grim-purple/20 transition-all duration-300">
                  <svg className="w-20 h-20 text-grim-accent/30 group-hover:text-grim-accent/60 group-hover:scale-110 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold mb-2 group-hover:text-grim-accent transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                  <span className="inline-block px-3 py-1 bg-grim-accent/10 text-grim-accent text-xs font-semibold rounded-full">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">No designs found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-grim-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Ready to Create <span className="text-grim-accent">Your Own</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Upload your design and see it come to life on premium keycaps.
          </p>
          <Link 
            to="/configurator" 
            className="inline-block px-12 py-6 bg-gradient-to-r from-grim-accent to-grim-blue text-grim-darker font-display font-bold text-xl rounded-lg hover:scale-110 hover:shadow-2xl hover:shadow-grim-accent/50 transition-all duration-300"
          >
            Start Designing
          </Link>
        </div>
      </section>
    </div>
  )
}
