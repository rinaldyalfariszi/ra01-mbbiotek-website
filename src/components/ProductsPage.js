export class ProductsPage extends HTMLElement
{
    constructor()
    {
        super()
    }

    connectedCallback()
    {
        this.createContent()
    }

    createContent()
    {
        this.template = document.getElementById("products-page-template")
        this.content = this.template.content.cloneNode(true)
        this.appendChild(this.content)
    }
}

customElements.define("products-page", ProductsPage)