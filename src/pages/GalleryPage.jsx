import { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { fetchGalleryDesigns, incrementCopyCount, getUserLikedDesigns } from '../services/supabase'
import DesignCard from '../components/gallery/DesignCard'
import ViewDetailsModal from '../components/gallery/ViewDetailsModal'
import AuthModal from '../components/auth/AuthModal'
import useConfiguratorStore from '../store/configuratorStore'
import useAuthStore from '../store/authStore'

gsap.registerPlugin(ScrollTrigger)

export default function GalleryPage() {
  const pageRef = useRef(null)
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDesign, setSelectedDesign] = useState(null)
  const [likedDesigns, setLikedDesigns] = useState(new Set())
  const [showAuthModal, setShowAuthModal] = useState(false)
  const user = useAuthStore(state => state.user)

  // Fetch designs from Supabase
  useEffect(() => {
    async function fetchDesigns() {
      try {
        setLoading(true)
        setError(null)
        
        const data = await fetchGalleryDesigns({
          limit: 50,
          sortBy: 'created_at'
        })
        
        setDesigns(data || [])
      } catch (err) {
        console.error('Error fetching designs:', err)
        setError(err.message || 'Failed to load designs')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDesigns()
  }, [])

  // Load user's liked designs on mount and when user changes
  useEffect(() => {
    async function loadUserLikes() {
      if (user) {
        try {
          const likedSet = await getUserLikedDesigns(user.id)
          setLikedDesigns(likedSet)
        } catch (err) {
          console.error('Error loading user likes:', err)
        }
      } else {
        setLikedDesigns(new Set())
      }
    }
    
    loadUserLikes()
  }, [user])

  // Sync selectedDesign with designs array when it changes
  // This ensures the modal shows updated like counts immediately
  useEffect(() => {
    if (selectedDesign) {
      const updatedDesign = designs.find(d => d.id === selectedDesign.id)
      if (updatedDesign && updatedDesign.likes_count !== selectedDesign.likes_count) {
        setSelectedDesign(updatedDesign)
      }
    }
  }, [designs, selectedDesign])

  const categories = ['all', 'popular', 'recent', 'most-liked']

  const filteredDesigns = selectedCategory === 'all' 
    ? designs 
    : selectedCategory === 'popular'
    ? [...designs].sort((a, b) => (b.likes_count + b.copies_count) - (a.likes_count + a.copies_count))
    : selectedCategory === 'recent'
    ? [...designs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    : selectedCategory === 'most-liked'
    ? [...designs].sort((a, b) => b.likes_count - a.likes_count)
    : designs

  const handleViewDetails = (design) => {
    setSelectedDesign(design)
  }

  const handleAuthRequired = () => {
    setShowAuthModal(true)
  }

  const handleLikeUpdate = (designId, isLiked) => {
    // Update local liked designs set
    setLikedDesigns(prev => {
      const newSet = new Set(prev)
      if (isLiked) {
        newSet.add(designId)
      } else {
        newSet.delete(designId)
      }
      return newSet
    })

    // Update the design in the designs array (optimistic update)
    setDesigns(prev => prev.map(design => {
      if (design.id === designId) {
        return {
          ...design,
          likes_count: isLiked ? (design.likes_count || 0) + 1 : Math.max(0, (design.likes_count || 0) - 1)
        }
      }
      return design
    }))
  }

  const handleCopyToConfigurator = async (design) => {
    // Check authentication
    if (!user) {
      setShowAuthModal(true)
      return
    }

    try {
      // Check if texture URL exists and is valid
      if (!design.texture_url || design.texture_url.startsWith('blob:')) {
        alert('This design has a missing or invalid texture. Please create a new design with a valid texture.')
        return
      }

      // Increment copy count
      await incrementCopyCount(design.id)
      
      // Load design into configurator
      const configuratorStore = useConfiguratorStore.getState()
      
      // Upload texture to active layer
      try {
        const response = await fetch(design.texture_url)
        if (!response.ok) throw new Error('Failed to fetch texture')
        
        const blob = await response.blob()
        const file = new File([blob], 'texture.png', { type: blob.type })
        
        configuratorStore.uploadTexture(configuratorStore.activeLayerId, file)
      } catch (fetchError) {
        console.error('Error fetching texture:', fetchError)
        alert('Failed to load texture. The image may be unavailable.')
        return
      }
      
      // Set texture transform
      if (design.texture_settings) {
        configuratorStore.updateTextureTransform(
          configuratorStore.activeLayerId,
          design.texture_settings
        )
      }
      
      // Set base color
      if (design.base_color) {
        configuratorStore.updateBaseColor(configuratorStore.activeLayerId, design.base_color)
      }
      
      // Set selected keys
      if (design.selected_keys && design.selected_keys.length > 0) {
        configuratorStore.setSelectedKeys(design.selected_keys)
      }
      
      // Navigate to configurator
      navigate('/configurator')
      
      // Close modal if open
      setSelectedDesign(null)
    } catch (error) {
      console.error('Error copying design:', error)
      alert('Failed to copy design. Please try again.')
    }
  }

  // Add your custom animations here

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
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-grim-accent border-t-transparent mb-4"></div>
              <p className="text-gray-400 text-lg">Loading designs...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-400 text-xl mb-2">Failed to load designs</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-3 bg-grim-accent text-black font-semibold rounded-lg hover:bg-grim-accent/90 transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {/* Gallery Grid */}
          {!loading && !error && (
            <>
              <div className="gallery-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDesigns.map((design) => (
                  <DesignCard 
                    key={design.id} 
                    design={design} 
                    onViewDetails={handleViewDetails}
                    onLikeToggle={handleLikeUpdate}
                    onAuthRequired={handleAuthRequired}
                    isLikedByUser={likedDesigns.has(design.id)}
                  />
                ))}
              </div>

              {filteredDesigns.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-xl">No designs found in this category.</p>
                  <Link 
                    to="/configurator"
                    className="inline-block mt-6 px-6 py-3 bg-grim-accent text-black font-semibold rounded-lg hover:bg-grim-accent/90 transition-all"
                  >
                    Be the first to create one!
                  </Link>
                </div>
              )}
            </>
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

      {/* View Details Modal */}
      {selectedDesign && (
        <ViewDetailsModal
          design={selectedDesign}
          onClose={() => setSelectedDesign(null)}
          onCopyToConfigurator={() => handleCopyToConfigurator(selectedDesign)}
          onLikeUpdate={handleLikeUpdate}
          currentLikeState={likedDesigns.has(selectedDesign.id)}
          onAuthRequired={handleAuthRequired}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab="signin"
        />
      )}
    </div>
  )
}
