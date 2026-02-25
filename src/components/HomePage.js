export class HomePage extends HTMLElement
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
        this.template = document.getElementById("home-page-template")
        this.content = this.template.content.cloneNode(true)
        this.appendChild(this.content)
    }
}

customElements.define("home-page", HomePage)