// Key preset definitions for quick selection
export const KEY_PRESETS = {
  // Keyboard rows (top to bottom)
  row1: ['K_ESC', 'K_1', 'K_2', 'K_3', 'K_4', 'K_5', 'K_6', 'K_7', 'K_8', 'K_9', 'K_0', 'K_DASH', 'K_EQUAL', 'K_BACKSPACE', 'K_DEL'],
  
  row2: ['K_TAB', 'K_Q', 'K_W', 'K_E', 'K_R', 'K_T', 'K_Y', 'K_U', 'K_I', 'K_O', 'K_P', 'K_LBRACKET', 'K_RBRACKET', 'K_BACKSLASH', 'K_PAGEUP'],
  
  row3: ['K_CAPS', 'K_A', 'K_S', 'K_D', 'K_F', 'K_G', 'K_H', 'K_J', 'K_K', 'K_L', 'K_SEMICOLON', 'K_QUOTE', 'K_ENTER', 'K_PAGEDOWN'],
  
  row4: ['K_LSHIFT', 'K_Z', 'K_X', 'K_C', 'K_V', 'K_B', 'K_N', 'K_M', 'K_COMMA', 'K_PERIOD', 'K_SLASH', 'K_RSHIFT', 'K_ARROWUP'],
  
  row5: ['K_LCONTROL', 'K_LWIN', 'K_LALT', 'K_SPACE', 'K_RALT', 'K_FN', 'K_ARROWLEFT', 'K_ARROWDOWN', 'K_ARROWRIGHT'],
  
  row6: ['K_GRAVE'], // Backtick/tilde key if separate
  
  // Function keys (if present on 60% keyboard)
  function: ['K_F1', 'K_F2', 'K_F3', 'K_F4', 'K_F5', 'K_F6', 'K_F7', 'K_F8', 'K_F9', 'K_F10', 'K_F11', 'K_F12'],
  
  // Gaming presets
  wasd: ['K_W', 'K_A', 'K_S', 'K_D'],
  
  arrows: ['K_ARROWUP', 'K_ARROWDOWN', 'K_ARROWLEFT', 'K_ARROWRIGHT'],
  
  // Number row
  numbers: ['K_1', 'K_2', 'K_3', 'K_4', 'K_5', 'K_6', 'K_7', 'K_8', 'K_9', 'K_0'],
  
  // Modifier keys
  modifiers: [
    'K_LSHIFT', 'K_RSHIFT', 'K_LCONTROL', 'K_LALT', 'K_RALT', 
    'K_LWIN', 'K_FN', 'K_CAPS', 'K_TAB', 'K_ENTER', 'K_BACKSPACE'
  ],
  
  // Home row (touch typing)
  homeRow: ['K_A', 'K_S', 'K_D', 'K_F', 'K_J', 'K_K', 'K_L', 'K_SEMICOLON'],
  
  // Alpha keys only
  alpha: [
    'K_Q', 'K_W', 'K_E', 'K_R', 'K_T', 'K_Y', 'K_U', 'K_I', 'K_O', 'K_P',
    'K_A', 'K_S', 'K_D', 'K_F', 'K_G', 'K_H', 'K_J', 'K_K', 'K_L',
    'K_Z', 'K_X', 'K_C', 'K_V', 'K_B', 'K_N', 'K_M'
  ],
}

// Format key names for display
export const formatKeyName = (keyName) => {
  if (!keyName) return ''
  
  // Remove K_ prefix
  const name = keyName.replace('K_', '')
  
  // Special key mappings
  const specialKeys = {
    'ARROWUP': '↑',
    'ARROWDOWN': '↓',
    'ARROWLEFT': '←',
    'ARROWRIGHT': '→',
    'SPACE': 'Space',
    'ENTER': 'Enter',
    'BACKSPACE': 'Backspace',
    'TAB': 'Tab',
    'CAPS': 'Caps',
    'LSHIFT': 'L Shift',
    'RSHIFT': 'R Shift',
    'LCONTROL': 'L Ctrl',
    'LALT': 'L Alt',
    'RALT': 'R Alt',
    'LWIN': 'Win',
    'FN': 'Fn',
    'ESC': 'Esc',
    'DEL': 'Del',
    'PAGEUP': 'PgUp',
    'PAGEDOWN': 'PgDn',
    'GRAVE': '`',
    'DASH': '-',
    'EQUAL': '=',
    'LBRACKET': '[',
    'RBRACKET': ']',
    'BACKSLASH': '\\',
    'SEMICOLON': ';',
    'QUOTE': "'",
    'COMMA': ',',
    'PERIOD': '.',
    'SLASH': '/',
  }
  
  return specialKeys[name] || name
}

// Get all keycap names from the keyboard model
export const getAllKeycapNames = () => {
  const allKeys = []
  Object.values(KEY_PRESETS).forEach(preset => {
    if (Array.isArray(preset)) {
      allKeys.push(...preset)
    }
  })
  // Remove duplicates
  return [...new Set(allKeys)]
}

// Get preset display name
export const getPresetDisplayName = (presetKey) => {
  const displayNames = {
    row1: 'Row 1 (Number Row)',
    row2: 'Row 2 (QWERTY)',
    row3: 'Row 3 (ASDF)',
    row4: 'Row 4 (ZXCV)',
    row5: 'Row 5 (Bottom)',
    row6: 'Row 6 (Backtick)',
    function: 'Function Keys',
    wasd: 'WASD',
    arrows: 'Arrow Keys',
    numbers: 'Numbers',
    modifiers: 'Modifiers',
    homeRow: 'Home Row',
    alpha: 'All Letters',
  }
  return displayNames[presetKey] || presetKey
}
