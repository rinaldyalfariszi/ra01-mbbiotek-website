import ProductDrawer from '../services/ProductDrawer.js'
import { products } from '../data/products.js'

export class ProductsPage extends HTMLElement {
    constructor() {
        super()
        this._handleCardClick = this._handleCardClick.bind(this)
    }

    connectedCallback() {
        this.createContent()
        this._attachDrawerTriggers()
    }

    disconnectedCallback() {
        // Called when Router replaces this page — clean up everything
        this.removeEventListener('click', this._handleCardClick)
        ProductDrawer.destroy()
    }

    createContent() {
        this.template = document.getElementById('products-page-template')
        this.content = this.template.content.cloneNode(true)
        this.appendChild(this.content)
    }

    _attachDrawerTriggers() {
        // Use event delegation on the page root — one listener for all cards
        this.addEventListener('click', this._handleCardClick)
    }

    _handleCardClick(event) {
        const trigger = event.target.closest('[data-product-id]')
        if (!trigger) return

        event.preventDefault()

        const productId = trigger.dataset.productId
        const product = products.find(p => p.id === productId)
        if (!product) return

        // Store triggering element for focus return on close
        ProductDrawer._focusReturnEl = trigger
        ProductDrawer.open(product, { position: 'bottom', size: '80%', ease: 'o6' })
    }
}

customElements.define('products-page', ProductsPage)