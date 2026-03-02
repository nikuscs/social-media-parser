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

  it('returns null for unknown domains', () => {
    expect(parse('https://example.com/path')).toBeNull()
  })

  it('returns null when domain matches but path does not', () => {
    expect(parse('https://twitter.com/home')).toBeNull()
  })

  it('accepts custom parsers', () => {
    const result = parse('https://twitter.com/user123', [])
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
