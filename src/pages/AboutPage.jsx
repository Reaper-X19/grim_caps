import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Cpu, Zap, Users, Shield, Globe, Terminal } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function AboutPage() {
  const pageRef = useRef(null)

  return (
    <div ref={pageRef} className="min-h-screen bg-grim-void overflow-hidden relative selection:bg-grim-cyan selection:text-black">

      {/* 1. Cyber-Void Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Dynamic Grid */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
                 linear-gradient(rgba(176, 38, 255, 0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
               `,
            backgroundSize: '40px 40px',
          }}>
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-grim-cyan/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-grim-purple/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030014_100%)]"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
          <div className="inline-block mb-4 px-4 py-1 bg-grim-cyan/10 border border-grim-cyan/30 rounded-none transform skew-x-[-10deg]">
            <span className="font-mono text-grim-cyan text-xs tracking-[0.3em] font-bold transform skew-x-[10deg] inline-block">ABOUT US // GRIM CAPS</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-display font-black mb-6 uppercase tracking-widest relative inline-block pb-4">
            <span className="absolute inset-0 text-grim-purple blur-[2px] opacity-70 animate-pulse-slow">OUR MISSION</span>
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-white via-grim-cyan to-grim-purple">
              OUR MISSION
            </span>
          </h1>

          <div className="max-w-2xl mx-auto border-l-2 border-r-2 border-grim-cyan/20 px-6 py-4 bg-black/40 backdrop-blur-sm">
            <p className="font-mono text-grim-cyan/80 text-sm md:text-base leading-relaxed">
              We are on a mission to democratize custom hardware.<br />
              Bringing premium mechanical keyboard customization to India with zero compromise.
            </p>
          </div>
        </section>

        {/* Core Directives (Values) */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <div className="h-[2px] w-12 bg-grim-cyan"></div>
              <h2 className="text-3xl font-display font-bold text-white uppercase tracking-widest">
                OUR VALUES
              </h2>
              <div className="h-[2px] flex-grow bg-gradient-to-r from-grim-cyan/50 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: 'PREMIUM QUALITY',
                  desc: 'We use high-grade PBT compounds. Our dye-sublimation process ensures colours never fade, even after years of use.',
                  color: 'text-grim-cyan',
                  border: 'group-hover:border-grim-cyan/50'
                },
                {
                  icon: Zap,
                  title: 'FAST DELIVERY',
                  desc: 'Optimized logistics network. Get your custom hardware delivered within 3-7 days. No more waiting weeks for overseas shipping.',
                  color: 'text-grim-yellow',
                  border: 'group-hover:border-grim-yellow/50'
                },
                {
                  icon: Users,
                  title: 'COMMUNITY FIRST',
                  desc: 'Built by enthusiasts, for enthusiasts. We listen to our community and let your feedback shape our future products.',
                  color: 'text-grim-purple',
                  border: 'group-hover:border-grim-purple/50'
                }
              ].map((item, index) => (
                <div key={index}
                  className={`group relative bg-grim-panel p-8 border border-white/5 transition-all duration-300 hover:-translate-y-2 ${item.border} clip-path-polygon-[20px_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%,0_20px]`}
                  style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                  <div className={`w-14 h-14 mb-6 rounded-none flex items-center justify-center bg-black/50 border border-white/10 ${item.color}`}>
                    <item.icon className="w-8 h-8" />
                  </div>

                  <h3 className={`text-xl font-display font-bold mb-4 uppercase tracking-wider text-white group-hover:text-glow transition-all`}>
                    {item.title}
                  </h3>

                  <p className="font-mono text-sm text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>

                  {/* Decorative corner */}
                  <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 opacity-50 ${item.color.replace('text-', 'border-')}`}></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Origin Log (Story) */}
        <section className="py-20 px-4 bg-black/30 border-y border-white/5">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">

            <div className="w-full md:w-1/2">
              <div className="relative aspect-video bg-black border border-grim-cyan/30 p-2">
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.05)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>
                <div className="w-full h-full bg-grim-void flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30 animate-pulse-slow bg-gradient-to-br from-grim-cyan/20 to-grim-purple/20"></div>
                  <Terminal className="w-24 h-24 text-grim-cyan opacity-50" />
                  <div className="absolute bottom-4 left-4 font-mono text-[10px] text-grim-cyan">
                    STATUS: ONLINE<br />
                    SYS_UPTIME: 99.9%
                  </div>
                </div>

                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-grim-cyan"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-grim-cyan"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-grim-cyan"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-grim-cyan"></div>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-grim-purple animate-pulse"></div>
                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-widest">OUR ORIGIN</h2>
              </div>

              <div className="font-mono text-sm text-gray-400 space-y-4 border-l border-white/10 pl-6 relative">
                <div className="absolute top-0 left-[-1px] w-[2px] h-10 bg-grim-purple"></div>
                <p>
                  <span className="text-grim-purple opacity-70">THE PROBLEM:</span> <br />
                  For too long, Indian keyboard enthusiasts had to import hardware from overseas. This meant high latency, excessive customs tariffs, and weeks of waiting.
                </p>
                <p>
                  <span className="text-grim-purple opacity-70">THE SOLUTION:</span> <br />
                  We decided to change the game. By bringing advanced dye-sublimation technology within national borders, we eliminated the wait.
                </p>
                <p>
                  <span className="text-grim-purple opacity-70">THE RESULT:</span> <br />
                  <span className="text-white">Custom hardware is now accessible.</span> Manufacturing time reduced to 72 hours. Customs headaches eliminated.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Operational Base (Team) */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-grim-cyan/5 skew-y-3 pointer-events-none"></div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1 border border-white/10 bg-black/50 rounded-full">
              <Globe className="w-4 h-4 text-grim-cyan" />
              <span className="font-mono text-xs text-gray-300 uppercase tracking-widest">LOCATION: <span className="text-white font-bold">INDIA</span></span>
            </div>

            <h2 className="text-4xl md:text-5xl font-display font-black mb-8 text-white uppercase tracking-widest">
              READY TO <span className="text-grim-cyan">UPGRADE?</span>
            </h2>

            <p className="text-gray-400 font-mono text-sm max-w-xl mx-auto mb-10">
              We are a dedicated unit of enthusiasts. Our mission is to equip the community with world-class customization tools.
            </p>

            <Link
              to="/contact"
              className="inline-block px-12 py-4 bg-transparent border-2 border-grim-cyan text-grim-cyan font-display font-bold text-lg uppercase tracking-widest hover:text-white hover:bg-grim-cyan/10 hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] hover:scale-105 transition-all duration-300"
              style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
            >
              CONTACT US
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
