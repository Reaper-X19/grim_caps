import { useRef, useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

export default function CustomCursor() {
    const cursorRef = useRef(null)
    const followerRef = useRef(null)
    const [isHovering, setIsHovering] = useState(false)

    // Check if device is touch-enabled to disable custom cursor
    const [isTouch, setIsTouch] = useState(false)

    useEffect(() => {
        setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }, [])

    useGSAP(() => {
        if (isTouch) return

        const cursor = cursorRef.current
        const follower = followerRef.current

        // Initial hide
        gsap.set([cursor, follower], { xPercent: -50, yPercent: -50, opacity: 0 })

        const moveCursor = (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                opacity: 1
            })

            gsap.to(follower, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.3,
                opacity: 1
            })
        }

        const handleHoverStart = () => {
            setIsHovering(true)
            gsap.to(cursor, { scale: 0.5, duration: 0.2 })
            gsap.to(follower, {
                scale: 2,
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                borderColor: 'rgba(0, 240, 255, 0.5)',
                duration: 0.2
            })
        }

        const handleHoverEnd = () => {
            setIsHovering(false)
            gsap.to(cursor, { scale: 1, duration: 0.2 })
            gsap.to(follower, {
                scale: 1,
                backgroundColor: 'transparent',
                borderColor: 'rgba(0, 240, 255, 0.3)',
                duration: 0.2
            })
        }

        const handleMouseDown = () => {
            gsap.to(cursor, { scale: 0.8, duration: 0.1 })
            gsap.to(follower, { scale: 0.8, duration: 0.1 })
        }

        const handleMouseUp = () => {
            gsap.to(cursor, { scale: isHovering ? 0.5 : 1, duration: 0.1 })
            gsap.to(follower, { scale: isHovering ? 2 : 1, duration: 0.1 })
        }

        window.addEventListener('mousemove', moveCursor)
        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)

        // Add listeners to clickable elements
        const clickables = document.querySelectorAll('a, button, input, textarea, select, [role="button"]')
        clickables.forEach(el => {
            el.addEventListener('mouseenter', handleHoverStart)
            el.addEventListener('mouseleave', handleHoverEnd)
        })

        // MutationObserver to handle dynamically added elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    const newClickables = document.querySelectorAll('a, button, input, textarea, select, [role="button"]')
                    newClickables.forEach(el => {
                        // Remove old listeners to avoid duplicates (simplified approach)
                        el.removeEventListener('mouseenter', handleHoverStart)
                        el.removeEventListener('mouseleave', handleHoverEnd)
                        // Add new listeners
                        el.addEventListener('mouseenter', handleHoverStart)
                        el.addEventListener('mouseleave', handleHoverEnd)
                    })
                }
            })
        })

        observer.observe(document.body, { childList: true, subtree: true })

        return () => {
            window.removeEventListener('mousemove', moveCursor)
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mouseup', handleMouseUp)
            observer.disconnect()

            const allClickables = document.querySelectorAll('a, button, input, textarea, select, [role="button"]')
            allClickables.forEach(el => {
                el.removeEventListener('mouseenter', handleHoverStart)
                el.removeEventListener('mouseleave', handleHoverEnd)
            })
        }
    }, [isTouch, isHovering])

    if (isTouch) return null

    return (
        <>
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-2 h-2 bg-grim-cyan rounded-full pointer-events-none z-[9999] mix-blend-difference"
            />
            <div
                ref={followerRef}
                className="fixed top-0 left-0 w-8 h-8 border border-grim-cyan/30 rounded-full pointer-events-none z-[9998] transition-colors duration-300"
            />
        </>
    )
}
