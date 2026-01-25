import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"

document.addEventListener("DOMContentLoaded", () => {
    /**
     * ============================================================
     * GSAP Register Plugin
     * ============================================================
     */
    gsap.registerPlugin(SplitText)


    /**
     * ============================================================
     * Lenis Setup
     * ============================================================
     */
    const lenis = new Lenis({
        lerp: 0.05,
        wheelMultiplier: 1.5
    })
    lenis.on("scroll", ScrollTrigger.update)
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000) // Convert Lenis time to milliseconds
    })
    gsap.ticker.lagSmoothing(0) // Disable GSAP lag smoothing

    /**
     * ============================================================
     * GSAP Animation
     * ============================================================
     */
    gsap.registerEffect({
        name: "textFadeReveal",
        extendTimeline: true,
        defaults: {
            y: -100,
            duration: 2,
            opacity: 0,
        },
        effect: (targets, config) =>
        {
            return gsap.from(targets, {
                duration: config.duration,
                opacity: config.opacity,
                y: config.y,
            })
        },
    })

    // let split
    // let animation = gsap.timeline({ repeat: 10, repeatDelay: 0.3 })

    // function AnimReveal1() {
    //     split = new SplitText("h1", { type: "lines" })
    //     gsap.set(".heading-xl-regular-fluid", { autoAlpha: 1 })
    //     animation.from(split.lines, { opacity:1, y: 84, stagger: 0.5, duration: 3, ease: "power3.out" })
    // }
    // function AnimReveal2() {
    //     split = new SplitText("p", { type: "lines" })
    //     gsap.set(".hero-headline", { autoAlpha: 1 })
    //     animation.from(split.lines, { opacity:1, y: 50, stagger: 0.5, duration: 3, ease: "power3.out" })
    // }

    // AnimReveal1()
    // AnimReveal2()

    let split
    let tl = gsap.timeline()

    function init() {
        split = new SplitText("h1", { type: "lines", linesClass: "u-lines" })
        gsap.set(".heading-xl-regular-fluid", { autoAlpha: 1 })

        split.lines.forEach((line, index) => {
            let split = new SplitText(line, {type: "lines"})
            tl.from(split.lines, { duration: 3, yPercent: 100, ease: "expo", skewX: 0.1 }, ">-90%")
        })
    }

    init()

})

