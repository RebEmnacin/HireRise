# HireRise (Vue 3 prototype)

Vue 3 + Vite + Vue Router. The CSS is the same hand-written stylesheet as the plain HTML version.

## Run it
```
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
```

## Folder map
```
index.html              the single page; Vue mounts into <div id="app">
src/main.js             starts Vue, plugs in the router and the v-reveal directive
src/App.vue             header + <RouterView> (the current page) + footer
src/router/index.js     URL -> page list
src/views/              one file per page (Home, Jobs, About, Contact)
src/components/         reusable pieces (AppHeader, AppFooter, JobCard, LineIcon, CountUp)
src/directives/reveal.js   v-reveal: fade-up when scrolled into view
src/data/               sample jobs + icon shapes (later: from a backend)
src/assets/style.css    all styles (colors in :root at the top)
```

## Plain JS -> Vue cheat sheet
| Plain version (main.js)                         | Vue version                                   |
|-------------------------------------------------|-----------------------------------------------|
| `document.querySelector(...)`                   | `ref()` + `ref="el"` in the template          |
| `element.classList.toggle('open', x)`           | `:class="{ open: x }"`                        |
| `addEventListener('click', fn)`                 | `@click="fn"`                                 |
| `list.map(...).join('')` + `innerHTML`          | `v-for="item in list" :key="item.id"`         |
| show/hide with a CSS class                      | `v-if="condition"`                            |
| read `input.value` on every `input` event       | `v-model="variable"`                          |
| re-run `applyFilters()` by hand                 | `computed(() => ...)` (re-runs by itself)     |
| `<a href="jobs.html">`                          | `<RouterLink to="/jobs">`                     |
| 4 copies of header/footer                       | one `AppHeader.vue` / `AppFooter.vue`         |

All names, numbers, roles and testimonials are SAMPLE content.
