import { Transition } from '../animations'

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
            const route = event.state?.route || location.pathname
            Route.go(route, false)
        })

        // Go to initial URL (current page URL)
        Route.go(location.pathname, false)
    },
    setMetaData(title)
    {
        document.title = `${title} - MBBiotek`
    },
    go: async (route, addToHistory = true) =>
    {
        if (App.isTransitioning)
        {
            addToHistory = false
            console.log('Transition in progress, ignoring navigation')
            return
        }

        if (addToHistory && location.pathname === route) {
            console.log(`Already at the "${ route }", ignoring navigation`)
            return
        }

        // console.log(`Going to ${route}`)
        
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

        // Clean up current page element when changing to new page URL
        if (pageElement)
        {
            const mainElement = document.querySelector("main")
            await Transition.outro()
            mainElement.replaceChildren(pageElement)
            window.scrollTo(0, 0)
            await Transition.intro()
        }
        else
        {
            // Client side 404
            document.querySelector("main").innerHTML = `<h1>Oops, 404 page not found</h1>`
        }
    }
}

export default Route