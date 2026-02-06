import { create } from 'zustand'

const useConfiguratorStore = create((set, get) => ({
  // Layers state
  layers: [
    {
      id: 'layer-1',
      name: 'Layer 1',
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
      visible: true
    }
  ],
  
  activeLayerId: 'layer-1',
  viewMode: 'realistic',
  
  // Key selection state (global, not per-layer)
  selectedKeys: [],
  
  // Per-key customizations: { keyName: { layerId, texture, baseColor, textureTransform } }
  keyCustomizations: {},
  
  // Copied style for paste functionality
  copiedStyle: null,
  
  // Actions
  addLayer: () => set((state) => {
    const newId = `layer-${Date.now()}`
    return {
      layers: [
        ...state.layers,
        {
          id: newId,
          name: `Layer ${state.layers.length + 1}`,
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
      keyCustomizations: newCustomizations
    }
  }),
  
  updateLayer: (id, updates) => set((state) => ({
    layers: state.layers.map(layer =>
      layer.id === id ? { ...layer, ...updates } : layer
    )
  })),
  
  setActiveLayer: (id) => set({ activeLayerId: id }),
  
  selectKeys: (layerId, keys) => set((state) => ({
    layers: state.layers.map(layer =>
      layer.id === layerId ? { ...layer, selectedKeys: keys } : layer
    )
  })),
  
  uploadTexture: (layerId, file) => set((state) => {
    const textureUrl = URL.createObjectURL(file)
    return {
      layers: state.layers.map(layer =>
        layer.id === layerId
          ? { ...layer, texture: file, textureUrl }
          : layer
      )
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
  
  clearSelection: () => set({ selectedKeys: [] }),
  
  // Apply current layer settings to selected keys
  applyToSelectedKeys: () => set((state) => {
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId)
    if (!activeLayer || state.selectedKeys.length === 0) return state
    
    const newCustomizations = { ...state.keyCustomizations }
    
    // Check for conflicts: keys already assigned to other layers
    const conflicts = []
    state.selectedKeys.forEach(keyName => {
      const existing = newCustomizations[keyName]
      if (existing && existing.layerId !== state.activeLayerId) {
        conflicts.push(keyName)
      }
    })
    
    // If there are conflicts, don't apply (user must clear those keys first)
    if (conflicts.length > 0) {
      console.warn('Cannot assign keys already used in other layers:', conflicts)
      return state
    }
    
    // Store the current selection as a group - this is critical for bounding box calculation
    const selectedKeysList = [...state.selectedKeys]
    
    // Apply customization to selected keys
    state.selectedKeys.forEach(keyName => {
      newCustomizations[keyName] = {
        layerId: state.activeLayerId,
        textureUrl: activeLayer.textureUrl,
        baseColor: activeLayer.baseColor,
        textureTransform: { ...activeLayer.textureTransform },
        // Store the group of keys this belongs to for unified texture mapping
        keyGroup: selectedKeysList
      }
    })
    
    return {
      keyCustomizations: newCustomizations,
      selectedKeys: [] // Clear selection after applying
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
      selectedKeys: []
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
      console.warn('Cannot paste to keys already used in other layers:', conflicts)
      return state
    }
    
    // Apply copied style
    state.selectedKeys.forEach(keyName => {
      newCustomizations[keyName] = {
        layerId: state.activeLayerId,
        ...state.copiedStyle
      }
    })
    
    return {
      keyCustomizations: newCustomizations,
      selectedKeys: []
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
  }
}))

export default useConfiguratorStore

