import { Download, ChevronDown, ChevronUp, Upload, Palette, Sliders } from 'lucide-react'
import { useState } from 'react'
import useConfiguratorStore from '../../store/configuratorStore'
import TextureUpload from './TextureUpload'
import TextureControls from './TextureControls'

export default function ControlPanel() {
  const activeLayerId = useConfiguratorStore((state) => state.activeLayerId)
  const activeLayer = useConfiguratorStore((state) =>
    state.layers.find(layer => layer.id === activeLayerId)
  )
  const updateBaseColor = useConfiguratorStore((state) => state.updateBaseColor)
  const layers = useConfiguratorStore((state) => state.layers)
  const selectedKeys = useConfiguratorStore((state) => state.selectedKeys)
  const keyCustomizations = useConfiguratorStore((state) => state.keyCustomizations)

  // Collapsible sections state
  const [sectionsOpen, setSectionsOpen] = useState({
    texture: true,
    color: true,
    controls: true
  })

  const toggleSection = (section) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Check if any keys in this layer have textures applied
  const hasAppliedTextures = Object.values(keyCustomizations).some(
    custom => custom.layerId === activeLayerId && custom.textureUrl
  )

  // Show texture controls if layer has texture OR if keys have applied textures
  const showTextureControls = activeLayer?.textureUrl || hasAppliedTextures

  // Export Design as JSON with proper data
  const handleExportDesign = () => {
    try {
      const designData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        activeLayer: activeLayerId,
        layers: layers.map(layer => ({
          id: layer.id,
          name: layer.name,
          baseColor: layer.baseColor,
          textureUrl: layer.textureUrl ? 'texture-included' : null,
          textureTransform: layer.textureTransform,
          selectedKeys: layer.selectedKeys || [],
          visible: layer.visible
        })),
        keyCustomizations: Object.keys(keyCustomizations).map(keyName => ({
          key: keyName,
          layerId: keyCustomizations[keyName].layerId,
          baseColor: keyCustomizations[keyName].baseColor,
          hasTexture: !!keyCustomizations[keyName].textureUrl
        })),
        selectedKeys: selectedKeys
      }

      const jsonString = JSON.stringify(designData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `grim-caps-design-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export design. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Texture Upload Section */}
      <div className="group border border-white/5 bg-black/20 hover:border-grim-purple/50 transition-colors duration-300">
        <button
          onClick={() => toggleSection('texture')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-1 bg-grim-purple/10 text-grim-purple group-hover:text-white group-hover:bg-grim-purple transition-all duration-300 shadow-[0_0_10px_rgba(188,19,254,0.3)]">
              <Upload className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-display font-bold text-gray-300 uppercase tracking-widest text-[10px] group-hover:text-grim-purple transition-colors">Texture Source</h3>
          </div>
          {sectionsOpen.texture ? <ChevronUp className="w-3 h-3 text-gray-500" /> : <ChevronDown className="w-3 h-3 text-gray-500" />}
        </button>
        {sectionsOpen.texture && (
          <div className="px-4 pb-4 border-t border-white/5 bg-black/20">
            <TextureUpload />
          </div>
        )}
      </div>

      {/* Base Color Section */}
      <div className="group border border-white/5 bg-black/20 hover:border-grim-pink/50 transition-colors duration-300">
        <button
          onClick={() => toggleSection('color')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-1 bg-grim-pink/10 text-grim-pink group-hover:text-white group-hover:bg-grim-pink transition-all duration-300 shadow-[0_0_10px_rgba(255,0,85,0.3)]">
              <Palette className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-display font-bold text-gray-300 uppercase tracking-widest text-[10px] group-hover:text-grim-pink transition-colors">Pigment</h3>
          </div>
          {sectionsOpen.color ? <ChevronUp className="w-3 h-3 text-gray-500" /> : <ChevronDown className="w-3 h-3 text-gray-500" />}
        </button>
        {sectionsOpen.color && (
          <div className="px-4 pb-4 pt-4 border-t border-white/5 bg-black/20">
            <div className="flex items-center space-x-4">
              <div className="relative group/picker">
                <input
                  type="color"
                  value={activeLayer?.baseColor || '#ffffff'}
                  onChange={(e) => updateBaseColor(activeLayerId, e.target.value)}
                  className="relative block w-12 h-12 cursor-pointer bg-transparent border border-white/20 p-0.5 hover:border-grim-pink transition-colors shadow-[0_0_15px_rgba(255,0,85,0.2)]"
                />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Hex Code</p>
                <div className="flex items-center gap-2 bg-grim-void px-2 py-1 border border-white/10 group-hover:border-grim-pink/50 transition-colors">
                  <span className="w-2 h-2 shadow-[0_0_5px_currentColor]" style={{ backgroundColor: activeLayer?.baseColor || '#ffffff', color: activeLayer?.baseColor || '#ffffff' }}></span>
                  <p className="text-xs text-mono text-gray-300 font-mono">
                    {activeLayer?.baseColor || '#ffffff'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Texture Controls Section */}
      {showTextureControls && (
        <div className="group border border-white/5 bg-black/20 hover:border-grim-cyan/50 transition-colors duration-300">
          <button
            onClick={() => toggleSection('controls')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-1 bg-grim-cyan/10 text-grim-cyan group-hover:text-white group-hover:bg-grim-cyan transition-all duration-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-display font-bold text-gray-300 uppercase tracking-widest text-[10px] group-hover:text-grim-cyan transition-colors">Calibration</h3>
            </div>
            {sectionsOpen.controls ? <ChevronUp className="w-3 h-3 text-gray-500" /> : <ChevronDown className="w-3 h-3 text-gray-500" />}
          </button>
          {sectionsOpen.controls && (
            <div className="px-4 pb-4 pt-2 border-t border-white/5 bg-black/20">
              <TextureControls />
              {hasAppliedTextures && !activeLayer?.textureUrl && (
                <div className="mt-3 px-3 py-2 bg-grim-cyan/5 border border-grim-cyan/20 text-[10px] text-grim-cyan flex items-center gap-2 uppercase tracking-wide font-bold shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]">
                  <span className="animate-pulse">//</span> EDITING APPLIED TEXTURE
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExportDesign}
        className="group w-full relative px-4 py-4 bg-grim-void border border-grim-cyan/30 hover:border-grim-cyan/80 transition-all overflow-hidden"
      >
        <div className="absolute inset-0 bg-grim-cyan/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
        <div className="flex items-center justify-center gap-3 relative z-10">
          <Download className="w-4 h-4 text-grim-cyan group-hover:text-white transition-colors" />
          <span className="text-xs font-display font-bold uppercase tracking-widest text-grim-cyan group-hover:text-white transition-colors drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">Export Data_Stream</span>
        </div>
        {/* Animated corner border */}
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-grim-cyan/50 group-hover:w-full group-hover:h-full transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-grim-cyan/50 group-hover:w-full group-hover:h-full transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
      </button>
    </div>
  )
}
