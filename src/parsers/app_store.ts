import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const APPLE_ID_RE = /^id(\d+)$/

export const app_store: SocialLinksPlatformParser = {
  platform: 'app_store',

  domains(hostname) {
    return (
      hostname === 'play.google.com' ||
      hostname === 'apps.apple.com' ||
      hostname === 'itunes.apple.com' ||
      hostname === 'appsto.re'
    )
  },

  parse(url): SocialLinksParseResult {
    // Google Play: /store/apps/details?id=com.example.app
    if (url.hostname === 'play.google.com') {
      const segments = url.pathname.split('/').filter(Boolean)

      // Developer: /store/apps/developer?id=... or /store/apps/dev?id=...
      if (
        segments.length >= 3 &&
        segments[0] === 'store' &&
        segments[1] === 'apps' &&
        (segments[2] === 'developer' || segments[2] === 'dev')
      ) {
        const id = url.searchParams.get('id')
        if (id) {
          return {
            type: 'profile',
            entities: { developer_id: id },
            url: `https://play.google.com/store/apps/${segments[2]}?id=${encodeURIComponent(id)}`,
          }
        }
      }

      // App: /store/apps/details?id=com.example.app
      if (
        segments.length >= 3 &&
        segments[0] === 'store' &&
        segments[1] === 'apps' &&
        segments[2] === 'details'
      ) {
        const id = url.searchParams.get('id')
        if (id) {
          return {
            type: 'profile',
            entities: { app_id: id },
            url: `https://play.google.com/store/apps/details?id=${id}`,
          }
        }
      }

      return null
    }

    // Apple App Store: /[country]/app/[slug]/id123 or /app/id123
    const segments = url.pathname.split('/').filter(Boolean)

    // appsto.re short links — we can identify the domain but can't extract an ID without following the redirect
    if (url.hostname === 'appsto.re') {
      return null
    }

    // Developer: /[country]/developer/[slug]/id123
    const devIdx = segments.indexOf('developer')
    if (devIdx !== -1) {
      for (let i = devIdx + 1; i < segments.length; i++) {
        const match = segments[i].match(APPLE_ID_RE)
        if (match) {
          return {
            type: 'profile',
            entities: { developer_id: match[1] },
            url: `https://apps.apple.com/app/developer/${segments[i]}`,
          }
        }
      }
      return null
    }

    // App: /[country]/app/[slug]/id123 or /app/id123
    const appIdx = segments.indexOf('app')
    if (appIdx !== -1) {
      for (let i = appIdx + 1; i < segments.length; i++) {
        const match = segments[i].match(APPLE_ID_RE)
        if (match) {
          return {
            type: 'profile',
            entities: { app_id: match[1] },
            url: `https://apps.apple.com/app/${segments[i]}`,
          }
        }
      }
    }

    return null
  },
}
