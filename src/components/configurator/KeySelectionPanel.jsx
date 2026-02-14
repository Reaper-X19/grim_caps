import { useState } from 'react'
import useConfiguratorStore from '../../store/configuratorStore'
import { KEY_PRESETS, formatKeyName, getPresetDisplayName } from '../../data/keyPresets'

export default function KeySelectionPanel() {
  const selectedKeys = useConfiguratorStore((state) => state.selectedKeys)
  const selectionLocked = useConfiguratorStore((state) => state.selectionLocked)
  const selectionMode = useConfiguratorStore((state) => state.selectionMode)
  const keyCustomizations = useConfiguratorStore((state) => state.keyCustomizations)
  const copiedStyle = useConfiguratorStore((state) => state.copiedStyle)
  const activeLayerId = useConfiguratorStore((state) => state.activeLayerId)

  const setSelectedKeys = useConfiguratorStore((state) => state.setSelectedKeys)
  const toggleKeySelection = useConfiguratorStore((state) => state.toggleKeySelection)
  const clearSelection = useConfiguratorStore((state) => state.clearSelection)
  const startSelecting = useConfiguratorStore((state) => state.startSelecting)
  const setSelectionLocked = useConfiguratorStore((state) => state.setSelectionLocked)
  const applyToSelectedKeys = useConfiguratorStore((state) => state.applyToSelectedKeys)
  const clearSelectedKeys = useConfiguratorStore((state) => state.clearSelectedKeys)
  const copyStyle = useConfiguratorStore((state) => state.copyStyle)
  const pasteStyle = useConfiguratorStore((state) => state.pasteStyle)

  const [showAllPresets, setShowAllPresets] = useState(false)

  const handlePresetClick = (presetKey) => {
    if (!selectionMode || selectionLocked) return // Require selection mode

    const keys = KEY_PRESETS[presetKey]
    if (keys) {
      // Toggle behavior: if all keys in preset are selected, deselect them; otherwise select them
      const allSelected = keys.every(key => selectedKeys.includes(key))

      if (allSelected) {
        // Deselect all keys in this preset
        const newSelection = selectedKeys.filter(key => !keys.includes(key))
        setSelectedKeys(newSelection)
      } else {
        // Add all keys from preset (toggle each one)
        const newSelection = [...selectedKeys]
        keys.forEach(key => {
          if (!newSelection.includes(key)) {
            newSelection.push(key)
          }
        })
        setSelectedKeys(newSelection)
      }
    }
  }

  const handleSelectAll = () => {
    if (!selectionMode || selectionLocked) return // Require selection mode

    const allKeys = Object.values(KEY_PRESETS).flat().filter(k => k)
    const uniqueKeys = [...new Set(allKeys)]
    setSelectedKeys(uniqueKeys)
  }

  const handleStartSelecting = () => {
    startSelecting()
  }

  const handleDoneSelection = () => {
    if (selectedKeys.length > 0) {
      setSelectionLocked(true)
    }
  }

  const handleEditSelection = () => {
    setSelectionLocked(false)
    startSelecting() // Re-enter selection mode
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
  const primaryPresets = ['wasd', 'arrows', 'numbers', 'row2', 'row3', 'row4']
  const secondaryPresets = ['row1', 'row5', 'row6', 'function', 'homeRow', 'alpha']

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-grim-purple/20 pb-4">
        <h3 className="text-sm font-display font-bold text-white tracking-widest uppercase">
          Key Selection <span className="text-grim-cyan">_</span>
        </h3>
        <span className="text-[10px] font-mono text-grim-cyan bg-grim-cyan/10 px-2 py-1 border border-grim-cyan/30 shadow-[0_0_5px_rgba(0,240,255,0.2)]">
          [{selectedKeys.length} UNITS SELECTED]
        </span>
      </div>

      {/* Mode Indicators */}
      {!selectionMode && !selectionLocked && selectedKeys.length === 0 && (
        <div className="p-6 bg-black/40 border border-dashed border-white/10 text-center transition-colors group hover:border-grim-cyan/50 hover:bg-grim-cyan/5">
          <p className="text-[10px] text-gray-400 mb-4 uppercase tracking-widest font-bold group-hover:text-white transition-colors">
            Targeting Inactive
          </p>
          <button
            onClick={handleStartSelecting}
            className="w-full px-4 py-3 bg-grim-cyan/10 hover:bg-grim-cyan/20 text-grim-cyan border border-grim-cyan/50 font-bold uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            Initiate Selection
          </button>
        </div>
      )}

      {/* Selection Mode Active */}
      {selectionMode && !selectionLocked && (
        <div className="p-4 bg-grim-cyan/10 border-l-2 border-grim-cyan flex items-center gap-4 animate-pulse-slow shadow-[0_0_15px_-5px_rgba(0,240,255,0.3)]">
          <div className="p-2 bg-grim-cyan/20 rounded-none relative">
            <span className="text-grim-cyan text-lg relative z-10">⦿</span>
            <div className="absolute inset-0 bg-grim-cyan blur-md opacity-50"></div>
          </div>
          <div>
            <p className="text-xs font-bold text-grim-cyan uppercase tracking-widest drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]">Targeting Active</p>
            <p className="text-[10px] text-grim-cyan/70 font-mono mt-1">SELECT_KEYS_FROM_GRID</p>
          </div>
        </div>
      )}

      {/* Selection Locked Status */}
      {selectionLocked && (
        <div className="p-4 bg-grim-pink/10 border-l-2 border-grim-pink flex items-center gap-4 shadow-[0_0_15px_-5px_rgba(255,0,85,0.3)]">
          <div className="p-2 bg-grim-pink/20 rounded-none relative">
            <span className="text-grim-pink text-lg relative z-10">🔒</span>
            <div className="absolute inset-0 bg-grim-pink blur-md opacity-50"></div>
          </div>
          <div>
            <p className="text-xs font-bold text-grim-pink uppercase tracking-widest drop-shadow-[0_0_5px_rgba(255,0,85,0.8)]">Selection Locked</p>
            <p className="text-[10px] text-grim-pink/70 font-mono mt-1">CONFIG_LOCKED_FOR_EDIT</p>
          </div>
        </div>
      )}

      {/* Done Selection / Edit Selection Button */}
      {(selectionMode || selectionLocked) && selectedKeys.length > 0 && (
        <button
          onClick={selectionLocked ? handleEditSelection : handleDoneSelection}
          className={`w-full px-4 py-4 font-black uppercase tracking-widest transition-all clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px] relative overflow-hidden group ${selectionLocked
            ? 'bg-black/40 border border-white/20 text-gray-400 hover:border-white/50 hover:text-white'
            : 'bg-grim-void border border-grim-cyan text-grim-cyan hover:bg-grim-cyan hover:text-black hover:shadow-[0_0_20px_#00F0FF]'
            }`}
          style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
        >
          <span className="relative z-10">{selectionLocked ? 'Modify Targets' : 'Confirm Targets'}</span>
          {!selectionLocked && (
            <div className="absolute inset-0 bg-grim-cyan/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
          )}
        </button>
      )}

      {/* Conflict Warning */}
      {hasConflicts && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400 font-semibold mb-1">⚠️ Set Conflict</p>
          <p className="text-xs text-gray-400">
            {conflictKeys.length} key(s) already assigned to another set. Clear them first to reassign.
          </p>
        </div>
      )}

      {/* Quick Select Presets - Only show when in selection mode */}
      {selectionMode && !selectionLocked && (
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
      )}

      {/* Actions */}
      <div className="space-y-3">
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
          className="w-full px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear Customization
        </button>

        {/* Copy/Paste */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={copyStyle}
            disabled={selectedKeys.length === 0}
            className="px-3 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-medium rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Copy Style
          </button>
          <button
            onClick={pasteStyle}
            disabled={!copiedStyle || selectedKeys.length === 0 || hasConflicts}
            className="px-3 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-medium rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Paste Style
          </button>
        </div>
      </div>

      {/* Selected Keys Display */}
      {selectedKeys.length > 0 && (
        <div className="p-3 bg-grim-dark/50 rounded-lg border border-grim-accent/10">
          <p className="text-xs text-gray-500 mb-2">Selected Keys:</p>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {selectedKeys.map(keyName => {
              const isConflict = keyCustomizations[keyName]?.layerId &&
                keyCustomizations[keyName].layerId !== activeLayerId

              return (
                <span
                  key={keyName}
                  className={`px-2 py-1 rounded text-xs font-medium ${isConflict
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
        <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
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
