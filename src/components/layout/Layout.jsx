import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }) {
  const location = useLocation()
  const isConfigurator = location.pathname === '/configurator'

  return (
    <div className="min-h-screen bg-grim-darker">
      <Navbar />
      <main className={`pt-20 ${isConfigurator ? 'h-[calc(100vh-80px)]' : ''}`}>
        {children}
      </main>
      {!isConfigurator && <Footer />}
    </div>
  )
}
