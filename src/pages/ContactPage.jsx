import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Mail, MessageCircle, Clock, Send, Terminal } from 'lucide-react'

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
  const [focusedField, setFocusedField] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      alert('Message sent successfully! We will get back to you soon.')
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
    <div ref={pageRef} className="min-h-screen bg-grim-void overflow-hidden relative selection:bg-grim-cyan selection:text-black">

      {/* 1. Cyber-Void Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
                 linear-gradient(rgba(176, 38, 255, 0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
               `,
            backgroundSize: '40px 40px',
          }}>
        </div>
        <div className="absolute top-20 left-[-10%] w-[600px] h-[600px] bg-grim-cyan/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-grim-purple/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030014_100%)]"></div>
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4">

        {/* Hero Section */}
        <section className="text-center mb-20 flex flex-col items-center">
          <div className="inline-block mb-6 px-4 py-1 bg-grim-cyan/10 border border-grim-cyan/30 rounded-none transform skew-x-[-10deg]">
            <span className="font-mono text-grim-cyan text-xs tracking-[0.3em] font-bold transform skew-x-[10deg] inline-block">CONTACT US // GRIM CAPS</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-display font-black mb-6 uppercase tracking-widest relative inline-block pb-4">
            <span className="absolute inset-0 text-grim-cyan blur-[2px] opacity-70 animate-pulse-slow">GET IN TOUCH</span>
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-white via-grim-cyan to-grim-purple">
              GET IN TOUCH
            </span>
          </h1>

          <div className="max-w-xl mx-auto border-l-2 border-r-2 border-grim-cyan/20 px-6 py-4 bg-black/40 backdrop-blur-sm">
            <p className="font-mono text-grim-cyan/80 text-sm md:text-base">
              We are here to help. <br />
              Reach out to us for any queries or collaborations.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

          {/* Left Column: Info Cards */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[2px] w-12 bg-grim-cyan"></div>
              <h2 className="text-2xl font-display font-bold text-white uppercase tracking-widest">
                CONTACT INFO
              </h2>
              <div className="h-[2px] flex-grow bg-gradient-to-r from-grim-cyan/50 to-transparent"></div>
            </div>

            {[
              {
                icon: Mail,
                title: 'EMAIL US',
                info: 'hello@grimcaps.in',
                status: 'ONLINE',
                color: 'text-grim-cyan border-grim-cyan/30'
              },
              {
                icon: MessageCircle,
                title: 'SOCIAL MEDIA',
                info: '@grimcaps on Instagram',
                status: 'ACTIVE',
                color: 'text-grim-purple border-grim-purple/30'
              },
              {
                icon: Clock,
                title: 'OPENING HOURS',
                info: 'Mon-Sat // 10:00 - 19:00 IST',
                status: 'OPEN',
                color: 'text-grim-yellow border-grim-yellow/30'
              }
            ].map((item, index) => (
              <div key={index}
                className="group relative bg-grim-panel p-6 border border-white/5 hover:border-white/20 transition-all duration-300 hover:translate-x-2 clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%_-10px)_100%,0_100%,0_10px]"
                style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>

                <div className="flex items-start gap-6">
                  <div className={`p-4 bg-black/50 border ${item.color} flex items-center justify-center`}>
                    <item.icon className={`w-6 h-6 ${item.color.split(' ')[0]}`} />
                  </div>

                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display font-bold text-white uppercase tracking-wider">{item.title}</h3>
                      <span className={`text-[10px] font-mono border px-1 ${item.color.split(' ')[0]} ${item.color.split(' ')[1]}`}>{item.status}</span>
                    </div>
                    <p className="font-mono text-gray-400 group-hover:text-white transition-colors">
                      {item.info}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Form */}
          <div className="relative">
            {/* Form Deco */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-grim-cyan opacity-50"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-grim-cyan opacity-50"></div>

            <div className="bg-black/40 backdrop-blur-md border border-white/10 p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-grim-cyan via-grim-purple to-grim-cyan opacity-50"></div>

              <h2 className="text-2xl font-display font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                <Terminal className="w-6 h-6 text-grim-cyan" />
                SEND MESSAGE
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {[
                  { id: 'name', label: 'YOUR NAME', type: 'text', placeholder: 'Enter your name...' },
                  { id: 'email', label: 'YOUR EMAIL', type: 'email', placeholder: 'name@domain.com' },
                  { id: 'subject', label: 'SUBJECT', type: 'text', placeholder: 'Reason for contacting...' }
                ].map((field) => (
                  <div key={field.id} className="relative group">
                    <label htmlFor={field.id} className="block text-xs font-mono font-bold text-grim-cyan mb-2 tracking-wider">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      id={field.id}
                      name={field.id}
                      value={formData[field.id]}
                      onChange={handleChange}
                      onFocus={() => setFocusedField(field.id)}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full bg-black/50 border border-white/10 px-4 py-3 text-white font-mono placeholder-gray-600 focus:outline-none focus:border-grim-cyan/80 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all"
                      placeholder={field.placeholder}
                    />
                    <div className={`absolute bottom-0 left-0 h-[1px] bg-grim-cyan transition-all duration-300 ${focusedField === field.id ? 'w-full' : 'w-0'}`}></div>
                  </div>
                ))}

                <div className="relative group">
                  <label htmlFor="message" className="block text-xs font-mono font-bold text-grim-cyan mb-2 tracking-wider">
                    YOUR MESSAGE
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    required
                    rows={5}
                    className="w-full bg-black/50 border border-white/10 px-4 py-3 text-white font-mono placeholder-gray-600 focus:outline-none focus:border-grim-cyan/80 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all resize-none"
                    placeholder="Enter message content..."
                  />
                  <div className={`absolute bottom-1 left-0 h-[1px] bg-grim-cyan transition-all duration-300 ${focusedField === 'message' ? 'w-full' : 'w-0'}`}></div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group relative px-8 py-4 bg-transparent border-2 border-grim-cyan text-grim-cyan font-display font-bold text-lg uppercase tracking-widest overflow-hidden hover:text-white hover:bg-grim-cyan/10 hover:shadow-[0_0_40px_rgba(0,240,255,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                  >
                    <span className="flex items-center justify-center gap-3">
                      {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
                      {!isSubmitting && <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
