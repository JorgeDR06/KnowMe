import fs from 'node:fs'
import path from 'node:path'

export function isDev() {
  return process.env.NODE_ENV !== 'production'
}

function loadManifest() {
  const manifestPath = path.resolve(process.cwd(), 'public/build/.vite/manifest.json')

  if (!fs.existsSync(manifestPath)) {
    return null
  }

  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
}

const ENTRY = 'js/main.js'

export function viteAsset() {
  if (isDev()) {
    return 'http://localhost:5173/js/main.js'
  }

  const manifest = loadManifest()
  if (!manifest || !manifest[ENTRY]) return null

  return `/build/${manifest[ENTRY].file}`
}

export function viteCssFiles() {
  if (isDev()) return []

  const manifest = loadManifest()
  if (!manifest || !manifest[ENTRY]) return []

  return manifest[ENTRY].css?.map(file => `/build/${file}`) || []
}