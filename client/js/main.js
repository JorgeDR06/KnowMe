import '../css/app.css'
import { gsap } from 'gsap'

gsap.set(['#hero-eyebrow', '#hero-title', '#hero-desc', '#hero-btns'], { y: 30 })

const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
tl.to('#hero-eyebrow', { opacity: 1, y: 0, duration: 0.8, delay: 0.2 })
    .to('#hero-title', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
    .to('#hero-desc', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
    .to('#hero-btns', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
    .to('#scroll-indicator', { opacity: 1, duration: 0.8 }, '-=0.2')

const reveals = document.querySelectorAll('.reveal')
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
            observer.unobserve(entry.target)
        }
    })
}, { threshold: 0.15 })

reveals.forEach(el => {
    gsap.set(el, { opacity: 0, y: 40 })
    observer.observe(el)
})