import { useEffect } from 'react'
import useConfiguratorStore from '../../store/configuratorStore'

export default function TextureControls() {
  const activeLayerId = useConfiguratorStore((state) => state.activeLayerId)
  const activeLayer = useConfiguratorStore((state) => 
    state.layers.find(layer => layer.id === activeLayerId)
  )
  const updateTextureTransform = useConfiguratorStore((state) => state.updateTextureTransform)
  const resetTextureTransform = useConfiguratorStore((state) => state.resetTextureTransform)
  
  if (!activeLayer) return null
  
  const { zoom, positionX, positionY, rotation } = activeLayer.textureTransform
  
  // Calculate max position based on zoom to prevent texture from exceeding edges
  // CRITICAL: Higher zoom (scaled up) = MORE movement needed, BUT capped to prevent bleeding
  // At zoom 1.0, allow ±20 units (reduced from ±30)
  // At zoom 3.0, allow ±50 units (reduced from ±90 to prevent bleeding beyond edges)
  const getMaxPosition = (currentZoom) => {
    const baseMax = 20 // Reduced from 30
    const maxPos = baseMax * currentZoom
    return Math.min(50, Math.max(20, maxPos)) // Range: 20 to 50 (reduced from 30-90)
  }
  
  const maxPosition = getMaxPosition(zoom)
  
  const handleChange = (property, value) => {
    let finalValue = parseFloat(value)
    
    // Clamp position values to prevent exceeding edges
    if (property === 'positionX' || property === 'positionY') {
      finalValue = Math.max(-maxPosition, Math.min(maxPosition, finalValue))
    }
    
    updateTextureTransform(activeLayerId, { [property]: finalValue })
  }
  
  // Auto-clamp existing values when zoom changes
  useEffect(() => {
    if (Math.abs(positionX) > maxPosition || Math.abs(positionY) > maxPosition) {
      const clampedX = Math.max(-maxPosition, Math.min(maxPosition, positionX))
      const clampedY = Math.max(-maxPosition, Math.min(maxPosition, positionY))
      
      if (clampedX !== positionX || clampedY !== positionY) {
        updateTextureTransform(activeLayerId, {
          positionX: clampedX,
          positionY: clampedY
        })
      }
    }
  }, [zoom, maxPosition, positionX, positionY, activeLayerId, updateTextureTransform])
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-display font-semibold text-grim-accent">Texture Controls</h3>
        <button
          onClick={() => resetTextureTransform(activeLayerId)}
          className="px-3 py-1.5 text-xs bg-grim-dark border border-gray-600 rounded hover:border-grim-accent transition-colors"
        >
          Reset
        </button>
      </div>
      
      {/* Zoom */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">Zoom</label>
          <span className="text-xs text-gray-500 font-mono">{zoom.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => handleChange('zoom', e.target.value)}
          className="w-full h-2 bg-grim-dark rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
      
      {/* Position X - CLAMPED BASED ON ZOOM */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">Position X</label>
          <span className="text-xs text-gray-500 font-mono">{positionX.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={-maxPosition}
          max={maxPosition}
          step="1"
          value={positionX}
          onChange={(e) => handleChange('positionX', e.target.value)}
          className="w-full h-2 bg-grim-dark rounded-lg appearance-none cursor-pointer slider"
        />
        <p className="text-xs text-gray-600 italic">Range: ±{maxPosition.toFixed(0)} (auto-adjusted for zoom)</p>
      </div>
      
      {/* Position Y - CLAMPED BASED ON ZOOM */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">Position Y</label>
          <span className="text-xs text-gray-500 font-mono">{positionY.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={-maxPosition}
          max={maxPosition}
          step="1"
          value={positionY}
          onChange={(e) => handleChange('positionY', e.target.value)}
          className="w-full h-2 bg-grim-dark rounded-lg appearance-none cursor-pointer slider"
        />
        <p className="text-xs text-gray-600 italic">Range: ±{maxPosition.toFixed(0)} (auto-adjusted for zoom)</p>
      </div>
      
      {/* Rotation */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">Rotation</label>
          <span className="text-xs text-gray-500 font-mono">{rotation}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          value={rotation}
          onChange={(e) => handleChange('rotation', e.target.value)}
          className="w-full h-2 bg-grim-dark rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  )
}
