import { useState, useRef, useEffect } from 'react'
import { Move, ZoomIn, ZoomOut, Plus, Minus, Maximize2 } from 'lucide-react'
import useConfiguratorStore from '../../store/configuratorStore'

/**
 * Clean, Beautiful Texture Preview
 * - Large preview area showing selected keys shape
 * - Bright, visible texture
 * - Simple drag-to-reposition
 * - Scroll-to-zoom
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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, startX: 0, startY: 0 })

  const selectedKeys = useConfiguratorStore((state) => state.selectedKeys)
  const activeLayerId = useConfiguratorStore((state) => state.activeLayerId)
  const activeLayer = useConfiguratorStore((state) =>
    state.layers.find(layer => layer.id === activeLayerId)
  )

  // Get actual bounding box from the layer (calculated from real 3D geometry)
  const boundingBox = activeLayer?.boundingBox

  // Calculate aspect ratio from actual 3D bounds (XZ plane)
  const aspectRatio = boundingBox
    ? (boundingBox.max.x - boundingBox.min.x) / (boundingBox.max.y - boundingBox.min.y)
    : 16 / 9 // Default to landscape if no bounds yet

  if (!textureUrl) {
    return (
      <div className="w-full aspect-square bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl border-2 border-dashed border-gray-700/50 flex flex-col items-center justify-center p-8">
        <Maximize2 className="w-16 h-16 text-gray-600 mb-4" />
        <p className="text-sm font-medium text-gray-400">Upload a texture to preview</p>
        <p className="text-xs text-gray-500 mt-2">Drag to reposition • Scroll to zoom</p>
      </div>
    )
  }

  // Event handlers
  const handlePointerDown = (e) => {
    e.preventDefault()
    setIsDragging(true)

    const clientX = e.clientX || e.touches?.[0]?.clientX || 0
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0

    setDragStart({
      x: clientX,
      y: clientY,
      startX: positionX,
      startY: positionY
    })
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    e.preventDefault()

    const clientX = e.clientX || e.touches?.[0]?.clientX || 0
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0

    // Convert pixel deltas to percentage of container size
    const container = containerRef.current
    const containerWidth = container ? container.offsetWidth : 300
    const containerHeight = container ? container.offsetHeight : 300

    const deltaX = ((clientX - dragStart.x) / containerWidth) * 100 * 0.5
    const deltaY = ((clientY - dragStart.y) / containerHeight) * 100 * 0.5

    const newX = dragStart.startX + deltaX
    const newY = dragStart.startY + deltaY

    // Clamp bounds: at zoom=1, no movement allowed. As zoom increases, allow more movement
    // Calculate max position based on zoom to prevent texture from creating gaps
    // The formula: 50 * (1 - 1/zoom) ensures UVs never go outside 0-1
    const maxPosition = 50 * (1 - 1 / zoom)
    const clampedX = Math.max(-maxPosition, Math.min(maxPosition, newX))
    const clampedY = Math.max(-maxPosition, Math.min(maxPosition, newY))

    onPositionChange(clampedX, clampedY)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    e.stopPropagation() // Prevent scrollbar scrolling
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(minZoom, Math.min(3.0, zoom + delta))
    onZoomChange(newZoom)
  }

  const handleZoomIn = () => {
    const newZoom = Math.min(3.0, zoom + 0.2)
    onZoomChange(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(minZoom, zoom - 0.2)
    onZoomChange(newZoom)
  }

  useEffect(() => {
    if (isDragging) {
      const handleMove = (e) => handlePointerMove(e)
      const handleUp = () => handlePointerUp()

      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
      window.addEventListener('touchmove', handleMove, { passive: false })
      window.addEventListener('touchend', handleUp)

      return () => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
        window.removeEventListener('touchmove', handleMove)
        window.removeEventListener('touchend', handleUp)
      }
    }
  }, [isDragging, dragStart, positionX, positionY, zoom])

  // Attach wheel listener with passive: false to prevent scrollbar scrolling
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const wheelHandler = (e) => {
      e.preventDefault()
      e.stopPropagation()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      const newZoom = Math.max(minZoom, Math.min(3.0, zoom + delta))
      onZoomChange(newZoom)
    }

    container.addEventListener('wheel', wheelHandler, { passive: false })

    return () => {
      container.removeEventListener('wheel', wheelHandler)
    }
  }, [zoom, minZoom, onZoomChange])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-grim-accent flex items-center gap-2">
          <Move className="w-4 h-4" />
          Texture Preview
        </label>
        <span className="text-xs text-gray-400 font-mono">
          {selectedKeys.length} key{selectedKeys.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Large Preview Area */}
      <div
        ref={containerRef}
        className={`relative w-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-2xl border-2 overflow-hidden shadow-2xl transition-all ${isDragging
          ? 'border-grim-accent shadow-grim-accent/50 cursor-grabbing scale-[0.98]'
          : 'border-grim-accent/40 cursor-grab hover:border-grim-accent/60'
          }`}
        style={{
          aspectRatio: `${aspectRatio} / 1`,
          minHeight: '300px',
          maxHeight: '400px'
        }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        {/* Texture Image Layer */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${positionX * 1}%, ${positionY * 1}%) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            willChange: isDragging ? 'transform' : 'auto'
          }}
        >
          <img
            src={textureUrl}
            alt="Texture preview"
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
            style={{
              filter: 'brightness(1.15) contrast(1.08) saturate(1.1)',
              imageRendering: 'high-quality'
            }}
          />
        </div>

        {/* Subtle Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-transparent via-transparent to-black/30" />

        {/* Crop Area Corners — sharp rectangles to show visible region */}
        <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-grim-accent pointer-events-none" />
        <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-grim-accent pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-grim-accent pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-grim-accent pointer-events-none" />

        {/* Zoom Controls */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= minZoom}
            className="p-2 bg-black/90 backdrop-blur-md rounded-lg border border-grim-accent/40 hover:border-grim-accent/70 hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4 text-grim-accent" />
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3.0}
            className="p-2 bg-black/90 backdrop-blur-md rounded-lg border border-grim-accent/40 hover:border-grim-accent/70 hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
            title="Zoom In"
          >
            <Plus className="w-4 h-4 text-grim-accent" />
          </button>
        </div>

        {/* Zoom Indicator */}
        <div className="absolute bottom-4 right-4 px-4 py-2 bg-black/90 backdrop-blur-md rounded-xl border border-grim-accent/40 flex items-center gap-2 pointer-events-none shadow-lg">
          <ZoomIn className="w-4 h-4 text-grim-accent" />
          <span className="text-sm font-mono text-white font-bold">{zoom.toFixed(2)}x</span>
        </div>

        {/* Instructions Overlay */}
        {!isDragging && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-black/70 backdrop-blur-lg px-6 py-3 rounded-xl border border-grim-accent/50 shadow-2xl">
              <p className="text-sm text-white font-medium text-center whitespace-nowrap flex items-center gap-3">
                <Move className="w-4 h-4 text-grim-accent" />
                Drag to reposition • Scroll to zoom
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center">
        {selectedKeys.length > 0
          ? `Preview shows how texture will appear on your ${selectedKeys.length} selected key${selectedKeys.length !== 1 ? 's' : ''}`
          : 'Select keys to customize'
        }
      </p>
    </div>
  )
}
