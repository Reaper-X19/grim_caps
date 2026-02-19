import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ConfiguratorPage from './pages/ConfiguratorPage'
import AboutPage from './pages/AboutPage'
import GalleryPage from './pages/GalleryPage'
import ContactPage from './pages/ContactPage'
import CartPage from './pages/CartPage'
import MyDesignsPage from './pages/MyDesignsPage'
import { onAuthStateChange } from './services/auth'
import useAuthStore from './store/authStore'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const location = useLocation()
  const setSession = useAuthStore(state => state.setSession)
  const setLoading = useAuthStore(state => state.setLoading)

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session
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

    // Initialize auth
    initAuth()

    // Listen to auth state changes
    const subscription = onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event)
      setSession(session)
      setLoading(false)
    })

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe()
      }
    }
  }, [setSession, setLoading])

  // Scroll to top and refresh ScrollTrigger on route change
  useEffect(() => {
    window.scrollTo(0, 0)

    // Small delay to let DOM update, then refresh ScrollTrigger
    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)

    return () => clearTimeout(timer)
  }, [location.pathname])

  // Page transition animation - ensure it always completes
  // SKIP for configurator page: setting opacity to 0 during Three.js Canvas
  // initialization causes WebGL context loss on hard reload
  useEffect(() => {
    const pageTransition = document.querySelector('.page-transition')
    if (pageTransition) {
      if (location.pathname === '/configurator') {
        // Immediately visible — don't hide while WebGL initializes
        gsap.set(pageTransition, { opacity: 1 })
      } else {
        // Set to 0 immediately, then animate to 1
        gsap.set(pageTransition, { opacity: 0 })
        gsap.to(pageTransition, {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out'
        })
      }
    }
  }, [location.pathname])

  return (
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
        </Routes>
      </div>
    </Layout>
  )
}

export default App
