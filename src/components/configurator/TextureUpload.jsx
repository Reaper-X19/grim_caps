import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import useConfiguratorStore from '../../store/configuratorStore'
import { Upload, FileImage, Image as ImageIcon } from 'lucide-react'

export default function TextureUpload() {
  const activeLayerId = useConfiguratorStore((state) => state.activeLayerId)
  const uploadTexture = useConfiguratorStore((state) => state.uploadTexture)
  const activeLayer = useConfiguratorStore((state) =>
    state.layers.find(layer => layer.id === activeLayerId)
  )

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      uploadTexture(activeLayerId, acceptedFiles[0])
    }
  }, [activeLayerId, uploadTexture])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/svg+xml': ['.svg']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-bold font-mono uppercase tracking-widest text-grim-accent flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Data Injection
        </h3>
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-grim-accent/40 animate-pulse"></div>
          <div className={`w-1 h-3 bg-grim-accent/40 animate-pulse delay-75`}></div>
          <div className={`w-1 h-3 bg-grim-accent/40 animate-pulse delay-150`}></div>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`
          group relative w-full h-64 rounded-xl overflow-hidden cursor-pointer transition-all duration-500
          ${isDragActive ? 'scale-[1.02] shadow-[0_0_30px_rgba(0,255,204,0.3)]' : 'hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]'}
        `}
      >
        <input {...getInputProps()} />

        {/* 1. Base Tech Layout - Dark Glass with Hover Gradient */}
        <div className={`
            absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 transition-all duration-500
            ${isDragActive
            ? 'bg-grim-accent/10 border-grim-accent/50'
            : 'group-hover:bg-gradient-to-br group-hover:from-purple-900/20 group-hover:to-cyan-900/20 group-hover:border-white/30'
          }
        `}></div>

        {/* 2. Grid Background Pattern (Enhanced Opacity on Hover) */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDragActive ? 'opacity-30' : 'opacity-10 group-hover:opacity-25'}`}
          style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* 3. Corner Brackets (Tactical Frame - Color Shift) */}
        {/* Colors: Idle (White/30) -> Hover (Cyan/Purple Blend) -> Drag (Grim Accent) */}
        <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 transition-all duration-300 ${isDragActive ? 'border-grim-accent w-12 h-12' : 'border-white/30 group-hover:border-cyan-400 group-hover:w-10 group-hover:h-10'}`}></div>
        <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 transition-all duration-300 ${isDragActive ? 'border-grim-accent w-12 h-12' : 'border-white/30 group-hover:border-purple-400 group-hover:w-10 group-hover:h-10'}`}></div>
        <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 transition-all duration-300 ${isDragActive ? 'border-grim-accent w-12 h-12' : 'border-white/30 group-hover:border-purple-400 group-hover:w-10 group-hover:h-10'}`}></div>
        <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 transition-all duration-300 ${isDragActive ? 'border-grim-accent w-12 h-12' : 'border-white/30 group-hover:border-cyan-400 group-hover:w-10 group-hover:h-10'}`}></div>

        {/* 4. Center Scanline Scanner (Only during Drag) */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${isDragActive ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full h-[2px] bg-grim-accent shadow-[0_0_15px_#00ffcc] animate-[scan_1.5s_linear_infinite]"></div>
        </div>

        {/* 5. Content Layer */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 text-center">
          {activeLayer?.textureUrl ? (
            <div className="relative group/preview w-full h-full flex flex-col items-center justify-center">
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-white/20 group-hover/preview:border-grim-accent transition-colors">
                <img
                  src={activeLayer.textureUrl}
                  alt="Uploaded texture"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity backdrop-blur-sm">
                  <span className="text-grim-accent font-bold uppercase tracking-wider text-sm border border-grim-accent px-3 py-1 bg-black/50">Replace Data</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs font-mono text-grim-accent/80">
                <span className="w-2 h-2 rounded-full bg-grim-accent animate-pulse"></span>
                Texture Loaded
              </div>
            </div>
          ) : (
            <div className={`transition-all duration-300 ${isDragActive ? 'scale-110' : 'group-hover:scale-105'}`}>
              {/* Icon Circle HUD */}
              <div className={`
                    relative w-24 h-24 mx-auto mb-4 rounded-full border border-dashed flex items-center justify-center transition-all duration-500
                    ${isDragActive
                  ? 'border-grim-accent bg-grim-accent/20 rotate-180 scale-110'
                  : 'border-white/20 group-hover:border-cyan-400 group-hover:bg-cyan-400/10 group-hover:rotate-90'
                }
                  `}>
                <div className={`absolute inset-0 rounded-full border border-grim-accent/30 animate-[ping_3s_linear_infinite] ${!isDragActive && 'hidden'}`}></div>

                {isDragActive ? (
                  <Upload className="w-10 h-10 text-grim-accent animate-bounce" />
                ) : (
                  <FileImage className="w-10 h-10 text-gray-400 group-hover:text-cyan-300 transition-colors duration-300" />
                )}
              </div>

              <h4 className={`text-lg font-bold uppercase tracking-wider mb-1 transition-colors ${isDragActive ? 'text-grim-accent' : 'text-gray-300 group-hover:text-white'}`}>
                {isDragActive ? 'INITIALIZING UPLOAD...' : 'DROP IMAGE FILE'}
              </h4>

              <p className={`text-xs font-mono transition-colors ${isDragActive ? 'text-grim-accent/60' : 'text-gray-500 group-hover:text-gray-300'}`}>
                [ OR CLICK TO BROWSE SYSTEM ]
              </p>

              <div className="mt-4 flex gap-2 justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono group-hover:border-cyan-500/30 group-hover:text-cyan-200/80 transition-colors">JPG</span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono group-hover:border-purple-500/30 group-hover:text-purple-200/80 transition-colors">PNG</span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono group-hover:border-cyan-500/30 group-hover:text-cyan-200/80 transition-colors">SVG</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
