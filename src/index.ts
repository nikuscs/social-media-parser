import type { SocialLinkParsedLink, SocialLinksPlatform, SocialLinksPlatformParser } from './types'
import { tryParseUrl, cleanUrl } from './url'
import { twitter } from './parsers/twitter'
import { instagram } from './parsers/instagram'
import { tiktok } from './parsers/tiktok'
import { reddit } from './parsers/reddit'
import { github } from './parsers/github'
import { youtube } from './parsers/youtube'
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

export function parse(
  input: string,
  parsers: SocialLinksPlatformParser[] = defaultParsers,
): SocialLinkParsedLink | null {
  const url = tryParseUrl(input)
  if (!url) return null

  const cleaned = cleanUrl(url)
  const hostname = cleaned.hostname

  for (const parser of parsers) {
    if (!parser.domains(hostname)) continue
    const result = parser.parse(cleaned)
    if (result) {
      return {
        platform: parser.platform,
        type: result.type,
        entities: result.entities,
        url: result.url,
      }
    }
  }

  return null
}

export function identify(
  input: string,
  parsers: SocialLinksPlatformParser[] = defaultParsers,
): SocialLinksPlatform | null {
  return parse(input, parsers)?.platform ?? null
}

export function normalize(
  input: string,
  parsers: SocialLinksPlatformParser[] = defaultParsers,
): string | null {
  return parse(input, parsers)?.url ?? null
}
