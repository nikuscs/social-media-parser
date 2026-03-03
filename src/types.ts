export type SocialLinksPlatform =
  | 'twitter'
  | 'instagram'
  | 'tiktok'
  | 'reddit'
  | 'github'
  | 'youtube'
  | 'spotify'
  | 'mastodon'
  | 'soundcloud'
  | 'mixcloud'
  | 'discord'
  | 'substack'
  | 'medium'
  | 'vkontakte'
  | 'rumble'
  | 'kick'
  | 'radiojavan'
  | 'patreon'
  | 'line'
  | 'qq'
  | 'lastfm'
  | 'kofi'
  | 'facebook'
  | 'search'
  | 'linkedin'
  | 'threads'
  | 'bluesky'
  | 'pinterest'
  | 'twitch'
  | 'telegram'
  | 'snapchat'
  | 'vimeo'
  | 'dailymotion'

export type SocialLinksContentType =
  | 'post'
  | 'profile'
  | 'video'
  | 'track'
  | 'album'
  | 'clip'
  | 'short'
  | 'story'
  | 'comment'
  | 'subreddit'
  | 'repository'
  | 'gist'
  | 'board'
  | 'channel'
  | 'playlist'
  | 'group'
  | 'event'
  | 'photo'
  | 'search'

export interface SocialLinkParsedLink {
  platform: SocialLinksPlatform
  type: SocialLinksContentType
  entities: Record<string, string>
  url: string
}

export type SocialLinksParseResult = {
  type: SocialLinksContentType
  entities: Record<string, string>
  url: string
} | null

export interface SocialLinksPlatformParser {
  platform: SocialLinksPlatform
  domains: (hostname: string) => boolean
  parse: (url: URL) => SocialLinksParseResult
}

export interface SocialLinksParseOptions {
  parsers?: SocialLinksPlatformParser[]
  network?: SocialLinksPlatform
}
