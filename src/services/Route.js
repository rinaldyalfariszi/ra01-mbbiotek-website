import Router from '../engine/Router.js'
import { HomePage } from '../components/HomePage.js'
import { AboutPage } from '../components/AboutPage.js'

export default class Route
{
    constructor()
    {
        const router = new Router()

        // router.setRoute('/', HomePage)
        // router.setRoute('/about', AboutPage)

        router.run()
        console.log(router.routes)
        console.log(router.pageElement)
    }
}