import { create } from 'zustand'

const useCameraStore = create((set) => ({
  // Camera control locks
  rotateEnabled: true,
  panEnabled: false,
  zoomEnabled: true,

  // Reset trigger (incremented to signal reset)
  resetTrigger: 0,

  // Actions
  toggleRotate: () => set((state) => ({ rotateEnabled: !state.rotateEnabled })),
  togglePan: () => set((state) => ({ panEnabled: !state.panEnabled })),
  toggleZoom: () => set((state) => ({ zoomEnabled: !state.zoomEnabled })),
  setRotateEnabled: (enabled) => set({ rotateEnabled: enabled }),
  setPanEnabled: (enabled) => set({ panEnabled: enabled }),
  setZoomEnabled: (enabled) => set({ zoomEnabled: enabled }),
  resetCamera: () => set((state) => ({ resetTrigger: state.resetTrigger + 1 })),
}))

export default useCameraStore
