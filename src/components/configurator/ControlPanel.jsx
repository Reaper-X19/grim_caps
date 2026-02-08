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
      <div className="border border-gray-700/30 rounded-lg overflow-hidden bg-grim-darker/30">
        <button
          onClick={() => toggleSection('texture')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-grim-dark/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-grim-accent" />
            <h3 className="font-display font-semibold text-grim-accent">Upload Texture</h3>
          </div>
          {sectionsOpen.texture ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {sectionsOpen.texture && (
          <div className="px-4 pb-4">
            <TextureUpload />
          </div>
        )}
      </div>
      
      {/* Base Color Section */}
      <div className="border border-gray-700/30 rounded-lg overflow-hidden bg-grim-darker/30">
        <button
          onClick={() => toggleSection('color')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-grim-dark/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-grim-accent" />
            <h3 className="font-display font-semibold text-grim-accent">Base Color</h3>
          </div>
          {sectionsOpen.color ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {sectionsOpen.color && (
          <div className="px-4 pb-4 pt-2">
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={activeLayer?.baseColor || '#ffffff'}
                onChange={(e) => updateBaseColor(activeLayerId, e.target.value)}
                className="w-14 h-14 rounded-lg cursor-pointer bg-grim-dark border-2 border-gray-600 hover:border-grim-accent transition-colors"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-400">Keycap plastic color</p>
                <p className="text-xs text-gray-600 mt-1 font-mono">
                  {activeLayer?.baseColor || '#ffffff'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Texture Controls Section - Show if texture uploaded OR if keys have applied textures */}
      {showTextureControls && (
        <div className="border border-gray-700/30 rounded-lg overflow-hidden bg-grim-darker/30">
          <button
            onClick={() => toggleSection('controls')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-grim-dark/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-grim-accent" />
              <h3 className="font-display font-semibold text-grim-accent">Texture Controls</h3>
            </div>
            {sectionsOpen.controls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {sectionsOpen.controls && (
            <div className="px-4 pb-4 pt-2">
              <TextureControls />
              {hasAppliedTextures && !activeLayer?.textureUrl && (
                <p className="text-xs text-gray-500 mt-3 italic">
                  ✓ Editing applied texture settings
                </p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Export Button */}
      <button 
        onClick={handleExportDesign}
        className="w-full px-4 py-3 bg-grim-dark border border-gray-600 rounded-lg hover:border-grim-accent transition-colors text-sm flex items-center justify-center gap-2 font-medium"
      >
        <Download className="w-4 h-4" />
        Export Design
      </button>
    </div>
  )
}
