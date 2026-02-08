import { useState, useRef, useEffect } from 'react'
import { Move, ZoomIn } from 'lucide-react'

/**
 * DraggableTexturePreview - WhatsApp-style drag-to-position texture control
 * 
 * Features:
 * - Drag with mouse or touch to reposition texture
 * - Scroll wheel to zoom in/out
 * - Visual keycap outline guide
 * - Real-time preview updates
 * - Zoom limit: never below 100% coverage
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
        className={`relative w-full aspect-square bg-gray-900 rounded-lg border-2 border-gray-700 overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onWheel={handleWheel}
      >
        {/* Keycap outline guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-3/4 border-2 border-grim-accent/30 rounded-lg" />
        </div>
        
        {/* Draggable texture */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: `translate(${positionX}px, ${positionY}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          <img 
            src={textureUrl} 
            alt="Texture preview"
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
        
        {/* Zoom indicator */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs font-mono text-white pointer-events-none">
          <ZoomIn className="w-3 h-3 inline mr-1" />
          {zoom.toFixed(2)}x
        </div>
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        Drag to reposition • Scroll to zoom in/out
      </p>
    </div>
  )
}
