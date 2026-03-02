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
})
