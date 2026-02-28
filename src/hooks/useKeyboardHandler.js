import { useEffect, useRef } from 'react'
import { KEY_MAP } from '../data/keyMapping'
import { initSoundEngine, playKeySound, isSoundReady } from '../utils/keyboardSoundEngine'
import useTypingStore from '../store/typingStore'
import useConfiguratorStore from '../store/configuratorStore'

/**
 * Custom hook: Handles physical keyboard → 3D keyboard interaction.
 *
 * - In selection mode: physical keys toggle selection on the 3D model
 * - Outside selection mode: enters typing mode, shows typed text
 * - Always: plays Cherry MX sound + triggers keydown/keyup animation
 * - Holding a key keeps it pressed (no repeat) — except Backspace/Delete
 * - Arrow keys move cursor in typing mode
 * - Only reacts to keys that exist on the 65% model
 */
export default function useKeyboardHandler() {
  const soundInitRef = useRef(false)

  // Configurator state
  const selectionMode = useConfiguratorStore((s) => s.selectionMode)
  const selectionLocked = useConfiguratorStore((s) => s.selectionLocked)
  const toggleKeySelection = useConfiguratorStore((s) => s.toggleKeySelection)

  // Typing state
  const keyDown = useTypingStore((s) => s.keyDown)
  const keyUp = useTypingStore((s) => s.keyUp)
  const appendChar = useTypingStore((s) => s.appendChar)
  const handleBackspace = useTypingStore((s) => s.handleBackspace)
  const handleDelete = useTypingStore((s) => s.handleDelete)
  const moveCursorLeft = useTypingStore((s) => s.moveCursorLeft)
  const moveCursorRight = useTypingStore((s) => s.moveCursorRight)
  const moveCursorHome = useTypingStore((s) => s.moveCursorHome)
  const moveCursorEnd = useTypingStore((s) => s.moveCursorEnd)
  const enterTypingMode = useTypingStore((s) => s.enterTypingMode)
  const exitTypingMode = useTypingStore((s) => s.exitTypingMode)
  const soundEnabled = useTypingStore((s) => s.soundEnabled)

  // Use refs for values we read in the event handler to avoid stale closures
  const selectionModeRef = useRef(selectionMode)
  const selectionLockedRef = useRef(selectionLocked)
  const soundEnabledRef = useRef(soundEnabled)

  useEffect(() => { selectionModeRef.current = selectionMode }, [selectionMode])
  useEffect(() => { selectionLockedRef.current = selectionLocked }, [selectionLocked])
  useEffect(() => { soundEnabledRef.current = soundEnabled }, [soundEnabled])

  // Keys that are allowed to repeat (like a real keyboard)
  const REPEATABLE_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']

  useEffect(() => {
    const handleKeyDown = async (e) => {
      // Don't intercept if user is typing in an input/textarea
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      // Look up this key in our mapping
      const mapping = KEY_MAP[e.code]
      if (!mapping) return // Key not on our 65% model — ignore

      // Prevent default for keys that would scroll or navigate
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
        e.preventDefault()
      }

      // Escape closes typing mode
      if (e.code === 'Escape') {
        exitTypingMode()
      }

      // Skip repeats — except for Backspace, Delete, and Arrow keys
      if (e.repeat && !REPEATABLE_KEYS.includes(e.code)) return

      // On first non-repeat keypress: init sound + animate
      if (!e.repeat) {
        // Initialize sound engine on first keypress (user gesture requirement)
        if (!soundInitRef.current) {
          soundInitRef.current = true
          await initSoundEngine()
        }

        // Play sound (only on initial press, not repeats)
        if (soundEnabledRef.current && isSoundReady()) {
          playKeySound(mapping.scancode)
        }

        // Trigger keydown animation (only on initial press)
        keyDown(mapping.model)
      }

      // Mode-dependent behavior
      if (selectionModeRef.current && !selectionLockedRef.current) {
        // Selection mode: toggle key selection (no repeat)
        if (!e.repeat) {
          toggleKeySelection(mapping.model)
        }
      } else if (!selectionModeRef.current) {
        // Typing mode
        enterTypingMode()

        if (e.code === 'Backspace') {
          handleBackspace()
        } else if (e.code === 'Delete') {
          handleDelete()
        } else if (e.code === 'ArrowLeft') {
          moveCursorLeft()
        } else if (e.code === 'ArrowRight') {
          moveCursorRight()
        } else if (e.code === 'Home') {
          moveCursorHome()
        } else if (e.code === 'End') {
          moveCursorEnd()
        } else if (mapping.char && !e.repeat) {
          // Handle shift for uppercase (no repeat for character keys)
          const char = e.shiftKey ? mapping.char.toUpperCase() : mapping.char
          appendChar(char)
        }
      }
    }

    const handleKeyUp = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const mapping = KEY_MAP[e.code]
      if (!mapping) return

      // Trigger keyup animation
      keyUp(mapping.model)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [toggleKeySelection, keyDown, keyUp, appendChar, handleBackspace, handleDelete,
      moveCursorLeft, moveCursorRight, moveCursorHome, moveCursorEnd,
      enterTypingMode, exitTypingMode])
}
