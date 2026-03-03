import type {
  SocialLinkParsedLink,
  SocialLinksParseOptions,
  SocialLinksPlatform,
  SocialLinksPlatformParser,
} from './types'
import { tryParseUrl, cleanUrl } from './url'
import { twitter } from './parsers/twitter'
import { instagram } from './parsers/instagram'
import { tiktok } from './parsers/tiktok'
import { reddit } from './parsers/reddit'
import { github } from './parsers/github'
import { youtube } from './parsers/youtube'
import { spotify } from './parsers/spotify'
import { mastodon } from './parsers/mastodon'
import { soundcloud } from './parsers/soundcloud'
import { mixcloud } from './parsers/mixcloud'
import { discord } from './parsers/discord'
import { substack } from './parsers/substack'
import { medium } from './parsers/medium'
import { vkontakte } from './parsers/vkontakte'
import { rumble } from './parsers/rumble'
import { kick } from './parsers/kick'
import { radiojavan } from './parsers/radiojavan'
import { patreon } from './parsers/patreon'
import { line } from './parsers/line'
import { qq } from './parsers/qq'
import { lastfm } from './parsers/lastfm'
import { kofi } from './parsers/kofi'
import { facebook } from './parsers/facebook'
import { search } from './parsers/search'
import { linkedin } from './parsers/linkedin'
import { threads } from './parsers/threads'
import { bluesky } from './parsers/bluesky'
import { pinterest } from './parsers/pinterest'
import { twitch } from './parsers/twitch'
import { telegram } from './parsers/telegram'
import { snapchat } from './parsers/snapchat'
import { vimeo } from './parsers/vimeo'
import { dailymotion } from './parsers/dailymotion'

export type * from './types'
export { tryParseUrl, cleanUrl } from './url'
export { twitter } from './parsers/twitter'
export { instagram } from './parsers/instagram'
export { tiktok } from './parsers/tiktok'
export { reddit } from './parsers/reddit'
export { github } from './parsers/github'
export { youtube } from './parsers/youtube'
export { spotify } from './parsers/spotify'
export { mastodon } from './parsers/mastodon'
export { soundcloud } from './parsers/soundcloud'
export { mixcloud } from './parsers/mixcloud'
export { discord } from './parsers/discord'
export { substack } from './parsers/substack'
export { medium } from './parsers/medium'
export { vkontakte } from './parsers/vkontakte'
export { rumble } from './parsers/rumble'
export { kick } from './parsers/kick'
export { radiojavan } from './parsers/radiojavan'
export { patreon } from './parsers/patreon'
export { line } from './parsers/line'
export { qq } from './parsers/qq'
export { lastfm } from './parsers/lastfm'
export { kofi } from './parsers/kofi'
export { facebook } from './parsers/facebook'
export { search } from './parsers/search'
export { linkedin } from './parsers/linkedin'
export { threads } from './parsers/threads'
export { bluesky } from './parsers/bluesky'
export { pinterest } from './parsers/pinterest'
export { twitch } from './parsers/twitch'
export { telegram } from './parsers/telegram'
export { snapchat } from './parsers/snapchat'
export { vimeo } from './parsers/vimeo'
export { dailymotion } from './parsers/dailymotion'

const defaultParsers: SocialLinksPlatformParser[] = [
  twitter,
  instagram,
  tiktok,
  reddit,
  github,
  youtube,
  spotify,
  mastodon,
  soundcloud,
  mixcloud,
  discord,
  substack,
  medium,
  vkontakte,
  rumble,
  kick,
  radiojavan,
  patreon,
  line,
  qq,
  lastfm,
  kofi,
  facebook,
  search,
  linkedin,
  threads,
  bluesky,
  pinterest,
  twitch,
  telegram,
  snapchat,
  vimeo,
  dailymotion,
]

const NETWORK_PARSER_MAP = new Map<SocialLinksPlatform, SocialLinksPlatformParser>(
  defaultParsers.map((parser) => [parser.platform, parser]),
)

const USERNAME_PATTERNS: Partial<Record<SocialLinksPlatform, RegExp>> = {
  instagram: /^[a-zA-Z0-9_](?:[a-zA-Z0-9_.]*[a-zA-Z0-9_])?$/,
  twitter: /^[a-zA-Z0-9_]{1,15}$/,
  threads: /^[a-zA-Z0-9_](?:[a-zA-Z0-9_.]*[a-zA-Z0-9_])?$/,
  youtube: /^[a-zA-Z0-9._-]+$/,
  tiktok: /^(?!\.)(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]{2,24}$/,
  github: /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38}[a-zA-Z0-9])?$/,
  twitch: /^[a-zA-Z0-9_]{4,25}$/,
  soundcloud: /^[^/?#\s]+$/,
  mixcloud: /^[^/?#\s]+$/,
  kofi: /^[^/?#\s]+$/,
  patreon: /^[^/?#\s]+$/,
  radiojavan: /^[^/?#\s]+$/,
  vkontakte: /^[^/?#\s]+$/,
  substack: /^[a-zA-Z0-9_-]+$/,
}

function parseHandleForNetwork(input: string, network: SocialLinksPlatform): SocialLinkParsedLink | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('//')) return null

  let candidate = trimmed.replace(/^\/+|\/+$/g, '')
  if (candidate.startsWith('@')) candidate = candidate.slice(1)
  if (!candidate || /[/?#\s]/.test(candidate)) return null

  const pattern = USERNAME_PATTERNS[network]
  if (pattern && !pattern.test(candidate)) return null

  switch (network) {
    case 'instagram':
      return { platform: network, type: 'profile', entities: { username: candidate }, url: `https://instagram.com/${candidate}` }
    case 'twitter':
      return { platform: network, type: 'profile', entities: { username: candidate }, url: `https://x.com/${candidate}` }
    case 'threads':
      return { platform: network, type: 'profile', entities: { username: candidate }, url: `https://threads.net/@${candidate}` }
    case 'youtube':
      return { platform: network, type: 'channel', entities: { username: candidate }, url: `https://youtube.com/@${candidate}` }
    case 'tiktok':
      return { platform: network, type: 'profile', entities: { username: candidate }, url: `https://tiktok.com/@${candidate}` }
    case 'github':
      return { platform: network, type: 'profile', entities: { username: candidate }, url: `https://github.com/${candidate}` }
    case 'twitch':
      return { platform: network, type: 'profile', entities: { username: candidate }, url: `https://twitch.tv/${candidate}` }
    case 'soundcloud':
      return { platform: network, type: 'profile', entities: { username: candidate }, url: `https://soundcloud.com/${candidate}` }
    case 'mixcloud':
      return { platform: network, type: 'profile', entities: { username: candidate }, url: `https://mixcloud.com/${candidate}` }
    case 'kofi':
      return { platform: network, type: 'profile', entities: { username: candidate }, url: `https://ko-fi.com/${candidate}` }
    case 'patreon':
      return { platform: network, type: 'profile', entities: { username: candidate }, url: `https://patreon.com/${candidate}` }
    case 'radiojavan':
      return { platform: network, type: 'profile', entities: { username: candidate }, url: `https://radiojavan.com/${candidate}` }
    case 'vkontakte':
      return { platform: network, type: 'profile', entities: { username: candidate }, url: `https://vk.com/${candidate}` }
    case 'substack':
      return { platform: network, type: 'profile', entities: { username: candidate }, url: `https://substack.com/@${candidate}` }
    default:
      return null
  }
}

export function parse(
  input: string,
  options: SocialLinksParseOptions = {},
): SocialLinkParsedLink | null {
  const parsers = options.parsers ?? defaultParsers
  const network = options.network

  const parseWithParser = (parser: SocialLinksPlatformParser): SocialLinkParsedLink | null => {
    const url = tryParseUrl(input)
    if (!url) return null

    const cleaned = cleanUrl(url)
    if (!parser.domains(cleaned.hostname)) return null
    const result = parser.parse(cleaned)
    if (!result) return null
    return {
      platform: parser.platform,
      type: result.type,
      entities: result.entities,
      url: result.url,
    }
  }

  if (network) {
    const forcedParser =
      parsers.find((parser) => parser.platform === network) ??
      (options.parsers ? null : NETWORK_PARSER_MAP.get(network))

    if (forcedParser) {
      const parsed = parseWithParser(forcedParser)
      if (parsed) return parsed
    }

    return parseHandleForNetwork(input, network)
  }

  for (const parser of parsers) {
    const parsed = parseWithParser(parser)
    if (parsed) {
      return parsed
    }
  }

  return null
}

export function identify(
  input: string,
  parsers: SocialLinksPlatformParser[] = defaultParsers,
): SocialLinksPlatform | null {
  return parse(input, { parsers })?.platform ?? null
}

export function normalize(
  input: string,
  parsers: SocialLinksPlatformParser[] = defaultParsers,
): string | null {
  return parse(input, { parsers })?.url ?? null
}
