import { gsap } from "gsap"

export class AboutPage extends HTMLElement
{
    constructor()
    {
        super()
    }

    connectedCallback()
    {
        this.createContent()
        this.transitionIn()
    }

    disconnectedCallback()
    {
        this.transitionOut()
    }

    createContent()
    {
        this.template = document.getElementById("about-page-template")
        this.content = this.template.content.cloneNode(true)
        this.appendChild(this.content)
    }

    transitionIn()
    {
        gsap.timeline()
            .from('.sail', { duration: 2, opacity: 1, ease: "power4.in" })
    }

    transitionOut()
    {
        gsap.timeline()
            .from('.sail', { duration: 2, opacity: 0, ease: "power4.out" })
    }
}

customElements.define("about-page", AboutPage)