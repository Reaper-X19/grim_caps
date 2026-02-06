import useConfiguratorStore from '../../store/configuratorStore'
import TextureUpload from './TextureUpload'
import TextureControls from './TextureControls'

export default function ControlPanel() {
  const activeLayerId = useConfiguratorStore((state) => state.activeLayerId)
  const activeLayer = useConfiguratorStore((state) => 
    state.layers.find(layer => layer.id === activeLayerId)
  )
  const updateBaseColor = useConfiguratorStore((state) => state.updateBaseColor)
  
  return (
    <div className="space-y-8">
      {/* Texture Upload */}
      <TextureUpload />
      
      {/* Base Color Picker */}
      <div className="space-y-4">
        <h3 className="text-lg font-display font-semibold text-grim-accent">Base Color</h3>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={activeLayer?.baseColor || '#ffffff'}
            onChange={(e) => updateBaseColor(activeLayerId, e.target.value)}
            className="w-16 h-16 rounded-lg cursor-pointer bg-grim-dark border-2 border-gray-600"
          />
          <div className="flex-1">
            <p className="text-sm text-gray-400">Keycap plastic color</p>
            <p className="text-xs text-gray-600 mt-1">
              {activeLayer?.baseColor || '#ffffff'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Texture Controls */}
      {activeLayer?.textureUrl && (
        <TextureControls />
      )}
      
      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-display font-semibold text-grim-accent">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button className="px-4 py-2 bg-grim-dark border border-gray-600 rounded hover:border-grim-accent transition-colors text-sm">
            Export Design
          </button>
          <button className="px-4 py-2 bg-grim-dark border border-gray-600 rounded hover:border-grim-accent transition-colors text-sm">
            Save Project
          </button>
        </div>
      </div>
    </div>
  )
}
