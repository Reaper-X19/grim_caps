import useConfiguratorStore from '../../store/configuratorStore'

export default function LayerPanel() {
  const layers = useConfiguratorStore((state) => state.layers)
  const activeLayerId = useConfiguratorStore((state) => state.activeLayerId)
  const addLayer = useConfiguratorStore((state) => state.addLayer)
  const removeLayer = useConfiguratorStore((state) => state.removeLayer)
  const setActiveLayer = useConfiguratorStore((state) => state.setActiveLayer)
  const toggleLayerVisibility = useConfiguratorStore((state) => state.toggleLayerVisibility)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-grim-purple/20 pb-4">
        <h3 className="text-sm font-display font-bold text-white tracking-widest uppercase">
          LAYERS <span className="text-grim-cyan animate-pulse">_</span>
        </h3>
        <button
          onClick={addLayer}
          className="px-3 py-1 text-[10px] bg-grim-cyan/10 hover:bg-grim-cyan/20 border border-grim-cyan/50 text-grim-cyan font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px]"
          style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
        >
          + Add Node
        </button>
      </div>

      <div className="space-y-2">
        {layers.map((layer) => (
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
            {/* Active Indicator Bar - Glitch Effect */}
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

                {/* Layer name */}
                <span className={`text-xs font-bold uppercase tracking-wide transition-colors ${layer.id === activeLayerId ? 'text-grim-cyan drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]' : 'text-gray-400 group-hover:text-white'}`}>
                  {layer.name}
                </span>
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
        ))}
      </div>
    </div>
  )
}
