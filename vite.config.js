import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { deckPlugin, tailwindPlugin } from '@deckio/deck-engine/vite'
import { REGISTRATION_FORM_HOSTS, registrationFormBuildError } from './src/registration/microsoftForm.js'

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
      const siteState = JSON.parse(readFileSync(join(config.root, 'site-state.json'), 'utf8'))
      const problem = registrationFormBuildError(siteState)
      if (!problem) return
      if (config.command === 'build') this.error(problem)
      this.warn(problem)
    },
  }
}

// GitHub Pages can't send response headers, so the built page carries its content security policy
// and referrer policy as the first tags in <head>. The policy allows the page's own inline scripts by
// hash and frames from Microsoft Forms only. A meta tag can't set frame-ancestors, X-Frame-Options,
// X-Content-Type-Options or Permissions-Policy. The dev server has no policy, so hot reload works.
function securityPolicy() {
  return {
    name: 'security-policy',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const page = bundle['index.html']
      const html = String(page.source)
      const inlineScripts = [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)]
        .map(([, code]) => `'sha256-${createHash('sha256').update(code).digest('base64')}'`)
      const policy = [
        "default-src 'self'",
        ["script-src 'self'", ...inlineScripts].join(' '),
        "connect-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self' data:",
        "img-src 'self' data:",
        `frame-src ${REGISTRATION_FORM_HOSTS.map((host) => `https://${host}`).join(' ')}`,
        "base-uri 'self'",
        "object-src 'none'",
        "form-action 'self'",
      ].join('; ')
      page.source = html.replace(
        /<head>/i,
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />\n`
          + '    <meta name="referrer" content="strict-origin-when-cross-origin" />',
      )
    },
  }
}

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/; the deploy workflow sets BASE_PATH.
  base: process.env.BASE_PATH || '/',
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
    securityPolicy(),
  ],
  server: {
    fs: {
      allow: ['..', '../..'],
    },
  },
})
