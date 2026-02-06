import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import useConfiguratorStore from '../../store/configuratorStore'

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
      <h3 className="text-lg font-display font-semibold text-grim-accent">Upload Texture</h3>
      
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-300
          ${isDragActive 
            ? 'border-grim-accent bg-grim-accent/10' 
            : 'border-gray-600 hover:border-grim-accent/50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        {activeLayer?.textureUrl ? (
          <div className="space-y-3">
            <img 
              src={activeLayer.textureUrl} 
              alt="Uploaded texture" 
              className="w-full h-32 object-cover rounded-lg"
            />
            <p className="text-sm text-gray-400">
              Click or drag to replace
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-300">
                {isDragActive ? 'Drop your image here' : 'Drag & drop an image'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                or click to browse
              </p>
            </div>
            <p className="text-xs text-gray-600">
              JPG, PNG, SVG • Max 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
