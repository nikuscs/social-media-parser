import { describe, expect, it } from 'vitest'
import { bluesky } from '../src/parsers/bluesky'

function parse(urlStr: string) {
  return bluesky.parse(new URL(urlStr))
}

describe('bluesky', () => {
  describe('domains', () => {
    it('matches bsky.app', () => expect(bluesky.domains('bsky.app')).toBe(true))
    it('matches subdomains of bsky.app', () => expect(bluesky.domains('staging.bsky.app')).toBe(true))
    it('rejects unrelated domains', () => expect(bluesky.domains('example.com')).toBe(false))
  })

  describe('profile', () => {
    it('parses /profile/{handle}', () => {
      expect(parse('https://bsky.app/profile/alice.bsky.social')).toEqual({
        type: 'profile',
        entities: { handle_or_did: 'alice.bsky.social' },
        url: 'https://bsky.app/profile/alice.bsky.social',
      })
    })
  })

  describe('post', () => {
    it('parses /profile/{did}/post/{id}', () => {
      expect(parse('https://bsky.app/profile/did:plc:abc123/post/3kxy9')).toEqual({
        type: 'post',
        entities: { handle_or_did: 'did:plc:abc123', post_id: '3kxy9' },
        url: 'https://bsky.app/profile/did:plc:abc123/post/3kxy9',
      })
    })
  })

  describe('null cases', () => {
    it('returns null for non-profile paths', () => {
      expect(parse('https://bsky.app/settings')).toBeNull()
    })

    it('returns null for profile without handle/did', () => {
      expect(parse('https://bsky.app/profile')).toBeNull()
    })

    it('returns null for unknown profile sub-paths', () => {
      expect(parse('https://bsky.app/profile/alice.bsky.social/followers')).toBeNull()
    })
  })
})
