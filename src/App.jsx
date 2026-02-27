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
import { onAuthStateChange, getCurrentSession } from './services/auth'
import useAuthStore from './store/authStore'

gsap.registerPlugin(ScrollTrigger)

// ─── Module-level flag ───────────────────────────────────────────────────────
let loaderHasRun = false

function App() {
  const location = useLocation()
  const setSession = useAuthStore(state => state.setSession)
  const setLoading = useAuthStore(state => state.setLoading)

  // showLoader: true only on fresh page load / any refresh
  const [showLoader, setShowLoader] = useState(!loaderHasRun)
  const [appReady, setAppReady] = useState(loaderHasRun)

  const handleLoaderComplete = () => {
    loaderHasRun = true
    setShowLoader(false)
    setAppReady(true)
  }

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
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

  // Page transition animation
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
      {showLoader && <LoadingScreen onComplete={handleLoaderComplete} />}

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
