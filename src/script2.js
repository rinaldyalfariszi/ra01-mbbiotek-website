import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { CustomEase } from "gsap/CustomEase"

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(SplitText, CustomEase)

    const lenis = new Lenis({
        lerp: 0.05
    })

    // keep ScrollTrigger in sync
    lenis.on("scroll", ScrollTrigger.update)

    // RAF
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    /**
     * ---------- Threshold stop/resume logic ----------
     * Stops Lenis when velocity is very low (to avoid micro drift).
     * Resumes on user input (wheel/touch/pointer).
     */
    const THRESHOLD = 0.1            // tweak this (lower => more sensitive)
    const QUIET_MS = 80             // require no input for X ms before stopping
    let isStopped = false
    let lastUserInput = performance.now()

    // record when the user manually interacts
    const markUserInput = () => { lastUserInput = performance.now() }

    // resume helper
    const resumeIfNeeded = () => {
        if (isStopped) {
            isStopped = false
            lenis.start()
            // ensure ScrollTrigger is up-to-date immediately after resume
            ScrollTrigger.update()
        }
    }

    // resume on these events (passive where sensible)
    document.addEventListener("wheel", markUserInput, { passive: true })
    document.addEventListener("touchstart", markUserInput, { passive: true })
    document.addEventListener("pointerdown", markUserInput, { passive: true })
    // also resume if user interacts after a stop
    document.addEventListener("wheel", resumeIfNeeded, { passive: true })
    document.addEventListener("touchstart", resumeIfNeeded, { passive: true })
    document.addEventListener("pointerdown", resumeIfNeeded, { passive: true })

    // listen to Lenis' scroll payload — it provides velocity
    lenis.on("scroll", ({ velocity }) => {
        const absVel = Math.abs(velocity ?? 0)

        // if velocity is above threshold, make sure Lenis is running
        if (absVel >= THRESHOLD) {
            if (isStopped) resumeIfNeeded()
            return
        }

        // only stop if there's been no user input for QUIET_MS
        if (!isStopped && (performance.now() - lastUserInput) > QUIET_MS) {
            isStopped = true

            // preserve scrollbar gutter to avoid layout shift
            document.documentElement.classList.add('force-scrollbar');
            
            lenis.stop()
        }
    })

    // ------------- your GSAP text animation (unchanged) -------------
    // let split
    // let tl = gsap.timeline()

    CustomEase.create("o6", "M0,0 C0.19,1 0.22,1 1,1")

    CustomEase.create("o2", "M0,0 C0.25,0.46 0.45,0.94 1,1")

    function textRevealHeading() {
        let split
        let tl = gsap.timeline()
        split = new SplitText("p", { type: "lines", linesClass: "u-generated-text-lines" })
        gsap.set(".hero-section", { autoAlpha: 1 })

        split.lines.forEach((line, index) => {
            let split = new SplitText(line, {type: "lines"})
            tl.from(split.lines, { duration: 2.2, yPercent: 100, ease: "o6", skewX: 0.1 }, ">-95%")
        })
    }

    function textRevealBody() {
        let split
        let tl = gsap.timeline()
        split = new SplitText("h1", { type: "lines", linesClass: "u-generated-text-lines" })
        gsap.set(".hero-section", { autoAlpha: 1 })

        split.lines.forEach((line, index) => {
            let split = new SplitText(line, {type: "lines"})
            tl.from(split.lines, { duration: 2.2, yPercent: 100, ease: "o6", skewX: 0.1 }, ">-88%")
        })
    }

    textRevealBody()
    textRevealHeading()

    // Transition Handler
    // if (navigation.addEventListener) {
    //     navigation.addEventListener("navigate", event => {
    //         if (!event.destination.url.includes(document.location.origin)) {
    //             return
    //         }

    //         event.intercept({
    //             handler: async () => {
    //                 const response = await fetch(event.destination.url)
    //                 const text = await response.text()

    //                 const transition = document.startViewTransition(() => {
    //                     const body = text.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
    //                     document.body.innerHTML = body

    //                     const title = text.match(/<title[^>]*>(.*?)<\/title>/i)[1]
    //                     document.title = title
    //                 })

    //                 transition.ready.then(() => {
    //                     window.scrollTo(0, 0)
    //                 })
    //             },
    //             scroll: "manual"
    //         })
    //     })
    // }
})