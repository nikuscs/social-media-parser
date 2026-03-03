import { describe, expect, it } from 'vitest'
import { normalize, parse } from '../src/index'

describe('cross-platform reserved-route negatives', () => {
  const cases: { name: string, url: string }[] = [
    { name: 'twitter home', url: 'https://x.com/home' },
    { name: 'instagram reels namespace', url: 'https://instagram.com/reels' },
    { name: 'tiktok video namespace', url: 'https://tiktok.com/video' },
    { name: 'reddit incomplete subreddit root', url: 'https://reddit.com/r' },
    { name: 'github org namespace', url: 'https://github.com/orgs/openai' },
    { name: 'youtube results page', url: 'https://youtube.com/results?search_query=test' },
    { name: 'facebook video.php without id', url: 'https://facebook.com/video.php' },
    { name: 'linkedin feed root', url: 'https://linkedin.com/feed' },
    { name: 'threads non-profile path', url: 'https://threads.net/about' },
    { name: 'bluesky non-profile path', url: 'https://bsky.app/settings' },
    { name: 'pinterest search namespace', url: 'https://pinterest.com/search' },
    { name: 'twitch videos namespace', url: 'https://twitch.tv/videos' },
    { name: 'telegram incomplete joinchat', url: 'https://t.me/joinchat' },
    { name: 'snapchat incomplete add', url: 'https://snapchat.com/add' },
    { name: 'vimeo channel root without video id', url: 'https://vimeo.com/channels/staffpicks' },
    { name: 'dailymotion video namespace', url: 'https://dailymotion.com/video' },
    { name: 'mastodon about route', url: 'https://mastodon.social/about' },
    { name: 'soundcloud discover namespace', url: 'https://soundcloud.com/discover' },
    { name: 'mixcloud discover namespace', url: 'https://mixcloud.com/discover' },
    { name: 'discord store namespace', url: 'https://discord.com/store' },
    { name: 'substack home route', url: 'https://substack.com/home' },
    { name: 'medium reserved route', url: 'https://medium.com/topics' },
    { name: 'vk reserved route', url: 'https://vk.com/feed' },
    { name: 'rumble empty root', url: 'https://rumble.com/' },
    { name: 'kick reserved route', url: 'https://kick.com/categories' },
    { name: 'radiojavan reserved route', url: 'https://radiojavan.com/search' },
    { name: 'patreon reserved route', url: 'https://patreon.com/home' },
    { name: 'line missing post id', url: 'https://line.me/R/home/public/post' },
    { name: 'qq invalid uin', url: 'https://user.qzone.qq.com/notuin' },
    { name: 'lastfm invalid user route', url: 'https://last.fm/user' },
    { name: 'kofi reserved route', url: 'https://ko-fi.com/home' },
    { name: 'search homepage without query', url: 'https://google.com/search' },
  ]

  it.each(cases)('returns null for $name', ({ url }) => {
    expect(parse(url)).toBeNull()
  })
})

describe('parse/normalize invariants', () => {
  const canonicalizableUrls = [
    'https://twitter.com/elonmusk/status/1234567890',
    'https://www.instagram.com/johndoe/',
    'https://www.tiktok.com/@user/video/123456789012345678',
    'https://www.reddit.com/r/typescript/comments/abc123/sample-post',
    'https://github.com/facebook/react/issues/1',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://mastodon.social/@gargron/112233445566778899',
    'https://soundcloud.com/porter-robinson/language',
    'https://mixcloud.com/nts/morning-show-001',
    'https://discord.com/channels/123456789012345678/223456789012345678/323456789012345678',
    'https://platformer.substack.com/p/example-post',
    'https://medium.com/@ev/example-post-abc123def456',
    'https://vk.com/wall-12345_67890',
    'https://rumble.com/v5abcde-example-title.html',
    'https://kick.com/trainwreckstv',
    'https://radiojavan.com/videos/video/artist-song',
    'https://patreon.com/c/creator/posts/post-title-123456',
    'https://line.me/ti/p/~mylineid',
    'https://user.qzone.qq.com/123456789',
    'https://last.fm/music/Daft+Punk/_/One+More+Time',
    'https://ko-fi.com/somecreator',
    'https://facebook.com/watch/?v=123456789',
    'https://www.google.com/search?q=hello+world',
    'https://linkedin.com/in/jane-doe',
    'https://threads.net/@johndoe/post/abc123',
    'https://bsky.app/profile/alice.bsky.social/post/3kxy9',
    'https://pinterest.com/johndoe/home-decor',
    'https://clips.twitch.tv/AmazingClipSlug',
    'https://t.me/openai/123',
    'https://snapchat.com/spotlight/abc123',
    'https://vimeo.com/123456789',
    'https://dailymotion.com/video/x9abcde',
  ]

  it.each(canonicalizableUrls)('normalize is idempotent for %s', (url) => {
    const once = normalize(url)
    expect(once).not.toBeNull()
    expect(normalize(once!)).toBe(once)
  })

  it.each(canonicalizableUrls)('parse(normalize(url)) keeps platform/type for %s', (url) => {
    const parsed = parse(url)
    expect(parsed).not.toBeNull()

    const normalized = normalize(url)
    expect(normalized).not.toBeNull()

    const reparsed = parse(normalized!)
    expect(reparsed).not.toBeNull()
    expect(reparsed!.platform).toBe(parsed!.platform)
    expect(reparsed!.type).toBe(parsed!.type)
  })

  it.each(canonicalizableUrls)('parses bare-domain input (no scheme) for %s', (url) => {
    const parsed = parse(url)
    expect(parsed).not.toBeNull()

    const noScheme = url.replace(/^https?:\/\//, '')
    const reparsed = parse(noScheme)
    expect(reparsed).not.toBeNull()
    expect(reparsed!.platform).toBe(parsed!.platform)
    expect(reparsed!.type).toBe(parsed!.type)
  })

  it.each(canonicalizableUrls)('parses malformed http-scheme input for %s', (url) => {
    const parsed = parse(url)
    expect(parsed).not.toBeNull()

    const malformed = url.replace(/^https?:\/\//, 'http:')
    const reparsed = parse(malformed)
    expect(reparsed).not.toBeNull()
    expect(reparsed!.platform).toBe(parsed!.platform)
    expect(reparsed!.type).toBe(parsed!.type)
  })
})
