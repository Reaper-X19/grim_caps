import { useEffect, useRef } from 'react'
import useTypingStore from '../../store/typingStore'
import { toggleMute } from '../../utils/keyboardSoundEngine'

export default function TypingOverlay() {
  const typingMode = useTypingStore((s) => s.typingMode)
  const typedText = useTypingStore((s) => s.typedText)
  const cursorPos = useTypingStore((s) => s.cursorPos)
  const soundEnabled = useTypingStore((s) => s.soundEnabled)
  const exitTypingMode = useTypingStore((s) => s.exitTypingMode)
  const clearText = useTypingStore((s) => s.clearText)
  const toggleSound = useTypingStore((s) => s.toggleSound)

  const textRef = useRef(null)

  // Auto-scroll to keep cursor visible
  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight
    }
  }, [typedText, cursorPos])

  if (!typingMode) return null

  // Split text at cursor position for rendering
  const beforeCursor = typedText.slice(0, cursorPos)
  const afterCursor = typedText.slice(cursorPos)

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative bg-black/80 backdrop-blur-xl border border-grim-cyan/30 shadow-[0_0_30px_rgba(0,240,255,0.15)]"
        style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-grim-cyan/20">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-grim-cyan rounded-full animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-grim-cyan uppercase tracking-[0.2em]">
              Typing Mode
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleSound()
                toggleMute()
              }}
              className={`p-1.5 transition-colors ${soundEnabled ? 'text-grim-cyan hover:text-white' : 'text-gray-600 hover:text-gray-400'}`}
              title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            >
              {soundEnabled ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.228 9.371L2 9.371V14.63h4.228l4.786 4.786V4.585L6.228 9.37z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>

            {/* Clear text */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearText()
              }}
              className="px-2 py-0.5 text-[9px] font-mono font-bold text-gray-500 hover:text-white border border-gray-700 hover:border-grim-cyan/50 transition-all uppercase tracking-widest"
            >
              Clear
            </button>

            {/* Close */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                exitTypingMode()
              }}
              className="p-1 text-gray-500 hover:text-grim-pink transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Text display with cursor */}
        <div
          ref={textRef}
          className="px-4 py-3 min-h-[60px] max-h-[120px] overflow-y-auto"
        >
          <p className="font-mono text-sm text-white/90 leading-relaxed whitespace-pre-wrap break-all">
            {beforeCursor}
            <span className="inline-block w-[2px] h-[1.1em] bg-grim-cyan animate-pulse align-middle" />
            {afterCursor}
          </p>
        </div>

        {/* Footer hint */}
        <div className="px-4 py-1.5 border-t border-grim-cyan/10">
          <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">
            Press ESC to close • Arrow keys move cursor • Backspace deletes
          </span>
        </div>
      </div>
    </div>
  )
}
