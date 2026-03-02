import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const SEARCH_DOMAINS = new Set([
  'google.com', 'bing.com', 'duckduckgo.com', 'yahoo.com', 'yandex.com',
  'baidu.com', 'brave.com', 'search.brave.com', 'ecosia.org', 'qwant.com',
  'startpage.com',
  'google.co.uk', 'google.com.au', 'google.ca', 'google.de', 'google.es',
  'google.fr', 'google.it', 'google.nl', 'google.pl', 'google.pt', 'google.ro',
  'google.ru', 'google.se', 'google.co.in', 'google.co.jp', 'google.co.kr',
  'google.co.id', 'google.co.th', 'google.co.za', 'google.co.br', 'google.co.mx',
  'google.co.nz', 'google.co.ph',
])

function isSearchDomain(hostname: string): boolean {
  if (SEARCH_DOMAINS.has(hostname)) return true
  for (const domain of SEARCH_DOMAINS) {
    if (hostname.endsWith('.' + domain)) return true
  }
  return false
}

export const search: SocialLinksPlatformParser = {
  platform: 'search',

  domains: isSearchDomain,

  parse(url): SocialLinksParseResult {
    const hostname = url.hostname
    const isBaidu = hostname === 'baidu.com' || hostname.endsWith('.baidu.com')
    const isYahoo = hostname === 'yahoo.com' || hostname.endsWith('.yahoo.com')
    const isYandex = hostname === 'yandex.com' || hostname.endsWith('.yandex.com')

    const params = isBaidu
      ? ['wd']
      : isYahoo
        ? ['p', 'q']
        : isYandex
          ? ['text', 'q']
          : ['q']

    let query: string | null = null
    for (const param of params) {
      const value = url.searchParams.get(param)
      if (value) {
        query = value
        break
      }
    }

    if (query) {
      return {
        type: 'search',
        entities: { query },
        url: url.href,
      }
    }

    return null
  },
}
