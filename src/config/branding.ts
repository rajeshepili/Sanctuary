/**
 * Public-facing product name and shared UI copy for Sanctuary.
 * npm package and GitHub repository id: `sanctuary`.
 */

export const APP_NAME = 'Sanctuary'

export const APP_TAGLINE =
  'A local, private journal and habit tracker for one person on one device.'

export const APP_META_DESCRIPTION =
  'Local-first journal, habits, and reflection — your data stays on your device.'

export const APP_REPO_URL = 'https://github.com/rajeshepili/sanctuary'

export const NAV_LINKS = [
  { to: '/', label: 'Journal' },
  { to: '/habits', label: 'Habits' },
  { to: '/prompts', label: 'Prompts' },
] as const

export const PAGE_TITLES = {
  journal: 'Journal',
  habits: 'Habits',
  prompts: 'Prompts',
} as const

export const PAGE_DESCRIPTIONS = {
  journal: 'Reflect on your day and capture what matters.',
  habits: 'Track habits and review your consistency over time.',
  prompts:
    'Curate a library of ideas to inspire your reflections. Prompts will appear in your Journal widget or can be used directly from here.',
} as const
