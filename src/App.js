import Router from './services/Router.js'

import { HomePage } from './components/HomePage.js'

window.App = {
    router: Router
}

window.addEventListener("DOMContentLoaded", async () =>
{
    App.router.init()
})