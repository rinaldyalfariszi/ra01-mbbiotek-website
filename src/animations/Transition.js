import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const Transition =
{
    _splitInstances: [],
    cleanup: () =>
    {
        // Revert all split instances cleanly
        Transition._splitInstances.forEach(split => {
            if (split && split.revert) split.revert()
        })
        Transition._splitInstances = []
        
        gsap.set("home-page, about-page", { clearProps: "all" })
        gsap.set("h1, h2, h3, p, a", { clearProps: "all" })
    },
    refreshSplits: () =>
    {
        // Only run if there's actually a page rendered
        const hasPage = document.querySelector("main > *")
        if (!hasPage) return

        // Revert all stale splits first
        Transition._splitInstances.forEach(split => {
            if (split && split.revert) split.revert()
        })
        Transition._splitInstances = []

        // Re-split heading
        const h1Split = new SplitText("h1", {
            type: "lines",
            linesClass: "u-generated-split-text-lines-container"
        })
        Transition._splitInstances.push(h1Split)

        h1Split.lines.forEach(line => {
            const inner = new SplitText(line, { type: "lines" })
            Transition._splitInstances.push(inner)
            // Set to final visible state — NO animation
            gsap.set(inner.lines, { yPercent: 0, skewX: 0, opacity: 1 })
        })

        // Re-split body paragraphs
        const pSplit = new SplitText("p", {
            type: "lines",
            linesClass: "u-generated-split-text-lines-container"
        })
        Transition._splitInstances.push(pSplit)

        pSplit.lines.forEach(line => {
            const inner = new SplitText(line, { type: "lines" })
            Transition._splitInstances.push(inner)
            gsap.set(inner.lines, { yPercent: 0, skewX: 0, opacity: 1 })
        })
    },
    intro: () =>
    {
        Transition.cleanup()

        const introTimeline = gsap.timeline(
        {
            onStart: () => { App.isTransitioning = true, ScrollTrigger.refresh() },
            onComplete: () => { App.isTransitioning = false }
        })
        
            introTimeline
                .add(Transition.sailFadeIn(), "0")
                .add(Transition.introPageSlideUp(), "0")
                .add(Transition.introTextReveal(), ".6")
        
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
        const tl = gsap.timeline()
        
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
    introTextReveal: () =>
    {
        const tl = gsap.timeline()
            
        tl
            // .add(Transition.textRevealA(), "0")
            .add(Transition.textRevealHeading(), "0")
            .add(Transition.textRevealBody(), "0.2")
        
        return tl
    },
    textRevealHeading: () =>
    {
        let split
        let tl = gsap.timeline()
        split = new SplitText("h1", { type: "lines", linesClass: "u-generated-split-text-lines-container" })

        Transition._splitInstances.push(split)
    
        split.lines.forEach((line, index) => {
            let split = new SplitText(line, {type: "lines"})
            tl.from(split.lines, { duration: 2.2, yPercent: 100, skewX: 0.1, ease: "o6" }, ">-88%")
        })
    
        return tl
    },
    textRevealBody: () =>
    {
        let split
        let tl = gsap.timeline()
        split = new SplitText("p", { type: "lines", linesClass: "u-generated-split-text-lines-container" })

        Transition._splitInstances.push(split)

        const lineCount = split.lines.length
        const durationPerLine = 2.2
        
        // Define speed limits
        const MIN_STAGGER = 0.1   // Fastest (for many lines)
        const MAX_STAGGER = 0.2   // Slowest (for few lines)
        
        // Calculate ideal stagger
        const totalDuration = 2.8
        const idealStagger = (totalDuration - durationPerLine) / Math.max(1, lineCount - 1)
        
        // Clamp stagger between min and max
        const stagger = Math.max(MIN_STAGGER, Math.min(MAX_STAGGER, idealStagger))
        
        const allLines = split.lines.map(line => {
            let lineSplit = new SplitText(line, {type: "lines"})
            Transition._splitInstances.push(lineSplit)
            return lineSplit.lines[0]
        })
        
        tl.from(allLines, { 
            duration: durationPerLine, 
            yPercent: 100, 
            skewX: 0.1, 
            ease: "o6",
            stagger: stagger
        })

        console.log(`Lines: ${lineCount}, Stagger: ${stagger.toFixed(3)}s`)

        return tl
    },
    textRevealA: () =>
    {
        let split
        split = new SplitText("a", { type: "lines", linesClass: "u-generated-split-text-lines-container" })
        Transition._splitInstances.push(split)

        let tl = gsap.timeline()
        
        tl.from(split.lines, { duration: 2.2, yPercent: 100, skewX: 0.1, ease: "o6" })

        return tl
    },
    sailFadeIn: () =>
    {
        const tl = gsap.timeline()

        tl.to("#sail", { duration: 0.35, opacity: 0, skewX: 0.1, ease: "io1" })

        return tl
    },
    sailFadeOut: () =>
    {
        const tl = gsap.timeline()

        tl.to("#sail", { duration: 0.575, opacity: 1, skewX: 0.1, ease: "io1" })

        return tl
    }
}

export default Transition