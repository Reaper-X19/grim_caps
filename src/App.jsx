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

gsap.registerPlugin(ScrollTrigger)

function App() {
  const location = useLocation()

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
  useEffect(() => {
    const pageTransition = document.querySelector('.page-transition')
    if (pageTransition) {
      // Set to 0 immediately, then animate to 1
      gsap.set(pageTransition, { opacity: 0 })
      gsap.to(pageTransition, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      })
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
        </Routes>
      </div>
    </Layout>
  )
}

export default App
