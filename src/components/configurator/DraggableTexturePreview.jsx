import { useState, useRef, useEffect } from 'react'
import { Move, ZoomIn } from 'lucide-react'
import useConfiguratorStore from '../../store/configuratorStore'

/**
 * DraggableTexturePreview - Shows texture preview matching ACTUAL selected keys shape
 * 
 * Features:
 * - Renders actual keycap shapes (not just a square)
 * - Drag with mouse or touch to reposition texture
 * - Scroll wheel to zoom in/out
 * - Shows exactly how texture will look on selected keys
 */
export default function DraggableTexturePreview({ 
  textureUrl, 
  zoom, 
  positionX, 
  positionY,
  minZoom = 1.0,
  onPositionChange,
  onZoomChange 
}) {
  const containerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(true)
  
  const selectedKeys = useConfiguratorStore((state) => state.selectedKeys)

  // Hide tooltip after first interaction
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleDragStart = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setShowTooltip(false)
    
    const clientX = e.clientX || e.touches?.[0]?.clientX
    const clientY = e.clientY || e.touches?.[0]?.clientY
    
    setDragStart({
      x: clientX - positionX,
      y: clientY - positionY
    })
  }

  const handleDragMove = (e) => {
    if (!isDragging) return
    
    const clientX = e.clientX || e.touches?.[0]?.clientX
    const clientY = e.clientY || e.touches?.[0]?.clientY
    
    const newX = clientX - dragStart.x
    const newY = clientY - dragStart.y
    
    // Apply position limits based on zoom
    const maxPosition = 50 * zoom
    const clampedX = Math.max(-maxPosition, Math.min(maxPosition, newX))
    const clampedY = Math.max(-maxPosition, Math.min(maxPosition, newY))
    
    onPositionChange(clampedX, clampedY)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    
    // Zoom in/out with scroll wheel
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(minZoom, Math.min(3.0, zoom + delta))
    
    onZoomChange(newZoom)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove)
      window.addEventListener('mouseup', handleDragEnd)
      window.addEventListener('touchmove', handleDragMove)
      window.addEventListener('touchend', handleDragEnd)
      
      return () => {
        window.removeEventListener('mousemove', handleDragMove)
        window.removeEventListener('mouseup', handleDragEnd)
        window.removeEventListener('touchmove', handleDragMove)
        window.removeEventListener('touchend', handleDragEnd)
      }
    }
  }, [isDragging, dragStart, positionX, positionY, zoom])

  if (!textureUrl) {
    return (
      <div className="w-full aspect-square bg-gray-900 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Upload a texture to preview</p>
      </div>
    )
  }

  // Calculate bounding box of selected keys for preview
  const getKeysBoundingBox = () => {
    if (selectedKeys.length === 0) {
      return { minRow: 0, maxRow: 1, minCol: 0, maxCol: 1, keys: [] }
    }
    
    // Parse key positions (format: "Key_R{row}_C{col}")
    const keyPositions = selectedKeys.map(key => {
      const match = key.match(/R(\d+)_C(\d+)/)
      if (match) {
        return { name: key, row: parseInt(match[1]), col: parseInt(match[2]) }
      }
      return null
    }).filter(Boolean)
    
    if (keyPositions.length === 0) {
      return { minRow: 0, maxRow: 1, minCol: 0, maxCol: 1, keys: [] }
    }
    
    const rows = keyPositions.map(k => k.row)
    const cols = keyPositions.map(k => k.col)
    
    return {
      minRow: Math.min(...rows),
      maxRow: Math.max(...rows),
      minCol: Math.min(...cols),
      maxCol: Math.max(...cols),
      keys: keyPositions
    }
  }
  
  const bbox = getKeysBoundingBox()
  const gridWidth = bbox.maxCol - bbox.minCol + 1
  const gridHeight = bbox.maxRow - bbox.minRow + 1

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Move className="w-4 h-4" />
          Texture Preview
        </label>
        {showTooltip && (
          <span className="text-xs text-grim-accent animate-pulse">
            Drag to reposition • Scroll to zoom
          </span>
        )}
      </div>
      
      <div 
        ref={containerRef}
        className={`relative w-full bg-gray-900 rounded-lg border-2 border-gray-700 overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ 
          aspectRatio: `${gridWidth} / ${gridHeight}`,
          minHeight: '200px',
          maxHeight: '300px'
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onWheel={handleWheel}
      >
        {/* Render actual keycap shapes */}
        <div className="absolute inset-0 p-4">
          <div 
            className="relative w-full h-full"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
              gridTemplateRows: `repeat(${gridHeight}, 1fr)`,
              gap: '2px'
            }}
          >
            {/* Render each selected key */}
            {bbox.keys.map(key => {
              const gridRow = key.row - bbox.minRow + 1
              const gridCol = key.col - bbox.minCol + 1
              
              return (
                <div
                  key={key.name}
                  className="relative bg-gray-800/30 border border-grim-accent/30 rounded overflow-hidden"
                  style={{
                    gridRow,
                    gridColumn: gridCol
                  }}
                >
                  {/* Texture overlay for this key */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `url(${textureUrl})`,
                      backgroundSize: `${zoom * 100}%`,
                      backgroundPosition: `${50 + positionX}% ${50 + positionY}%`,
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Zoom indicator */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs font-mono text-white pointer-events-none">
          <ZoomIn className="w-3 h-3 inline mr-1" />
          {zoom.toFixed(2)}x
        </div>
        
        {/* Selected keys count */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-xs font-mono text-white pointer-events-none">
          {selectedKeys.length} key{selectedKeys.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        {selectedKeys.length > 0 
          ? `Showing ${selectedKeys.length} selected key${selectedKeys.length !== 1 ? 's' : ''} • Drag to reposition • Scroll to zoom`
          : 'Select keys to see preview'
        }
      </p>
    </div>
  )
}
