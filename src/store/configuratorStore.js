import { create } from 'zustand'

const useConfiguratorStore = create((set, get) => ({
  // Layers state
  layers: [
    {
      id: 'layer-1',
      name: 'Set 1',
      selectedKeys: [],
      texture: null,
      textureUrl: null,
      baseColor: '#ffffff',
      textureTransform: {
        zoom: 1,
        positionX: 0,
        positionY: 0,
        rotation: 0
      },
      boundingBox: null, // Stores { min: Vector2, max: Vector2 } for texture mapping
      visible: true
    }
  ],

  activeLayerId: 'layer-1',

  // Key selection state (global, not per-layer)
  selectedKeys: [],
  selectionLocked: false, // When true, selection is locked and user must click "Edit Selection" to modify
  selectionMode: false, // When true, user can click keys to select them

  // Per-key customizations: { keyName: { layerId, texture, baseColor, textureTransform } }
  keyCustomizations: {},

  // Copied style for paste functionality
  copiedStyle: null,

  // Loaded design tracking (for overwrite vs. new save)
  loadedDesignId: null,
  loadedDesignMeta: null,

  // Actions
  addLayer: () => set((state) => {
    // Prevent adding a new layer if the active layer has no keys applied
    const activeLayerKeys = Object.values(state.keyCustomizations).filter(c => c.layerId === state.activeLayerId)
    if (activeLayerKeys.length === 0 && state.layers.length > 0) {
      return { ...state, selectionConflict: 'Please apply selection to the current layer before adding a new one.' }
    }

    const newId = `layer-${Date.now()}`
    return {
      selectionConflict: null,
      layers: [
        ...state.layers,
        {
          id: newId,
          name: `Set ${state.layers.length + 1}`,
          selectedKeys: [],
          texture: null,
          textureUrl: null,
          baseColor: '#ffffff',
          textureTransform: {
            zoom: 1,
            positionX: 0,
            positionY: 0,
            rotation: 0
          },
          boundingBox: null,
          visible: true
        }
      ],
      activeLayerId: newId
    }
  }),

  removeLayer: (id) => set((state) => {
    const newLayers = state.layers.filter(layer => layer.id !== id)
    if (newLayers.length === 0) {
      // Always keep at least one layer
      return state
    }

    // Remove key customizations for this layer
    const newCustomizations = { ...state.keyCustomizations }
    Object.keys(newCustomizations).forEach(keyName => {
      if (newCustomizations[keyName].layerId === id) {
        delete newCustomizations[keyName]
      }
    })

    return {
      layers: newLayers,
      activeLayerId: state.activeLayerId === id ? newLayers[0].id : state.activeLayerId,
      keyCustomizations: newCustomizations,
      selectionConflict: null
    }
  }),

  updateLayer: (id, updates) => set((state) => ({
    layers: state.layers.map(layer =>
      layer.id === id ? { ...layer, ...updates } : layer
    )
  })),

  setActiveLayer: (id) => set({ activeLayerId: id, selectionConflict: null }),

  selectKeys: (layerId, keys) => set((state) => ({
    layers: state.layers.map(layer =>
      layer.id === layerId ? { ...layer, selectedKeys: keys } : layer
    )
  })),

  uploadTexture: (layerId, file) => set((state) => {
    // Revoke old blob URL to prevent memory leaks
    const oldLayer = state.layers.find(l => l.id === layerId)
    if (oldLayer?.textureUrl) {
      URL.revokeObjectURL(oldLayer.textureUrl)
    }

    const textureUrl = URL.createObjectURL(file)

    // Also update all keyCustomizations that belong to this layer
    const newCustomizations = { ...state.keyCustomizations }
    Object.keys(newCustomizations).forEach(keyName => {
      if (newCustomizations[keyName].layerId === layerId) {
        newCustomizations[keyName] = {
          ...newCustomizations[keyName],
          textureUrl
        }
      }
    })

    return {
      layers: state.layers.map(layer =>
        layer.id === layerId
          ? { ...layer, texture: file, textureUrl }
          : layer
      ),
      keyCustomizations: newCustomizations
    }
  }),

  updateTextureTransform: (layerId, transform) => set((state) => {
    // Update the layer's transform
    const updatedLayers = state.layers.map(layer =>
      layer.id === layerId
        ? { ...layer, textureTransform: { ...layer.textureTransform, ...transform } }
        : layer
    )

    // ALSO update all applied keys that belong to this layer
    const newCustomizations = { ...state.keyCustomizations }
    Object.keys(newCustomizations).forEach(keyName => {
      if (newCustomizations[keyName].layerId === layerId) {
        newCustomizations[keyName] = {
          ...newCustomizations[keyName],
          textureTransform: {
            ...newCustomizations[keyName].textureTransform,
            ...transform
          }
        }
      }
    })

    return {
      layers: updatedLayers,
      keyCustomizations: newCustomizations
    }
  }),

  updateBaseColor: (layerId, color) => set((state) => {
    // Update the layer's base color
    const updatedLayers = state.layers.map(layer =>
      layer.id === layerId ? { ...layer, baseColor: color } : layer
    )

    // ALSO update all applied keys that belong to this layer
    const newCustomizations = { ...state.keyCustomizations }
    Object.keys(newCustomizations).forEach(keyName => {
      if (newCustomizations[keyName].layerId === layerId) {
        newCustomizations[keyName] = {
          ...newCustomizations[keyName],
          baseColor: color
        }
      }
    })

    return {
      layers: updatedLayers,
      keyCustomizations: newCustomizations
    }
  }),

  toggleLayerVisibility: (layerId) => set((state) => ({
    layers: state.layers.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    )
  })),

  setViewMode: (mode) => set({ viewMode: mode }),

  resetTextureTransform: (layerId) => set((state) => ({
    layers: state.layers.map(layer =>
      layer.id === layerId
        ? {
          ...layer,
          textureTransform: {
            zoom: 1,
            positionX: 0,
            positionY: 0,
            rotation: 0
          }
        }
        : layer
    )
  })),

  // UI feedback state for selection errors
  selectionConflict: null,
  clearSelectionConflict: () => set({ selectionConflict: null }),

  // Key selection actions - ENFORCING UNIQUENESS ACROSS LAYERS
  setSelectedKeys: (keys) => set((state) => {
    // Filter out keys that belong to OTHER layers
    const validKeys = []
    const conflictKeys = []
    
    keys.forEach(key => {
      const existing = state.keyCustomizations[key]
      if (existing && existing.layerId !== state.activeLayerId) {
        conflictKeys.push(key)
      } else {
        validKeys.push(key)
      }
    })

    return {
      selectedKeys: validKeys,
      selectionConflict: conflictKeys.length > 0 ? 'Some keys were skipped because they are already used in another layer.' : null
    }
  }),

  toggleKeySelection: (keyName) => set((state) => {
    // Check for cross-layer conflict
    const existing = state.keyCustomizations[keyName]
    if (existing && existing.layerId !== state.activeLayerId) {
      return { selectionConflict: `Key ${keyName} is already used in another layer.` }
    }

    const isSelected = state.selectedKeys.includes(keyName)
    return {
      selectedKeys: isSelected
        ? state.selectedKeys.filter(k => k !== keyName)
        : [...state.selectedKeys, keyName],
      selectionConflict: null // Clear conflict on success
    }
  }),

  addToSelection: (keyName) => set((state) => {
    // Check for cross-layer conflict
    const existing = state.keyCustomizations[keyName]
    if (existing && existing.layerId !== state.activeLayerId) {
      return { selectionConflict: `Key ${keyName} is already used in another layer.` }
    }

    if (state.selectedKeys.includes(keyName)) return state
    return { 
      selectedKeys: [...state.selectedKeys, keyName],
      selectionConflict: null
    }
  }),

  clearSelection: () => set({ selectedKeys: [], selectionLocked: false, selectionMode: false, selectionConflict: null }),

  // Selection mode actions
  setSelectionMode: (active) => set({ selectionMode: active }),

  startSelecting: () => set({ selectionMode: true, selectionLocked: false }),

  // Selection lock actions
  setSelectionLocked: (locked) => set({ selectionLocked: locked }),

  toggleSelectionLock: () => set((state) => ({ selectionLocked: !state.selectionLocked })),

  // Apply current layer settings to selected keys
  applyToSelectedKeys: () => set((state) => {
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId)
    if (!activeLayer || state.selectedKeys.length === 0) return state

    const newCustomizations = { ...state.keyCustomizations }

    // Store the current selection as a group - this is critical for bounding box calculation
    const selectedKeysList = [...state.selectedKeys]

    // Apply customization to selected keys
    state.selectedKeys.forEach(keyName => {
      newCustomizations[keyName] = {
        layerId: state.activeLayerId,
        textureUrl: activeLayer.textureUrl,
        baseColor: activeLayer.baseColor,
        textureTransform: { ...activeLayer.textureTransform },
        // Fix: Do NOT use activeLayer.boundingBox as it might be stale due to race conditions.
        // Instead, set to null to force KeyboardModel to calculate it fresh from keyGroup.
        boundingBox: null,
        // Store the group of keys this belongs to for unified texture mapping
        keyGroup: selectedKeysList
      }
    })

    // Update layer's selectedKeys to match what was applied
    const updatedLayers = state.layers.map(layer =>
      layer.id === state.activeLayerId
        ? { ...layer, selectedKeys: selectedKeysList }
        : layer
    )

    return {
      keyCustomizations: newCustomizations,
      layers: updatedLayers,
      // KEEP SELECTION ACTIVE AND LOCKED for immediate editing
      selectedKeys: selectedKeysList,
      selectionMode: false, // Exit selection mode (shows "Edit Selection" button)
      selectionLocked: true // Lock selection to prevent accidental changes
    }
  }),

  // Clear customization for selected keys
  clearSelectedKeys: () => set((state) => {
    const newCustomizations = { ...state.keyCustomizations }
    state.selectedKeys.forEach(keyName => {
      delete newCustomizations[keyName]
    })
    return {
      keyCustomizations: newCustomizations,
      selectedKeys: [],
      selectionLocked: false, // Fix: Unlock selection so user can select again
      selectionMode: false    // Fix: Reset mode
    }
  }),

  // Copy style from the first selected key or active layer
  copyStyle: () => set((state) => {
    // If we have selected keys, copy from the first one
    if (state.selectedKeys.length > 0) {
      const firstKey = state.selectedKeys[0]
      const customization = state.keyCustomizations[firstKey]
      
      if (customization) {
        return {
          copiedStyle: {
            textureUrl: customization.textureUrl,
            baseColor: customization.baseColor,
            textureTransform: { ...customization.textureTransform }
          }
        }
      }
    }

    // Otherwise, or if key has no customization, copy from the active layer
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId)
    if (activeLayer) {
      return {
        copiedStyle: {
          textureUrl: activeLayer.textureUrl,
          baseColor: activeLayer.baseColor,
          textureTransform: { ...activeLayer.textureTransform }
        }
      }
    }
    
    return state
  }),

  // Paste copied style to selected keys AND the active layer
  pasteStyle: () => set((state) => {
    if (!state.copiedStyle || state.selectedKeys.length === 0) return state

    const newCustomizations = { ...state.keyCustomizations }

    // Check for conflicts
    const conflicts = []
    state.selectedKeys.forEach(keyName => {
      const existing = newCustomizations[keyName]
      if (existing && existing.layerId !== state.activeLayerId) {
        conflicts.push(keyName)
      }
    })

    if (conflicts.length > 0) {
      return { selectionConflict: 'Cannot paste to keys already used in other layers.' }
    }

    // Create new keyGroup from current selection for correct bounding box
    const selectedKeysList = [...state.selectedKeys]

    // Apply copied style with NEW keyGroup
    state.selectedKeys.forEach(keyName => {
      newCustomizations[keyName] = {
        layerId: state.activeLayerId,
        textureUrl: state.copiedStyle.textureUrl,
        baseColor: state.copiedStyle.baseColor,
        textureTransform: { ...state.copiedStyle.textureTransform },
        boundingBox: null, // Force recalculation
        keyGroup: selectedKeysList // CRITICAL: Use new selection as keyGroup
      }
    })

    // UPDATE THE ACTIVE LAYER ITSELF so the Customizer UI shows the pasted style
    const updatedLayers = state.layers.map(layer => 
      layer.id === state.activeLayerId
        ? {
            ...layer,
            textureUrl: state.copiedStyle.textureUrl,
            baseColor: state.copiedStyle.baseColor,
            textureTransform: { ...state.copiedStyle.textureTransform },
            selectedKeys: selectedKeysList
          }
        : layer
    )

    return {
      layers: updatedLayers,
      keyCustomizations: newCustomizations,
      selectedKeys: [],
      selectionLocked: false, // Unlock after paste
      selectionMode: false, // Exit selection mode
      selectionConflict: null
    }
  }),

  // Get keys assigned to a specific layer
  getLayerKeys: (layerId) => {
    const state = get()
    return Object.keys(state.keyCustomizations).filter(
      keyName => state.keyCustomizations[keyName].layerId === layerId
    )
  },

  // Check if a key is assigned to any layer
  isKeyAssigned: (keyName) => {
    const state = get()
    return keyName in state.keyCustomizations
  },

  // Get the layer ID that a key is assigned to
  getKeyLayer: (keyName) => {
    const state = get()
    return state.keyCustomizations[keyName]?.layerId || null
  },

  // Load a saved design into the configurator
  loadDesign: (designData) => {
    // Check if this is a newer multi-layer design
    if (designData.texture_config?.multilayers) {
      const multilayers = designData.texture_config.multilayers
      set({
        selectedKeys: [], // Usually empty when a saved design is first loaded
        layers: multilayers.layers.map(layer => ({
          ...layer,
          texture: null, // We have a URL, but no local File object
          // Restore bounding box from serialized JSON if present
          boundingBox: layer.boundingBox ? {
            min: layer.boundingBox.min,
            max: layer.boundingBox.max
          } : null
        })),
        activeLayerId: multilayers.layers[0]?.id || 'layer-1',
        keyCustomizations: multilayers.keyCustomizations || {},
        selectionLocked: false,
        selectionMode: false,
        selectionConflict: null,
        
        // Track which design was loaded
        loadedDesignId: designData.id || null,
        loadedDesignMeta: designData.id ? {
          title: designData.name || '',
          description: designData.description || '',
          category: designData.category || 'custom',
          tags: designData.tags || [],
          isPublic: designData.is_public || false
        } : null
      })
    } else {
      // Legacy single-layer fallback
      set({
        selectedKeys: designData.selected_keys || [],
        layers: [
          {
            id: 'layer-1',
            name: 'Set 1',
            selectedKeys: designData.selected_keys || [],
            texture: null,
            textureUrl: designData.texture_url || null,
            baseColor: designData.base_color || '#ffffff',
            textureTransform: designData.texture_config || {
              zoom: 1,
              positionX: 0,
              positionY: 0,
              rotation: 0
            },
            boundingBox: (designData.texture_config?.boundsMin && designData.texture_config?.boundsMax) ? {
              min: designData.texture_config.boundsMin,
              max: designData.texture_config.boundsMax
            } : null,
            visible: true
          }
        ],
        activeLayerId: 'layer-1',
        
        // Emulate key customizations for the single layer
        keyCustomizations: (designData.selected_keys || []).reduce((acc, key) => ({
          ...acc,
          [key]: {
            layerId: 'layer-1',
            textureUrl: designData.texture_url || null,
            baseColor: designData.base_color || '#ffffff',
            textureTransform: designData.texture_config || { zoom: 1, positionX: 0, positionY: 0, rotation: 0 },
            boundingBox: null,
            keyGroup: designData.selected_keys || []
          }
        }), {}),
        
        selectionLocked: false,
        selectionMode: false,
        selectionConflict: null,
        
        // Track which design was loaded
        loadedDesignId: designData.id || null,
        loadedDesignMeta: designData.id ? {
          title: designData.name || '',
          description: designData.description || '',
          category: designData.category || 'custom',
          tags: designData.tags || [],
          isPublic: designData.is_public || false
        } : null
      })
    }
  },

  // Clear loaded design tracking (e.g. when starting fresh)
  clearLoadedDesign: () => set({ loadedDesignId: null, loadedDesignMeta: null }),

  // Set loaded design tracking (e.g. after saving a design)
  setLoadedDesign: (designId, meta) => set({
    loadedDesignId: designId,
    loadedDesignMeta: meta
  }),
  // Reset store to initial state
  reset: () => set({
    layers: [
      {
        id: 'layer-1',
        name: 'Set 1',
        selectedKeys: [],
        texture: null,
        textureUrl: null,
        baseColor: '#ffffff',
        textureTransform: {
          zoom: 1,
          positionX: 0,
          positionY: 0,
          rotation: 0
        },
        boundingBox: null,
        visible: true
      }
    ],
    activeLayerId: 'layer-1',
    selectedKeys: [],
    selectionLocked: false,
    selectionMode: false,
    keyCustomizations: {},
    copiedStyle: null,
    loadedDesignId: null,
    loadedDesignMeta: null
  })
}))

export default useConfiguratorStore

