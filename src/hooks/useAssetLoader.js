import { useState, useEffect, useRef } from 'react'

/**
 * useAssetLoader
 *
 * Tracks Three.js DefaultLoadingManager to derive a real loading
 * percentage. Falls back gracefully when there are no 3D assets
 * (auto-completes after a minimum display duration so the animation
 * always has time to play).
 *
 * Returns: { progress: 0-100, isLoaded: boolean }
 */
export default function useAssetLoader(minDurationMs = 2200) {
  const [progress, setProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const startTimeRef = useRef(Date.now())
  const itemsLoadedRef = useRef(0)
  const itemsTotalRef = useRef(0)
  const animFrameRef = useRef(null)
  const finalizedRef = useRef(false)

  useEffect(() => {
    // Smoothly animate the displayed progress toward a target value.
    let displayProgress = 0
    let targetProgress = 0

    const animate = () => {
      const diff = targetProgress - displayProgress
      if (Math.abs(diff) > 0.3) {
        displayProgress += diff * 0.08
        setProgress(Math.min(100, Math.round(displayProgress)))
      } else if (displayProgress !== targetProgress) {
        displayProgress = targetProgress
        setProgress(targetProgress)
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)

    const finalize = () => {
      if (finalizedRef.current) return
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, minDurationMs - elapsed)

      setTimeout(() => {
        targetProgress = 100
        // After progress hits 100, wait a beat then mark as loaded
        setTimeout(() => {
          finalizedRef.current = true
          setIsLoaded(true)
        }, 600)
      }, remaining)
    }

    // Hook into Three.js DefaultLoadingManager
    const hookThree = () => {
      try {
        const THREE = window.__THREE__ || null

        // Three.js exposes DefaultLoadingManager globally after the first
        // import.  We poll for it briefly since our hook may run before
        // the first 3D component mounts.
        if (!THREE) {
          return import('three').then(({ DefaultLoadingManager }) => {
            attachManager(DefaultLoadingManager, finalize, setTarget)
          }).catch(() => {
            // three.js not available — simulate progress
            simulateProgress(setTarget, finalize)
          })
        }

        attachManager(THREE.DefaultLoadingManager, finalize, setTarget)
      } catch {
        simulateProgress(setTarget, finalize)
      }
    }

    function setTarget(val) {
      targetProgress = Math.max(targetProgress, val)
    }

    hookThree()

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [minDurationMs])

  return { progress, isLoaded }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function attachManager(manager, finalize, setTarget) {
  let itemsLoaded = 0
  let itemsTotal = 0
  let hasStarted = false

  const origStart = manager.onStart
  const origProgress = manager.onProgress
  const origLoad = manager.onLoad
  const origError = manager.onError

  manager.onStart = (url, loaded, total) => {
    hasStarted = true
    itemsTotal = Math.max(itemsTotal, total)
    if (origStart) origStart(url, loaded, total)
  }

  manager.onProgress = (url, loaded, total) => {
    hasStarted = true
    itemsLoaded = loaded
    itemsTotal = Math.max(itemsTotal, total)
    if (itemsTotal > 0) {
      // Map to 10–95 range — keep 0-10 for initial animation, 95-100 for exit
      const raw = (itemsLoaded / itemsTotal) * 85 + 10
      setTarget(Math.min(95, Math.round(raw)))
    }
    if (origProgress) origProgress(url, loaded, total)
  }

  manager.onLoad = () => {
    if (!hasStarted) {
      // No assets loaded via manager — simulate quick fill
      setTarget(90)
    }
    finalize()
    if (origLoad) origLoad()
  }

  manager.onError = (url) => {
    // Don't stall on errors — treat as if that item loaded
    itemsLoaded = Math.min(itemsLoaded + 1, itemsTotal)
    if (origError) origError(url)
  }

  // Safety net: if nothing loads within 4s, auto-complete
  setTimeout(() => {
    if (!hasStarted) finalize()
  }, 4000)
}

function simulateProgress(setTarget, finalize) {
  // Fake a believable download curve
  const steps = [
    { delay: 80,  value: 12 },
    { delay: 200, value: 28 },
    { delay: 400, value: 45 },
    { delay: 700, value: 62 },
    { delay: 1100, value: 78 },
    { delay: 1600, value: 89 },
    { delay: 2000, value: 95 },
  ]
  steps.forEach(({ delay, value }) => {
    setTimeout(() => setTarget(value), delay)
  })
  setTimeout(finalize, 2000)
}
