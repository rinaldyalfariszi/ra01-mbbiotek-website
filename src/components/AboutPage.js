export class AboutPage extends HTMLElement
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
        this.template = document.getElementById("about-page-template")
        this.content = this.template.content.cloneNode(true)
        this.appendChild(this.content)
    }
}

customElements.define("about-page", AboutPage)