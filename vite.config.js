import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { deckPlugin, tailwindPlugin } from '@deckio/deck-engine/vite'
import { registrationFormBuildError } from './src/registration/microsoftForm.js'

// Inter is self-hosted (see src/index.css), but DECKIO's global.css still @imports it from Google
// Fonts, which would send every visitor's IP address and user agent to Google. Drop only that remote
// @import, and fail the build if a Google Fonts URL still reaches the output.
const GOOGLE_FONTS = /fonts\.(?:googleapis|gstatic)\.com/

const dropGoogleFontsImport = {
  postcssPlugin: 'drop-google-fonts-import',
  AtRule: {
    import(rule) {
      if (GOOGLE_FONTS.test(rule.params)) rule.remove()
    },
  },
}

function forbidGoogleFonts() {
  return {
    name: 'forbid-google-fonts',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const file of Object.values(bundle)) {
        const text = file.type === 'chunk' ? file.code : typeof file.source === 'string' ? file.source : ''
        if (GOOGLE_FONTS.test(text)) this.error(`${file.fileName} references Google Fonts. Self-host the font instead.`)
      }
    },
  }
}

// Registration state 4 sends registrants to this bootcamp's Microsoft Form. Without a valid form link
// the site would show registration as closed, so the build fails and a broken form never deploys.
// The dev server only warns.
function requireRegistrationFormUrl() {
  let config
  return {
    name: 'require-registration-form-url',
    configResolved(resolved) {
      config = resolved
    },
    buildStart() {
      const siteState = JSON.parse(readFileSync(join(config.root, 'api/site-state.json'), 'utf8'))
      const problem = registrationFormBuildError(siteState)
      if (!problem) return
      if (config.command === 'build') this.error(problem)
      this.warn(problem)
    },
  }
}

export default defineConfig({
  base: '/',
  css: {
    postcss: { plugins: [dropGoogleFontsImport] },
  },
  plugins: [
    react({
      include: [/\.[jt]sx?$/, /node_modules\/@deckio\/deck-engine\/.+\.jsx$/],
    }),
    deckPlugin({ inlineEditing: false }),
    tailwindPlugin(),
    forbidGoogleFonts(),
    requireRegistrationFormUrl(),
  ],
  server: {
    fs: {
      allow: ['..', '../..'],
    },
  },
})
