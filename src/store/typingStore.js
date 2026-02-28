import { create } from 'zustand'

const useTypingStore = create((set, get) => ({
  // Typing mode state
  typingMode: false,
  typedText: '',
  cursorPos: 0, // cursor position within typedText

  // Currently pressed keys (model key names) — for animation
  pressedKeys: new Set(),

  // Sound settings
  soundEnabled: true,

  // Actions
  enterTypingMode: () => set({ typingMode: true }),
  exitTypingMode: () => set({ typingMode: false, typedText: '', cursorPos: 0 }),

  appendChar: (char) => set((state) => {
    const before = state.typedText.slice(0, state.cursorPos)
    const after = state.typedText.slice(state.cursorPos)
    return {
      typedText: before + char + after,
      cursorPos: state.cursorPos + char.length
    }
  }),

  handleBackspace: () => set((state) => {
    if (state.cursorPos === 0) return state
    const before = state.typedText.slice(0, state.cursorPos - 1)
    const after = state.typedText.slice(state.cursorPos)
    return {
      typedText: before + after,
      cursorPos: state.cursorPos - 1
    }
  }),

  handleDelete: () => set((state) => {
    if (state.cursorPos >= state.typedText.length) return state
    const before = state.typedText.slice(0, state.cursorPos)
    const after = state.typedText.slice(state.cursorPos + 1)
    return { typedText: before + after }
  }),

  moveCursorLeft: () => set((state) => ({
    cursorPos: Math.max(0, state.cursorPos - 1)
  })),

  moveCursorRight: () => set((state) => ({
    cursorPos: Math.min(state.typedText.length, state.cursorPos + 1)
  })),

  moveCursorHome: () => set({ cursorPos: 0 }),

  moveCursorEnd: () => set((state) => ({
    cursorPos: state.typedText.length
  })),

  clearText: () => set({ typedText: '', cursorPos: 0 }),

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
