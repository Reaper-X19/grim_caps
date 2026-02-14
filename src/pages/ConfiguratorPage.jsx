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
    <div className="fixed inset-0 bg-[#050505] overflow-hidden">
      {/* 1. Cyber-Void Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grim-void overflow-hidden">
        {/* Dynamic Grid - Using a simple repeating linear gradient for performance */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
                 linear-gradient(rgba(176, 38, 255, 0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
               `,
            backgroundSize: '50px 50px',
            // Simple animation via keyframes can be added in global CSS, or simulated here with a transform if needed.
            // For now, static but high-contrast.
          }}>
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-grim-purple/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-grim-cyan/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
      </div>

      {/* 2. Deep Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#030014_100%)] z-0 pointer-events-none"></div>

      {/* Fullscreen 3D Scene */}
      <div className="absolute inset-0">
        <ErrorBoundary>
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-grim-void">
              <div className="text-center relative">
                {/* Decorative Loader Ring */}
                <div className="absolute inset-0 border-4 border-grim-purple/30 rounded-full animate-ping"></div>
                <div className="relative z-10 animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-grim-cyan"></div>
                <p className="mt-4 text-grim-cyan font-display font-bold uppercase tracking-[0.2em] text-sm animate-pulse">
                  Initializing <span className="text-grim-purple">Void</span>
                </p>
              </div>
            </div>
          }>
            <KeyboardScene />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Floating Left Panel - Layers (Cyber-Holo Style) */}
      <div className="absolute left-8 top-28 bottom-8 w-80 pointer-events-none perspective-[1000px]">
        <div className="h-full flex flex-col pointer-events-auto transform transition-transform hover:translate-x-1 duration-300">
          <div className="bg-grim-panel/80 backdrop-blur-xl p-0 rounded-xl shadow-[0_0_30px_rgba(176,38,255,0.15)] max-h-full overflow-y-auto border border-white/5 flex flex-col h-full relative group overflow-hidden">
            {/* Holographic Border Effect */}
            <div className="absolute inset-0 rounded-xl border border-transparent bg-gradient-to-br from-grim-cyan/30 via-transparent to-grim-purple/30 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ maskImage: 'linear-gradient(black, black)', WebkitMaskImage: 'linear-gradient(black, black)', maskComposite: 'exclude', WebkitMaskComposite: 'xor' }}></div>

            {/* Top Glow Line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-grim-cyan via-grim-purple to-grim-pink shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar relative z-10">
              <LayerPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Right Panel - Controls (Cyber-Holo Style) */}
      <div className="absolute right-8 top-28 bottom-8 w-80 pointer-events-none z-10 perspective-[1000px]">
        <div className="h-full flex flex-col pointer-events-auto transform transition-transform hover:-translate-x-1 duration-300">
          <div className="bg-grim-panel/80 backdrop-blur-xl p-0 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.15)] max-h-full overflow-hidden border border-white/5 flex flex-col h-full relative group">
            {/* Holographic Border Effect */}
            <div className="absolute inset-0 rounded-xl border border-transparent bg-gradient-to-bl from-grim-pink/30 via-transparent to-grim-cyan/30 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            {/* Top Glow Line */}
            <div className="h-[2px] w-full bg-gradient-to-l from-grim-cyan via-grim-purple to-grim-pink shadow-[0_0_10px_rgba(176,38,255,0.5)]"></div>

            <div className="p-6 flex flex-col h-full relative z-10">
              {/* Tab Headers - Neon Segmented Control */}
              <div className="flex mb-6 bg-black/40 p-1 rounded-lg border border-white/5 relative">
                {/* Active Slider Background */}
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-grim-purple/20 to-grim-cyan/20 border border-grim-cyan/30 rounded-md transition-all duration-300 ease-out shadow-[0_0_15px_rgba(0,240,255,0.2)] ${activeTab === 'select' ? 'translate-x-[100%] left-1' : 'left-1'
                    }`}
                ></div>

                <button
                  onClick={() => setActiveTab('customize')}
                  className={`flex-1 py-2 font-display font-bold text-xs uppercase tracking-wider relative z-10 transition-colors duration-300 ${activeTab === 'customize' ? 'text-grim-cyan drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                  Customize
                </button>
                <button
                  onClick={() => setActiveTab('select')}
                  className={`flex-1 py-2 font-display font-bold text-xs uppercase tracking-wider relative z-10 transition-colors duration-300 ${activeTab === 'select' ? 'text-grim-cyan drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                  Select Keys
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {activeTab === 'customize' && <ControlPanel />}
                {activeTab === 'select' && <KeySelectionPanel />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Instructions Bar - Floating HUD */}
      <div className="absolute top-28 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div className="bg-grim-panel/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-auto flex gap-8 items-center">
          <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-grim-text-muted">
            <span className="text-grim-cyan bg-grim-cyan/10 px-1.5 py-0.5 rounded border border-grim-cyan/20">R-CLICK</span>
            <span className="tracking-wider">ROTATE</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20"></div>
          <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-grim-text-muted">
            <span className="text-grim-purple bg-grim-purple/10 px-1.5 py-0.5 rounded border border-grim-purple/20">SCROLL</span>
            <span className="tracking-wider">ZOOM</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20"></div>
          <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-grim-text-muted">
            <span className="text-grim-pink bg-grim-pink/10 px-1.5 py-0.5 rounded border border-grim-pink/20">L-CLICK</span>
            <span className="tracking-wider">SELECT</span>
          </div>
        </div>
      </div>

      {/* Save Design Modal */}
      <SaveDesignModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
      />

      {/* Save Design Button - Unique Glitch Style */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log('Save Design clicked!')
          setShowSaveModal(true)
        }}
        className="fixed top-24 right-8 z-[9999] group pointer-events-auto cursor-pointer"
      >
        <div className="relative">
          {/* Glitch Layers */}
          <div className="absolute inset-0 bg-grim-cyan translate-x-1 translate-y-1 opacity-0 group-hover:opacity-70 transition-opacity duration-100 clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px] pointer-events-none" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}></div>
          <div className="absolute inset-0 bg-grim-pink -translate-x-1 -translate-y-1 opacity-0 group-hover:opacity-70 transition-opacity duration-100 clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px] pointer-events-none" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}></div>

          {/* Main Button */}
          <div className="relative px-6 py-2 bg-white hover:bg-white text-black font-black uppercase tracking-widest text-xs clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px] transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] z-10 flex items-center gap-2 pointer-events-none"
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
            <Save className="w-3 h-3" />
            <span>Save Configuration</span>
          </div>
        </div>
      </button>
    </div>
  )
}
