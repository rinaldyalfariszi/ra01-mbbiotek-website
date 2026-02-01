import gsap from 'gsap'

const pageTransitionLeave = (pageElement) => {
    const sail = pageElement.querySelector('.sail')

    const tl = gsap.timeline(
    {
        defaults:
        {
            duration: 0.4,
            ease: 'power1.in'
        }
    })

    tl
        .set(sail, { autoAlpha: 1 })
        .to(sail, { opacity: 1 })
    
    console.log('Transition Leave')

    return tl
}

export default pageTransitionLeave