import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const Transition =
{
    _splitInstances: [],
    _pendingRefresh: false,
    _isRevealingText: false,
    cleanup: () =>
    {
        // Revert all split instances cleanly
        Transition._splitInstances.forEach(split => {
            if (split && split.revert) split.revert()
        })
        Transition._splitInstances = []
        
        gsap.set("home-page, about-page", { clearProps: "all" })
        gsap.set("h1, h2, h3, p, a", { clearProps: "all" })
        gsap.set("._o", { clearProps: "opacity" })
    },
    recalculateSplits: async () => {
        await document.fonts.ready
        const hasPage = document.querySelector("main > *")
        if (!hasPage) return

        Transition._splitInstances.forEach(split => {
            if (split && split.revert) split.revert()
        })
        Transition._splitInstances = []

        // ✅ Re-split all ._y elements
        const outerSplit = new SplitText("._y", {
            type: "lines",
            linesClass: "u-generated-split-text-lines-container"
        })
        Transition._splitInstances.push(outerSplit)

        outerSplit.lines.forEach(line => {
            const inner = new SplitText(line, { type: "lines" })
            Transition._splitInstances.push(inner)
            gsap.set(inner.lines, { yPercent: 0, skewX: 0, opacity: 1 })
        })
    },
    intro: async () =>
    {
        await document.fonts.ready

        await Promise.all(
            [...document.images]
                .filter(img => !img.complete)
                .map(img => new Promise(res => { img.onload = res; img.onerror = res }))
        )

        Transition.cleanup()

        const introTimeline = gsap.timeline(
        {
            onStart: () => { App.isTransitioning = true },
            onComplete: () => { App.isTransitioning = false }
        })

        const yEls = document.querySelectorAll(".hero-section ._y")
        const oEls = document.querySelectorAll(".hero-section ._o")
        
        introTimeline
            .add(Transition.sailFadeIn(), "0")
            .add(Transition.introPageSlideUp(), "0")
            // .add(Transition.introTextReveal(), ".6")
            .add(Transition.textReveal(yEls), ".6")
            .add(Transition.opacityReveal(oEls), "1")
        
        console.log("intro() running")
        return introTimeline
    },
    outro: () =>
    {
        const outroTimeline = gsap.timeline(
        {
            onStart: () => { App.isTransitioning = true },
            onComplete: () => { App.isTransitioning = false }
        })
        
            outroTimeline
                .add(Transition.sailFadeOut(), "0")

        console.log("outro() running")
        return outroTimeline
    },
    introPageSlideUp: () =>
    {
        const tl = gsap.timeline(
        {
            onComplete: () => { ScrollTrigger.refresh() }
        })
        
        const currentPage = document.querySelector("main > *")
        
        if (!currentPage) {
            console.warn("No page element found")
            return tl
        }

        tl
            .set(currentPage, { autoAlpha: 1 })
            .from(currentPage, { duration: 2, yPercent: 100, opacity: 1, skewX: 0.1, ease: "o6" })

        return tl
    },
    introTextRevealOld: () =>
    {
        const tl = gsap.timeline()
            
        tl
            // .add(Transition.textRevealA(), "0")
            .add(Transition.textRevealHeading(), "0")
            .add(Transition.textRevealBody(), "0.2")
        
        return tl
    },
    introTextReveal: () => {
        const tl = gsap.timeline({
            onStart: () => { Transition._isRevealingText = true },
            onComplete: () => {
                Transition._isRevealingText = false
                if (Transition._pendingRefresh) {
                    Transition._pendingRefresh = false
                }
            }
        })

        tl
            .add(Transition.textReveal("hero-section ._y"), "0")
            .add(Transition.opacityReveal("._o"), "0")

        return tl
    },
    textReveal: (selector = "._y") => {
        const tl = gsap.timeline()

        // == Split line ==
        const outerSplit = new SplitText(selector, {
            type: "lines",
            linesClass: "u-generated-split-text-lines-container"
        })
        Transition._splitInstances.push(outerSplit)

        // == Stagger logic ==
        const durationPerLine = 2.2
        const MIN_STAGGER = 0.1
        const MAX_STAGGER = 0.2
        const totalDuration = 2.8

        const allLines = outerSplit.lines.map(line => {
            const inner = new SplitText(line, { type: "lines" })
            Transition._splitInstances.push(inner)
            return inner.lines[0]
        })

        const lineCount = allLines.length
        const idealStagger = (totalDuration - durationPerLine) / Math.max(1, lineCount - 1)
        const stagger = Math.max(MIN_STAGGER, Math.min(MAX_STAGGER, idealStagger))

        // == Text reveal timeline ==
        tl
            .set(selector, { autoAlpha: 1 })
            .set(allLines, { yPercent: 100 })
            .to(allLines, {
                duration: durationPerLine,
                yPercent: 0,
                skewX: 0.1,
                ease: "o6",
                stagger
            })

        console.log(`._y lines: ${lineCount}, stagger: ${stagger.toFixed(3)}s`)

        return tl
    },
    opacityReveal: (selector = "._o") => {
        // == GSAP timeline setup ==
        const tl = gsap.timeline()
        const elements = gsap.utils.toArray(selector)

        if (!elements.length) return tl

        // == Opacity timeline ==
        tl
            .set(elements, { autoAlpha: 1 })
            .from(elements, {
                duration: 1.6,
                opacity: 0,
                ease: "o6",
                stagger: 0.3
            })

        return tl
    },
    revealSection: (section) =>
    {
        const tl = gsap.timeline(
        {
            onComplete: () => { ScrollTrigger.refresh() }
        })

        const yEls = section.querySelectorAll("._y")
        const oEls = section.querySelectorAll("._o")

        if (yEls.length) tl.add(Transition.textReveal(yEls), "0")
        if (oEls.length) tl.add(Transition.opacityReveal(oEls), "0")

        return tl
    },
    sailFadeIn: () =>
    {
        const tl = gsap.timeline()

        tl.to("#sail", { duration: 0.35, opacity: 0, ease: "io1" })

        return tl
    },
    sailFadeOut: () =>
    {
        const tl = gsap.timeline()

        tl.to("#sail", { duration: 0.575, opacity: 1, ease: "io1" })

        return tl
    }
}

export default Transition