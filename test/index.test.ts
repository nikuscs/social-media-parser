import { describe, expect, it } from 'vitest'
import { parse, identify, normalize } from '../src/index'

describe('parse', () => {
  it('parses a Twitter post URL', () => {
    const result = parse('https://twitter.com/elonmusk/status/1234567890')
    expect(result).toEqual({
      platform: 'twitter',
      type: 'post',
      entities: { post_id: '1234567890', username: 'elonmusk' },
      url: 'https://x.com/i/status/1234567890',
    })
  })

  it('parses an Instagram profile URL', () => {
    const result = parse('https://www.instagram.com/johndoe/')
    expect(result).toEqual({
      platform: 'instagram',
      type: 'profile',
      entities: { username: 'johndoe' },
      url: 'https://instagram.com/johndoe',
    })
  })

  it('parses a TikTok video URL', () => {
    const result = parse('https://www.tiktok.com/@user/video/123456789012345678')
    expect(result).toEqual({
      platform: 'tiktok',
      type: 'video',
      entities: { video_id: '123456789012345678', username: 'user' },
      url: 'https://tiktok.com/@user/video/123456789012345678',
    })
  })

  it('parses a Reddit subreddit URL', () => {
    const result = parse('https://www.reddit.com/r/typescript')
    expect(result).toEqual({
      platform: 'reddit',
      type: 'subreddit',
      entities: { subreddit: 'typescript' },
      url: 'https://reddit.com/r/typescript',
    })
  })

  it('parses a GitHub repository URL', () => {
    const result = parse('https://github.com/facebook/react')
    expect(result).toEqual({
      platform: 'github',
      type: 'repository',
      entities: { owner: 'facebook', repo: 'react' },
      url: 'https://github.com/facebook/react',
    })
  })

  it('parses a YouTube video URL', () => {
    const result = parse('https://youtu.be/dQw4w9WgXcQ')
    expect(result).toEqual({
      platform: 'youtube',
      type: 'video',
      entities: { video_id: 'dQw4w9WgXcQ' },
      url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    })
  })

  it('parses a Spotify track URL', () => {
    const result = parse('https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7P')
    expect(result).toEqual({
      platform: 'spotify',
      type: 'track',
      entities: { track_id: '7ouMYWpwJ422jRcDASZB7P' },
      url: 'https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7P',
    })
  })

  it('parses a Mastodon post URL', () => {
    const result = parse('https://mastodon.social/@gargron/112233445566778899')
    expect(result).toEqual({
      platform: 'mastodon',
      type: 'post',
      entities: { username: 'gargron', post_id: '112233445566778899' },
      url: 'https://mastodon.social/@gargron/112233445566778899',
    })
  })

  it('parses a SoundCloud track URL', () => {
    const result = parse('https://soundcloud.com/porter-robinson/language')
    expect(result).toEqual({
      platform: 'soundcloud',
      type: 'track',
      entities: { username: 'porter-robinson', track: 'language' },
      url: 'https://soundcloud.com/porter-robinson/language',
    })
  })

  it('parses a Mixcloud show URL', () => {
    const result = parse('https://mixcloud.com/nts/morning-show-001')
    expect(result).toEqual({
      platform: 'mixcloud',
      type: 'post',
      entities: { username: 'nts', show: 'morning-show-001' },
      url: 'https://mixcloud.com/nts/morning-show-001',
    })
  })

  it('parses a Discord message URL', () => {
    const result = parse('https://discord.com/channels/123456789012345678/223456789012345678/323456789012345678')
    expect(result).toEqual({
      platform: 'discord',
      type: 'post',
      entities: {
        guild_id: '123456789012345678',
        channel_id: '223456789012345678',
        message_id: '323456789012345678',
      },
      url: 'https://discord.com/channels/123456789012345678/223456789012345678/323456789012345678',
    })
  })

  it('parses a Substack post URL', () => {
    const result = parse('https://platformer.substack.com/p/example-post')
    expect(result).toEqual({
      platform: 'substack',
      type: 'post',
      entities: { publication: 'platformer', slug: 'example-post' },
      url: 'https://platformer.substack.com/p/example-post',
    })
  })

  it('parses a Medium post URL', () => {
    const result = parse('https://medium.com/@ev/example-post-abc123def456')
    expect(result).toEqual({
      platform: 'medium',
      type: 'post',
      entities: { username: 'ev', post_id: 'abc123def456' },
      url: 'https://medium.com/@ev/example-post-abc123def456',
    })
  })

  it('parses a VK post URL', () => {
    const result = parse('https://vk.com/wall-12345_67890')
    expect(result).toEqual({
      platform: 'vkontakte',
      type: 'post',
      entities: { owner_id: '-12345', post_id: '67890' },
      url: 'https://vk.com/wall-12345_67890',
    })
  })

  it('parses a Rumble video URL', () => {
    const result = parse('https://rumble.com/v5abcde-example-title.html')
    expect(result).toEqual({
      platform: 'rumble',
      type: 'video',
      entities: { video_id: '5abcde' },
      url: 'https://rumble.com/v5abcde',
    })
  })

  it('parses a Kick profile URL', () => {
    const result = parse('https://kick.com/trainwreckstv')
    expect(result).toEqual({
      platform: 'kick',
      type: 'profile',
      entities: { username: 'trainwreckstv' },
      url: 'https://kick.com/trainwreckstv',
    })
  })

  it('parses a Radio Javan video URL', () => {
    const result = parse('https://radiojavan.com/videos/video/artist-song')
    expect(result).toEqual({
      platform: 'radiojavan',
      type: 'video',
      entities: { video_slug: 'artist-song' },
      url: 'https://radiojavan.com/videos/video/artist-song',
    })
  })

  it('parses a Patreon post URL', () => {
    const result = parse('https://patreon.com/c/creator/posts/post-title-123456')
    expect(result).toEqual({
      platform: 'patreon',
      type: 'post',
      entities: { username: 'creator', post_id: '123456' },
      url: 'https://patreon.com/c/creator/posts/post-title-123456',
    })
  })

  it('parses a LINE profile URL', () => {
    const result = parse('https://line.me/ti/p/~mylineid')
    expect(result).toEqual({
      platform: 'line',
      type: 'profile',
      entities: { line_id: '~mylineid' },
      url: 'https://line.me/ti/p/~mylineid',
    })
  })

  it('parses a QQ profile URL', () => {
    const result = parse('https://user.qzone.qq.com/123456789')
    expect(result).toEqual({
      platform: 'qq',
      type: 'profile',
      entities: { uin: '123456789' },
      url: 'https://user.qzone.qq.com/123456789',
    })
  })

  it('parses a Last.fm track URL', () => {
    const result = parse('https://last.fm/music/Daft+Punk/_/One+More+Time')
    expect(result).toEqual({
      platform: 'lastfm',
      type: 'track',
      entities: { artist: 'Daft+Punk', track: 'One+More+Time' },
      url: 'https://last.fm/music/Daft+Punk/_/One+More+Time',
    })
  })

  it('parses a Ko-fi profile URL', () => {
    const result = parse('https://ko-fi.com/somecreator')
    expect(result).toEqual({
      platform: 'kofi',
      type: 'profile',
      entities: { username: 'somecreator' },
      url: 'https://ko-fi.com/somecreator',
    })
  })

  it('parses a Facebook post URL', () => {
    const result = parse('https://www.facebook.com/johndoe/posts/123456789')
    expect(result).toEqual({
      platform: 'facebook',
      type: 'post',
      entities: { post_id: '123456789', username: 'johndoe' },
      url: 'https://facebook.com/johndoe/posts/123456789',
    })
  })

  it('parses a Facebook video via fb.watch', () => {
    const result = parse('https://fb.watch/abc123')
    expect(result).toEqual({
      platform: 'facebook',
      type: 'video',
      entities: { video_id: 'abc123' },
      url: 'https://facebook.com/watch/?v=abc123',
    })
  })

  it('parses a Google search URL', () => {
    const result = parse('https://www.google.com/search?q=hello+world')
    expect(result).toEqual({
      platform: 'search',
      type: 'search',
      entities: { query: 'hello world' },
      url: 'https://www.google.com/search?q=hello+world',
    })
  })

  it('parses a LinkedIn profile URL', () => {
    const result = parse('https://linkedin.com/in/jane-doe')
    expect(result).toEqual({
      platform: 'linkedin',
      type: 'profile',
      entities: { username: 'jane-doe' },
      url: 'https://linkedin.com/in/jane-doe',
    })
  })

  it('parses a Threads post URL', () => {
    const result = parse('https://threads.net/@johndoe/post/abc123')
    expect(result).toEqual({
      platform: 'threads',
      type: 'post',
      entities: { username: 'johndoe', post_id: 'abc123' },
      url: 'https://threads.net/@johndoe/post/abc123',
    })
  })

  it('parses a Bluesky post URL', () => {
    const result = parse('https://bsky.app/profile/alice.bsky.social/post/3kxy9')
    expect(result).toEqual({
      platform: 'bluesky',
      type: 'post',
      entities: { handle_or_did: 'alice.bsky.social', post_id: '3kxy9' },
      url: 'https://bsky.app/profile/alice.bsky.social/post/3kxy9',
    })
  })

  it('parses a Pinterest board URL', () => {
    const result = parse('https://pinterest.com/johndoe/home-decor')
    expect(result).toEqual({
      platform: 'pinterest',
      type: 'board',
      entities: { username: 'johndoe', board: 'home-decor' },
      url: 'https://pinterest.com/johndoe/home-decor',
    })
  })

  it('parses a Twitch clip URL', () => {
    const result = parse('https://clips.twitch.tv/AmazingClipSlug')
    expect(result).toEqual({
      platform: 'twitch',
      type: 'clip',
      entities: { clip_id: 'AmazingClipSlug' },
      url: 'https://clips.twitch.tv/AmazingClipSlug',
    })
  })

  it('parses a Telegram channel post URL', () => {
    const result = parse('https://t.me/openai/123')
    expect(result).toEqual({
      platform: 'telegram',
      type: 'post',
      entities: { channel: 'openai', post_id: '123' },
      url: 'https://t.me/openai/123',
    })
  })

  it('parses a Snapchat spotlight URL', () => {
    const result = parse('https://snapchat.com/spotlight/abc123')
    expect(result).toEqual({
      platform: 'snapchat',
      type: 'short',
      entities: { video_id: 'abc123' },
      url: 'https://snapchat.com/spotlight/abc123',
    })
  })

  it('parses a Vimeo URL', () => {
    const result = parse('https://vimeo.com/123456789')
    expect(result).toEqual({
      platform: 'vimeo',
      type: 'video',
      entities: { video_id: '123456789' },
      url: 'https://vimeo.com/123456789',
    })
  })

  it('parses a Dailymotion URL', () => {
    const result = parse('https://dailymotion.com/video/x9abcde')
    expect(result).toEqual({
      platform: 'dailymotion',
      type: 'video',
      entities: { video_id: 'x9abcde' },
      url: 'https://dailymotion.com/video/x9abcde',
    })
  })

  it('strips tracking params', () => {
    const result = parse('https://twitter.com/user/status/123?utm_source=share&utm_medium=web')
    expect(result).not.toBeNull()
    expect(result!.url).not.toContain('utm_source')
  })

  it('returns null for invalid input', () => {
    expect(parse('')).toBeNull()
    expect(parse('not a url')).toBeNull()
  })

  it('recovers malformed scheme input like http:instagram.com/nikuscs', () => {
    expect(parse('http:instagram.com/nikuscs')).toEqual({
      platform: 'instagram',
      type: 'profile',
      entities: { username: 'nikuscs' },
      url: 'https://instagram.com/nikuscs',
    })
  })

  it('supports forced-network parsing for @handles', () => {
    expect(parse('@nikuscs', { network: 'instagram' })).toEqual({
      platform: 'instagram',
      type: 'profile',
      entities: { username: 'nikuscs' },
      url: 'https://instagram.com/nikuscs',
    })
  })

  it('supports forced-network parsing for bare handles', () => {
    expect(parse('nikuscs', { network: 'threads' })).toEqual({
      platform: 'threads',
      type: 'profile',
      entities: { username: 'nikuscs' },
      url: 'https://threads.net/@nikuscs',
    })
  })

  it('returns null for @handle without forced network', () => {
    expect(parse('@nikuscs')).toBeNull()
  })

  it('does not coerce URL into wrong forced network', () => {
    expect(parse('https://x.com/nikuscs', { network: 'instagram' })).toBeNull()
  })

  it.each([
    { network: 'twitter', type: 'profile', url: 'https://x.com/nikuscs' },
    { network: 'youtube', type: 'channel', url: 'https://youtube.com/@nikuscs' },
    { network: 'tiktok', type: 'profile', url: 'https://tiktok.com/@nikuscs' },
    { network: 'github', type: 'profile', url: 'https://github.com/nikuscs' },
    { network: 'twitch', type: 'profile', url: 'https://twitch.tv/nikuscs' },
    { network: 'soundcloud', type: 'profile', url: 'https://soundcloud.com/nikuscs' },
    { network: 'mixcloud', type: 'profile', url: 'https://mixcloud.com/nikuscs' },
    { network: 'kofi', type: 'profile', url: 'https://ko-fi.com/nikuscs' },
    { network: 'patreon', type: 'profile', url: 'https://patreon.com/nikuscs' },
    { network: 'radiojavan', type: 'profile', url: 'https://radiojavan.com/nikuscs' },
    { network: 'vkontakte', type: 'profile', url: 'https://vk.com/nikuscs' },
    { network: 'substack', type: 'profile', url: 'https://substack.com/@nikuscs' },
  ] as const)('supports forced handle parsing for $network', ({ network, type, url }) => {
    expect(parse('@nikuscs', { network })).toEqual({
      platform: network,
      type,
      entities: { username: 'nikuscs' },
      url,
    })
  })

  it('returns null for forced network when input is protocol-relative URL of another network', () => {
    expect(parse('//instagram.com/nikuscs', { network: 'twitter' })).toBeNull()
  })

  it('returns null for forced network that does not support bare handle parsing', () => {
    expect(parse('@nikuscs', { network: 'facebook' })).toBeNull()
  })

  it('falls back to handle parsing when forced network is missing from provided parsers', () => {
    expect(parse('@nikuscs', { network: 'twitter', parsers: [] })).toEqual({
      platform: 'twitter',
      type: 'profile',
      entities: { username: 'nikuscs' },
      url: 'https://x.com/nikuscs',
    })
  })

  it('returns null for empty forced-network handle input', () => {
    expect(parse('   ', { network: 'instagram' })).toBeNull()
  })

  it('returns null when forced-network handle collapses to empty after @ removal', () => {
    expect(parse('@/', { network: 'instagram' })).toBeNull()
  })

  it('returns null when forced-network handle fails regex', () => {
    expect(parse('@john..doe', { network: 'tiktok' })).toBeNull()
  })

  it('uses forced parser directly when URL already matches that network', () => {
    expect(parse('https://instagram.com/nikuscs', { network: 'instagram' })?.platform).toBe('instagram')
  })

  it('returns null for invalid forced network value', () => {
    expect(parse('@nikuscs', { network: 'not-a-network' as never })).toBeNull()
  })

  it('returns null for unknown domains', () => {
    expect(parse('https://example.com/path')).toBeNull()
  })

  it('returns null when domain matches but path does not', () => {
    expect(parse('https://twitter.com/home')).toBeNull()
  })

  it('accepts custom parsers', () => {
    const result = parse('https://twitter.com/user123', { parsers: [] })
    expect(result).toBeNull()
  })
})

describe('identify', () => {
  it('identifies twitter', () => {
    expect(identify('https://x.com/elonmusk')).toBe('twitter')
  })

  it('identifies instagram', () => {
    expect(identify('https://instagram.com/johndoe')).toBe('instagram')
  })

  it('returns null for unknown', () => {
    expect(identify('https://example.com')).toBeNull()
  })

  it('returns null for invalid input', () => {
    expect(identify('')).toBeNull()
  })

  it('accepts custom parsers', () => {
    expect(identify('https://x.com/user123', [])).toBeNull()
  })
})

describe('normalize', () => {
  it('normalizes a Twitter URL', () => {
    expect(normalize('https://twitter.com/elonmusk/status/123')).toBe('https://x.com/i/status/123')
  })

  it('normalizes an Instagram URL with www', () => {
    expect(normalize('https://www.instagram.com/johndoe/')).toBe('https://instagram.com/johndoe')
  })

  it('returns null for unknown', () => {
    expect(normalize('https://example.com')).toBeNull()
  })

  it('returns null for invalid input', () => {
    expect(normalize('')).toBeNull()
  })

  it('accepts custom parsers', () => {
    expect(normalize('https://x.com/user123', [])).toBeNull()
  })
})
