/**
 * Key Mapping: KeyboardEvent.code → Model mesh name (K_*) → Sound scancode
 *
 * This is the central mapping table for the keyboard sound/typing system.
 * - `model`: The Three.js mesh name in the GLTF keyboard model
 * - `scancode`: The key ID used in cherrymx-black-pbt config.json
 * - `char`: The character this key produces (for typing mode)
 */

// Maps KeyboardEvent.code to { model, scancode, char }
export const KEY_MAP = {
  // ── Row 1: Escape + Function keys ──
  Escape:      { model: 'K_ESC',    scancode: '1',  char: '' },
  F1:          { model: 'K_F1',     scancode: '59', char: '' },
  F2:          { model: 'K_F2',     scancode: '60', char: '' },
  F3:          { model: 'K_F3',     scancode: '61', char: '' },
  F4:          { model: 'K_F4',     scancode: '62', char: '' },
  F5:          { model: 'K_F5',     scancode: '63', char: '' },
  F6:          { model: 'K_F6',     scancode: '64', char: '' },
  F7:          { model: 'K_F7',     scancode: '65', char: '' },
  F8:          { model: 'K_F8',     scancode: '66', char: '' },
  F9:          { model: 'K_F9',     scancode: '67', char: '' },
  F10:         { model: 'K_F10',    scancode: '68', char: '' },
  F11:         { model: 'K_F11',    scancode: '87', char: '' },
  F12:         { model: 'K_F12',    scancode: '88', char: '' },

  // ── Row 2: Number row ──
  Backquote:   { model: 'K_GRAVE',      scancode: '41', char: '`' },
  Digit1:      { model: 'K_1',          scancode: '2',  char: '1' },
  Digit2:      { model: 'K_2',          scancode: '3',  char: '2' },
  Digit3:      { model: 'K_3',          scancode: '4',  char: '3' },
  Digit4:      { model: 'K_4',          scancode: '5',  char: '4' },
  Digit5:      { model: 'K_5',          scancode: '6',  char: '5' },
  Digit6:      { model: 'K_6',          scancode: '7',  char: '6' },
  Digit7:      { model: 'K_7',          scancode: '8',  char: '7' },
  Digit8:      { model: 'K_8',          scancode: '9',  char: '8' },
  Digit9:      { model: 'K_9',          scancode: '10', char: '9' },
  Digit0:      { model: 'K_0',          scancode: '11', char: '0' },
  Minus:       { model: 'K_DASH',       scancode: '12', char: '-' },
  Equal:       { model: 'K_EQUAL',      scancode: '13', char: '=' },
  Backspace:   { model: 'K_BACKSPACE',  scancode: '14', char: '' },
  Delete:      { model: 'K_DEL',        scancode: '83', char: '' },
  Home:        { model: 'K_HOME',       scancode: '71', char: '' },

  // ── Row 3: QWERTY row ──
  Tab:         { model: 'K_TAB',            scancode: '15', char: '\t' },
  KeyQ:        { model: 'K_Q',              scancode: '16', char: 'q' },
  KeyW:        { model: 'K_W',              scancode: '17', char: 'w' },
  KeyE:        { model: 'K_E',              scancode: '18', char: 'e' },
  KeyR:        { model: 'K_R',              scancode: '19', char: 'r' },
  KeyT:        { model: 'K_T',              scancode: '20', char: 't' },
  KeyY:        { model: 'K_Y',              scancode: '21', char: 'y' },
  KeyU:        { model: 'K_U',              scancode: '22', char: 'u' },
  KeyI:        { model: 'K_I',              scancode: '23', char: 'i' },
  KeyO:        { model: 'K_O',              scancode: '24', char: 'o' },
  KeyP:        { model: 'K_P',              scancode: '25', char: 'p' },
  BracketLeft: { model: 'K_LSQUAREBRACKET', scancode: '26', char: '[' },
  BracketRight:{ model: 'K_RSQUAREBRACKET', scancode: '27', char: ']' },
  Backslash:   { model: 'K_BACKSLASH',      scancode: '43', char: '\\' },
  PageUp:      { model: 'K_PAGEUP',         scancode: '73', char: '' },

  // ── Row 4: Home row (ASDF) ──
  CapsLock:    { model: 'K_CAPS',      scancode: '58', char: '' },
  KeyA:        { model: 'K_A',         scancode: '30', char: 'a' },
  KeyS:        { model: 'K_S',         scancode: '31', char: 's' },
  KeyD:        { model: 'K_D',         scancode: '32', char: 'd' },
  KeyF:        { model: 'K_F',         scancode: '33', char: 'f' },
  KeyG:        { model: 'K_G',         scancode: '34', char: 'g' },
  KeyH:        { model: 'K_H',         scancode: '35', char: 'h' },
  KeyJ:        { model: 'K_J',         scancode: '36', char: 'j' },
  KeyK:        { model: 'K_K',         scancode: '37', char: 'k' },
  KeyL:        { model: 'K_L',         scancode: '38', char: 'l' },
  Semicolon:   { model: 'K_SEMICOLON', scancode: '39', char: ';' },
  Quote:       { model: 'K_QUOTE',     scancode: '40', char: '\'' },
  Enter:       { model: 'K_ENTER',     scancode: '28', char: '\n' },
  PageDown:    { model: 'K_PAGEDOWN',  scancode: '81', char: '' },

  // ── Row 5: ZXCV row ──
  ShiftLeft:   { model: 'K_LSHIFT',    scancode: '42', char: '' },
  KeyZ:        { model: 'K_Z',         scancode: '44', char: 'z' },
  KeyX:        { model: 'K_X',         scancode: '45', char: 'x' },
  KeyC:        { model: 'K_C',         scancode: '46', char: 'c' },
  KeyV:        { model: 'K_V',         scancode: '47', char: 'v' },
  KeyB:        { model: 'K_B',         scancode: '48', char: 'b' },
  KeyN:        { model: 'K_N',         scancode: '49', char: 'n' },
  KeyM:        { model: 'K_M',         scancode: '50', char: 'm' },
  Comma:       { model: 'K_COMMA',     scancode: '51', char: ',' },
  Period:      { model: 'K_PERIOD',    scancode: '52', char: '.' },
  Slash:       { model: 'K_SLASH',     scancode: '53', char: '/' },
  ShiftRight:  { model: 'K_RSHIFT',    scancode: '54', char: '' },
  ArrowUp:     { model: 'K_ARROWUP',   scancode: '57416', char: '' },
  End:         { model: 'K_END',       scancode: '79', char: '' },

  // ── Row 6: Bottom row ──
  ControlLeft: { model: 'K_LCONTROL',    scancode: '29',    char: '' },
  MetaLeft:    { model: 'K_LWIN',        scancode: '3675',  char: '' },
  AltLeft:     { model: 'K_LALT',        scancode: '56',    char: '' },
  Space:       { model: 'K_SPACE',       scancode: '57',    char: ' ' },
  AltRight:    { model: 'K_RALT',        scancode: '3640',  char: '' },
  // FN key has no standard KeyboardEvent.code — skip
  ArrowLeft:   { model: 'K_ARROWLEFT',   scancode: '57419', char: '' },
  ArrowDown:   { model: 'K_ARROWDOWN',   scancode: '57424', char: '' },
  ArrowRight:  { model: 'K_ARROWRIGHT',  scancode: '57421', char: '' },
}

// Set of all valid model key names (for filtering)
export const VALID_MODEL_KEYS = new Set(Object.values(KEY_MAP).map(v => v.model))

// Reverse lookup: model name → event code (for click → sound)
export const MODEL_TO_EVENT_CODE = Object.fromEntries(
  Object.entries(KEY_MAP).map(([code, data]) => [data.model, code])
)

// Reverse lookup: model name → scancode
export const MODEL_TO_SCANCODE = Object.fromEntries(
  Object.entries(KEY_MAP).map(([, data]) => [data.model, data.scancode])
)
