export class HomePage extends HTMLElement
{
    constructor()
    {
        super()
    }

    connectedCallback()
    {
        const template = document.getElementById("test-page-template")
        const content = template.content.cloneNode(true)
        this.appendChild(content)

        this.animate()
    }

    animate()
    {
        const headings = this.querySelectorAll("h1")
        const paragraphs = this.querySelectorAll("p")

        headings.forEach(h =>
        {
            const split = new SplitText(h, { type: "lines" })
            gsap.from(split.lines,
            {
                yPercent: 100,
                duration: 2,
                ease: "o6"
            })
        })
    }
}

customElements.define("home-page", HomePage)