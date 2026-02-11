/**
 * Post-Processing Setup Template
 * 
 * Common post-processing effects for cinematic visuals:
 * - Bloom for glow effects
 * - Vignette for focus
 * - Color grading
 * 
 * Requires: @react-three/postprocessing
 */

import { EffectComposer, Bloom, Vignette, ChromaticAberration, ToneMapping } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { Vector2 } from 'three'

/**
 * Cinematic post-processing stack
 * Add this inside your Canvas component
 */
export function CinematicEffects({ 
  bloomIntensity = 0.5,
  bloomThreshold = 0.9,
  vignetteOpacity = 0.5,
  chromaticOffset = 0.002
}) {
  return (
    <EffectComposer>
      {/* Bloom - glow on bright areas */}
      <Bloom
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.9}
        intensity={bloomIntensity}
        mipmapBlur
      />
      
      {/* Vignette - darkened edges */}
      <Vignette
        offset={0.3}
        darkness={vignetteOpacity}
        blendFunction={BlendFunction.NORMAL}
      />
      
      {/* Chromatic Aberration - lens effect */}
      <ChromaticAberration
        offset={new Vector2(chromaticOffset, chromaticOffset)}
        blendFunction={BlendFunction.NORMAL}
      />
      
      {/* Tone Mapping - HDR to SDR */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}

/**
 * Minimal post-processing (better performance)
 */
export function MinimalEffects() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.9}
        intensity={0.3}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}

export default CinematicEffects
