import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ContactPage() {
  const pageRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useGSAP(() => {
    // Hero entrance - use timeline
    const heroTl = gsap.timeline({
      defaults: { ease: 'power3.out' }
    })

    heroTl
      .to('.contact-hero-title', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power4.out'
      })
      .to('.contact-hero-subtitle', {
        y: 0,
        opacity: 1,
        duration: 0.8
      }, '-=0.5')

    // Info cards
    gsap.to('.info-card', {
      scrollTrigger: {
        trigger: '.info-section',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 0,
      opacity: 1,
      stagger: 0.2,
      duration: 0.6,
      ease: 'power3.out'
    })

    // Form entrance
    gsap.to('.contact-form', {
      scrollTrigger: {
        trigger: '.form-section',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out'
    })
  }, { scope: pageRef })

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      alert('Thank you for your message! We\'ll get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setIsSubmitting(false)
    }, 1500)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div ref={pageRef} className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden" style={{
        background: 'radial-gradient(ellipse at top, rgba(6, 182, 212, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(59, 130, 246, 0.15) 0%, transparent 50%), linear-gradient(180deg, #0a0a0a 0%, #0a1a1f 50%, #0a0f1f 100%)'
      }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-grim-blue/10 rounded-full blur-3xl top-20 left-1/2 -translate-x-1/2 animate-pulse"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="contact-hero-title text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
            Get in <span className="text-grim-accent text-glow">Touch</span>
          </h1>
          <p className="contact-hero-subtitle text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Have questions? Want to collaborate? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="info-section py-16 px-4 bg-grim-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Email */}
            <div className="info-card glass p-8 rounded-xl text-center hover:border-grim-accent transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-gradient-to-r from-grim-accent to-grim-blue rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all">
                <svg className="w-8 h-8 text-grim-darker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-semibold mb-2 group-hover:text-grim-accent transition-colors">Email Us</h3>
              <p className="text-gray-400">hello@grimcaps.in</p>
            </div>

            {/* Social */}
            <div className="info-card glass p-8 rounded-xl text-center hover:border-grim-accent transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-gradient-to-r from-grim-purple to-grim-accent rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all">
                <svg className="w-8 h-8 text-grim-darker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-semibold mb-2 group-hover:text-grim-accent transition-colors">Follow Us</h3>
              <p className="text-gray-400">@grimcaps on Instagram</p>
            </div>

            {/* Support */}
            <div className="info-card glass p-8 rounded-xl text-center hover:border-grim-accent transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-gradient-to-r from-grim-blue to-grim-purple rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all">
                <svg className="w-8 h-8 text-grim-darker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-semibold mb-2 group-hover:text-grim-accent transition-colors">Support</h3>
              <p className="text-gray-400">Mon-Sat, 10 AM - 7 PM IST</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="form-section py-24 px-4 bg-gradient-to-b from-grim-dark to-grim-darker">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-12 text-center">
            Send us a <span className="text-grim-accent">Message</span>
          </h2>
          
          <form onSubmit={handleSubmit} className="contact-form glass p-8 md:p-12 rounded-xl space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-display font-semibold text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-grim-darker border border-grim-gray-700 rounded-lg text-white focus:border-grim-accent focus:outline-none focus:ring-2 focus:ring-grim-accent/50 transition-all"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-display font-semibold text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-grim-darker border border-grim-gray-700 rounded-lg text-white focus:border-grim-accent focus:outline-none focus:ring-2 focus:ring-grim-accent/50 transition-all"
                placeholder="your@email.com"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-display font-semibold text-gray-300 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-grim-darker border border-grim-gray-700 rounded-lg text-white focus:border-grim-accent focus:outline-none focus:ring-2 focus:ring-grim-accent/50 transition-all"
                placeholder="What's this about?"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-display font-semibold text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-grim-darker border border-grim-gray-700 rounded-lg text-white focus:border-grim-accent focus:outline-none focus:ring-2 focus:ring-grim-accent/50 transition-all resize-none"
                placeholder="Tell us more..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-10 py-5 bg-gradient-to-r from-grim-accent to-grim-blue text-grim-darker font-display font-bold text-lg rounded-lg hover:scale-105 hover:shadow-2xl hover:shadow-grim-accent/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
