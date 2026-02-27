import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import CustomCursor from './CustomCursor'

export default function Layout({ children }) {
  const location = useLocation()
  const isConfigurator = location.pathname === '/configurator'
  const isPlayground = location.pathname === '/playground'
  const isHome = location.pathname === '/'

  const hideFooter = isConfigurator || isPlayground
  const noPadding = isHome || isPlayground

  return (
    <div className="min-h-screen bg-grim-void">
      <CustomCursor />
      <Navbar />
      <main className={`${noPadding ? '' : 'pt-20'} ${isConfigurator ? 'h-[calc(100vh-80px)]' : ''}`}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}
