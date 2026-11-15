// All the TEXT of the landing page lives here, so you can edit wording without opening any component.

// the three employee statuses shown on the first card (same words the app uses)
export const people = [
  { initials: 'AD', status: 'Active', tone: 'ok' },
  { initials: 'MS', status: 'Probation', tone: 'warn' },
  { initials: 'JR', status: 'On leave', tone: 'info' },
]

// weekday bars on the attendance card (heights are percentages)
export const week = [
  { d: 'M', h: 82 },
  { d: 'T', h: 64 },
  { d: 'W', h: 90 },
  { d: 'T', h: 72 },
  { d: 'F', h: 48, today: true },
]

// who is who on the access card (matches the roles table in the README)
export const roles = [
  { name: 'Admin', scope: 'Company-wide' },
  { name: 'HR', scope: 'Company-wide' },
  { name: 'Employee', scope: 'Own records only' },
]

// the "who it's for" cards
export const audiences = [
  {
    title: 'For HR and admins',
    points: [
      'A company-wide dashboard: headcount, who is in, who is on leave, what is pending',
      'Approve or reject leave requests in one click',
      'Employee directory, team attendance and the task board',
    ],
  },
  {
    title: 'For employees',
    points: [
      'A personal dashboard with your hours, leave balance and open tasks',
      'Clock in and out, request leave and see how it was decided',
      'You only ever see your own records and tasks',
    ],
  },
  {
    title: 'Secure by default',
    points: [
      'Real sign-in with hashed passwords and signed tokens',
      'Every page and every action is limited by role',
      'Deactivate someone and their access ends immediately',
    ],
  },
]

// how it works: three steps (the icon names come from data/icons.js)
export const steps = [
  { n: '01', icon: 'userCheck', tone: 't-dark', title: 'HR creates the account', text: 'An admin or HR adds the employee and the account. There is no public sign-up, so only the right people get in.' },
  { n: '02', icon: 'clock', tone: 't-light', title: 'The day gets logged', text: 'Employees clock in and out, request leave and update their tasks. Late is counted automatically after 09:15.' },
  { n: '03', icon: 'dashboard', tone: 't-blue', title: 'HR decides in one click', text: 'Approve or reject leave, then read the whole company at a glance on the dashboard.' },
]

// built with: what the project is made of, grouped
export const stack = [
  { icon: 'dashboard', title: 'Frontend', items: ['Vue 3', 'Vite', 'Pinia', 'Vue Router', 'Axios', 'Motion'] },
  { icon: 'tasks', title: 'Backend', items: ['FastAPI', 'SQLAlchemy', 'Pydantic', 'Uvicorn'] },
  { icon: 'inbox', title: 'Data and hosting', items: ['SQLite (local)', 'PostgreSQL', 'Neon', 'Vercel'] },
  { icon: 'shield', title: 'Security', items: ['JWT sign-in', 'bcrypt hashing', 'Role-based access'] },
]

// faq: one open at a time
export const faq = [
  { q: 'Who creates the accounts?', a: 'HR or an admin. HireRise has no public sign-up, so nobody can register themselves. The first admin is created when the system starts.' },
  { q: 'What can an employee see?', a: 'Only their own records and tasks. Every page and every action is limited by the signed-in role.' },
  { q: 'What happens when someone leaves?', a: 'HR deactivates the account and that person loses access straight away.' },
  { q: 'How is "late" decided?', a: 'Clocking in after 09:15 counts as late. The attendance page and the dashboard use the same rule.' },
  { q: 'Is HireRise a real product?', a: 'It is a portfolio project, built to learn the full stack. Sign-in is a real backend with hashed passwords. The HR data you see after signing in is generated sample data.' },
]