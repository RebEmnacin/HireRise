# HireRise: Setup and Comeback Guide

This is the "I'm coming back to this project after a while" file. The public overview is in [README.md](README.md).

## 1. Requirements

| Tool | Version | Why |
|---|---|---|
| Node.js | **20.19+ or 22.12+** | Vite 7 refuses to run on older Node |
| npm | comes with Node | Installs the packages |
| Git | any | Clone the repo |

Check what you have:

```bash
node --version
npm --version
```

## 2. First-time setup

```bash
git clone https://github.com/RebEmnacin/HireRise.git
cd HireRise
npm install
npm run dev
```

Open http://localhost:5173.

- There is no backend and no database to set up. Everything runs in the browser.
- Try the **Jobs** page: search for `recruit`, filter by **Contract**, then press **Apply** on a role.

## 3. Every time after that

```bash
cd HireRise
npm run dev
```

Other commands:

```bash
npm run build      # production build into dist/
npm run preview    # serve the built dist/ folder locally to test it
```

## 4. Environment variables

None are needed right now. When a backend is added, create a `.env` file in the project root:

| Variable | Example | Notes |
|---|---|---|
| `VITE_API_URL` | `https://your-backend.example.com/api` | Where the API lives. Vite only exposes variables that start with `VITE_`, and you read them with `import.meta.env.VITE_API_URL` |

Never put secrets in a `VITE_` variable. Everything in the frontend can be read by anyone who opens the browser tools.

## 5. Deploying

**Vercel or Netlify (static hosting)**
- Build command: `npm run build`, output directory: `dist`
- Every path must rewrite to `/index.html` for Vue Router (otherwise refreshing `/jobs` gives a 404). `vercel.json` already does this. On Netlify, add a `public/_redirects` file containing `/* /index.html 200`.
- When a backend exists, add `VITE_API_URL` in the host's environment variable settings.

## 6. Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| Vite says the Node version is unsupported | Upgrade Node to 20.19+ or 22.12+ |
| Port 5173 already in use | Stop the other process, or run `npm run dev -- --port 5174` |
| `npm install` fails or acts strangely | Delete `node_modules` and `package-lock.json`, then run `npm install` again |
| Page refresh gives a 404 in production | The host is missing the "rewrite all paths to `/index.html`" rule (see section 5) |
| The font looks different offline | The font (Plus Jakarta Sans) loads from Google Fonts. Offline, the browser uses a system font, which is expected |
| Changes don't show up | Hard refresh with Ctrl + Shift + R, and make sure `npm run dev` is still running |
| Mobile menu only covers the top bar | A parent with `backdrop-filter` traps `position: fixed` children, so keep it off the header on phones (already handled in `style.css`) |
| Scroll animations never play | The element needs the `v-reveal` directive, and the directive must be registered in `src/main.js` |

## 7. Where things live

| I want to change... | Go to |
|---|---|
| Brand colors, sizes, shadows | `src/assets/style.css` (the `:root` block at the top) |
| Hero text and buttons | the `<template>` at the top of `src/views/HomeView.vue` |
| Services, stats, steps and testimonials | the `<script setup>` at the top of `src/views/HomeView.vue` |
| The job list | `src/data/jobs.js` |
| About page text, values, timeline and team | the `<script setup>` of `src/views/AboutView.vue` |
| Contact form fields and validation rules | `src/views/ContactView.vue` (`rules`) |
| Navigation links | the `links` array in `src/components/AppHeader.vue` |
| Footer text and contact details | `src/components/AppFooter.vue` |
| Icons | `src/data/icons.js` |
| Scroll reveal animation | `src/directives/reveal.js` |
| Page URLs | `src/router/index.js` |
| Brand name | `AppHeader.vue`, `AppFooter.vue`, `index.html` and the README |

## 8. Known issues and loose ends

- [ ] There is no backend: jobs are sample data, and the contact form sends nothing
- [ ] All names, numbers, roles and testimonials are placeholders
- [ ] The font loads from Google Fonts (an external request)
- [ ] The scroll reveal still plays when the OS "reduce motion" setting is on (only the floating cards and the industry strip stop)
- [ ] Unknown URLs redirect to the home page instead of showing a 404 page
- [ ] It is a client-side rendered app, so search engines see less than they would with server rendering
- [ ] The Apply buttons open the contact form, not a real application with a CV upload
- [ ] No automated tests
- [ ] The page `<title>` and description don't change per page
- [ ] Accessibility hasn't been fully audited (keyboard focus styles, contrast and the mobile menu focus trap)

## 9. Learn-later checklist

Things to study when you review the code line by line:

- [ ] `ref()` vs `reactive()`, and why you use `.value` in script but not in the template
- [ ] `computed()` and how the jobs filter re-runs by itself (`views/JobsView.vue`)
- [ ] `v-model`, `v-for` with `:key`, `v-if`, `:class` and `@click`
- [ ] Props with `defineProps` (`components/JobCard.vue`, `LineIcon.vue`, `CountUp.vue`)
- [ ] `watch()` and the `onMounted` / `onBeforeUnmount` lifecycle (`components/AppHeader.vue`)
- [ ] Template refs (`ref="el"`) and `IntersectionObserver` (`components/CountUp.vue`)
- [ ] How a custom directive works (`directives/reveal.js`)
- [ ] Vue Router: `RouterLink`, `useRoute`, lazy imports and `scrollBehavior` (`router/index.js`)
- [ ] Why `backdrop-filter` breaks `position: fixed` children
- [ ] How the CSS "draw" animation works with `pathLength="1"` and `stroke-dashoffset`

## 10. Ideas for later

- Backend and database for jobs and messages
- Job detail pages, saved jobs and email alerts
- Admin page to post and close jobs
- Nuxt (server rendering), TypeScript, Pinia and Tailwind
- Dark mode, multiple languages, a blog or resources section

## 11. Tech stack

| Layer | Tech | Why it's here |
|---|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) | Templates stay close to HTML, and the reactivity model is easy to learn |
| Build tool | Vite | Fast dev server and a simple production build |
| Routing | Vue Router | Four pages with real URLs, lazy-loaded |
| Styling | Plain CSS with custom properties | One hand-written stylesheet, and colors are changed in one place |
| Animation | CSS keyframes + `IntersectionObserver` | Scroll reveals, count-up and line-art icons with no animation library |
| Data | Local JavaScript arrays | A placeholder until a backend exists |

## 12. Project structure

```
HireRise/
├── index.html                # Vue mounts into <div id="app">
├── vercel.json               # rewrite all paths to index.html
├── public/
│   └── logo.svg              # logo and favicon
├── docs/screenshots/         # images used in the README
└── src/
    ├── main.js               # starts Vue, router and the v-reveal directive
    ├── App.vue               # header + current page + footer
    ├── router/index.js       # URL -> page list
    ├── views/                # HomeView, JobsView, AboutView, ContactView
    ├── components/           # AppHeader, AppFooter, JobCard, LineIcon, CountUp
    ├── directives/reveal.js  # fade up when scrolled into view
    ├── data/                 # jobs.js, icons.js
    └── assets/style.css      # all styles
```

## 13. Run it locally

Short version: `npm install`, then `npm run dev`, then open http://localhost:5173.

For everything else (deployment, environment variables, troubleshooting), use the sections above.

## 14. Roadmap

- [ ] Backend and database for jobs and contact messages (Express + MySQL, or FastAPI + Postgres)
- [ ] Job detail page and a real application form with CV upload
- [ ] Admin page to post and close jobs
- [ ] Automated tests (Vitest and Playwright)
- [ ] Server-side rendering with Nuxt
- [ ] Real content, photos and a live demo link
