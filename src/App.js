import Route from './services/Router.js'
import { Transition } from './animations'

import { HomePage } from './components/HomePage.js'
import { AboutPage } from './components/AboutPage.js'

import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'

import { Pane } from 'tweakpane'
// import * as EssentialsPlugin from '@tweakpane/plugin-essentials'

import { ENV } from './config'

globalThis.App = {}

App.router = Route
App.transition = Transition
App.isTransitioning = false
App.lenis = null


globalThis.addEventListener("DOMContentLoaded", async () =>
{
    gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)

    lenisScroll()

    await document.fonts.ready
    
    App.router.init()
    console.log('App Initiated')

    CustomEase.create("o6", "M0,0 C0.19,1 0.22,1 1,1")
    CustomEase.create("o2", "M0,0 C0.25,0.46 0.45,0.94 1,1")
    CustomEase.create("io1", "0.87, 0, 0.13, 1")

    gsap.config({
        force3D: "auto"
    })

    ScrollTrigger.config({
        ignoreMobileResize: true
    })
    
    const navbar = document.querySelector("header")
    const element = document.querySelector(".hero-section")
    const showAnim = gsap.from(navbar, { yPercent: -100, paused: true, duration: 0.2 }).progress(1)

    let lastDirection = { value: 0 }
    let navST = null
    
    menuNavigationToggler()

    navST?.kill()
    navST = createNavST(showAnim, lastDirection)

    // Resize debounce
    let resizeTimeout = null
    let delay = 50
    let lastWidth = window.innerWidth

    window.addEventListener('resize', () =>
    {
        if (window.innerWidth === lastWidth) return

        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() =>
        {
            lastWidth = window.innerWidth

            if (App.isTransitioning || Transition._isRevealingText)
            {
                Transition._pendingRefresh = true
                return
            }
            Transition.recalculateSplits()
        }, delay)
    })
})

function createNavST(tween, lastDirection)
{
    return ScrollTrigger.create(
    {
        trigger: "body",
        start: "15% top",
        end: "bottom bottom",
        markers: false,
        onUpdate: (self) =>
        {
            if (self.direction !== lastDirection.value)
            {
                self.direction === -1 ? tween.play() : tween.reverse()
                lastDirection.value = self.direction
            }
        }
    })
}

function menuNavigationToggler()
{
    const navToggle = document.querySelector('[aria-controls="primary-nav"]')

    navToggle.addEventListener("click", event =>
    {
        event.stopImmediatePropagation()
        const isOpen = navToggle.ariaExpanded === 'true'
        navToggle.ariaExpanded = String(!isOpen)

        console.log('Nav is now:', !isOpen ? 'OPEN' : 'CLOSED')
    })
}

function lenisScroll() {
    const lenis = new Lenis({ lerp: 0.05 })
    App.lenis = lenis

    // Correct integration: proxy scroll reading to Lenis
    ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
            if (arguments.length) {
                lenis.scrollTo(value, { immediate: true })
            }
            return lenis.scroll
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
        }
    })

    lenis.on("scroll", () => ScrollTrigger.update())

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)
}

function lenisScrollOld()
{
    // Lenis setup
    const lenis = new Lenis(
    {
        lerp: 0.05,
        
    })

    App.lenis = lenis

    // keep ScrollTrigger in sync
    lenis.on("scroll", ScrollTrigger.update)

    // RAF
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000)
    })
    // gsap.ticker.lagSmoothing(50, 33)
    gsap.ticker.lagSmoothing(0)

    // /**
    //  * ---------- Threshold stop/resume logic ----------
    //  * Stops Lenis when velocity is very low (to avoid micro drift).
    //  * Resumes on user input (wheel/touch/pointer).
    //  */
    // const THRESHOLD = 0.1            // tweak this (lower => more sensitive)
    // const QUIET_MS = 80             // require no input for X ms before stopping
    // let isStopped = false
    // let lastUserInput = performance.now()

    // // record when the user manually interacts
    // const markUserInput = () => { lastUserInput = performance.now() }

    // // resume helper
    // const resumeIfNeeded = () => {
    //     if (isStopped) {
    //         isStopped = false
    //         lenis.start()
    //         // ensure ScrollTrigger is up-to-date immediately after resume
    //         ScrollTrigger.update()
    //     }
    // }

    // // resume on these events (passive where sensible)
    // document.addEventListener("wheel", markUserInput, { passive: true })
    // document.addEventListener("touchstart", markUserInput, { passive: true })
    // document.addEventListener("pointerdown", markUserInput, { passive: true })
    // // also resume if user interacts after a stop
    // document.addEventListener("wheel", resumeIfNeeded, { passive: true })
    // document.addEventListener("touchstart", resumeIfNeeded, { passive: true })
    // document.addEventListener("pointerdown", resumeIfNeeded, { passive: true })

    // // listen to Lenis' scroll payload — it provides velocity
    // lenis.on("scroll", ({ velocity }) => {
    //     const absVel = Math.abs(velocity ?? 0)

    //     // if velocity is above threshold, make sure Lenis is running
    //     if (absVel >= THRESHOLD) {
    //         if (isStopped) resumeIfNeeded()
    //         return
    //     }

    //     // only stop if there's been no user input for QUIET_MS
    //     if (!isStopped && (performance.now() - lastUserInput) > QUIET_MS) {
    //         isStopped = true

    //         // preserve scrollbar gutter to avoid layout shift
    //         document.documentElement.classList.add('force-scrollbar');
            
    //         lenis.stop()
    //     }
    // })
}

function getScrollBarWidthSimple()
{
    /**
     * Less accurate
     */
    let scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const browserScrollWidth = scrollbarWidth
    console.log(browserScrollWidth)
}

function getScrollBarWidthAdvanced()
{
    /**
     * More accurate
     */
    // Create a temporary div element
    var scrollDiv = document.createElement("div");

    // Apply CSS to force a scrollbar and hide it off-screen
    scrollDiv.style.width = '100px';
    scrollDiv.style.height = '100px';
    scrollDiv.style.overflow = 'scroll';
    scrollDiv.style.position = 'absolute';
    scrollDiv.style.top = '-9999px'; // Move it off-screen

    document.body.appendChild(scrollDiv);

    // Calculate the scrollbar width
    // offsetWidth includes the border and scrollbar
    // clientWidth includes the padding but not the border or scrollbar
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    console.log(scrollbarWidth); // Log the result

    // Remove the temporary div
    document.body.removeChild(scrollDiv);

    return scrollbarWidth;
}