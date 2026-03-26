import { describe, expect, it } from 'vitest'
import { reddit } from '../src/parsers/reddit'

function parse(urlStr: string) {
  return reddit.parse(new URL(urlStr))
}

describe('reddit', () => {
  describe('domains', () => {
    it('matches reddit.com', () => expect(reddit.domains('reddit.com')).toBe(true))
    it('matches old.reddit.com', () => expect(reddit.domains('old.reddit.com')).toBe(true))
    it('matches www.reddit.com', () => expect(reddit.domains('www.reddit.com')).toBe(true))
    it('matches i.redd.it', () => expect(reddit.domains('i.redd.it')).toBe(true))
    it('matches v.redd.it', () => expect(reddit.domains('v.redd.it')).toBe(true))
    it('matches redd.it short domain', () => expect(reddit.domains('redd.it')).toBe(true))
    it('rejects unrelated domains', () => expect(reddit.domains('notreddit.com')).toBe(false))
  })

  describe('comment', () => {
    it('parses /r/{sub}/comments/{post_id}/{slug}/{comment_id}', () => {
      expect(parse('https://reddit.com/r/typescript/comments/abc12345/my_post/abcdefg0')).toEqual({
        type: 'comment',
        entities: {
          subreddit: 'typescript',
          post_id: 'abc12345',
          comment_id: 'abcdefg0',
        },
        url: 'https://reddit.com/r/typescript/comments/abc12345/_/abcdefg0',
      })
    })

    it('rejects comment IDs shorter than 7 chars', () => {
      const result = parse('https://reddit.com/r/test/comments/abc12345/slug/abcdef')
      // This has 6-char comment ID, won't match comment pattern, will fall through to post
      expect(result?.type).toBe('post')
    })
  })

  describe('post', () => {
    it('parses redd.it/{id}', () => {
      expect(parse('https://redd.it/abc12345')).toEqual({
        type: 'post',
        entities: { post_id: 'abc12345' },
        url: 'https://reddit.com/comments/abc12345',
      })
    })

    it('parses /comments/{id}', () => {
      expect(parse('https://reddit.com/comments/abc12345')).toEqual({
        type: 'post',
        entities: { post_id: 'abc12345' },
        url: 'https://reddit.com/comments/abc12345',
      })
    })

    it('parses /comments/{id}/{slug}', () => {
      expect(parse('https://reddit.com/comments/abc12345/my_post')).toEqual({
        type: 'post',
        entities: { post_id: 'abc12345' },
        url: 'https://reddit.com/comments/abc12345',
      })
    })

    it('parses /comments/{id}/{slug}/{comment_id}', () => {
      expect(parse('https://reddit.com/comments/abc12345/my_post/abcdefg0')).toEqual({
        type: 'comment',
        entities: { post_id: 'abc12345', comment_id: 'abcdefg0' },
        url: 'https://reddit.com/comments/abc12345/_/abcdefg0',
      })
    })

    it('parses /comments/{id}/{slug} as post not comment', () => {
      // 3-segment form is always post+slug, never comment
      expect(parse('https://reddit.com/comments/abc12345/abcdefg0')).toEqual({
        type: 'post',
        entities: { post_id: 'abc12345' },
        url: 'https://reddit.com/comments/abc12345',
      })
    })

    it('parses /r/{sub}/comments/{id}', () => {
      expect(parse('https://reddit.com/r/typescript/comments/abc12345')).toEqual({
        type: 'post',
        entities: { subreddit: 'typescript', post_id: 'abc12345' },
        url: 'https://reddit.com/r/typescript/comments/abc12345',
      })
    })

    it('parses /r/{sub}/comments/{id}/{slug}', () => {
      expect(parse('https://reddit.com/r/typescript/comments/abc12345/my_post')).toEqual({
        type: 'post',
        entities: { subreddit: 'typescript', post_id: 'abc12345' },
        url: 'https://reddit.com/r/typescript/comments/abc12345',
      })
    })

    it('rejects post IDs shorter than 6 chars', () => {
      expect(parse('https://reddit.com/r/test/comments/abc12')).toBeNull()
    })

    it('rejects post IDs longer than 10 chars', () => {
      expect(parse('https://reddit.com/r/test/comments/abc12345678')).toBeNull()
    })

    it('rejects subreddits shorter than 3 chars', () => {
      expect(parse('https://reddit.com/r/ab/comments/abc123')).toBeNull()
    })

    it('rejects subreddits longer than 21 chars', () => {
      expect(parse('https://reddit.com/r/abcdefghijklmnopqrstuv/comments/abc123')).toBeNull()
    })
  })

  describe('profile', () => {
    it('parses /user/{name}', () => {
      expect(parse('https://reddit.com/user/johndoe')).toEqual({
        type: 'profile',
        entities: { username: 'johndoe' },
        url: 'https://reddit.com/user/johndoe',
      })
    })

    it('parses /u/{name}', () => {
      expect(parse('https://reddit.com/u/johndoe')).toEqual({
        type: 'profile',
        entities: { username: 'johndoe' },
        url: 'https://reddit.com/user/johndoe',
      })
    })

    it('allows hyphens in username', () => {
      const result = parse('https://reddit.com/user/john-doe')
      expect(result).not.toBeNull()
      expect(result!.entities.username).toBe('john-doe')
    })

    it('rejects all-dash usernames', () => {
      expect(parse('https://reddit.com/user/---')).toBeNull()
    })

    it('rejects usernames shorter than 3 chars', () => {
      expect(parse('https://reddit.com/user/ab')).toBeNull()
    })

    it('rejects usernames longer than 20 chars', () => {
      expect(parse('https://reddit.com/user/abcdefghijklmnopqrstu')).toBeNull()
    })
  })

  describe('subreddit', () => {
    it('parses /r/{name}', () => {
      expect(parse('https://reddit.com/r/typescript')).toEqual({
        type: 'subreddit',
        entities: { subreddit: 'typescript' },
        url: 'https://reddit.com/r/typescript',
      })
    })

    it('rejects /r alone', () => {
      expect(parse('https://reddit.com/r')).toBeNull()
    })

    it('rejects subreddit names with invalid chars', () => {
      expect(parse('https://reddit.com/r/type-script')).toBeNull()
    })
  })

  describe('null cases', () => {
    it('returns null for root path', () => {
      expect(parse('https://reddit.com/')).toBeNull()
    })

    it('returns null for unrecognized paths', () => {
      expect(parse('https://reddit.com/random/path')).toBeNull()
    })

    it('returns null for /user with extra segments', () => {
      expect(parse('https://reddit.com/user/john/posts')).toBeNull()
    })
  })
})
