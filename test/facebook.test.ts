import { describe, expect, it } from 'vitest'
import { facebook } from '../src/parsers/facebook'

function parse(urlStr: string) {
  return facebook.parse(new URL(urlStr))
}

describe('facebook', () => {
  describe('domains', () => {
    it('matches facebook.com', () => expect(facebook.domains('facebook.com')).toBe(true))
    it('matches www.facebook.com', () => expect(facebook.domains('www.facebook.com')).toBe(true))
    it('matches m.facebook.com', () => expect(facebook.domains('m.facebook.com')).toBe(true))
    it('matches web.facebook.com', () => expect(facebook.domains('web.facebook.com')).toBe(true))
    it('matches fb.com', () => expect(facebook.domains('fb.com')).toBe(true))
    it('matches fb.watch', () => expect(facebook.domains('fb.watch')).toBe(true))
    it('matches fb.me', () => expect(facebook.domains('fb.me')).toBe(true))
    it('matches m.me', () => expect(facebook.domains('m.me')).toBe(true))
    it('rejects unrelated domains', () => expect(facebook.domains('notfacebook.com')).toBe(false))
    it('rejects partial match', () => expect(facebook.domains('fakefb.com')).toBe(false))
  })

  describe('video', () => {
    it('parses fb.watch/{id}', () => {
      expect(parse('https://fb.watch/abc123')).toEqual({
        type: 'video',
        entities: { video_id: 'abc123' },
        url: 'https://facebook.com/watch/?v=abc123',
      })
    })

    it('parses /watch/?v={id}', () => {
      expect(parse('https://facebook.com/watch/?v=123456789')).toEqual({
        type: 'video',
        entities: { video_id: '123456789' },
        url: 'https://facebook.com/watch/?v=123456789',
      })
    })

    it('parses /video.php?v={id}', () => {
      expect(parse('https://facebook.com/video.php?v=123456789')).toEqual({
        type: 'video',
        entities: { video_id: '123456789' },
        url: 'https://facebook.com/video.php?v=123456789',
      })
    })

    it('parses /reel/{id}', () => {
      expect(parse('https://facebook.com/reel/123456789')).toEqual({
        type: 'video',
        entities: { video_id: '123456789' },
        url: 'https://facebook.com/reel/123456789',
      })
    })

    it('parses /{user}/videos/{id}', () => {
      expect(parse('https://facebook.com/johndoe/videos/123456')).toEqual({
        type: 'video',
        entities: { username: 'johndoe', video_id: '123456' },
        url: 'https://facebook.com/johndoe/videos/123456',
      })
    })

    it('returns null for /watch without v param', () => {
      expect(parse('https://facebook.com/watch')).toBeNull()
    })
  })

  describe('post', () => {
    it('parses /{user}/posts/{post_id}', () => {
      expect(parse('https://facebook.com/johndoe/posts/123456789')).toEqual({
        type: 'post',
        entities: { username: 'johndoe', post_id: '123456789' },
        url: 'https://facebook.com/johndoe/posts/123456789',
      })
    })

    it('parses /permalink.php?story_fbid={id}&id={page_id}', () => {
      expect(parse('https://facebook.com/permalink.php?story_fbid=abc123&id=page456')).toEqual({
        type: 'post',
        entities: { post_id: 'abc123', page_id: 'page456' },
        url: 'https://facebook.com/permalink.php?story_fbid=abc123',
      })
    })

    it('parses /permalink.php?story_fbid={id} without page id', () => {
      expect(parse('https://facebook.com/permalink.php?story_fbid=abc123')).toEqual({
        type: 'post',
        entities: { post_id: 'abc123' },
        url: 'https://facebook.com/permalink.php?story_fbid=abc123',
      })
    })

    it('returns null for /permalink.php without story_fbid', () => {
      expect(parse('https://facebook.com/permalink.php?id=123')).toBeNull()
    })
  })

  describe('photo', () => {
    it('parses /photo/?fbid={id}', () => {
      expect(parse('https://facebook.com/photo/?fbid=123456')).toEqual({
        type: 'photo',
        entities: { photo_id: '123456' },
        url: 'https://facebook.com/photo/?fbid=123456',
      })
    })

    it('parses /photo.php?fbid={id}', () => {
      expect(parse('https://facebook.com/photo.php?fbid=789')).toEqual({
        type: 'photo',
        entities: { photo_id: '789' },
        url: 'https://facebook.com/photo/?fbid=789',
      })
    })

    it('parses /{user}/photos/{id}', () => {
      expect(parse('https://facebook.com/johndoe/photos/123456')).toEqual({
        type: 'photo',
        entities: { username: 'johndoe', photo_id: '123456' },
        url: 'https://facebook.com/johndoe/photos/123456',
      })
    })

    it('returns null for /photo without fbid', () => {
      expect(parse('https://facebook.com/photo')).toBeNull()
    })

    it('returns null for /photo.php without fbid', () => {
      expect(parse('https://facebook.com/photo.php')).toBeNull()
    })
  })

  describe('profile', () => {
    it('parses /{username}', () => {
      expect(parse('https://facebook.com/johndoe')).toEqual({
        type: 'profile',
        entities: { username: 'johndoe' },
        url: 'https://facebook.com/johndoe',
      })
    })

    it('parses /profile.php?id={numeric_id}', () => {
      expect(parse('https://facebook.com/profile.php?id=100000123456789')).toEqual({
        type: 'profile',
        entities: { user_id: '100000123456789' },
        url: 'https://facebook.com/profile.php?id=100000123456789',
      })
    })

    it('allows dots in username', () => {
      const result = parse('https://facebook.com/john.doe')
      expect(result).not.toBeNull()
      expect(result!.entities.username).toBe('john.doe')
    })

    it('rejects usernames shorter than 5 chars', () => {
      expect(parse('https://facebook.com/abcd')).toBeNull()
    })

    it('rejects /profile.php with non-numeric id', () => {
      expect(parse('https://facebook.com/profile.php?id=abc')).toBeNull()
    })

    it('rejects /profile.php without id', () => {
      expect(parse('https://facebook.com/profile.php')).toBeNull()
    })

    it('rejects reserved paths', () => {
      expect(parse('https://facebook.com/marketplace')).toBeNull()
      expect(parse('https://facebook.com/settings')).toBeNull()
      expect(parse('https://facebook.com/watch')).toBeNull()
      expect(parse('https://facebook.com/groups')).toBeNull()
      expect(parse('https://facebook.com/events')).toBeNull()
      expect(parse('https://facebook.com/login')).toBeNull()
      expect(parse('https://facebook.com/video.php')).toBeNull()
    })
  })

  describe('group', () => {
    it('parses /groups/{name_or_id}', () => {
      expect(parse('https://facebook.com/groups/typescript.developers')).toEqual({
        type: 'group',
        entities: { group_id: 'typescript.developers' },
        url: 'https://facebook.com/groups/typescript.developers',
      })
    })
  })

  describe('event', () => {
    it('parses /events/{id}', () => {
      expect(parse('https://facebook.com/events/123456789')).toEqual({
        type: 'event',
        entities: { event_id: '123456789' },
        url: 'https://facebook.com/events/123456789',
      })
    })
  })

  describe('short links', () => {
    it('parses fb.me/{code} as short link', () => {
      expect(parse('https://fb.me/abc123xyz')).toEqual({
        type: 'short',
        entities: {},
        url: 'https://fb.me/abc123xyz',
      })
    })

    it('parses fb.me with nested path as short link', () => {
      expect(parse('https://fb.me/story/abc123')).toEqual({
        type: 'short',
        entities: {},
        url: 'https://fb.me/story/abc123',
      })
    })

    it('returns null for fb.me root with no path', () => {
      expect(parse('https://fb.me/')).toBeNull()
    })

    it('parses m.me/{username} as short link', () => {
      expect(parse('https://m.me/johndoe')).toEqual({
        type: 'short',
        entities: {},
        url: 'https://m.me/johndoe',
      })
    })

    it('returns null for m.me root with no path', () => {
      expect(parse('https://m.me/')).toBeNull()
    })
  })

  describe('null cases', () => {
    it('returns null for root path', () => {
      expect(parse('https://facebook.com/')).toBeNull()
    })

    it('returns null for unrecognized multi-segment paths', () => {
      expect(parse('https://facebook.com/user/something/else/extra')).toBeNull()
    })

    it('returns null for fb.watch with extra segments', () => {
      expect(parse('https://fb.watch/abc/def')).toBeNull()
    })

    it('does not misidentify a post as a profile', () => {
      const result = parse('https://facebook.com/johndoe/posts/123456')
      expect(result!.type).toBe('post')
    })
  })
})
