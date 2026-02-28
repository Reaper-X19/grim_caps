import { create } from 'zustand'

const useTypingStore = create((set, get) => ({
  // Typing mode state
  typingMode: false,
  typedText: '',

  // Currently pressed keys (model key names) — for animation
  pressedKeys: new Set(),

  // Sound settings
  soundEnabled: true,

  // Actions
  enterTypingMode: () => set({ typingMode: true }),
  exitTypingMode: () => set({ typingMode: false, typedText: '' }),

  appendChar: (char) => set((state) => ({
    typedText: state.typedText + char
  })),

  handleBackspace: () => set((state) => ({
    typedText: state.typedText.slice(0, -1)
  })),

  clearText: () => set({ typedText: '' }),

  keyDown: (modelKeyName) => set((state) => {
    const newSet = new Set(state.pressedKeys)
    newSet.add(modelKeyName)
    return { pressedKeys: newSet }
  }),

  keyUp: (modelKeyName) => set((state) => {
    const newSet = new Set(state.pressedKeys)
    newSet.delete(modelKeyName)
    return { pressedKeys: newSet }
  }),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}))

export default useTypingStore
