export class PartnersPage extends HTMLElement
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
        this.template = document.getElementById("partners-page-template")
        this.content = this.template.content.cloneNode(true)
        this.appendChild(this.content)
    }
}

customElements.define("partners-page", PartnersPage)