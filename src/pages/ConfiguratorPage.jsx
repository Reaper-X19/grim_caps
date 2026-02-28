import { Suspense, useState } from 'react'
import { Save, Layers, Sliders, MousePointerClick, X, ChevronUp, RotateCcw, Lock, Unlock, Move, Orbit } from 'lucide-react'
import KeyboardScene from '../components/3d/KeyboardScene'
import LayerPanel from '../components/configurator/LayerPanel'
import ControlPanel from '../components/configurator/ControlPanel'
import KeySelectionPanel from '../components/configurator/KeySelectionPanel'
import SaveDesignModal from '../components/configurator/SaveDesignModal'
import ErrorBoundary from '../components/ErrorBoundary'
import useCameraStore from '../store/cameraStore'

// ─── Camera Control Bar ───────────────────────────────────────────────────────
function CameraControlBar() {
  const rotateEnabled = useCameraStore((s) => s.rotateEnabled)
  const panEnabled = useCameraStore((s) => s.panEnabled)
  const zoomEnabled = useCameraStore((s) => s.zoomEnabled)
  const toggleRotate = useCameraStore((s) => s.toggleRotate)
  const togglePan = useCameraStore((s) => s.togglePan)
  const toggleZoom = useCameraStore((s) => s.toggleZoom)
  const resetCamera = useCameraStore((s) => s.resetCamera)

  return (
    <div className="fixed bottom-16 2xl:bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div className="flex items-center gap-1 sm:gap-2 bg-grim-panel/90 backdrop-blur-xl border border-white/10 px-2 sm:px-3 py-1.5 sm:py-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
      >
        {/* Rotate Toggle */}
        <button
          onClick={toggleRotate}
          className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all border ${
            rotateEnabled
              ? 'bg-grim-cyan/10 border-grim-cyan/50 text-grim-cyan shadow-[0_0_8px_rgba(0,240,255,0.2)]'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
          title={rotateEnabled ? 'Lock Rotation' : 'Unlock Rotation'}
        >
          {rotateEnabled ? (
            <Unlock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          ) : (
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          )}
          <span className="hidden sm:inline">Rotate</span>
        </button>

        {/* Pan Toggle */}
        <button
          onClick={togglePan}
          className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all border ${
            panEnabled
              ? 'bg-grim-purple/10 border-grim-purple/50 text-grim-purple shadow-[0_0_8px_rgba(176,38,255,0.2)]'
              : 'bg-gray-700/30 border-gray-600/30 text-gray-500'
          }`}
          title={panEnabled ? 'Lock Position' : 'Unlock Position'}
        >
          {panEnabled ? (
            <Unlock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          ) : (
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          )}
          <span className="hidden sm:inline">Position</span>
        </button>

        {/* Zoom Toggle */}
        <button
          onClick={toggleZoom}
          className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all border ${
            zoomEnabled
              ? 'bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.2)]'
              : 'bg-gray-700/30 border-gray-600/30 text-gray-500'
          }`}
          title={zoomEnabled ? 'Lock Zoom' : 'Unlock Zoom'}
        >
          {zoomEnabled ? (
            <Unlock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          ) : (
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          )}
          <span className="hidden sm:inline">Zoom</span>
        </button>

        {/* Divider */}
        <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5"></div>

        {/* Reset Camera */}
        <button
          onClick={resetCamera}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-grim-pink/80 hover:text-grim-pink border border-grim-pink/20 hover:border-grim-pink/50 hover:bg-grim-pink/10 transition-all group"
          title="Reset Camera"
        >
          <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:animate-spin" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </div>
  )
}

export default function ConfiguratorPage() {
  const [activeTab, setActiveTab] = useState('customize')
  const [showSaveModal, setShowSaveModal] = useState(false)
  // Mobile drawer state
  const [mobileDrawer, setMobileDrawer] = useState(null) // null | 'layers' | 'customize' | 'select'

  const toggleDrawer = (drawer) => {
    setMobileDrawer(prev => prev === drawer ? null : drawer)
  }

  return (
    <div className="fixed inset-0 bg-[#050505] overflow-hidden">
      {/* 1. Cyber-Void Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grim-void overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
                 linear-gradient(rgba(176, 38, 255, 0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
               `,
            backgroundSize: '50px 50px',
          }}>
        </div>


      </div>

      {/* 2. Deep Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#030014_100%)] z-0 pointer-events-none"></div>

      {/* Fullscreen 3D Scene */}
      <div className="absolute inset-0">
        <ErrorBoundary>
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-grim-void">
              <div className="text-center relative">
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

      {/* ═══════════════════════════════════════════════════════════════
          DESKTOP LAYOUT (≥1024px) — Side panels
          ═══════════════════════════════════════════════════════════════ */}

      {/* Floating Left Panel - Layers */}
      <div className="hidden 2xl:block absolute left-8 top-28 bottom-8 w-80 pointer-events-none perspective-[1000px]">
        <div className="h-full flex flex-col pointer-events-auto transform transition-transform hover:translate-x-1 duration-300">
          <div className="bg-grim-panel/80 backdrop-blur-xl p-0 rounded-xl shadow-[0_0_30px_rgba(176,38,255,0.15)] max-h-full overflow-y-auto border border-white/5 flex flex-col h-full relative group overflow-hidden">
            <div className="absolute inset-0 rounded-xl border border-transparent bg-gradient-to-br from-grim-cyan/30 via-transparent to-grim-purple/30 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ maskImage: 'linear-gradient(black, black)', WebkitMaskImage: 'linear-gradient(black, black)', maskComposite: 'exclude', WebkitMaskComposite: 'xor' }}></div>
            <div className="h-[2px] w-full bg-gradient-to-r from-grim-cyan via-grim-purple to-grim-pink shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar relative z-10">
              <LayerPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Right Panel - Controls */}
      <div className="hidden 2xl:block absolute right-8 top-28 bottom-8 w-80 pointer-events-none z-10 perspective-[1000px]">
        <div className="h-full flex flex-col pointer-events-auto transform transition-transform hover:-translate-x-1 duration-300">
          <div className="bg-grim-panel/80 backdrop-blur-xl p-0 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.15)] max-h-full overflow-hidden border border-white/5 flex flex-col h-full relative group">
            <div className="absolute inset-0 rounded-xl border border-transparent bg-gradient-to-bl from-grim-pink/30 via-transparent to-grim-cyan/30 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="h-[2px] w-full bg-gradient-to-l from-grim-cyan via-grim-purple to-grim-pink shadow-[0_0_10px_rgba(176,38,255,0.5)]"></div>
            <div className="p-6 flex flex-col h-full relative z-10">
              {/* Tab Headers */}
              <div className="flex mb-6 bg-black/40 p-1 rounded-lg border border-white/5 relative">
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-grim-purple/20 to-grim-cyan/20 border border-grim-cyan/30 rounded-md transition-all duration-300 ease-out shadow-[0_0_15px_rgba(191,0,255,0.2)] ${activeTab === 'select' ? 'translate-x-[100%] left-1' : 'left-1'
                    }`}
                ></div>
                <button
                  onClick={() => setActiveTab('customize')}
                  className={`flex-1 py-2 font-display font-bold text-xs uppercase tracking-wider relative z-10 transition-colors duration-300 ${activeTab === 'customize' ? 'text-grim-cyan drop-shadow-[0_0_5px_rgba(191,0,255,0.8)]' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                  Customize
                </button>
                <button
                  onClick={() => setActiveTab('select')}
                  className={`flex-1 py-2 font-display font-bold text-xs uppercase tracking-wider relative z-10 transition-colors duration-300 ${activeTab === 'select' ? 'text-grim-cyan drop-shadow-[0_0_5px_rgba(191,0,255,0.8)]' : 'text-gray-500 hover:text-gray-300'
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

      {/* Top Instructions Bar — desktop only */}
      <div className="hidden sm:block absolute top-28 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div className="bg-grim-panel/60 backdrop-blur-md px-4 sm:px-6 py-2 rounded-full border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-auto flex gap-4 sm:gap-8 items-center">
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

      {/* ═══════════════════════════════════════════════════════════════
          CAMERA CONTROLS BAR — responsive floating bar
          ═══════════════════════════════════════════════════════════════ */}
      <CameraControlBar />

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE/TABLET LAYOUT (<1024px) — Bottom drawer
          ═══════════════════════════════════════════════════════════════ */}

      {/* Mobile Bottom Tab Bar */}
      <div className="2xl:hidden fixed bottom-0 left-0 right-0 z-30">
        {/* Drawer */}
        <div
          className={`transition-all duration-300 ease-out overflow-hidden ${mobileDrawer ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="bg-grim-panel/95 backdrop-blur-xl border-t border-white/10 overflow-y-auto max-h-[60vh] relative">
            {/* Close button */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-2 bg-grim-panel/95 backdrop-blur-xl border-b border-white/5">
              <span className="text-xs font-display font-bold text-grim-cyan uppercase tracking-widest">
                {mobileDrawer === 'layers' && 'Layers'}
                {mobileDrawer === 'customize' && 'Customize'}
                {mobileDrawer === 'select' && 'Select Keys'}
              </span>
              <button
                onClick={() => setMobileDrawer(null)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              {mobileDrawer === 'layers' && <LayerPanel />}
              {mobileDrawer === 'customize' && <ControlPanel />}
              {mobileDrawer === 'select' && <KeySelectionPanel />}
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="bg-grim-panel/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around gap-1 safe-area-bottom">
          {[
            { id: 'layers', icon: Layers, label: 'Layers' },
            { id: 'customize', icon: Sliders, label: 'Customize' },
            { id: 'select', icon: MousePointerClick, label: 'Select' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => toggleDrawer(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-all duration-200 ${mobileDrawer === id
                ? 'text-grim-cyan bg-grim-cyan/10 border border-grim-cyan/20'
                : 'text-gray-500 hover:text-gray-300 border border-transparent'
                }`}
            >
              {mobileDrawer === id ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Save Design Modal */}
      <SaveDesignModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
      />

      {/* Save Design Button — responsive positioning */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowSaveModal(true)
        }}
        className="fixed top-20 sm:top-24 right-3 sm:right-8 z-[9999] group pointer-events-auto cursor-pointer"
      >
        <div className="relative">
          {/* Glitch Layers */}
          <div className="absolute inset-0 bg-grim-cyan translate-x-1 translate-y-1 opacity-0 group-hover:opacity-70 transition-opacity duration-100 pointer-events-none" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}></div>
          <div className="absolute inset-0 bg-grim-pink -translate-x-1 -translate-y-1 opacity-0 group-hover:opacity-70 transition-opacity duration-100 pointer-events-none" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}></div>

          {/* Main Button */}
          <div className="relative px-3 sm:px-6 py-2 bg-white hover:bg-white text-black font-black uppercase tracking-widest text-[10px] sm:text-xs transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] z-10 flex items-center gap-2 pointer-events-none"
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 10px)' }}>
            <Save className="w-3 h-3" />
            <span className="hidden sm:inline">Save Configuration</span>
            <span className="sm:hidden">Save</span>
          </div>
        </div>
      </button>
    </div>
  )
}
