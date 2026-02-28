import useConfiguratorStore from '../../store/configuratorStore'

export default function LayerPanel() {
  const layers = useConfiguratorStore((state) => state.layers)
  const activeLayerId = useConfiguratorStore((state) => state.activeLayerId)
  const keyCustomizations = useConfiguratorStore((state) => state.keyCustomizations)
  const addLayer = useConfiguratorStore((state) => state.addLayer)
  const removeLayer = useConfiguratorStore((state) => state.removeLayer)
  const setActiveLayer = useConfiguratorStore((state) => state.setActiveLayer)
  const toggleLayerVisibility = useConfiguratorStore((state) => state.toggleLayerVisibility)

  // Check if active layer is applied (gate for Add Node)
  const activeLayer = layers.find(l => l.id === activeLayerId)
  const canAddLayer = activeLayer?.applied || false

  // Count keys per layer from keyCustomizations
  const getLayerKeyCount = (layerId) => {
    return Object.values(keyCustomizations).filter(c => c.layerId === layerId).length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-grim-purple/20 pb-4">
        <h3 className="text-sm font-display font-bold text-white tracking-widest uppercase">
          LAYERS <span className="text-grim-cyan animate-pulse">_</span>
        </h3>
        <div className="relative group/add">
          <button
            onClick={addLayer}
            disabled={!canAddLayer}
            className={`px-3 py-1 text-[10px] border font-bold uppercase tracking-widest transition-all ${
              canAddLayer
                ? 'bg-grim-cyan/10 hover:bg-grim-cyan/20 border-grim-cyan/50 text-grim-cyan hover:shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'bg-gray-800/50 border-gray-600/30 text-gray-600 cursor-not-allowed'
            }`}
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
            + Add Node
          </button>
          {/* Tooltip when disabled */}
          {!canAddLayer && (
            <div className="absolute right-0 top-full mt-2 w-44 p-2 bg-black/90 border border-grim-pink/30 text-[9px] text-grim-pink font-mono opacity-0 group-hover/add:opacity-100 transition-opacity pointer-events-none z-50">
              APPLY CURRENT LAYER FIRST
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {layers.map((layer) => {
          const keyCount = getLayerKeyCount(layer.id)
          return (
            <div
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`
                relative p-3 cursor-pointer transition-all duration-200 group border
                ${layer.id === activeLayerId
                  ? 'bg-grim-cyan/5 border-grim-cyan shadow-[0_0_15px_-5px_rgba(0,240,255,0.5)] z-10'
                  : 'bg-black/40 border-transparent hover:border-grim-purple/50 hover:bg-grim-purple/5'
                }
              `}
            >
              {/* Active Indicator Bar */}
              {layer.id === activeLayerId && (
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-grim-cyan to-grim-purple shadow-[0_0_10px_#00F0FF]"></div>
              )}

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3 flex-1">
                  {/* Layer thumbnail */}
                  <div className={`w-8 h-8 flex items-center justify-center overflow-hidden border ${layer.id === activeLayerId ? 'border-grim-cyan' : 'border-white/10'}`}>
                    {layer.textureUrl ? (
                      <img src={layer.textureUrl} alt={layer.name} className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: layer.baseColor }}
                      />
                    )}
                  </div>

                  <div className="flex flex-col">
                    {/* Layer name */}
                    <span className={`text-xs font-bold uppercase tracking-wide transition-colors ${layer.id === activeLayerId ? 'text-grim-cyan drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]' : 'text-gray-400 group-hover:text-white'}`}>
                      {layer.name}
                    </span>
                    {/* Status + key count */}
                    <div className="flex items-center gap-2 mt-0.5">
                      {layer.applied ? (
                        <span className="text-[8px] font-mono font-bold text-green-400 uppercase tracking-widest">✓ Applied</span>
                      ) : (
                        <span className="text-[8px] font-mono font-bold text-yellow-500 uppercase tracking-widest">○ Pending</span>
                      )}
                      {keyCount > 0 && (
                        <span className="text-[8px] font-mono text-gray-500">[{keyCount} keys]</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Visibility toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLayerVisibility(layer.id)
                    }}
                    className="p-1 hover:bg-white/10 transition-colors text-gray-500 hover:text-white"
                  >
                    {layer.visible ? (
                      <svg className="w-3 h-3 text-grim-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
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
                      className="p-1 hover:bg-grim-alert transition-colors text-gray-500 hover:text-white group/del"
                    >
                      <svg className="w-3 h-3 group-hover/del:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
