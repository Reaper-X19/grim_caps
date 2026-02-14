import { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { fetchGalleryDesigns, incrementCopyCount } from '../services/supabase'
import DesignCard from '../components/gallery/DesignCard'
import ViewDetailsModal from '../components/gallery/ViewDetailsModal'
import useConfiguratorStore from '../store/configuratorStore'

gsap.registerPlugin(ScrollTrigger)

export default function GalleryPage() {
  const pageRef = useRef(null)
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDesign, setSelectedDesign] = useState(null)

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

  const handleLikeUpdate = async (designId) => {
    // Refresh the designs list to get updated like count
    try {
      const data = await fetchGalleryDesigns({
        limit: 50,
        sortBy: 'created_at'
      })
      setDesigns(data || [])
    } catch (err) {
      console.error('Error refreshing designs:', err)
    }
  }

  const handleCopyToConfigurator = async (design) => {
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
      if (design.texture_config) {
        configuratorStore.updateTextureTransform(
          configuratorStore.activeLayerId,
          design.texture_config
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

      // Close modal and navigate
      setSelectedDesign(null)
      navigate('/configurator')
    } catch (error) {
      console.error('Error copying to configurator:', error)
      alert('Failed to copy design. Please try again.')
    }
  }

  // Add your custom animations here

  return (
    <div ref={pageRef} className="min-h-screen bg-grim-void overflow-hidden relative selection:bg-grim-cyan selection:text-black">

      {/* 1. Cyber-Void Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Dynamic Grid */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
                 linear-gradient(rgba(176, 38, 255, 0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
               `,
            backgroundSize: '50px 50px',
          }}>
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-grim-purple/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-grim-cyan/10 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#030014_100%)]"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 flex items-center justify-center overflow-hidden">
          <div className="text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-display font-black mb-6 uppercase tracking-widest relative inline-block pb-4">
              <span className="absolute inset-0 text-grim-cyan blur-[2px] opacity-70 animate-pulse-slow">COMMUNITY_GRID</span>
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-white via-grim-cyan to-grim-purple">
                COMMUNITY_GRID
              </span>
            </h1>
            <p className="text-sm md:text-base font-mono text-grim-cyan/60 max-w-2xl mx-auto uppercase tracking-wider border-l-2 border-r-2 border-grim-cyan/20 px-8 py-2">
              Accessing Global Arsenal of Custom Configurations
            </p>
          </div>
        </section>

        {/* Filters Section - Holo Bar */}
        <section className="sticky top-20 z-40 py-6 px-4 backdrop-blur-sm border-b border-white/5 bg-grim-void/80">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`relative px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px] ${selectedCategory === category
                    ? 'bg-white !text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:bg-white hover:!text-black'
                    : 'bg-grim-panel text-gray-500 hover:text-white hover:bg-white/5 border border-white/5 hover:border-grim-cyan/50'
                    }`}
                  style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-12 px-4 min-h-[50vh]">
          <div className="max-w-7xl mx-auto">
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 font-mono text-grim-cyan">
                <div className="w-16 h-16 border-2 border-grim-cyan border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(0,240,255,0.3)]"></div>
                <p className="animate-pulse">LOADING_DATA_STREAM...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20 border border-grim-alert/30 bg-grim-alert/5 rounded-lg max-w-lg mx-auto p-8">
                <div className="text-grim-alert text-4xl mb-4">⚠</div>
                <p className="text-grim-alert font-mono text-xl mb-2">CONNECTION_FAILURE</p>
                <p className="text-gray-500 text-xs font-mono mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-grim-alert/20 hover:bg-grim-alert/40 text-grim-alert border border-grim-alert/50 font-bold uppercase tracking-widest text-xs transition-all"
                >
                  Re-Initialize
                </button>
              </div>
            )}

            {/* Gallery Grid */}
            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredDesigns.map((design) => (
                    <DesignCard
                      key={design.id}
                      design={design}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>

                {filteredDesigns.length === 0 && (
                  <div className="text-center py-20 border border-white/5 bg-grim-panel/50 rounded-lg">
                    <p className="text-gray-500 font-mono text-sm uppercase mb-6">NO_DATA_FOUND_IN_SECTOR</p>
                    <Link
                      to="/configurator"
                      className="inline-block px-8 py-3 bg-grim-cyan text-black font-black uppercase tracking-widest text-xs hover:bg-white hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px]"
                      style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                    >
                      Initialize New Design
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-grim-purple/5 skew-y-3 transform origin-bottom-right pointer-events-none"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-black mb-6 uppercase tracking-widest text-white">
              <span className="text-grim-cyan">DEPLOY</span> YOUR OWN CONFIGURATION
            </h2>
            <p className="text-sm font-mono text-gray-400 mb-10 max-w-xl mx-auto">
              UPLOAD_DESIGN // CUSTOMIZE_KEYS // EXPORT_SCHEMATIC
            </p>
            <Link
              to="/configurator"
              className="inline-block px-12 py-4 bg-transparent border border-grim-purple text-grim-purple font-display font-bold text-lg uppercase tracking-widest hover:bg-grim-purple hover:text-black hover:shadow-[0_0_30px_rgba(176,38,255,0.4)] transition-all duration-300 clip-path-polygon-[20px_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%,0_20px]"
              style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
            >
              Start System
            </Link>
          </div>
        </section>
      </div>

      {/* View Details Modal */}
      {selectedDesign && (
        <ViewDetailsModal
          design={selectedDesign}
          onClose={() => setSelectedDesign(null)}
          onCopyToConfigurator={() => handleCopyToConfigurator(selectedDesign)}
          onLikeUpdate={handleLikeUpdate}
        />
      )}
    </div>
  )
}
