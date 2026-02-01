export default class Router
{
    constructor()
    {
        console.log("Router engine initated")

        this.routes = []
        this.pageElement = null
    }

    setRoute(path, pageElement)
    {
        // this.routes.push(path)

        // this.pageElement = pageElement
    }

    run()
    {
        // Listen to <a> navlink click event
        document.querySelectorAll("a.navlink").forEach(link =>
        {
            link.addEventListener("click", event =>
            {
                event.preventDefault() // Preventing browser from default reload behaviour when being clicked
                const url = event.currentTarget.getAttribute("href")
                this.go(url)
                console.log(this.pageElement)
            })
        })

        // Event Handler for URL changes
        window.addEventListener("popstate", event =>
        {
            this.go(event.state.route, false)
        })

        // Go to initial URL (current page URL)
        this.go(location.pathname)
    }

    go(route, addToHistory = true)
    {
        console.log(`Going to ${route}`)

        // If 'addtoHistory' enabled, then push the new route to the browser history stack
        if (addToHistory)
        {
            history.pushState({ route }, '', route)
        }

        switch (route)
        {
            case "/": 
                this.pageElement = document.createElement("home-page")
                // Route.setMetaData("Home")

                // Route.routes.push(route)
                break;
            case "/about":
                this.pageElement = document.createElement("about-page")
                // Route.setMetaData("About")

                // Route.routes.push(route)
                break;
            default:
                const cache = document.querySelector("main")
                cache.innerHTML = `<h1>Oops, 404 page not found</h1>`
        }

        if (this.pageElement)
        {
            const cache = document.querySelector("main")
            cache.replaceChildren(this.pageElement)
            window.scrollTo(0, 0)
        }
        else
        {
            // Client side 404
            const cache = document.querySelector("main")
            cache.innerHTML = `<h1>Oops, 404 page not found</h1>`
        }
    }

    match(path)
    {

    }
}