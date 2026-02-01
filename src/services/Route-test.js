import { pageTransitionEnter, pageTransitionLeave } from '../animations'

const Route =
{
    routes: [],
    init: () =>
    {
        // Listen to <a> navlink click event
        document.querySelectorAll("a.navlink").forEach(link =>
        {
            link.addEventListener("click", event =>
            {
                event.preventDefault() // Preventing browser from default reload behaviour when being clicked
                const url = event.currentTarget.getAttribute("href")
                Route.go(url)
            })
        })

        // Event Handler for URL changes
        window.addEventListener("popstate", event =>
        {
            Route.go(event.state.route, false)
        })

        // Go to initial URL (current page URL)
        Route.go(location.pathname)
    },
    setMetaData(title)
    {
        document.title = `${title} - MBBiotek`
    },
    go: async (route, addToHistory = true) =>
    {
        console.log(`Going to ${route}`)
        
        // If 'addtoHistory' enabled, then push the new route to the browser history stack
        if (addToHistory)
        {
            history.pushState({ route }, '', route)
        }

        // Render 'pageElement' based on route
        let pageElement = null

        switch (route)
        {
            case "/": 
                pageElement = document.createElement("home-page")
                Route.setMetaData("Home")

                Route.routes.push(route)
                break;
            case "/about":
                pageElement = document.createElement("about-page")
                Route.setMetaData("About")

                Route.routes.push(route)
                break;
        }

        console.log(`currentRoute: ${route} | routes: ${Route.routes} | length: ${Route.routes.length}`)

        // Clean up current page element when changing to new page URL
        if (pageElement)
        {
            const cache = document.querySelector("main")
            cache.replaceChildren(pageElement)
            window.scrollTo(0, 0)

            if (route !== Route.routes)
            {
                console.log("Route changed!")
                
                pageTransitionEnter(pageElement)
            }
            pageTransitionLeave(pageElement)
            
        }
        else
        {
            // Client side 404
            document.querySelector("main").innerHTML = `<h1>Oops, 404 page not found</h1>`
        }
    }
}

export default Route