const Router = {
    init: () =>
    {
        document.querySelectorAll("a.navlink").forEach(link =>
        {
            link.addEventListener("click", event =>
            {
                event.preventDefault() // Preventing browser from default reload behaviour when being clicked
                const url = event.target.getAttribute("href")
                Router.go(url)
            })
        })

        // Event Handler for URL changes
        window.addEventListener("popstate", event =>
        {
            Router.go(event.state.route, false)
        })

        // Go to initial URL (current page URL)
        Router.go(location.pathname)
    },
    setMetaData(title) {
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
                Router.setMetaData("Home")
                break;
            case "/about":
                pageElement = document.createElement("about-page")
                Router.setMetaData("About")
                break;
        }

        // Clean up current page element when changing to new page URL
        if (pageElement)
        {
            const cache = document.querySelector("main")
            cache.replaceChildren(pageElement)
        }
        else
        {
            // Client side 404
            document.querySelector("main").innerHTML = `<h1>Oops, 404 page not found</h1>`
        }
    }
}

export default Router