import Route from './services/Router.js'
import { Transition } from './animations'

import { HomePage } from './components/HomePage.js'
import { AboutPage } from './components/AboutPage.js'
import { CapabilitiesPage } from './components/CapabilitiesPage.js'
import { ProductsPage } from './components/ProductsPage.js'
import { PartnersPage } from './components/PartnersPage.js'

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
let navbarTween = null


globalThis.addEventListener("DOMContentLoaded", async () =>
{
    /**
     * ============================================================
     * Base Setup
     * ============================================================
     */
    gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)

    lenisScroll()

    await document.fonts.ready
    
    App.router.init()
    console.log('App Initiated')

    menuNavigationToggler()

    CustomEase.create("o6", "M0,0 C0.19,1 0.22,1 1,1")
    CustomEase.create("o2", "M0,0 C0.25,0.46 0.45,0.94 1,1")
    CustomEase.create("io1", "0.87, 0, 0.13, 1")

    gsap.config({
        force3D: "auto"
    })

    ScrollTrigger.config({
        ignoreMobileResize: true
    })

    /**
     * ============================================================
     * Resize debounce
     * ============================================================
     */
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
            ScrollTrigger.refresh()
        }, delay)
    })
})

function initNavbarScrollTriggers() {
    ScrollTrigger.getAll()
        .filter(st => st.vars._isNavbarTrigger)
        .forEach(st => st.kill())

    const navbar = document.querySelector("header")
    let lastDirection = { value: 0 }

    navbarTween = {
        play:    () => gsap.to(navbar, { yPercent: 0, duration: 0.6, ease: "o2", overwrite: true }), // Navbar show
        reverse: () => gsap.to(navbar, { yPercent: -102, duration: 0.6, ease: "power2", overwrite: true }) // Navbar hide
    }

    // Ensure navbar starts visible
    gsap.set(navbar, { yPercent: 0 })

    ScrollTrigger.create({
        trigger: "body",
        start: "500px top",
        end: "bottom bottom",
        _isNavbarTrigger: true,
        onUpdate: (self) => {
            if (self.direction !== lastDirection.value) {
                if (App.navbarLocked) {
                    navbarTween.play()
                } else {
                    self.direction === -1 ? navbarTween.play() : navbarTween.reverse()
                }
                lastDirection.value = self.direction
            }
        }
    })
}

function initSectionScrollTriggers()
{
    ScrollTrigger.getAll()
        .filter(st => st.vars._isSectionTrigger)
        .forEach(st => st.kill())

    ScrollTrigger.refresh()

    const sections = document.querySelectorAll(".js-st-theme")
    const revealSections = document.querySelectorAll(".js-st-reveal")
    const header = document.querySelector(".site-header")

    if (!sections.length)
    {
        console.warn("initSectionScrollTriggers: No .js-st-section elements found")
        return
    }

    // ── Navbar theme trigger (all sections) ──
    sections.forEach((section) =>
    {
        const theme = [...section.classList]
            .find(c => c.startsWith("nav-theme-"))
            ?.replace("nav-theme-", "")

        if (!theme) return

        ScrollTrigger.create(
        {
            trigger: section,
            start: "top 5%",
            end: "bottom 5%",
            // markers: true,
            _isSectionTrigger: true,
            onEnter:     () => setNavbarTheme(header, theme),
            onEnterBack: () => setNavbarTheme(header, theme),
        })
    })

    // ── Navbar lock trigger ──
    // Add class "js-st-navbar-lock" to any section that should keep navbar always visible
    App.navbarLocked = false  // reset on each page init

    document.querySelectorAll(".js-st-navbar-lock").forEach((section) => {
        ScrollTrigger.create({
            trigger: section,
            start: "top 4%",
            end: "bottom 4%",
            _isSectionTrigger: true,
            onEnter:     () => { App.navbarLocked = true;  navbarTween.play() },    // scrolling DOWN into lock → show
            onEnterBack: () => { App.navbarLocked = true;  navbarTween.play() },    // scrolling UP back into lock → show
            onLeave:     () => { App.navbarLocked = false; navbarTween.reverse() }, // scrolling DOWN out of lock → hide immediately
            onLeaveBack: () => { App.navbarLocked = false }
        })
    })

    // ── Reveal trigger (non-hero sections only) ──
    revealSections.forEach((section) =>
    {
        ScrollTrigger.create(
        {
            trigger: section,
            start: "top 50%",
            end: "bottom bottom",
            once: true,
            _isSectionTrigger: true,
            onEnter: () => Transition.revealSection(section),
        })
    })

    ScrollTrigger.refresh()

    console.log(`initSectionScrollTriggers: ${sections.length} theme trigger(s), ${revealSections.length} reveal trigger(s) created`)
}

function setNavbarTheme(header, theme) {
    header.classList.remove("site-header--theme-light", "site-header--theme-dark")
    header.classList.add(`site-header--theme-${theme}`)
}

// Expose globally so Router can call it
App.initSectionScrollTriggers = initSectionScrollTriggers
App.initNavbarScrollTriggers = initNavbarScrollTriggers

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
    const lenis = new Lenis(
    {
        lerp: 0.05,
        // duration: 1.8,
        // easing: (t) => 1 - Math.exp(-6 * t) * Math.cos(t * 0.5) // damped
    })

    App.lenis = lenis

    lenis.on("scroll", () => ScrollTrigger.update())

    gsap.ticker.add(() => {
        lenis.raf(performance.now())
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