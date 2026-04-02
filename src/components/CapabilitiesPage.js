export class CapabilitiesPage extends HTMLElement
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
        this.template = document.getElementById("capabilities-page-template")
        this.content = this.template.content.cloneNode(true)
        this.appendChild(this.content)
    }
}

customElements.define("capabilities-page", CapabilitiesPage)