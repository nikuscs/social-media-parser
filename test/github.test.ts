import { describe, expect, it } from 'vitest'
import { github } from '../src/parsers/github'

function parse(urlStr: string) {
  return github.parse(new URL(urlStr))
}

describe('github', () => {
  describe('domains', () => {
    it('matches github.com', () => expect(github.domains('github.com')).toBe(true))
    it('matches gist.github.com', () => expect(github.domains('gist.github.com')).toBe(true))
    it('rejects subdomains', () => expect(github.domains('www.github.com')).toBe(false))
    it('rejects unrelated domains', () => expect(github.domains('notgithub.com')).toBe(false))
  })

  describe('gist', () => {
    it('parses gist.github.com/{hex_id}', () => {
      expect(parse('https://gist.github.com/abc123def')).toEqual({
        type: 'gist',
        entities: { gist_id: 'abc123def' },
        url: 'https://gist.github.com/abc123def',
      })
    })

    it('parses gist.github.com/{user}/{hex_id}', () => {
      expect(parse('https://gist.github.com/johndoe/abc123def')).toEqual({
        type: 'gist',
        entities: { gist_id: 'abc123def', username: 'johndoe' },
        url: 'https://gist.github.com/abc123def',
      })
    })

    it('rejects non-hex gist IDs', () => {
      expect(parse('https://gist.github.com/xyz-not-hex')).toBeNull()
    })

    it('rejects non-hex second segment', () => {
      expect(parse('https://gist.github.com/user/xyz-not-hex')).toBeNull()
    })

    it('returns null for gist root', () => {
      expect(parse('https://gist.github.com/')).toBeNull()
    })

    it('returns null for gist with too many segments', () => {
      expect(parse('https://gist.github.com/user/abc123/extra')).toBeNull()
    })
  })

  describe('repository', () => {
    it('parses /{owner}/{repo}', () => {
      expect(parse('https://github.com/facebook/react')).toEqual({
        type: 'repository',
        entities: { owner: 'facebook', repo: 'react' },
        url: 'https://github.com/facebook/react',
      })
    })

    it('allows repo sub-paths like /issues', () => {
      expect(parse('https://github.com/facebook/react/issues')).toEqual({
        type: 'repository',
        entities: { owner: 'facebook', repo: 'react' },
        url: 'https://github.com/facebook/react',
      })
    })

    it('rejects unknown third segment', () => {
      expect(parse('https://github.com/facebook/react/unknown-path')).toBeNull()
    })

    it('rejects reserved owner paths', () => {
      expect(parse('https://github.com/explore/something')).toBeNull()
      expect(parse('https://github.com/settings/tokens')).toBeNull()
      expect(parse('https://github.com/login/oauth')).toBeNull()
    })
  })

  describe('profile', () => {
    it('parses /{username}', () => {
      expect(parse('https://github.com/torvalds')).toEqual({
        type: 'profile',
        entities: { username: 'torvalds' },
        url: 'https://github.com/torvalds',
      })
    })

    it('rejects reserved paths as profiles', () => {
      expect(parse('https://github.com/explore')).toBeNull()
      expect(parse('https://github.com/settings')).toBeNull()
      expect(parse('https://github.com/login')).toBeNull()
      expect(parse('https://github.com/trending')).toBeNull()
      expect(parse('https://github.com/search')).toBeNull()
    })
  })

  describe('null cases', () => {
    it('returns null for root path', () => {
      expect(parse('https://github.com/')).toBeNull()
    })
  })
})
