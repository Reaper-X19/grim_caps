/**
 * Keyboard Sound Engine — Cherry MX Black PBT
 *
 * Uses Web Audio API to play sound sprites from a single .ogg file.
 * Each key has a [start_ms, duration_ms] region defined in config.json.
 */

const SOUND_URL = '/cherrymx-black-pbt/sound.ogg'
const CONFIG_URL = '/cherrymx-black-pbt/config.json'

let audioContext = null
let audioBuffer = null
let soundDefines = null
let isLoaded = false
let isMuted = false
let volume = 0.6

/**
 * Initialize the sound engine — loads audio buffer + config
 * Call once on first user interaction (to satisfy autoplay policy)
 */
export async function initSoundEngine() {
  if (isLoaded) return

  try {
    // Create AudioContext on user gesture
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }

    // Resume if suspended (some browsers require this)
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    // Load config and audio in parallel
    const [configRes, audioRes] = await Promise.all([
      fetch(CONFIG_URL),
      fetch(SOUND_URL)
    ])

    const config = await configRes.json()
    soundDefines = config.defines

    const arrayBuffer = await audioRes.arrayBuffer()
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    isLoaded = true
  } catch (err) {
    console.warn('Failed to initialize sound engine:', err)
  }
}

/**
 * Play the sound for a given scancode
 * @param {string} scancode - The key scancode from config.json
 */
export function playKeySound(scancode) {
  if (!isLoaded || isMuted || !audioBuffer || !soundDefines) return

  const sprite = soundDefines[scancode]
  if (!sprite) return

  const [startMs, durationMs] = sprite
  const startSec = startMs / 1000
  const durationSec = durationMs / 1000

  try {
    // Resume context if needed (e.g., after tab switch)
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer

    // Volume control via GainNode
    const gainNode = audioContext.createGain()
    gainNode.gain.value = volume

    source.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Play the sprite slice
    source.start(0, startSec, durationSec)
  } catch (err) {
    // Silently fail — don't break the UI
  }
}

/**
 * Check if sound engine is ready
 */
export function isSoundReady() {
  return isLoaded
}

/**
 * Set volume (0.0 to 1.0)
 */
export function setVolume(v) {
  volume = Math.max(0, Math.min(1, v))
}

/**
 * Get current volume
 */
export function getVolume() {
  return volume
}

/**
 * Toggle mute
 */
export function toggleMute() {
  isMuted = !isMuted
  return isMuted
}

/**
 * Get mute state
 */
export function getMuted() {
  return isMuted
}
