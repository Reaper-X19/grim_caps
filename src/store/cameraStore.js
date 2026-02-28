import { create } from 'zustand'

const useCameraStore = create((set) => ({
  // Camera control locks
  rotateEnabled: true,
  panEnabled: false,

  // Reset trigger (incremented to signal reset)
  resetTrigger: 0,

  // Actions
  toggleRotate: () => set((state) => ({ rotateEnabled: !state.rotateEnabled })),
  togglePan: () => set((state) => ({ panEnabled: !state.panEnabled })),
  setRotateEnabled: (enabled) => set({ rotateEnabled: enabled }),
  setPanEnabled: (enabled) => set({ panEnabled: enabled }),
  resetCamera: () => set((state) => ({ resetTrigger: state.resetTrigger + 1 })),
}))

export default useCameraStore
