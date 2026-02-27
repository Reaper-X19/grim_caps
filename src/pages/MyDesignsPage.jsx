import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Edit, Eye, Lock, Globe, ShoppingCart, Terminal } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'
import { supabase } from '../services/supabase'
import { formatPrice } from '../utils/pricing'
import useConfiguratorStore from '../store/configuratorStore'

export default function MyDesignsPage() {
  const pageRef = useRef(null)
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'public', 'private'
  const user = useAuthStore(state => state.user)
  const loadDesign = useConfiguratorStore(state => state.loadDesign)
  const addDesign = useCartStore(state => state.addDesign)
  const isInCart = useCartStore(state => state.isInCart)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/gallery')
      return
    }

    fetchMyDesigns()
  }, [user, navigate])

  const fetchMyDesigns = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('user_designs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setDesigns(data || [])
    } catch (error) {
      console.error('Error fetching designs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (designId) => {
    if (!confirm('Are you sure you want to delete this design?')) return

    try {
      const { error } = await supabase
        .from('user_designs')
        .delete()
        .eq('id', designId)
        .eq('user_id', user.id)

      if (error) throw error

      setDesigns(designs.filter(d => d.id !== designId))
    } catch (error) {
      console.error('Error deleting design:', error)
      alert('Failed to delete design')
    }
  }

  const handleViewDesign = (design) => {
    // Load the design into the configurator
    loadDesign(design)
    // Navigate to configurator
    navigate('/configurator')
  }

  const handleAddToCart = (design) => {
    try {
      addDesign(design, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add design to cart')
    }
  }

  const filteredDesigns = designs.filter(design => {
    if (filter === 'all') return true
    if (filter === 'public') return design.is_public
    if (filter === 'private') return !design.is_public
    return true
  })

  // Entrance animations
  useGSAP(() => {
    if (!loading && designs.length > 0) {
      gsap.fromTo('.design-card', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
      )
    }
  }, [loading, filter])

  if (!user) {
    return null
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-grim-void overflow-hidden relative selection:bg-grim-cyan selection:text-black pt-32 pb-20 px-4">
      
      {/* 1. Cyber-Void Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
                 linear-gradient(rgba(176, 38, 255, 0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
               `,
            backgroundSize: '50px 50px',
          }}>
        </div>


        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030014_100%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-block mb-4 px-4 py-1 bg-grim-cyan/10 border border-grim-cyan/30 rounded-none transform skew-x-[-10deg]">
              <span className="font-mono text-grim-cyan text-xs tracking-[0.3em] font-bold transform skew-x-[10deg] inline-block uppercase">ARCHIVE // DESIGN_LOG</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tighter italic">
              MY <span className="text-transparent bg-clip-text bg-gradient-to-r from-grim-cyan to-grim-purple">DESIGNS</span>
            </h1>
          </div>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'ALL', count: designs.length },
              { id: 'public', label: 'PUBLIC', count: designs.filter(d => d.is_public).length },
              { id: 'private', label: 'PRIVATE', count: designs.filter(d => !d.is_public).length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 sm:px-6 py-2 font-mono text-xs font-bold transition-all border ${
                  filter === tab.id
                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                    : 'bg-black/40 text-gray-500 border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {tab.label} [{tab.count}]
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 font-mono text-grim-cyan">
            <div className="w-16 h-16 border-2 border-grim-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="animate-pulse uppercase tracking-[0.2em]">ACCESSING_DATABASE...</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="text-center py-24 bg-grim-panel/40 border border-white/5 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.02)_50%)] bg-[length:100%_4px]"></div>
            <p className="text-gray-500 font-mono text-lg mb-8 uppercase tracking-widest relative z-10">
              {filter === 'all' 
                ? "NO_LOGS_DETECTED_IN_SECTOR"
                : `NO_${filter.toUpperCase()}_LOGS_FOUND`}
            </p>
            <button
              onClick={() => navigate('/configurator')}
              className="relative z-10 px-10 py-4 bg-grim-cyan text-black font-black uppercase tracking-widest text-sm hover:bg-white hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px]"
              style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
            >
              INITIALIZE_NEW_SEQUENCE
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDesigns.map(design => (
              <div key={design.id} className="design-card group relative bg-grim-panel border border-white/5 hover:border-grim-cyan/50 transition-all duration-500 clip-path-polygon-[20px_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%,0_20px]"
                style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                
                {/* Visual Header */}
                <div className="aspect-video bg-black relative overflow-hidden border-b border-white/5">
                  {design.texture_url ? (
                    <img
                      src={design.texture_url}
                      alt={design.name}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-800">
                      <Terminal className="w-16 h-16 opacity-20" />
                    </div>
                  )}
                  
                  {/* Privacy Badge */}
                  <div className="absolute top-4 right-4">
                    {design.is_public ? (
                      <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-500 font-mono text-[10px] uppercase tracking-widest backdrop-blur-md">
                        PUBLIC_ACCESS
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-gray-800/40 border border-white/10 text-gray-400 font-mono text-[10px] uppercase tracking-widest backdrop-blur-md">
                        RESTRICTED
                      </div>
                    )}
                  </div>

                  {/* Scanline Effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
                </div>

                {/* Info Panel */}
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-display font-bold text-xl text-white uppercase tracking-wider group-hover:text-grim-cyan transition-colors truncate pr-4">
                      {design.name}
                    </h3>
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-gray-600 uppercase mb-0.5">VALUE</div>
                      <span className="text-grim-cyan font-bold font-display">{formatPrice(design.total_price)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500 mb-6 border-l border-white/10 pl-4 uppercase tracking-widest">
                    <span>UNIT_COUNT: <span className="text-gray-300">{design.key_count || 0}</span></span>
                    <span className="w-1 h-1 rounded-full bg-white/10"></span>
                    <span>LOG_ID: <span className="text-gray-300">{design.id.slice(0, 8)}</span></span>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleAddToCart(design)}
                      disabled={isInCart(design.id)}
                      className={`col-span-2 flex items-center justify-center gap-2 py-3 font-mono text-[10px] font-black uppercase tracking-widest transition-all ${
                        isInCart(design.id)
                          ? 'bg-green-500/10 border border-green-500/30 text-green-500 cursor-default'
                          : 'bg-white text-black hover:bg-grim-cyan hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      }`}
                    >
                      <ShoppingCart className="w-3 h-3" />
                      {isInCart(design.id) ? 'ACQUIRED' : 'ACQUIRE_UNIT'}
                    </button>
                    
                    <button
                      onClick={() => handleViewDesign(design)}
                      className="flex items-center justify-center bg-black/40 border border-white/10 text-white hover:border-grim-cyan hover:text-grim-cyan transition-all"
                      title="EDIT_CONFIGURATION"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(design.id)}
                      className="col-span-3 flex items-center justify-center gap-2 py-2 mt-1 border border-white/5 text-gray-600 hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all font-mono text-[9px] uppercase tracking-[0.2em]"
                    >
                      <Trash2 className="w-3 h-3" />
                      TERMINATE_SEQUENCE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
