import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function CustomCursor() {
    const cursorRef = useRef(null)
    const followerRef = useRef(null)
    const [isTouch, setIsTouch] = useState(false)

    // Detect touch
    useEffect(() => {
        const checkTouch = () => {
            setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
        }
        checkTouch()
        window.addEventListener('resize', checkTouch)
        return () => window.removeEventListener('resize', checkTouch)
    }, [])

    useGSAP(() => {
        if (isTouch) return

        const cursor = cursorRef.current
        const follower = followerRef.current

        if (!cursor || !follower) return

        // Initial setups
        gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 })
        gsap.set(follower, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 })

        // Use quickSetter for maximum performance
        const setCursorX = gsap.quickSetter(cursor, "x", "px")
        const setCursorY = gsap.quickSetter(cursor, "y", "px")
        const setFollowerX = gsap.quickSetter(follower, "x", "px")
        const setFollowerY = gsap.quickSetter(follower, "y", "px")

        let mouseX = 0
        let mouseY = 0
        let followerX = 0
        let followerY = 0

        // INCREASED SPEED: 0.35 represents a very tight, responsive follow 
        // (Reduced "float/lag" significantly while triggering smooth motion)
        const speed = 0.35

        const loop = () => {
            // Follower lerp - this runs on RAF/Ticker
            followerX += (mouseX - followerX) * speed
            followerY += (mouseY - followerY) * speed

            setFollowerX(followerX)
            setFollowerY(followerY)
        }

        // Bind to GSAP ticker for synchronized updates
        gsap.ticker.add(loop)

        const onMouseMove = (e) => {
            mouseX = e.clientX
            mouseY = e.clientY

            // CRITICAL OPTIMIZATION: Update the main cursor DOT instantly on event
            // This removes the 1-frame input latency caused by waiting for the RAF loop
            setCursorX(mouseX)
            setCursorY(mouseY)

            // Reveal on first move if hidden
            if (cursor.style.opacity === '0') {
                gsap.to([cursor, follower], { scale: 1, opacity: 1, duration: 0.3 })
            }
        }

        const onMouseDown = () => {
            gsap.to(cursor, { scale: 0.8, duration: 0.1, ease: 'power2.out' })
            gsap.to(follower, { scale: 0.8, duration: 0.1, ease: 'power2.out' })
        }

        const onMouseUp = () => {
            gsap.to(cursor, { scale: 1, duration: 0.2, ease: 'elastic.out(1, 0.3)' })
            gsap.to(follower, { scale: 1, duration: 0.2, ease: 'elastic.out(1, 0.3)' })
        }

        const onMouseOver = (e) => {
            if (e.target.closest('a, button, input, textarea, select, [role="button"], .clickable')) {
                gsap.to(cursor, { scale: 0, duration: 0.15 }) // Snappier duration
                gsap.to(follower, {
                    scale: 2.5,
                    backgroundColor: 'rgba(0, 240, 255, 0.1)',
                    borderWidth: '1px',
                    borderColor: 'rgba(0, 240, 255, 0.8)',
                    duration: 0.15 // Snappier duration
                })
            }
        }

        const onMouseOut = (e) => {
            if (e.target.closest('a, button, input, textarea, select, [role="button"], .clickable')) {
                gsap.to(cursor, { scale: 1, duration: 0.15 })
                gsap.to(follower, {
                    scale: 1,
                    backgroundColor: 'transparent',
                    borderWidth: '1px',
                    borderColor: 'rgba(0, 240, 255, 0.3)',
                    duration: 0.15
                })
            }
        }

        window.addEventListener('mousemove', onMouseMove, { passive: true })
        window.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mouseup', onMouseUp)
        window.addEventListener('mouseover', onMouseOver)
        window.addEventListener('mouseout', onMouseOut)

        return () => {
            gsap.ticker.remove(loop)
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mousedown', onMouseDown)
            window.removeEventListener('mouseup', onMouseUp)
            window.removeEventListener('mouseover', onMouseOver)
            window.removeEventListener('mouseout', onMouseOut)
        }
    }, [isTouch])

    if (isTouch) return null

    return (
        <>
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-2.5 h-2.5 bg-grim-cyan rounded-full pointer-events-none z-[9999] mix-blend-difference will-change-transform"
            />
            <div
                ref={followerRef}
                className="fixed top-0 left-0 w-8 h-8 border border-grim-cyan/30 rounded-full pointer-events-none z-[9998] transition-colors duration-300 will-change-transform"
            />
        </>
    )
}
