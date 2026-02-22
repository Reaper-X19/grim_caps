/**
 * keyboardLayout.js
 *
 * Authoritative column and row layout for the keyboard model.
 * Mesh names in the GLTF use uppercase K_ prefix (e.g. K_ESC, K_F1, K_Q).
 *
 * COLUMNS: Left → Right physical grouping across ALL rows
 * ROWS   : Top → Bottom (row1=function, row6=spacebar/modifiers)
 *
 * Used by Cascade (column wave L→R) and Resonance (row wave T→B ripple).
 */

// ─── COLUMNS (Left → Right) ─────────────────────────────────────────────────
// Each inner array = one physical column across the full keyboard height
// Derived from the physical layout of a TKL/compact 75% keyboard
export const KEYBOARD_COLUMNS = [
  // Far left
  ['K_ESC',   'K_GRAVE',  'K_TAB',    'K_CAPS',   'K_LSHIFT',   'K_LCONTROL'],
  ['K_F1',    'K_1',      'K_Q',      'K_A',       'K_Z',         'K_LALT'],
  ['K_F2',    'K_2',      'K_W',      'K_S',       'K_X',         'K_LWIN'],
  ['K_F3',    'K_3',      'K_E',      'K_D',       'K_C'],
  ['K_F4',    'K_4',      'K_R',      'K_F',       'K_V'],
  ['K_F5',    'K_5',      'K_T',      'K_G',       'K_B',         'K_SPACE'],
  ['K_F6',    'K_6',      'K_Y',      'K_H',       'K_N'],
  ['K_F7',    'K_7',      'K_U',      'K_J',       'K_M'],
  ['K_F8',    'K_8',      'K_I',      'K_K',       'K_COMMA'],
  ['K_F9',    'K_9',      'K_O',      'K_L',       'K_PERIOD'],
  ['K_F10',   'K_0',      'K_DASH',   'K_P',       'K_SEMICOLON', 'K_SLASH',  'K_RALT'],
  ['K_F11',   'K_EQUAL',  'K_LSQUAREBRACKET', 'K_QUOTE', 'K_RSHIFT', 'K_FN'],
  ['K_F12',   'K_BACKSPACE', 'K_RSQUAREBRACKET', 'K_BACKSLASH', 'K_ENTER'],
  ['K_DEL',   'K_HOME',   'K_PAGEUP'],
  ['K_END',   'K_PAGEDOWN', 'K_ARROWUP'],
  ['K_ARROWLEFT', 'K_ARROWDOWN', 'K_ARROWRIGHT'],
]

// ─── ROWS (Top → Bottom) ────────────────────────────────────────────────────
// Matches keyPresets.js row1–row6 ordering exactly
export const KEYBOARD_ROWS = [
  // Row 1 — Function row (top)
  ['K_ESC', 'K_F1', 'K_F2', 'K_F3', 'K_F4', 'K_F5', 'K_F6',
   'K_F7', 'K_F8', 'K_F9', 'K_F10', 'K_F11', 'K_F12'],

  // Row 2 — Number row
  ['K_GRAVE', 'K_1', 'K_2', 'K_3', 'K_4', 'K_5', 'K_6', 'K_7',
   'K_8', 'K_9', 'K_0', 'K_DASH', 'K_EQUAL', 'K_BACKSPACE', 'K_DEL', 'K_HOME'],

  // Row 3 — QWERTY
  ['K_TAB', 'K_Q', 'K_W', 'K_E', 'K_R', 'K_T', 'K_Y', 'K_U',
   'K_I', 'K_O', 'K_P', 'K_LSQUAREBRACKET', 'K_RSQUAREBRACKET', 'K_BACKSLASH', 'K_PAGEUP'],

  // Row 4 — Home row (ASDF)
  ['K_CAPS', 'K_A', 'K_S', 'K_D', 'K_F', 'K_G', 'K_H', 'K_J',
   'K_K', 'K_L', 'K_SEMICOLON', 'K_QUOTE', 'K_ENTER', 'K_PAGEDOWN'],

  // Row 5 — ZXCV
  ['K_LSHIFT', 'K_Z', 'K_X', 'K_C', 'K_V', 'K_B', 'K_N', 'K_M',
   'K_COMMA', 'K_PERIOD', 'K_SLASH', 'K_RSHIFT', 'K_ARROWUP', 'K_END'],

  // Row 6 — Bottom / modifiers
  ['K_LCONTROL', 'K_LWIN', 'K_LALT', 'K_SPACE', 'K_RALT', 'K_FN',
   'K_ARROWLEFT', 'K_ARROWDOWN', 'K_ARROWRIGHT'],
]

// ─── HELPERS ────────────────────────────────────────────────────────────────

/**
 * Build a name→mesh lookup from a traversed group.
 * Returns Map<string, THREE.Mesh> keyed by mesh.name (e.g. "K_ESC")
 */
export function buildMeshMap(group) {
  const map = new Map()
  group.traverse((child) => {
    if (child.isMesh && child.name) map.set(child.name, child)
  })
  return map
}

/**
 * Resolve a layout (array of arrays of key names) to arrays of meshes.
 * Skips any key name not present in meshMap.
 *
 * @param {string[][]}       layout  - KEYBOARD_COLUMNS or KEYBOARD_ROWS
 * @param {Map<string,Mesh>} meshMap - from buildMeshMap()
 * @returns {THREE.Mesh[][]}
 */
export function resolveLayout(layout, meshMap) {
  return layout.map(group =>
    group.map(name => meshMap.get(name)).filter(Boolean)
  ).filter(g => g.length > 0)
}
