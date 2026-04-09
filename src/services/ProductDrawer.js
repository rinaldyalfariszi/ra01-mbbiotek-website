// src/services/ProductDrawer.js
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Default config — override any key when calling ProductDrawer.open()
 */
const DEFAULTS = {
    position: 'right',          // 'right' | 'left' | 'bottom' | 'top'
    size:     null,             // null = use CSS defaults; or '480px', '60vw', '50dvh', etc.
    duration: 0.65,             // open animation duration in seconds
    closeDuration: 0.45,        // close animation duration
    ease:     'o6',             // any GSAP ease string; 'o6' / 'o2' / 'io1' are pre-registered in App.js
    closeEase: 'power2.in',
    backdrop:  true,            // show backdrop overlay
}

/**
 * CSS anchor per position — sets which edge the drawer hugs and which
 * dimension (width or height) the `size` option controls.
 */
const POSITION_CSS = {
    right:  { top: '0', right: '0', bottom: '0', left: 'auto', sizeProp: 'width'  },
    left:   { top: '0', left:  '0', bottom: '0', right: 'auto', sizeProp: 'width'  },
    bottom: { left: '0', right: '0', bottom: '0', top: 'auto',  sizeProp: 'height' },
    top:    { left: '0', right: '0', top:    '0', bottom: 'auto', sizeProp: 'height' },
}

/**
 * GSAP `fromTo` axis + starting value per position
 */
const ANIMATION_FROM = {
    right:  { axis: 'x', from: '100%' },
    left:   { axis: 'x', from: '-100%' },
    bottom: { axis: 'y', from: '100%' },
    top:    { axis: 'y', from: '-100%' },
}

/**
 * Border radius to round the "open" edge of the drawer panel
 */
const PANEL_RADIUS = {
    right:  '12px 0 0 12px',
    left:   '0 12px 12px 0',
    bottom: '12px 12px 0 0',
    top:    '0 0 12px 12px',
}

const ProductDrawer = {
    _isOpen:        false,
    _focusReturnEl: null,
    _activeConfig:  null,   // stores resolved config of the currently open drawer

    /**
     * Open the drawer.
     * @param {Object} product - your product data object
     * @param {Object} options - override any key from DEFAULTS
     */
    open(product, options = {}) {
        if (ProductDrawer._isOpen) return
        if (App.isTransitioning)  return

        const config = { ...DEFAULTS, ...options }
        ProductDrawer._activeConfig = config

        ProductDrawer._applyPositionCSS(config)
        ProductDrawer._populate(product)
        ProductDrawer._animate('open', config)

        ProductDrawer._isOpen = true

        // Freeze background scroll
        if (App.lenis) App.lenis.stop()
        document.body.style.overflow = 'hidden'

        // Accessibility
        const drawer   = document.getElementById('product-drawer')
        const backdrop = document.getElementById('product-drawer-backdrop')
        drawer.setAttribute('aria-hidden', 'false')

        if (config.backdrop) {
            backdrop.classList.add('is-visible')
            backdrop.setAttribute('aria-hidden', 'false')
        }

        ProductDrawer._trapFocus(drawer)
    },

    close() {
        if (!ProductDrawer._isOpen) return

        const config = ProductDrawer._activeConfig ?? DEFAULTS

        ProductDrawer._animate('close', config, () => {
            const drawer   = document.getElementById('product-drawer')
            const backdrop = document.getElementById('product-drawer-backdrop')

            drawer.setAttribute('aria-hidden', 'true')
            backdrop.classList.remove('is-visible')
            backdrop.setAttribute('aria-hidden', 'true')

            document.body.style.overflow = ''
            if (App.lenis) App.lenis.start()
            ScrollTrigger.refresh()

            // Return keyboard focus to the card that was clicked
            if (ProductDrawer._focusReturnEl) {
                ProductDrawer._focusReturnEl.focus({ preventScroll: true })
                ProductDrawer._focusReturnEl = null
            }

            // Reset inline size so next open starts clean
            const panel = document.getElementById('product-drawer')
            panel.style.width  = ''
            panel.style.height = ''
        })

        ProductDrawer._isOpen        = false
        ProductDrawer._activeConfig  = null
    },

    // ─── Private ─────────────────────────────────────────────────────────────

    /**
     * Apply CSS position anchoring and size based on the chosen position.
     * All values are set via inline styles so they're scoped to this call
     * and don't pollute the stylesheet.
     */
    _applyPositionCSS(config) {
        const panel  = document.getElementById('product-drawer')
        const css    = POSITION_CSS[config.position]
        const radius = PANEL_RADIUS[config.position]

        // Reset all anchors first
        Object.assign(panel.style, {
            top:    'auto',
            right:  'auto',
            bottom: 'auto',
            left:   'auto',
            width:  '',
            height: '',
        })

        panel.style.top    = css.top    ?? 'auto'
        panel.style.right  = css.right  ?? 'auto'
        panel.style.bottom = css.bottom ?? 'auto'
        panel.style.left   = css.left   ?? 'auto'

        // ✅ FIX: always fill the cross-axis explicitly
        // bottom/top → needs full width; left/right → needs full height
        if (config.position === 'bottom' || config.position === 'top') {
            panel.style.width  = '100%'
            panel.style.height = config.size ?? '80svh'
        } else {
            panel.style.height = '100svh'
            panel.style.width  = config.size ?? 'min(560px, 90vw)'
        }

        panel.style.borderRadius = radius
    },

    _animate(direction, config, onComplete) {
        const panel = document.getElementById('product-drawer')
        const { axis, from } = ANIMATION_FROM[config.position]

        if (direction === 'open') {
            gsap.set(panel, { visibility: 'visible', [axis]: from })
            gsap.to(panel, {
                [axis]:   '0%',
                duration: config.duration,
                ease:     config.ease,
                overwrite: true,
            })
        } else {
            gsap.to(panel, {
                [axis]:   from,                    // slide back out from where it came
                duration: config.closeDuration,
                ease:     config.closeEase,
                overwrite: true,
                onComplete: () => {
                    gsap.set(panel, { visibility: 'hidden' })
                    if (onComplete) onComplete()
                }
            })
        }
    },

    _populate(product) {
        const panel = document.getElementById('product-drawer')

        panel.querySelector('.product-drawer__product-id').textContent = product.id ?? ''
        panel.querySelector('.product-drawer__title').textContent      = product.name ?? ''
        panel.querySelector('.product-drawer__description').textContent = product.description ?? ''

        const img = panel.querySelector('.product-drawer__image')
        img.src = product.image ?? ''
        img.alt = product.name ?? ''

        const specsContainer = panel.querySelector('.product-drawer__specs')
        specsContainer.innerHTML = ''
        ;(product.specs ?? []).forEach(({ label, value }) => {
            const row = document.createElement('div')
            row.className = 'product-drawer__spec-row'

            const labelEl = document.createElement('span')
            labelEl.className = 'product-drawer__spec-label'
            labelEl.textContent = label

            const valueEl = document.createElement('span')
            valueEl.className = 'product-drawer__spec-value'

            // Split on \n and insert <br> between segments — no innerHTML
            const lines = String(value ?? '').split('\n')
            lines.forEach((line, i) => {
                valueEl.appendChild(document.createTextNode(line.trim()))
                if (i < lines.length - 1) {
                    valueEl.appendChild(document.createElement('br'))
                }
            })

            row.appendChild(labelEl)
            row.appendChild(valueEl)
            specsContainer.appendChild(row)
        })

        const cta = panel.querySelector('.product-drawer__cta')
        if (product.ctaHref) cta.href = product.ctaHref
    },

    _trapFocus(drawer) {
        const focusable = drawer.querySelectorAll(
            'button, [href], input, select, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable.length) return

        const first = focusable[0]
        const last  = focusable[focusable.length - 1]
        first.focus()

        drawer._keyHandler = (e) => {
            if (e.key !== 'Tab') return
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus() }
            } else {
                if (document.activeElement === last)  { e.preventDefault(); first.focus() }
            }
        }

        drawer._escHandler = (e) => {
            if (e.key === 'Escape') ProductDrawer.close()
        }

        drawer.addEventListener('keydown', drawer._keyHandler)
        document.addEventListener('keydown', drawer._escHandler)
    },

    destroy() {
        const drawer = document.getElementById('product-drawer')
        if (drawer?._keyHandler) drawer.removeEventListener('keydown', drawer._keyHandler)
        if (drawer?._escHandler) document.removeEventListener('keydown', drawer._escHandler)
        if (ProductDrawer._isOpen) ProductDrawer.close()
    }
}

export default ProductDrawer