import { supabase } from './supabase'

/**
 * Sign in with Google OAuth
 * @returns {Promise<{user, session, error}>}
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  })

  if (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }

  return data
}

/**
 * Sign up with email and password
 * @param {string} email 
 * @param {string} password 
 * @param {Object} metadata - Additional user metadata
 * @returns {Promise<{user, session, error}>}
 */
export async function signUpWithEmail(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) {
    console.error('Error signing up:', error)
    throw error
  }

  return data
}

/**
 * Sign in with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{user, session, error}>}
 */
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('Error signing in:', error)
    throw error
  }

  return data
}

/**
 * Sign out current user
 * @returns {Promise<{error}>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

/**
 * Get current user session
 * @returns {Promise<{session, user}>}
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error getting session:', error)
    throw error
  }

  return {
    session,
    user: session?.user || null
  }
}

/**
 * Get current user
 * @returns {Promise<{user}>}
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting user:', error)
    throw error
  }

  return user
}

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function (event, session) => {}
 * @returns {Object} Subscription object with unsubscribe method
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
  return subscription
}

/**
 * Validate password strength
 * @param {string} password 
 * @returns {Object} {valid: boolean, message: string, strength: number}
 */
export function validatePassword(password) {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  let strength = 0
  const issues = []

  if (password.length < minLength) {
    issues.push(`at least ${minLength} characters`)
  } else {
    strength += 1
  }

  if (!hasUpperCase) {
    issues.push('one uppercase letter')
  } else {
    strength += 1
  }

  if (!hasLowerCase) {
    issues.push('one lowercase letter')
  } else {
    strength += 1
  }

  if (!hasNumbers) {
    issues.push('one number')
  } else {
    strength += 1
  }

  if (!hasSpecialChar) {
    issues.push('one special character')
  } else {
    strength += 1
  }

  const valid = issues.length === 0

  return {
    valid,
    message: valid 
      ? 'Password is strong' 
      : `Password must contain ${issues.join(', ')}`,
    strength: (strength / 5) * 100 // 0-100
  }
}
