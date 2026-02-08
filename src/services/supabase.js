/**
 * Supabase Service Layer
 * 
 * Centralized service for all Supabase operations:
 * - Design CRUD operations
 * - Image uploads to Supabase Storage
 * - Gallery queries with filters
 * - Contact form submissions
 */

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a mock client for development when credentials are missing
const createMockClient = () => ({
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    delete: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    eq: function() { return this },
    single: function() { return this }
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      remove: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  },
  rpc: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
})

// Check if credentials are valid
const hasValidCredentials = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && !supabaseAnonKey.includes('placeholder')

if (!hasValidCredentials) {
  console.warn('⚠️  Supabase credentials not configured. Using mock client for development.')
  console.warn('   Add real credentials to .env file to enable database features.')
}

export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient()

// ============================================================================
// DESIGN OPERATIONS
// ============================================================================

/**
 * Save a new design to the database
 * @param {Object} designData - Design data from configurator
 * @returns {Promise<Object>} Saved design with ID
 */
export async function saveDesign(designData) {
  const {
    title,
    description,
    authorName,
    authorEmail,
    textureUrl,
    textureTransform,
    selectedKeys,
    keyGroup,
    baseColor,
    keyCount,
    pricePerKey,
    totalPrice,
    isPublic = false,
    category = 'custom',
    tags = []
  } = designData

  const { data, error } = await supabase
    .from('user_designs')
    .insert([
      {
        name: title,
        description,
        author_name: authorName,
        author_email: authorEmail,
        texture_url: textureUrl,
        texture_config: textureTransform,
        selected_keys: selectedKeys,
        key_group: keyGroup,
        base_color: baseColor,
        key_count: keyCount,
        price_per_key: pricePerKey,
        total_price: totalPrice,
        is_public: isPublic,
        category,
        tags
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error saving design:', error)
    throw new Error(`Failed to save design: ${error.message}`)
  }

  return data
}

/**
 * Update an existing design
 * @param {string} designId - Design ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated design
 */
export async function updateDesign(designId, updates) {
  const { data, error } = await supabase
    .from('user_designs')
    .update(updates)
    .eq('id', designId)
    .select()
    .single()

  if (error) {
    console.error('Error updating design:', error)
    throw new Error(`Failed to update design: ${error.message}`)
  }

  return data
}

/**
 * Get a single design by ID
 * @param {string} designId - Design ID
 * @returns {Promise<Object>} Design data
 */
export async function getDesign(designId) {
  const { data, error } = await supabase
    .from('user_designs')
    .select('*')
    .eq('id', designId)
    .single()

  if (error) {
    console.error('Error fetching design:', error)
    throw new Error(`Failed to fetch design: ${error.message}`)
  }

  return data
}

/**
 * Delete a design
 * @param {string} designId - Design ID
 * @returns {Promise<void>}
 */
export async function deleteDesign(designId) {
  const { error } = await supabase
    .from('user_designs')
    .delete()
    .eq('id', designId)

  if (error) {
    console.error('Error deleting design:', error)
    throw new Error(`Failed to delete design: ${error.message}`)
  }
}

// ============================================================================
// GALLERY QUERIES
// ============================================================================

/**
 * Fetch public designs for gallery with filters
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of designs
 */
export async function fetchGalleryDesigns({
  category = null,
  sortBy = 'created_at',
  sortOrder = 'desc',
  limit = 20,
  offset = 0
} = {}) {
  let query = supabase
    .from('user_designs')
    .select('*')
    .eq('is_public', true)

  // Apply category filter
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  // Apply sorting
  switch (sortBy) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'liked':
      query = query.order('likes_count', { ascending: false })
      break
    case 'copied':
      query = query.order('copy_count', { ascending: false })
      break
    case 'featured':
      query = query.eq('is_featured', true).order('created_at', { ascending: false })
      break
    default:
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching gallery designs:', error)
    throw new Error(`Failed to fetch designs: ${error.message}`)
  }

  return data || []
}

/**
 * Increment like count for a design
 * @param {string} designId - Design ID
 * @returns {Promise<Object>} Updated design
 */
export async function likeDesign(designId) {
  const { data, error } = await supabase.rpc('increment_likes', {
    design_id_param: designId
  })

  if (error) {
    console.error('Error liking design:', error)
    throw new Error(`Failed to like design: ${error.message}`)
  }

  return data
}

/**
 * Increment copy count for a design
 * @param {string} designId - Design ID
 * @returns {Promise<Object>} Updated design
 */
export async function incrementCopyCount(designId) {
  const { data, error } = await supabase.rpc('increment_copies', {
    design_id_param: designId
  })

  if (error) {
    console.error('Error incrementing copy count:', error)
    throw new Error(`Failed to increment copy count: ${error.message}`)
  }

  return data
}

// ============================================================================
// IMAGE UPLOAD
// ============================================================================

/**
 * Upload texture image to Supabase Storage
 * @param {File} file - Image file
 * @param {string} designId - Design ID (for folder organization)
 * @returns {Promise<string>} Public URL of uploaded image
 */
export async function uploadTexture(file, designId) {
  // Validate file
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit')
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPG, PNG, WebP, or SVG')
  }

  // Generate unique filename
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const fileName = `${designId}_${timestamp}.${fileExt}`
  const filePath = `${fileName}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('textures')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Error uploading texture:', error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('textures')
    .getPublicUrl(filePath)

  return publicUrl
}

/**
 * Delete texture from storage
 * @param {string} textureUrl - Full URL of texture
 * @returns {Promise<void>}
 */
export async function deleteTexture(textureUrl) {
  // Extract file path from URL
  const urlParts = textureUrl.split('/storage/v1/object/public/designs/')
  if (urlParts.length < 2) {
    console.error('Invalid texture URL format')
    return
  }

  const filePath = urlParts[1]

  const { error } = await supabase.storage
    .from('designs')
    .remove([filePath])

  if (error) {
    console.error('Error deleting texture:', error)
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

// ============================================================================
// CONTACT FORM / INQUIRIES
// ============================================================================

/**
 * Submit contact form inquiry
 * @param {Object} inquiryData - Form data
 * @returns {Promise<Object>} Saved inquiry
 */
export async function submitInquiry(inquiryData) {
  const {
    name,
    email,
    phone,
    message,
    designIds = [],
    cartSummary = null
  } = inquiryData

  const { data, error } = await supabase
    .from('inquiries')
    .insert([
      {
        name,
        email,
        phone,
        message,
        design_ids: designIds,
        cart_summary: cartSummary,
        status: 'pending'
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error submitting inquiry:', error)
    throw new Error(`Failed to submit inquiry: ${error.message}`)
  }

  return data
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if Supabase is connected
 * @returns {Promise<boolean>}
 */
export async function checkConnection() {
  try {
    const { error } = await supabase.from('user_designs').select('id').limit(1)
    return !error
  } catch (err) {
    console.error('Supabase connection error:', err)
    return false
  }
}

/**
 * Get storage usage stats (for admin)
 * @returns {Promise<Object>}
 */
export async function getStorageStats() {
  const { data, error } = await supabase.storage
    .from('designs')
    .list('textures', {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (error) {
    console.error('Error fetching storage stats:', error)
    return { totalFiles: 0, totalSize: 0 }
  }

  const totalFiles = data.length
  const totalSize = data.reduce((sum, file) => sum + (file.metadata?.size || 0), 0)

  return {
    totalFiles,
    totalSize,
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
  }
}

export default {
  // Design operations
  saveDesign,
  updateDesign,
  getDesign,
  deleteDesign,
  
  // Gallery
  fetchGalleryDesigns,
  likeDesign,
  incrementCopyCount,
  
  // Images
  uploadTexture,
  deleteTexture,
  
  // Inquiries
  submitInquiry,
  
  // Utilities
  checkConnection,
  getStorageStats
}
