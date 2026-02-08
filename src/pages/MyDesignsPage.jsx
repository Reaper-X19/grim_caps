import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Edit, Eye, Lock, Globe } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { supabase } from '../services/supabase'
import { formatPrice } from '../utils/pricing'

export default function MyDesignsPage() {
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'public', 'private'
  const user = useAuthStore(state => state.user)
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

  const filteredDesigns = designs.filter(design => {
    if (filter === 'all') return true
    if (filter === 'public') return design.is_public
    if (filter === 'private') return !design.is_public
    return true
  })

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-display font-bold mb-4">
            My <span className="text-grim-accent">Designs</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your custom keycap designs
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-grim-accent text-black'
                : 'glass hover:bg-gray-800/50'
            }`}
          >
            All ({designs.length})
          </button>
          <button
            onClick={() => setFilter('public')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              filter === 'public'
                ? 'bg-grim-accent text-black'
                : 'glass hover:bg-gray-800/50'
            }`}
          >
            Public ({designs.filter(d => d.is_public).length})
          </button>
          <button
            onClick={() => setFilter('private')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              filter === 'private'
                ? 'bg-grim-accent text-black'
                : 'glass hover:bg-gray-800/50'
            }`}
          >
            Private ({designs.filter(d => !d.is_public).length})
          </button>
        </div>

        {/* Designs Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-grim-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading your designs...</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl">
            <p className="text-gray-400 text-lg mb-4">
              {filter === 'all' 
                ? "You haven't created any designs yet"
                : `No ${filter} designs found`}
            </p>
            <button
              onClick={() => navigate('/configurator')}
              className="px-6 py-3 bg-gradient-to-r from-grim-accent to-grim-blue text-black font-bold rounded-lg hover:scale-105 transition-all duration-300"
            >
              Create Your First Design
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDesigns.map(design => (
              <div key={design.id} className="glass rounded-xl overflow-hidden hover:scale-105 transition-all duration-300">
                {/* Image */}
                <div className="aspect-square bg-gray-900 relative">
                  {design.texture_url ? (
                    <img
                      src={design.texture_url}
                      alt={design.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <Eye className="w-24 h-24" />
                    </div>
                  )}
                  
                  {/* Privacy Badge */}
                  <div className="absolute top-3 right-3">
                    {design.is_public ? (
                      <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full flex items-center gap-1 text-green-400 text-xs font-semibold">
                        <Globe className="w-3 h-3" />
                        Public
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-gray-800/80 border border-gray-700 rounded-full flex items-center gap-1 text-gray-300 text-xs font-semibold">
                        <Lock className="w-3 h-3" />
                        Private
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 truncate">{design.name}</h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span>{design.key_count || 0} keys</span>
                    <span className="text-grim-accent font-semibold">
                      {formatPrice(design.total_price)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/gallery`)}
                      className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(design.id)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
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
