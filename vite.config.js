import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { deckPlugin, tailwindPlugin } from '@deckio/deck-engine/vite'

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
  ],
  server: {
    fs: {
      allow: ['..', '../..'],
    },
  },
})
