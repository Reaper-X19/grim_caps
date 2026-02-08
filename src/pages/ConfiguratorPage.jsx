import { Suspense, useState } from 'react'
import { Save } from 'lucide-react'
import KeyboardScene from '../components/3d/KeyboardScene'
import LayerPanel from '../components/configurator/LayerPanel'
import ControlPanel from '../components/configurator/ControlPanel'
import KeySelectionPanel from '../components/configurator/KeySelectionPanel'
import SaveDesignModal from '../components/configurator/SaveDesignModal'
import ErrorBoundary from '../components/ErrorBoundary'

export default function ConfiguratorPage() {
  const [activeTab, setActiveTab] = useState('customize')
  const [showSaveModal, setShowSaveModal] = useState(false)
  
  return (
    <div className="fixed inset-0" style={{
      background: `
        radial-gradient(ellipse 800px 600px at 20% 30%, rgba(0, 255, 204, 0.25) 0%, transparent 50%),
        radial-gradient(ellipse 700px 700px at 80% 20%, rgba(139, 92, 246, 0.28) 0%, transparent 50%),
        radial-gradient(ellipse 600px 500px at 50% 80%, rgba(236, 72, 153, 0.22) 0%, transparent 50%),
        radial-gradient(ellipse 900px 800px at 90% 90%, rgba(59, 130, 246, 0.18) 0%, transparent 50%),
        linear-gradient(135deg, #0f0f0f 0%, #2a1a3f 25%, #1a2a3f 50%, #2a1f3f 75%, #0f0f1f 100%)
      `
    }}>
      {/* Fullscreen 3D Scene */}
      <div className="absolute inset-0">
        <ErrorBoundary>
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-grim-darker to-grim-dark">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-grim-accent border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-400">Loading 3D Model...</p>
              </div>
            </div>
          }>
            <KeyboardScene />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Floating Left Panel - Layers */}
      <div className="absolute left-6 top-24 bottom-6 w-80 pointer-events-none">
        <div className="h-full flex flex-col pointer-events-auto">
          <div className="glass p-6 rounded-xl shadow-2xl max-h-full overflow-y-auto">
            <LayerPanel />
          </div>
        </div>
      </div>

      {/* Floating Right Panel - Controls with Tabs */}
      <div className="absolute right-6 top-24 bottom-6 w-80 pointer-events-none z-10">
        <div className="h-full flex flex-col pointer-events-auto">
          <div className="glass p-6 rounded-xl shadow-2xl max-h-full overflow-y-auto flex flex-col">
            {/* Tab Headers */}
            <div className="flex gap-2 mb-6 border-b border-gray-700/50 pb-2">
              <button
                onClick={() => setActiveTab('customize')}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === 'customize'
                    ? 'bg-grim-accent text-black'
                    : 'bg-grim-dark/50 text-gray-400 hover:text-gray-200'
                }`}
              >
                Customize
              </button>
              <button
                onClick={() => setActiveTab('select')}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === 'select'
                    ? 'bg-grim-accent text-black'
                    : 'bg-grim-dark/50 text-gray-400 hover:text-gray-200'
                }`}
              >
                Select Keys
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'customize' && <ControlPanel />}
              {activeTab === 'select' && <KeySelectionPanel />}
            </div>
          </div>
        </div>
      </div>

      {/* Top Instructions Bar */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div className="glass px-6 py-3 rounded-full shadow-lg pointer-events-auto">
          <div className="flex items-center space-x-4 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-grim-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span>Drag to rotate</span>
            </div>
            <div className="w-px h-4 bg-gray-600"></div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-grim-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
              <span>Scroll to zoom</span>
            </div>
            <div className="w-px h-4 bg-gray-600"></div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-grim-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
              </svg>
              <span>Click keys to select</span>
            </div>
          </div>
        </div>
      </div>


      {/* Save Design Modal */}
      <SaveDesignModal 
        isOpen={showSaveModal} 
        onClose={() => setShowSaveModal(false)} 
      />

      {/* Save Design Button - ABSOLUTE HIGHEST Z-INDEX, RENDERED LAST */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log('Save Design clicked!')
          setShowSaveModal(true)
        }}
        onMouseEnter={() => console.log('Mouse entered Save Design button')}
        className="fixed top-6 right-6 z-[9999] px-6 py-3 bg-grim-accent text-black font-display font-bold rounded-lg hover:bg-grim-accent/90 transition-all duration-200 flex items-center gap-2 shadow-2xl cursor-pointer"
        style={{ 
          pointerEvents: 'auto', 
          cursor: 'pointer',
          position: 'fixed',
          zIndex: 9999
        }}
      >
        <Save className="w-5 h-5" />
        Save Design
      </button>
    </div>
  )
}

