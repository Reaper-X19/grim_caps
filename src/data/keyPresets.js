// Key preset definitions for quick selection
// Complete keyboard layout with all keys properly mapped
export const KEY_PRESETS = {
  // Row 1 (Function Row): 13 keys
  row1: [
    'K_ESC', 'K_F1', 'K_F2', 'K_F3', 'K_F4', 'K_F5', 'K_F6', 
    'K_F7', 'K_F8', 'K_F9', 'K_F10', 'K_F11', 'K_F12'
  ],
  
  // Row 2 (Number Row): 16 keys (added K_DEL)
  row2: [
    'K_GRAVE', 'K_1', 'K_2', 'K_3', 'K_4', 'K_5', 'K_6', 'K_7', 
    'K_8', 'K_9', 'K_0', 'K_DASH', 'K_EQUAL', 'K_BACKSPACE', 'K_DEL', 'K_HOME'
  ],
  
  // Row 3 (QWERTY): 15 keys (added K_LSQUAREBRACKET, K_RSQUAREBRACKET, K_PAGEUP)
  row3: [
    'K_TAB', 'K_Q', 'K_W', 'K_E', 'K_R', 'K_T', 'K_Y', 'K_U', 
    'K_I', 'K_O', 'K_P', 'K_LSQUAREBRACKET', 'K_RSQUAREBRACKET', 'K_BACKSLASH', 'K_PAGEUP'
  ],
  
  // Row 4 (ASDF / Home Row): 14 keys (added K_PAGEDOWN, removed extras)
  row4: [
    'K_CAPS', 'K_A', 'K_S', 'K_D', 'K_F', 'K_G', 'K_H', 'K_J', 
    'K_K', 'K_L', 'K_SEMICOLON', 'K_QUOTE', 'K_ENTER', 'K_PAGEDOWN'
  ],
  
  // Row 5 (ZXCV): 14 keys (added K_END)
  row5: [
    'K_LSHIFT', 'K_Z', 'K_X', 'K_C', 'K_V', 'K_B', 'K_N', 'K_M', 
    'K_COMMA', 'K_PERIOD', 'K_SLASH', 'K_RSHIFT', 'K_ARROWUP', 'K_END'
  ],
  
  // Row 6 (Bottom Row): 12 keys (added K_LALT, K_LWIN, K_RALT)
  row6: [
    'K_LCONTROL', 'K_LWIN', 'K_LALT', 'K_SPACE', 'K_RALT', 'K_FN', 
    'K_ARROWLEFT', 'K_ARROWDOWN', 'K_ARROWRIGHT'
  ],
  
  // Function keys: 12 keys
  function: [
    'K_F1', 'K_F2', 'K_F3', 'K_F4', 'K_F5', 'K_F6', 
    'K_F7', 'K_F8', 'K_F9', 'K_F10', 'K_F11', 'K_F12'
  ],
  
  // Gaming presets
  wasd: ['K_W', 'K_A', 'K_S', 'K_D'],
  
  arrows: ['K_ARROWUP', 'K_ARROWDOWN', 'K_ARROWLEFT', 'K_ARROWRIGHT'],
  
  // Number row (just the numbers)
  numbers: ['K_1', 'K_2', 'K_3', 'K_4', 'K_5', 'K_6', 'K_7', 'K_8', 'K_9', 'K_0'],
  
  // Home row (touch typing) - middle keys of Row 4
  homeRow: ['K_A', 'K_S', 'K_D', 'K_F', 'K_G', 'K_H', 'K_J', 'K_K', 'K_L'],
  
  // Alpha keys only (A-Z): 26 keys
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
    'LWIN': 'L Win',
    'FN': 'Fn',
    'ESC': 'Esc',
    'DEL': 'Del',
    'HOME': 'Home',
    'END': 'End',
    'PAGEUP': 'PgUp',
    'PAGEDOWN': 'PgDn',
    'GRAVE': '`',
    'DASH': '-',
    'EQUAL': '=',
    'LSQUAREBRACKET': '[',
    'RSQUAREBRACKET': ']',
    'BACKSLASH': '\\',
    'SEMICOLON': ';',
    'QUOTE': "'",
    'COMMA': ',',
    'PERIOD': '.',
    'SLASH': '/',
    // Function keys
    'F1': 'F1', 'F2': 'F2', 'F3': 'F3', 'F4': 'F4',
    'F5': 'F5', 'F6': 'F6', 'F7': 'F7', 'F8': 'F8',
    'F9': 'F9', 'F10': 'F10', 'F11': 'F11', 'F12': 'F12',
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
    row1: 'Row 1 (Function)',
    row2: 'Row 2 (Numbers)',
    row3: 'Row 3 (QWERTY)',
    row4: 'Row 4 (ASDF)',
    row5: 'Row 5 (ZXCV)',
    row6: 'Row 6 (Bottom)',
    function: 'Function Keys',
    wasd: 'WASD',
    arrows: 'Arrow Keys',
    numbers: 'Numbers',
    homeRow: 'Home Row',
    alpha: 'All Letters',
  }
  return displayNames[presetKey] || presetKey
}
