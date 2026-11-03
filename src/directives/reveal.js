// A custom directive: write  v-reveal  (or  v-reveal="0.2"  for a 0.2s delay) on any element
// and it fades up when it scrolls into view. Same idea as the IntersectionObserver in the plain-JS version.
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in')
        observer.unobserve(entry.target) // only once
      }
    })
  },
  { threshold: 0.15 }
)

export default {
  // mounted = runs when the element is added to the page
  mounted(el, binding) {
    el.classList.add('reveal')
    if (binding.value) el.style.setProperty('--d', `${binding.value}s`)
    observer.observe(el)
  },
  // unmounted = runs when it is removed (stop watching so nothing leaks)
  unmounted(el) {
    observer.unobserve(el)
  },
}
