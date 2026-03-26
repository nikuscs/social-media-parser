import { describe, expect, it } from 'vitest'
import { parse, identify, normalize, shorten } from '../src/index'
import { tryParseUrl, cleanUrl } from '../src/url'

describe('tryParseUrl additional edge cases', () => {
  it('handles uppercase HTTP scheme', () => {
    const url = tryParseUrl('HTTP://example.com/path')
    expect(url).not.toBeNull()
    expect(url!.hostname).toBe('example.com')
  })

  it('handles mixed case HTTPS scheme', () => {
    const url = tryParseUrl('HtTpS://example.com')
    expect(url).not.toBeNull()
    expect(url!.hostname).toBe('example.com')
  })

  it('recovers triple-slash URL', () => {
    const url = tryParseUrl('https:///example.com')
    // URL constructor treats this as empty host with path /example.com
    // So tryParseUrl returns a URL but it won't match any parser
    expect(url).not.toBeNull()
  })

  it('handles bare domain with port', () => {
    const url = tryParseUrl('example.com:8080/path')
    expect(url).not.toBeNull()
  })

  it('handles IPv4 address', () => {
    const url = tryParseUrl('https://127.0.0.1/path')
    expect(url).not.toBeNull()
    expect(url!.hostname).toBe('127.0.0.1')
  })

  it('handles URL with basic auth', () => {
    const url = tryParseUrl('https://user:pass@example.com/path')
    expect(url).not.toBeNull()
    expect(url!.hostname).toBe('example.com')
  })

  it('parses single word without dot (valid URL with TLD-less host)', () => {
    // "hello" becomes "https://hello" which is technically valid per URL spec
    const url = tryParseUrl('hello')
    expect(url).not.toBeNull()
    expect(url!.hostname).toBe('hello')
  })

  it('returns null for data: URI', () => {
    expect(tryParseUrl('data:text/html,<h1>hi</h1>')).toBeNull()
  })

  it('returns null for blob: URI', () => {
    expect(tryParseUrl('blob:http://example.com/uuid')).toBeNull()
  })
})

describe('cleanUrl additional edge cases', () => {
  it('strips multiple trailing slashes', () => {
    const url = new URL('https://example.com/path///')
    const cleaned = cleanUrl(url)
    expect(cleaned.pathname).toBe('/path')
  })

  it('preserves non-tracking query params', () => {
    const url = new URL('https://example.com/path?page=2&sort=date')
    const cleaned = cleanUrl(url)
    expect(cleaned.searchParams.get('page')).toBe('2')
    expect(cleaned.searchParams.get('sort')).toBe('date')
  })

  it('removes only tracking params from mixed params', () => {
    const url = new URL('https://example.com?keep=yes&utm_source=twitter&fbclid=abc&page=2')
    const cleaned = cleanUrl(url)
    expect(cleaned.searchParams.get('keep')).toBe('yes')
    expect(cleaned.searchParams.get('page')).toBe('2')
    expect(cleaned.searchParams.has('utm_source')).toBe(false)
    expect(cleaned.searchParams.has('fbclid')).toBe(false)
  })

  it('handles empty query string', () => {
    const url = new URL('https://example.com/path?')
    const cleaned = cleanUrl(url)
    expect(cleaned.pathname).toBe('/path')
  })

  it('handles mixed case hostname with subdomain', () => {
    const url = new URL('https://WWW.EXAMPLE.COM/path')
    const cleaned = cleanUrl(url)
    expect(cleaned.hostname).toBe('www.example.com')
  })
})

describe('twitter edge cases', () => {
  it('handles 15-char username at boundary', () => {
    const result = parse('https://x.com/abcdefghijklmno')
    expect(result?.type).toBe('profile')
    expect(result?.entities.username).toBe('abcdefghijklmno')
  })

  it('rejects 16-char username over boundary', () => {
    expect(parse('https://x.com/abcdefghijklmnop')).toBeNull()
  })

  it('rejects reserved paths case-insensitively', () => {
    expect(parse('https://x.com/Home')).toBeNull()
    expect(parse('https://x.com/EXPLORE')).toBeNull()
    expect(parse('https://x.com/Settings')).toBeNull()
  })

  it('accepts username that starts like reserved but is not', () => {
    expect(parse('https://x.com/homely')?.type).toBe('profile')
    // settings_page is 13 chars, not in RESERVED set, so it's a valid username
    expect(parse('https://x.com/settings_page')?.type).toBe('profile')
  })

  it('handles post with non-numeric ID', () => {
    expect(parse('https://x.com/user/status/abc')).toBeNull()
    expect(parse('https://x.com/user/status/123abc')).toBeNull()
  })

  it('handles post ID with leading zeros', () => {
    const result = parse('https://x.com/user/status/0000000001')
    expect(result?.type).toBe('post')
    expect(result?.entities.post_id).toBe('0000000001')
  })

  it('handles t.co root with no path', () => {
    expect(parse('https://t.co/')).toBeNull()
    expect(parse('https://t.co')).toBeNull()
  })

  it('handles single-char username', () => {
    const result = parse('https://x.com/a')
    expect(result?.type).toBe('profile')
    expect(result?.entities.username).toBe('a')
  })

  it('handles underscore-only username', () => {
    const result = parse('https://x.com/___')
    expect(result?.type).toBe('profile')
  })
})

describe('instagram edge cases', () => {
  it('rejects username ending with dot', () => {
    expect(parse('https://instagram.com/user.')).toBeNull()
  })

  it('rejects username starting with dot', () => {
    expect(parse('https://instagram.com/.user')).toBeNull()
  })

  it('accepts username with consecutive dots (regex allows it)', () => {
    // Instagram USERNAME_RE is /^[a-zA-Z0-9_](?:[a-zA-Z0-9_.]*[a-zA-Z0-9_])?$/
    // This allows consecutive dots in the middle
    const result = parse('https://instagram.com/user..name')
    expect(result?.type).toBe('profile')
    expect(result?.entities.username).toBe('user..name')
  })

  it('accepts username with single dots', () => {
    const result = parse('https://instagram.com/user.name')
    expect(result?.type).toBe('profile')
    expect(result?.entities.username).toBe('user.name')
  })

  it('handles post types case-sensitively (uppercase P rejected)', () => {
    // POST_TYPES set only has lowercase
    expect(parse('https://instagram.com/P/ABC123')).toBeNull()
  })

  it('rejects stories/highlights path', () => {
    expect(parse('https://instagram.com/stories/highlights/123')).toBeNull()
  })

  it('rejects story without numeric ID', () => {
    expect(parse('https://instagram.com/stories/user/abc')).toBeNull()
  })

  it('instagr.am root returns null', () => {
    expect(parse('https://instagr.am/')).toBeNull()
    expect(parse('https://instagr.am')).toBeNull()
  })

  it('ig.me root returns null', () => {
    expect(parse('https://ig.me/')).toBeNull()
    expect(parse('https://ig.me')).toBeNull()
  })
})

describe('youtube edge cases', () => {
  it('rejects video ID shorter than 11 chars', () => {
    expect(parse('https://youtube.com/watch?v=dQw4w9WgXc')).toBeNull() // 10 chars
  })

  it('rejects video ID longer than 11 chars', () => {
    expect(parse('https://youtube.com/watch?v=dQw4w9WgXcQQ')).toBeNull() // 12 chars
  })

  it('accepts video ID with underscore and hyphen', () => {
    const result = parse('https://youtube.com/watch?v=a_b-c_d-e_1')
    expect(result?.type).toBe('video')
  })

  it('handles /watch without v param', () => {
    expect(parse('https://youtube.com/watch')).toBeNull()
    expect(parse('https://youtube.com/watch?list=PLabc')).toBeNull()
  })

  it('handles /playlist without list param', () => {
    expect(parse('https://youtube.com/playlist')).toBeNull()
  })

  it('handles embed path', () => {
    const result = parse('https://youtube.com/embed/dQw4w9WgXcQ')
    expect(result?.type).toBe('video')
    expect(result?.entities.video_id).toBe('dQw4w9WgXcQ')
  })

  it('handles youtube-nocookie.com domain', () => {
    const result = parse('https://youtube-nocookie.com/embed/dQw4w9WgXcQ')
    expect(result?.platform).toBe('youtube')
    expect(result?.type).toBe('video')
  })

  it('handles /c/{name} channel path', () => {
    const result = parse('https://youtube.com/c/mkbhd')
    expect(result?.type).toBe('channel')
    expect(result?.entities.username).toBe('mkbhd')
  })

  it('handles /user/{name} channel path', () => {
    const result = parse('https://youtube.com/user/mkbhd')
    expect(result?.type).toBe('channel')
    expect(result?.entities.username).toBe('mkbhd')
  })

  it('handles /channel/{id} path', () => {
    const result = parse('https://youtube.com/channel/UCBcRF18a7Qf58cCRy5xuWwQ')
    expect(result?.type).toBe('channel')
    expect(result?.entities.channel_id).toBe('UCBcRF18a7Qf58cCRy5xuWwQ')
  })

  it('handles youtu.be with non-matching ID', () => {
    expect(parse('https://youtu.be/short')).toBeNull() // only 5 chars
    expect(parse('https://youtu.be/')).toBeNull()
  })

  it('yt.be root returns null', () => {
    expect(parse('https://yt.be/')).toBeNull()
    expect(parse('https://yt.be')).toBeNull()
  })

  it('handles encoded @ in handle path', () => {
    const result = parse('https://youtube.com/%40mkbhd')
    expect(result?.type).toBe('channel')
    expect(result?.entities.username).toBe('mkbhd')
  })

  it('rejects empty handle after @', () => {
    expect(parse('https://youtube.com/@')).toBeNull()
  })
})

describe('reddit edge cases', () => {
  it('subreddit at exact 3-char boundary', () => {
    const result = parse('https://reddit.com/r/abc')
    expect(result?.type).toBe('subreddit')
  })

  it('subreddit at exact 21-char boundary', () => {
    const result = parse('https://reddit.com/r/abcdefghijklmnopqrstu')
    expect(result?.type).toBe('subreddit')
  })

  it('rejects subreddit at 22 chars', () => {
    expect(parse('https://reddit.com/r/abcdefghijklmnopqrstuv')).toBeNull()
  })

  it('rejects subreddit at 2 chars', () => {
    expect(parse('https://reddit.com/r/ab')).toBeNull()
  })

  it('post ID at exact 6-char boundary', () => {
    const result = parse('https://reddit.com/comments/abc123')
    expect(result?.type).toBe('post')
  })

  it('rejects post ID at 5 chars', () => {
    expect(parse('https://reddit.com/comments/abc12')).toBeNull()
  })

  it('post ID at exact 10-char boundary', () => {
    const result = parse('https://reddit.com/comments/abcdef1234')
    expect(result?.type).toBe('post')
  })

  it('rejects post ID at 11 chars', () => {
    expect(parse('https://reddit.com/comments/abcdef12345')).toBeNull()
  })

  it('handles /u/ alias for user', () => {
    const result = parse('https://reddit.com/u/testuser')
    expect(result?.type).toBe('profile')
    expect(result?.entities.username).toBe('testuser')
  })

  it('rejects username that is all hyphens', () => {
    expect(parse('https://reddit.com/user/---')).toBeNull()
  })

  it('rejects username at 2 chars', () => {
    expect(parse('https://reddit.com/user/ab')).toBeNull()
  })

  it('accepts username at 3 chars', () => {
    const result = parse('https://reddit.com/user/abc')
    expect(result?.type).toBe('profile')
  })

  it('handles comment without subreddit (3 segments with slug)', () => {
    const result = parse('https://reddit.com/comments/abc123/slug/abcdefg0')
    expect(result?.type).toBe('comment')
    expect(result?.entities.post_id).toBe('abc123')
    expect(result?.entities.comment_id).toBe('abcdefg0')
  })

  it('treats 3-segment /comments/{id}/{slug} as post not comment', () => {
    // Slug can look like a comment ID but 3-segment form is always a post
    const result = parse('https://reddit.com/comments/abc123/somethi')
    expect(result?.type).toBe('post')
    expect(result?.entities.post_id).toBe('abc123')
  })

  it('redd.it with invalid post ID', () => {
    expect(parse('https://redd.it/ab')).toBeNull() // too short
  })

  it('handles i.redd.it as matched domain but null parse', () => {
    expect(identify('https://i.redd.it/image.jpg')).toBeNull()
  })

  it('handles v.redd.it as matched domain but null parse', () => {
    expect(identify('https://v.redd.it/video123')).toBeNull()
  })
})

describe('github edge cases', () => {
  it('accepts repo with dots', () => {
    const result = parse('https://github.com/user/repo.js')
    expect(result?.type).toBe('repository')
    expect(result?.entities.repo).toBe('repo.js')
  })

  it('accepts repo with hyphens', () => {
    const result = parse('https://github.com/user/my-repo')
    expect(result?.type).toBe('repository')
  })

  it('preserves case in owner and repo', () => {
    const result = parse('https://github.com/Facebook/React')
    expect(result?.entities.owner).toBe('Facebook')
    expect(result?.entities.repo).toBe('React')
  })

  it('rejects gist with non-hex ID', () => {
    expect(parse('https://gist.github.com/xyz-not-hex')).toBeNull()
  })

  it('accepts gist with uppercase hex', () => {
    const result = parse('https://gist.github.com/ABCDEF123456')
    expect(result?.type).toBe('gist')
  })

  it('rejects reserved username as profile', () => {
    expect(parse('https://github.com/api')).toBeNull()
    expect(parse('https://github.com/login')).toBeNull()
    expect(parse('https://github.com/explore')).toBeNull()
  })

  it('rejects reserved owner in repo path', () => {
    expect(parse('https://github.com/explore/repo')).toBeNull()
  })

  it('accepts repo with known sub-path', () => {
    const result = parse('https://github.com/user/repo/issues')
    expect(result?.type).toBe('repository')
  })

  it('rejects repo with unknown sub-path', () => {
    expect(parse('https://github.com/user/repo/unknown')).toBeNull()
  })

  it('gist root returns null', () => {
    expect(parse('https://gist.github.com/')).toBeNull()
  })

  it('gist with 3+ segments returns null', () => {
    expect(parse('https://gist.github.com/user/abc123/extra')).toBeNull()
  })
})

describe('spotify edge cases', () => {
  it('rejects ID at 21 chars', () => {
    expect(parse('https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB')).toBeNull()
  })

  it('rejects ID at 23 chars', () => {
    expect(parse('https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7Px')).toBeNull()
  })

  it('handles artist resource type', () => {
    const result = parse('https://open.spotify.com/artist/7ouMYWpwJ422jRcDASZB7P')
    expect(result?.type).toBe('profile')
    expect(result?.entities.artist_id).toBe('7ouMYWpwJ422jRcDASZB7P')
  })

  it('rejects unknown resource type', () => {
    expect(parse('https://open.spotify.com/podcast/7ouMYWpwJ422jRcDASZB7P')).toBeNull()
    expect(parse('https://open.spotify.com/episode/7ouMYWpwJ422jRcDASZB7P')).toBeNull()
  })

  it('handles user profile', () => {
    const result = parse('https://open.spotify.com/user/spotify')
    expect(result?.type).toBe('profile')
    expect(result?.entities.username).toBe('spotify')
  })

  it('spotify.link root returns null', () => {
    expect(parse('https://spotify.link/')).toBeNull()
    expect(parse('https://spotify.link')).toBeNull()
  })

  it('rejects IDs with special chars', () => {
    expect(parse('https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7!')).toBeNull()
  })
})

describe('discord edge cases', () => {
  it('accepts snowflake ID at 17-char boundary', () => {
    const result = parse('https://discord.com/channels/12345678901234567/12345678901234567')
    expect(result?.type).toBe('channel')
  })

  it('accepts snowflake ID at 20-char boundary', () => {
    const result = parse('https://discord.com/channels/12345678901234567890/12345678901234567890')
    expect(result?.type).toBe('channel')
  })

  it('rejects snowflake ID at 16 chars', () => {
    expect(parse('https://discord.com/channels/1234567890123456/1234567890123456')).toBeNull()
  })

  it('rejects snowflake ID at 21 chars', () => {
    expect(parse('https://discord.com/channels/123456789012345678901/123456789012345678901')).toBeNull()
  })

  it('rejects non-numeric channel ID', () => {
    expect(parse('https://discord.com/channels/123456789012345678/abc')).toBeNull()
  })

  it('handles message with 5+ segments (ignores extra)', () => {
    // Only 3 or 4 segments after "channels" are valid
    expect(parse('https://discord.com/channels/123456789012345678/223456789012345678/323456789012345678/extra')).toBeNull()
  })

  it('accepts invite code with hyphens', () => {
    const result = parse('https://discord.gg/cool-server')
    expect(result?.type).toBe('group')
    expect(result?.entities.invite_code).toBe('cool-server')
  })

  it('rejects single-char invite code', () => {
    expect(parse('https://discord.gg/a')).toBeNull()
  })

  it('accepts invite via discord.com/invite path', () => {
    const result = parse('https://discord.com/invite/coolserver')
    expect(result?.type).toBe('group')
    expect(result?.entities.invite_code).toBe('coolserver')
  })

  it('handles discordapp.com domain', () => {
    expect(identify('https://discordapp.com/channels/123456789012345678/223456789012345678')).toBe('discord')
  })

  it('dis.gd root returns null', () => {
    expect(parse('https://dis.gd/')).toBeNull()
    expect(parse('https://dis.gd')).toBeNull()
  })

  it('discord.gg root returns null', () => {
    expect(parse('https://discord.gg/')).toBeNull()
  })
})

describe('linkedin edge cases', () => {
  it('handles /in/ with extra segments (still parses)', () => {
    const result = parse('https://linkedin.com/in/jane-doe/detail')
    expect(result?.type).toBe('profile')
    expect(result?.entities.username).toBe('jane-doe')
  })

  it('handles company with special chars', () => {
    const result = parse('https://linkedin.com/company/my-company.inc')
    expect(result?.type).toBe('profile')
    expect(result?.entities.company).toBe('my-company.inc')
  })

  it('handles /feed/update with URN in path', () => {
    const result = parse('https://linkedin.com/feed/update/urn:li:activity:1234567890')
    expect(result?.type).toBe('post')
    expect(result?.entities.post_id).toBe('urn:li:activity:1234567890')
  })

  it('handles /feed/update with URN in query param', () => {
    const result = parse('https://linkedin.com/feed/update?updateEntityUrn=urn:li:activity:123')
    expect(result?.type).toBe('post')
    expect(result?.entities.post_id).toBe('urn:li:activity:123')
  })

  it('rejects /feed/update without URN', () => {
    expect(parse('https://linkedin.com/feed/update')).toBeNull()
  })

  it('lnkd.in root returns null', () => {
    expect(parse('https://lnkd.in/')).toBeNull()
    expect(parse('https://lnkd.in')).toBeNull()
  })

  it('rejects bare /feed path', () => {
    expect(parse('https://linkedin.com/feed')).toBeNull()
  })
})

describe('bluesky edge cases', () => {
  it('handles DID format', () => {
    const result = parse('https://bsky.app/profile/did:plc:abcdef123456')
    expect(result?.type).toBe('profile')
    expect(result?.entities.handle_or_did).toBe('did:plc:abcdef123456')
  })

  it('handles post with DID handle', () => {
    const result = parse('https://bsky.app/profile/did:plc:abcdef123456/post/3kxy9abc')
    expect(result?.type).toBe('post')
    expect(result?.entities.handle_or_did).toBe('did:plc:abcdef123456')
  })

  it('rejects non-profile paths', () => {
    expect(parse('https://bsky.app/settings')).toBeNull()
    expect(parse('https://bsky.app/search')).toBeNull()
    expect(parse('https://bsky.app/')).toBeNull()
  })

  it('rejects profile with 3 segments but wrong second', () => {
    expect(parse('https://bsky.app/profile/user/followers')).toBeNull()
  })

  it('rejects empty profile handle', () => {
    expect(parse('https://bsky.app/profile/')).toBeNull()
  })

  it('rejects profile with 5+ segments', () => {
    expect(parse('https://bsky.app/profile/user/post/id/extra')).toBeNull()
  })
})

describe('threads edge cases', () => {
  it('rejects path without @ prefix', () => {
    expect(parse('https://threads.net/johndoe')).toBeNull()
  })

  it('rejects empty username after @', () => {
    expect(parse('https://threads.net/@')).toBeNull()
  })

  it('handles encoded @ in path', () => {
    const result = parse('https://threads.net/%40johndoe')
    expect(result?.platform).toBe('threads')
    expect(result?.type).toBe('profile')
  })

  it('rejects profile with 2 segments but wrong second', () => {
    expect(parse('https://threads.net/@johndoe/followers')).toBeNull()
  })

  it('rejects post with empty post ID', () => {
    // 3 segments: @user, post, "" - but filter(Boolean) removes empty
    expect(parse('https://threads.net/@johndoe/post/')).toBeNull()
  })
})

describe('facebook edge cases', () => {
  it('username at exact 5-char boundary', () => {
    const result = parse('https://facebook.com/abcde')
    expect(result?.type).toBe('profile')
  })

  it('rejects username at 4 chars', () => {
    expect(parse('https://facebook.com/abcd')).toBeNull()
  })

  it('handles reserved paths case-insensitively', () => {
    expect(parse('https://facebook.com/Marketplace')).toBeNull()
    expect(parse('https://facebook.com/GROUPS')).toBeNull()
  })

  it('handles permalink with story_fbid and page_id', () => {
    const result = parse('https://facebook.com/permalink.php?story_fbid=abc&id=page')
    expect(result?.type).toBe('post')
    expect(result?.entities.post_id).toBe('abc')
    expect(result?.entities.page_id).toBe('page')
  })

  it('rejects permalink without story_fbid', () => {
    expect(parse('https://facebook.com/permalink.php?id=page')).toBeNull()
  })

  it('handles /photo and /photo.php', () => {
    expect(parse('https://facebook.com/photo/?fbid=123')?.type).toBe('photo')
    expect(parse('https://facebook.com/photo.php?fbid=123')?.type).toBe('photo')
  })

  it('rejects /photo without fbid', () => {
    expect(parse('https://facebook.com/photo')).toBeNull()
    expect(parse('https://facebook.com/photo.php')).toBeNull()
  })

  it('handles fb.com domain', () => {
    expect(identify('https://fb.com/johndoe')).toBe('facebook')
  })

  it('handles web.facebook.com subdomain', () => {
    const result = parse('https://web.facebook.com/johndoe')
    expect(result?.platform).toBe('facebook')
  })

  it('rejects root with no path', () => {
    expect(parse('https://facebook.com/')).toBeNull()
  })
})

describe('tiktok edge cases', () => {
  it('rejects video ID at 17 digits', () => {
    expect(parse('https://tiktok.com/@user/video/12345678901234567')).toBeNull()
  })

  it('accepts video ID at 18 digits', () => {
    const result = parse('https://tiktok.com/@user/video/123456789012345678')
    expect(result?.type).toBe('video')
  })

  it('accepts video ID at 20 digits', () => {
    const result = parse('https://tiktok.com/@user/video/12345678901234567890')
    expect(result?.type).toBe('video')
  })

  it('rejects video ID at 21 digits', () => {
    expect(parse('https://tiktok.com/@user/video/123456789012345678901')).toBeNull()
  })

  it('handles /video/{id} without username', () => {
    const result = parse('https://tiktok.com/video/123456789012345678')
    expect(result?.type).toBe('video')
    expect(result?.entities.video_id).toBe('123456789012345678')
  })

  it('handles vt.tiktok.com domain', () => {
    expect(identify('https://vt.tiktok.com/ZSabc')).toBe('tiktok')
  })

  it('handles /t/{code} short link', () => {
    const result = parse('https://tiktok.com/t/ZTRabc123')
    expect(result?.type).toBe('short')
  })

  it('rejects /t/ with special chars in code', () => {
    expect(parse('https://tiktok.com/t/abc!def')).toBeNull()
  })
})

describe('cross-cutting: normalize idempotency with tracking params', () => {
  it('normalize strips tracking params', () => {
    const result = normalize('https://instagram.com/johndoe?utm_source=share&fbclid=abc')
    expect(result).toBe('https://instagram.com/johndoe')
  })

  it('normalize strips igshid from instagram', () => {
    const result = normalize('https://instagram.com/p/ABC123?igshid=abc123')
    expect(result).toBe('https://instagram.com/p/ABC123')
  })

  it('normalize preserves meaningful params', () => {
    const result = normalize('https://youtube.com/watch?v=dQw4w9WgXcQ&t=60')
    expect(result).toBe('https://youtube.com/watch?v=dQw4w9WgXcQ')
  })
})

describe('cross-cutting: identify consistency', () => {
  it('identify returns same platform as parse for all major platforms', () => {
    const urls = [
      'https://x.com/user',
      'https://instagram.com/user',
      'https://tiktok.com/@user/video/123456789012345678',
      'https://reddit.com/r/test',
      'https://github.com/user/repo',
      'https://youtube.com/watch?v=dQw4w9WgXcQ',
      'https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7P',
      'https://discord.gg/coolserver',
      'https://linkedin.com/in/user',
      'https://threads.net/@user',
      'https://bsky.app/profile/user',
      'https://t.me/channel/123',
    ]
    for (const url of urls) {
      const parsed = parse(url)
      const identified = identify(url)
      expect(identified).toBe(parsed?.platform)
    }
  })
})

describe('cross-cutting: shorten consistency with parse', () => {
  it('shorten returns non-null for every URL that parse returns non-null', () => {
    const urls = [
      'https://x.com/user/status/123',
      'https://instagram.com/p/ABC123',
      'https://youtube.com/watch?v=dQw4w9WgXcQ',
      'https://github.com/user/repo',
      'https://reddit.com/r/test',
      'https://t.co/abc123',
      'https://discord.gg/server',
      'https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7P',
    ]
    for (const url of urls) {
      expect(parse(url)).not.toBeNull()
      expect(shorten(url)).not.toBeNull()
    }
  })
})

describe('cross-cutting: double-slash paths', () => {
  it('double slashes in path are filtered as empty segments', () => {
    const result = parse('https://instagram.com//johndoe')
    expect(result?.platform).toBe('instagram')
    expect(result?.entities.username).toBe('johndoe')
  })

  it('double slashes in twitter path', () => {
    const result = parse('https://x.com//elonmusk')
    expect(result?.platform).toBe('twitter')
    expect(result?.entities.username).toBe('elonmusk')
  })

  it('double slashes in reddit path', () => {
    const result = parse('https://reddit.com//r//typescript')
    expect(result?.type).toBe('subreddit')
  })
})

describe('cross-cutting: www subdomain handling', () => {
  it.each([
    { url: 'https://www.twitter.com/user', platform: 'twitter' },
    { url: 'https://www.instagram.com/user', platform: 'instagram' },
    { url: 'https://www.tiktok.com/@user/video/123456789012345678', platform: 'tiktok' },
    { url: 'https://www.reddit.com/r/test', platform: 'reddit' },
    { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', platform: 'youtube' },
    { url: 'https://www.facebook.com/johndoe', platform: 'facebook' },
    { url: 'https://www.linkedin.com/in/user', platform: 'linkedin' },
    { url: 'https://www.pinterest.com/user', platform: 'pinterest' },
  ] as const)('handles www.$platform.com', ({ url, platform }) => {
    expect(identify(url)).toBe(platform)
  })
})

describe('cross-cutting: mobile subdomain handling', () => {
  it('m.facebook.com', () => {
    expect(identify('https://m.facebook.com/johndoe')).toBe('facebook')
  })

  it('mobile.twitter.com', () => {
    expect(identify('https://mobile.twitter.com/user')).toBe('twitter')
  })

  it('m.youtube.com', () => {
    expect(identify('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube')
  })

  it('old.reddit.com', () => {
    expect(identify('https://old.reddit.com/r/test')).toBe('reddit')
  })

  it('new.reddit.com', () => {
    expect(identify('https://new.reddit.com/r/test')).toBe('reddit')
  })
})
