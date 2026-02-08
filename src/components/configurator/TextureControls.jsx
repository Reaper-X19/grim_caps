import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import useConfiguratorStore from '../../store/configuratorStore'
import DraggableTexturePreview from './DraggableTexturePreview'

export default function TextureControls() {
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const activeLayerId = useConfiguratorStore((state) => state.activeLayerId)
  const activeLayer = useConfiguratorStore((state) => 
    state.layers.find(layer => layer.id === activeLayerId)
  )
  const updateTextureTransform = useConfiguratorStore((state) => state.updateTextureTransform)
  const resetTextureTransform = useConfiguratorStore((state) => state.resetTextureTransform)
  
  if (!activeLayer || !activeLayer.textureUrl) return null
  
  const { zoom, positionX, positionY, rotation } = activeLayer.textureTransform
  
  // Calculate minimum zoom to ensure texture always covers area (WhatsApp-style)
  const minZoom = 1.0 // Can be calculated based on image aspect ratio later
  
  // Calculate max position based on zoom
  const getMaxPosition = (currentZoom) => {
    const baseMax = 20
    const maxPos = baseMax * currentZoom
    return Math.min(50, Math.max(20, maxPos))
  }
  
  const maxPosition = getMaxPosition(zoom)
  
  const handleChange = (property, value) => {
    let finalValue = parseFloat(value)
    
    // Ensure zoom never goes below minZoom (WhatsApp-style: always covers area)
    if (property === 'zoom') {
      finalValue = Math.max(minZoom, Math.min(3.0, finalValue))
    }
    
    // Clamp position values
    if (property === 'positionX' || property === 'positionY') {
      finalValue = Math.max(-maxPosition, Math.min(maxPosition, finalValue))
    }
    
    updateTextureTransform(activeLayerId, { [property]: finalValue })
  }
  
  const handlePositionChange = (newX, newY) => {
    updateTextureTransform(activeLayerId, { 
      positionX: newX, 
      positionY: newY 
    })
  }
  
  const handleZoomChange = (newZoom) => {
    const clampedZoom = Math.max(minZoom, Math.min(3.0, newZoom))
    updateTextureTransform(activeLayerId, { zoom: clampedZoom })
  }
  
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
      
      {/* WhatsApp-Style Draggable Preview */}
      <DraggableTexturePreview
        textureUrl={activeLayer.textureUrl}
        zoom={zoom}
        positionX={positionX}
        positionY={positionY}
        minZoom={minZoom}
        onPositionChange={handlePositionChange}
        onZoomChange={handleZoomChange}
      />
      
      {/* Zoom Slider - Always Visible */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">Zoom</label>
          <span className="text-xs text-gray-500 font-mono">{zoom.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min={minZoom}
          max="3"
          step="0.01"
          value={zoom}
          onChange={(e) => handleChange('zoom', e.target.value)}
          className="w-full h-2 bg-grim-dark rounded-lg appearance-none cursor-pointer slider"
        />
        <p className="text-xs text-gray-600 italic">
          {zoom === minZoom ? 'Minimum (100% coverage)' : `${((zoom / minZoom) * 100).toFixed(0)}% zoom`}
        </p>
      </div>
      
      {/* Advanced Controls - Collapsible */}
      <div className="border-t border-gray-800 pt-3">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-400 hover:text-grim-accent transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-xs">⚙️</span>
            Advanced Controls
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showAdvanced && (
          <div className="mt-3 space-y-4 pl-2">
            {/* Precision Position X */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300">Position X (Precision)</label>
                <span className="text-xs text-gray-500 font-mono">{positionX.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={-maxPosition}
                max={maxPosition}
                step="0.01"
                value={positionX}
                onChange={(e) => handleChange('positionX', e.target.value)}
                className="w-full h-2 bg-grim-dark rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-xs text-gray-600 italic">Range: ±{maxPosition.toFixed(0)}</p>
            </div>
            
            {/* Precision Position Y */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300">Position Y (Precision)</label>
                <span className="text-xs text-gray-500 font-mono">{positionY.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={-maxPosition}
                max={maxPosition}
                step="0.01"
                value={positionY}
                onChange={(e) => handleChange('positionY', e.target.value)}
                className="w-full h-2 bg-grim-dark rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-xs text-gray-600 italic">Range: ±{maxPosition.toFixed(0)}</p>
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
        )}
      </div>
    </div>
  )
}
