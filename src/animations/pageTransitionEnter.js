import gsap from 'gsap'

const pageTransitionEnter = (pageElement) => {
    const sail = pageElement.querySelector('.sail')

    const tl = gsap.timeline(
    {
        defaults:
        {
            duration: 5,
            ease: 'power4.out'
        }
    })

    tl
        .set(sail, { autoAlpha: 1 })
        .from(sail, { opacity: 1, skewX: 0.1 })
    
    console.log('Transition Enter')
    
    return tl
}

export default pageTransitionEnter