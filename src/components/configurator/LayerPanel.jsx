import useConfiguratorStore from '../../store/configuratorStore'

export default function LayerPanel() {
  const layers = useConfiguratorStore((state) => state.layers)
  const activeLayerId = useConfiguratorStore((state) => state.activeLayerId)
  const addLayer = useConfiguratorStore((state) => state.addLayer)
  const removeLayer = useConfiguratorStore((state) => state.removeLayer)
  const setActiveLayer = useConfiguratorStore((state) => state.setActiveLayer)
  const toggleLayerVisibility = useConfiguratorStore((state) => state.toggleLayerVisibility)
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold text-grim-accent">Layers</h3>
        <button
          onClick={addLayer}
          className="px-3 py-1 text-xs bg-gradient-to-r from-grim-accent to-grim-blue text-grim-darker font-semibold rounded hover:scale-105 transition-transform"
        >
          + New Layer
        </button>
      </div>
      
      <div className="space-y-2">
        {layers.map((layer) => (
          <div
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            className={`
              p-3 rounded-lg cursor-pointer transition-all duration-200
              ${layer.id === activeLayerId 
                ? 'bg-grim-accent/20 border-2 border-grim-accent' 
                : 'bg-grim-dark border-2 border-transparent hover:border-gray-600'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {/* Layer thumbnail */}
                <div className="w-10 h-10 rounded bg-grim-darker flex items-center justify-center overflow-hidden">
                  {layer.textureUrl ? (
                    <img src={layer.textureUrl} alt={layer.name} className="w-full h-full object-cover" />
                  ) : (
                    <div 
                      className="w-full h-full" 
                      style={{ backgroundColor: layer.baseColor }}
                    />
                  )}
                </div>
                
                {/* Layer name */}
                <span className="text-sm font-medium text-gray-200">
                  {layer.name}
                </span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-2">
                {/* Visibility toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleLayerVisibility(layer.id)
                  }}
                  className="p-1 hover:bg-grim-darker rounded transition-colors"
                >
                  {layer.visible ? (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
                
                {/* Delete button */}
                {layers.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeLayer(layer.id)
                    }}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
