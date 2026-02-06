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
  
  const handleChange = (property, value) => {
    updateTextureTransform(activeLayerId, { [property]: parseFloat(value) })
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold text-grim-accent">Texture Controls</h3>
        <button
          onClick={() => resetTextureTransform(activeLayerId)}
          className="px-3 py-1 text-xs bg-grim-dark border border-gray-600 rounded hover:border-grim-accent transition-colors"
        >
          Reset
        </button>
      </div>
      
      {/* Zoom */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">Zoom</label>
          <span className="text-xs text-gray-500">{zoom.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => handleChange('zoom', e.target.value)}
          className="w-full h-2 bg-grim-dark rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
      
      {/* Position X */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">Position X</label>
          <span className="text-xs text-gray-500">{(positionX * 10).toFixed(1)}%</span>
        </div>
        <input
          type="range"
          min="-10"
          max="10"
          step="0.5"
          value={positionX}
          onChange={(e) => handleChange('positionX', e.target.value)}
          className="w-full h-2 bg-grim-dark rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
      
      {/* Position Y */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">Position Y</label>
          <span className="text-xs text-gray-500">{(positionY * 10).toFixed(1)}%</span>
        </div>
        <input
          type="range"
          min="-10"
          max="10"
          step="0.5"
          value={positionY}
          onChange={(e) => handleChange('positionY', e.target.value)}
          className="w-full h-2 bg-grim-dark rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
      
      {/* Rotation */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">Rotation</label>
          <span className="text-xs text-gray-500">{rotation}°</span>
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
