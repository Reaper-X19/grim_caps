import { create } from 'zustand'

const useConfiguratorStore = create((set, get) => ({
  // Layers state
  layers: [
    {
      id: 'layer-1',
      name: 'Set 1',
      selectedKeys: [],
      applied: false, // true once user clicks "Apply Selection"
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
    // Block if active layer is not applied
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId)
    if (activeLayer && !activeLayer.applied) return state

    const newId = `layer-${Date.now()}`
    // Save current selection back to active layer before switching
    const updatedLayers = state.layers.map(layer =>
      layer.id === state.activeLayerId
        ? { ...layer, selectedKeys: [...state.selectedKeys] }
        : layer
    )
    return {
      layers: [
        ...updatedLayers,
        {
          id: newId,
          name: `Set ${state.layers.length + 1}`,
          selectedKeys: [],
          applied: false,
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
      activeLayerId: newId,
      selectedKeys: [],
      selectionLocked: false,
      selectionMode: false
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
      keyCustomizations: newCustomizations
    }
  }),

  updateLayer: (id, updates) => set((state) => ({
    layers: state.layers.map(layer =>
      layer.id === id ? { ...layer, ...updates } : layer
    )
  })),

  setActiveLayer: (id) => set((state) => {
    if (id === state.activeLayerId) return state
    // Save current selection back to current layer
    const updatedLayers = state.layers.map(layer =>
      layer.id === state.activeLayerId
        ? { ...layer, selectedKeys: [...state.selectedKeys] }
        : layer
    )
    // Restore target layer's selection
    const targetLayer = updatedLayers.find(l => l.id === id)
    return {
      layers: updatedLayers,
      activeLayerId: id,
      selectedKeys: targetLayer ? [...targetLayer.selectedKeys] : [],
      selectionLocked: targetLayer?.applied || false,
      selectionMode: false
    }
  }),

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

  // Key selection actions
  setSelectedKeys: (keys) => set({ selectedKeys: keys }),

  toggleKeySelection: (keyName) => set((state) => {
    // Block if key is owned by another applied layer
    const owner = Object.entries(state.keyCustomizations).find(
      ([k, v]) => k === keyName && v.layerId !== state.activeLayerId
    )
    if (owner) return state // Key belongs to another layer, reject

    const isSelected = state.selectedKeys.includes(keyName)
    return {
      selectedKeys: isSelected
        ? state.selectedKeys.filter(k => k !== keyName)
        : [...state.selectedKeys, keyName]
    }
  }),

  addToSelection: (keyName) => set((state) => {
    if (state.selectedKeys.includes(keyName)) return state
    return { selectedKeys: [...state.selectedKeys, keyName] }
  }),

  clearSelection: () => set({ selectedKeys: [], selectionLocked: false, selectionMode: false }),

  // Selection mode actions
  setSelectionMode: (active) => set({ selectionMode: active }),

  startSelecting: () => set({ selectionMode: true, selectionLocked: false }),

  // Edit selection on an already-applied layer:
  // Clears keyCustomizations for this layer's keys so ALL selected keys
  // use the unified real-time preview path (same bounding box)
  editSelection: () => set((state) => {
    const newCustomizations = { ...state.keyCustomizations }
    // Remove customizations for keys belonging to this layer
    Object.keys(newCustomizations).forEach(keyName => {
      if (newCustomizations[keyName].layerId === state.activeLayerId) {
        delete newCustomizations[keyName]
      }
    })
    // Un-apply the layer so it goes back to "pending"
    const updatedLayers = state.layers.map(layer =>
      layer.id === state.activeLayerId
        ? { ...layer, applied: false }
        : layer
    )
    return {
      keyCustomizations: newCustomizations,
      layers: updatedLayers,
      selectionMode: true,
      selectionLocked: false
    }
  }),

  // Selection lock actions
  setSelectionLocked: (locked) => set({ selectionLocked: locked }),

  toggleSelectionLock: () => set((state) => ({ selectionLocked: !state.selectionLocked })),

  // Apply current layer settings to selected keys AND mark layer as applied
  applyToSelectedKeys: () => set((state) => {
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId)
    if (!activeLayer || state.selectedKeys.length === 0) return state

    const newCustomizations = { ...state.keyCustomizations }

    // Store the current selection as a group
    const selectedKeysList = [...state.selectedKeys]

    // Apply customization to selected keys
    state.selectedKeys.forEach(keyName => {
      newCustomizations[keyName] = {
        layerId: state.activeLayerId,
        textureUrl: activeLayer.textureUrl,
        baseColor: activeLayer.baseColor,
        textureTransform: { ...activeLayer.textureTransform },
        boundingBox: null,
        keyGroup: selectedKeysList
      }
    })

    // Update layer: save keys AND mark as applied
    const updatedLayers = state.layers.map(layer =>
      layer.id === state.activeLayerId
        ? { ...layer, selectedKeys: selectedKeysList, applied: true }
        : layer
    )

    return {
      keyCustomizations: newCustomizations,
      layers: updatedLayers,
      selectedKeys: selectedKeysList,
      selectionMode: false,
      selectionLocked: true
    }
  }),

  // Clear customization for selected keys (also un-applies the layer)
  clearSelectedKeys: () => set((state) => {
    const newCustomizations = { ...state.keyCustomizations }
    state.selectedKeys.forEach(keyName => {
      delete newCustomizations[keyName]
    })
    // Un-apply the active layer since its keys are cleared
    const updatedLayers = state.layers.map(layer =>
      layer.id === state.activeLayerId
        ? { ...layer, applied: false, selectedKeys: [] }
        : layer
    )
    return {
      keyCustomizations: newCustomizations,
      layers: updatedLayers,
      selectedKeys: [],
      selectionLocked: false,
      selectionMode: false
    }
  }),

  // Copy style from the first selected key
  copyStyle: () => set((state) => {
    if (state.selectedKeys.length === 0) return state

    const firstKey = state.selectedKeys[0]
    const customization = state.keyCustomizations[firstKey]

    if (!customization) {
      // Copy from active layer if key has no customization
      const activeLayer = state.layers.find(l => l.id === state.activeLayerId)
      return {
        copiedStyle: {
          textureUrl: activeLayer.textureUrl,
          baseColor: activeLayer.baseColor,
          textureTransform: { ...activeLayer.textureTransform }
        }
      }
    }

    return {
      copiedStyle: {
        textureUrl: customization.textureUrl,
        baseColor: customization.baseColor,
        textureTransform: { ...customization.textureTransform }
      }
    }
  }),

  // Paste copied style to selected keys
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
      console.warn('Cannot paste to keys already used in other sets:', conflicts)
      return state
    }

    // Create new keyGroup from current selection for correct bounding box
    const selectedKeysList = [...state.selectedKeys]

    // Apply copied style with NEW keyGroup
    state.selectedKeys.forEach(keyName => {
      newCustomizations[keyName] = {
        layerId: state.activeLayerId,
        ...state.copiedStyle,
        keyGroup: selectedKeysList // CRITICAL: Use new selection as keyGroup
      }
    })

    return {
      keyCustomizations: newCustomizations,
      selectedKeys: [],
      selectionLocked: false, // Unlock after paste
      selectionMode: false // Exit selection mode
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

  // Check if a key is owned by another applied layer
  isKeyOwnedByOtherLayer: (keyName, currentLayerId) => {
    const state = get()
    const custom = state.keyCustomizations[keyName]
    if (!custom) return null
    if (custom.layerId === currentLayerId) return null
    // Find the owning layer name
    const owningLayer = state.layers.find(l => l.id === custom.layerId)
    return owningLayer ? owningLayer.name : custom.layerId
  },

  // Get map of all keys owned by applied layers (for rendering blocked indicators)
  getOwnedKeysMap: () => {
    const state = get()
    const map = {}
    Object.entries(state.keyCustomizations).forEach(([keyName, custom]) => {
      map[keyName] = custom.layerId
    })
    return map
  },

  // Load a saved design into the configurator
  loadDesign: (designData) => {
    set({
      selectedKeys: designData.selected_keys || [],
      layers: [
        {
          id: 'layer-1',
          name: 'Set 1',
          selectedKeys: designData.selected_keys || [],
          applied: (designData.selected_keys || []).length > 0, // Auto-apply loaded designs
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
      keyCustomizations: {},
      selectionLocked: false,
      selectionMode: false,
      // Track which design was loaded so Save can offer overwrite
      loadedDesignId: designData.id || null,
      loadedDesignMeta: designData.id ? {
        title: designData.name || '',
        description: designData.description || '',
        category: designData.category || 'custom',
        tags: designData.tags || [],
        isPublic: designData.is_public || false
      } : null
    })
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
        applied: false,
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

