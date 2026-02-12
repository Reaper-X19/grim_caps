# GLSL Shader Library

Common patterns and utilities for custom shaders in Three.js/R3F.

## Table of Contents
1. [Noise Functions](#noise-functions)
2. [UV Manipulation](#uv-manipulation)
3. [Color Operations](#color-operations)
4. [Lighting Calculations](#lighting-calculations)
5. [Common Effects](#common-effects)
6. [Vertex Animations](#vertex-animations)

---

## Noise Functions

### Simplex Noise 2D
```glsl
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
```

### FBM (Fractal Brownian Motion)
```glsl
float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < octaves; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
```

### Random/Hash
```glsl
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 random2(vec2 st) {
  st = vec2(dot(st, vec2(127.1, 311.7)), dot(st, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}
```

---

## UV Manipulation

### Rotate UV
```glsl
vec2 rotateUV(vec2 uv, float angle, vec2 center) {
  float s = sin(angle);
  float c = cos(angle);
  uv -= center;
  return vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c) + center;
}
```

### Scale UV from Center
```glsl
vec2 scaleUV(vec2 uv, float scale, vec2 center) {
  return (uv - center) * scale + center;
}
```

### Tile/Repeat
```glsl
vec2 tile(vec2 uv, float zoom) {
  return fract(uv * zoom);
}
```

### Polar Coordinates
```glsl
vec2 toPolar(vec2 uv, vec2 center) {
  vec2 delta = uv - center;
  float r = length(delta);
  float theta = atan(delta.y, delta.x);
  return vec2(r, theta);
}
```

---

## Color Operations

### HSV ↔ RGB
```glsl
vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
```

### Gradient Mapping
```glsl
vec3 gradientMap(float t, vec3 color1, vec3 color2, vec3 color3) {
  return mix(mix(color1, color2, smoothstep(0.0, 0.5, t)),
             color3, smoothstep(0.5, 1.0, t));
}
```

### Gamma Correction
```glsl
vec3 gammaCorrect(vec3 color) {
  return pow(color, vec3(1.0 / 2.2));
}

vec3 linearize(vec3 color) {
  return pow(color, vec3(2.2));
}
```

---

## Lighting Calculations

### Diffuse (Lambert)
```glsl
float diffuse(vec3 normal, vec3 lightDir) {
  return max(dot(normal, lightDir), 0.0);
}
```

### Specular (Blinn-Phong)
```glsl
float specular(vec3 normal, vec3 lightDir, vec3 viewDir, float shininess) {
  vec3 halfDir = normalize(lightDir + viewDir);
  return pow(max(dot(normal, halfDir), 0.0), shininess);
}
```

### Fresnel
```glsl
float fresnel(vec3 normal, vec3 viewDir, float power) {
  return pow(1.0 - max(dot(normal, viewDir), 0.0), power);
}
```

### Rim Light
```glsl
float rimLight(vec3 normal, vec3 viewDir, float strength, float power) {
  return strength * pow(1.0 - max(dot(normal, viewDir), 0.0), power);
}
```

---

## Common Effects

### Hologram Effect
```glsl
// Fragment shader
uniform float uTime;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  // Scanlines
  float scanline = sin(vPosition.y * 50.0 + uTime * 2.0) * 0.1;
  
  // Fresnel glow
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float rim = fresnel(vNormal, viewDir, 2.0);
  
  // Hologram color
  vec3 color = vec3(0.0, 1.0, 0.8) * (0.5 + rim + scanline);
  
  // Flicker
  float flicker = 0.9 + 0.1 * sin(uTime * 15.0);
  
  gl_FragColor = vec4(color * flicker, 0.7 + rim * 0.3);
}
```

### Dissolve Effect
```glsl
uniform float uProgress;
uniform sampler2D uNoiseTexture;
varying vec2 vUv;

void main() {
  float noise = texture2D(uNoiseTexture, vUv).r;
  float threshold = uProgress;
  
  if (noise < threshold) discard;
  
  // Edge glow
  float edge = smoothstep(threshold, threshold + 0.1, noise);
  vec3 edgeColor = vec3(1.0, 0.5, 0.0);
  vec3 baseColor = vec3(1.0);
  
  gl_FragColor = vec4(mix(edgeColor, baseColor, edge), 1.0);
}
```

### Glass/Refraction
```glsl
uniform samplerCube uEnvMap;
uniform float uIOR;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDir = normalize(vPosition - cameraPosition);
  vec3 refracted = refract(viewDir, normalize(vNormal), 1.0 / uIOR);
  vec3 reflected = reflect(viewDir, normalize(vNormal));
  
  float fresnelFactor = fresnel(vNormal, -viewDir, 5.0);
  
  vec3 refractColor = textureCube(uEnvMap, refracted).rgb;
  vec3 reflectColor = textureCube(uEnvMap, reflected).rgb;
  
  gl_FragColor = vec4(mix(refractColor, reflectColor, fresnelFactor), 0.9);
}
```

---

## Vertex Animations

### Wave Displacement
```glsl
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;

void main() {
  vec3 pos = position;
  pos.z += sin(pos.x * uFrequency + uTime) * uAmplitude;
  pos.z += sin(pos.y * uFrequency * 0.5 + uTime * 0.7) * uAmplitude * 0.5;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

### Morph Targets (Manual)
```glsl
uniform float uMorphProgress;
attribute vec3 morphPosition;

void main() {
  vec3 pos = mix(position, morphPosition, uMorphProgress);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

### Explode Effect
```glsl
uniform float uProgress;
attribute vec3 aCentroid; // Per-face center

void main() {
  vec3 direction = normalize(aCentroid);
  vec3 pos = position + direction * uProgress * 2.0;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```
