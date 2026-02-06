import { useState } from 'react'
import useConfiguratorStore from '../../store/configuratorStore'
import { KEY_PRESETS, formatKeyName, getPresetDisplayName } from '../../data/keyPresets'

export default function KeySelectionPanel() {
  const selectedKeys = useConfiguratorStore((state) => state.selectedKeys)
  const keyCustomizations = useConfiguratorStore((state) => state.keyCustomizations)
  const copiedStyle = useConfiguratorStore((state) => state.copiedStyle)
  const activeLayerId = useConfiguratorStore((state) => state.activeLayerId)
  
  const setSelectedKeys = useConfiguratorStore((state) => state.setSelectedKeys)
  const clearSelection = useConfiguratorStore((state) => state.clearSelection)
  const applyToSelectedKeys = useConfiguratorStore((state) => state.applyToSelectedKeys)
  const clearSelectedKeys = useConfiguratorStore((state) => state.clearSelectedKeys)
  const copyStyle = useConfiguratorStore((state) => state.copyStyle)
  const pasteStyle = useConfiguratorStore((state) => state.pasteStyle)
  
  const [showAllPresets, setShowAllPresets] = useState(false)
  
  const handlePresetClick = (presetKey) => {
    const keys = KEY_PRESETS[presetKey]
    if (keys) {
      setSelectedKeys(keys)
    }
  }
  
  const handleSelectAll = () => {
    const allKeys = Object.values(KEY_PRESETS).flat().filter(k => k)
    const uniqueKeys = [...new Set(allKeys)]
    setSelectedKeys(uniqueKeys)
  }
  
  // Check if any selected keys have conflicts
  const hasConflicts = selectedKeys.some(keyName => {
    const customization = keyCustomizations[keyName]
    return customization && customization.layerId !== activeLayerId
  })
  
  // Get conflict info
  const conflictKeys = selectedKeys.filter(keyName => {
    const customization = keyCustomizations[keyName]
    return customization && customization.layerId !== activeLayerId
  })
  
  // Primary presets to show by default
  const primaryPresets = ['wasd', 'arrows', 'numbers', 'row1', 'row2', 'row3']
  const secondaryPresets = ['row4', 'row5', 'function', 'modifiers', 'homeRow', 'alpha']
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-grim-accent">
          Key Selection
        </h3>
        <span className="text-sm text-gray-400">
          {selectedKeys.length} selected
        </span>
      </div>
      
      {/* Conflict Warning */}
      {hasConflicts && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400 font-semibold mb-1">⚠️ Layer Conflict</p>
          <p className="text-xs text-gray-400">
            {conflictKeys.length} key(s) already assigned to another layer. Clear them first to reassign.
          </p>
        </div>
      )}
      
      {/* Quick Select Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Quick Select</p>
          <button
            onClick={() => setShowAllPresets(!showAllPresets)}
            className="text-xs text-grim-accent hover:text-grim-accent/80 transition-colors"
          >
            {showAllPresets ? 'Show Less' : 'Show More'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {primaryPresets.map(presetKey => (
            <button
              key={presetKey}
              onClick={() => handlePresetClick(presetKey)}
              className="px-3 py-2 bg-grim-dark hover:bg-grim-dark/70 border border-grim-accent/20 hover:border-grim-accent/40 rounded-lg text-xs font-medium text-gray-300 transition-all"
            >
              {getPresetDisplayName(presetKey)}
            </button>
          ))}
          
          {showAllPresets && secondaryPresets.map(presetKey => (
            <button
              key={presetKey}
              onClick={() => handlePresetClick(presetKey)}
              className="px-3 py-2 bg-grim-dark hover:bg-grim-dark/70 border border-grim-accent/20 hover:border-grim-accent/40 rounded-lg text-xs font-medium text-gray-300 transition-all"
            >
              {getPresetDisplayName(presetKey)}
            </button>
          ))}
        </div>
        
        {/* Select All / Clear */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSelectAll}
            className="px-3 py-2 bg-grim-accent/10 hover:bg-grim-accent/20 border border-grim-accent/30 rounded-lg text-xs font-medium text-grim-accent transition-all"
          >
            Select All
          </button>
          <button
            onClick={clearSelection}
            disabled={selectedKeys.length === 0}
            className="px-3 py-2 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 rounded-lg text-xs font-medium text-gray-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear Selection
          </button>
        </div>
      </div>
      
      {/* Actions */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Actions</p>
        
        <button
          onClick={applyToSelectedKeys}
          disabled={selectedKeys.length === 0 || hasConflicts}
          className="w-full px-4 py-3 bg-grim-accent hover:bg-grim-accent/90 text-grim-darker font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-grim-accent"
        >
          Apply to Selected Keys
        </button>
        
        <button
          onClick={clearSelectedKeys}
          disabled={selectedKeys.length === 0}
          className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear Customization
        </button>
        
        {/* Copy/Paste */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={copyStyle}
            disabled={selectedKeys.length === 0}
            className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-medium rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Copy Style
          </button>
          <button
            onClick={pasteStyle}
            disabled={!copiedStyle || selectedKeys.length === 0 || hasConflicts}
            className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-medium rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Paste Style
          </button>
        </div>
      </div>
      
      {/* Selected Keys Display */}
      {selectedKeys.length > 0 && (
        <div className="p-3 bg-grim-dark/50 rounded-lg border border-grim-accent/10">
          <p className="text-xs text-gray-500 mb-2">Selected Keys:</p>
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {selectedKeys.map(keyName => {
              const isConflict = keyCustomizations[keyName]?.layerId && 
                                keyCustomizations[keyName].layerId !== activeLayerId
              
              return (
                <span
                  key={keyName}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    isConflict
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-grim-accent/20 text-grim-accent border border-grim-accent/30'
                  }`}
                >
                  {formatKeyName(keyName)}
                </span>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Copy Status */}
      {copiedStyle && (
        <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
          ✓ Style copied - ready to paste
        </div>
      )}
      
      {/* Instructions */}
      <div className="p-3 bg-grim-darker/50 rounded-lg border border-gray-700/30">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-semibold text-gray-400">Tip:</span> Click keys on the keyboard to select them, or use presets above. Ctrl+Click to multi-select.
        </p>
      </div>
    </div>
  )
}
