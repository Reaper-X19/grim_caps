import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Layout from './components/layout/Layout'
import LoadingScreen from './components/layout/LoadingScreen'
import HomePage from './pages/HomePage'
import ConfiguratorPage from './pages/ConfiguratorPage'
import AboutPage from './pages/AboutPage'
import GalleryPage from './pages/GalleryPage'
import ContactPage from './pages/ContactPage'
import CartPage from './pages/CartPage'
import MyDesignsPage from './pages/MyDesignsPage'
import PlaygroundPage from './pages/PlaygroundPage'
import { onAuthStateChange } from './services/auth'
import useAuthStore from './store/authStore'

gsap.registerPlugin(ScrollTrigger)

// ─── Module-level flag ───────────────────────────────────────────────────────
// Using a module-level variable (not sessionStorage) means:
//   • Any page reload — F5 OR Ctrl+Shift+R — reloads the JS module and resets
//     this to false → loader shows every time the user refreshes.
//   • SPA navigation (React Router link clicks) does NOT reload the module,
//     so the flag stays true → loader skips on in-app navigation.
let loaderHasRun = false

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const location = useLocation()
  const setSession = useAuthStore(state => state.setSession)
  const setLoading = useAuthStore(state => state.setLoading)

  // showLoader: true only on fresh page load / any refresh (F5 included)
  const [showLoader, setShowLoader] = useState(!loaderHasRun)
  // appReady: gates the rendering of ALL page content.
  // Pages only mount AFTER the loader exits, so every entrance animation
  // fires fresh — user always sees hero animations, scroll reveals, etc.
  const [appReady, setAppReady] = useState(loaderHasRun)

  const handleLoaderComplete = () => {
    loaderHasRun = true       // mark for this browser tab session (in memory)
    setShowLoader(false)
    setAppReady(true)
  }

  // Initialize Supabase auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { getCurrentSession } = await import('./services/auth')
        const { session } = await getCurrentSession()
        setSession(session)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const subscription = onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event)
      setSession(session)
      setLoading(false)
    })

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe()
    }
  }, [setSession, setLoading])

  // Scroll to top + refresh ScrollTrigger on SPA route change
  useEffect(() => {
    if (!appReady) return
    window.scrollTo(0, 0)
    const timer = setTimeout(() => ScrollTrigger.refresh(), 100)
    return () => clearTimeout(timer)
  }, [location.pathname, appReady])

  // Page transition fade on SPA navigation (skip for configurator — WebGL)
  useEffect(() => {
    if (!appReady) return
    const pageTransition = document.querySelector('.page-transition')
    if (!pageTransition) return

    if (location.pathname === '/configurator') {
      gsap.set(pageTransition, { opacity: 1 })
    } else {
      gsap.set(pageTransition, { opacity: 0 })
      gsap.to(pageTransition, { opacity: 1, duration: 0.4, ease: 'power2.out' })
    }
  }, [location.pathname, appReady])

  return (
    <>
      {/* Loading screen — renders on top, fires on every page refresh */}
      {showLoader && <LoadingScreen onComplete={handleLoaderComplete} />}

      {/* Main app — only mounts AFTER loader exits.
          This guarantees every page's useGSAP / useEffect entrance animation
          fires fresh and the user actually sees it. */}
      {appReady && (
        <Layout>
          <div className="page-transition">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/configurator" element={<ConfiguratorPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/my-designs" element={<MyDesignsPage />} />
              <Route path="/playground" element={<PlaygroundPage />} />
            </Routes>
          </div>
        </Layout>
      )}
    </>
  )
}

export default App
