import { describe, expect, it } from 'vitest'
import { medium } from '../src/parsers/medium'

function parse(urlStr: string) {
  return medium.parse(new URL(urlStr))
}

describe('medium', () => {
  it('matches domains', () => {
    expect(medium.domains('medium.com')).toBe(true)
    expect(medium.domains('towardsdatascience.medium.com')).toBe(true)
    expect(medium.domains('notmedium.com')).toBe(false)
  })

  it('parses user profile', () => {
    expect(parse('https://medium.com/@ev')).toEqual({
      type: 'profile',
      entities: { username: 'ev' },
      url: 'https://medium.com/@ev',
    })
  })

  it('parses user post', () => {
    expect(parse('https://medium.com/@ev/example-post-abc123def456')).toEqual({
      type: 'post',
      entities: { username: 'ev', post_id: 'abc123def456' },
      url: 'https://medium.com/@ev/example-post-abc123def456',
    })
  })

  it('parses publication profile', () => {
    expect(parse('https://medium.com/airbnb-engineering')).toEqual({
      type: 'profile',
      entities: { publication: 'airbnb-engineering' },
      url: 'https://medium.com/airbnb-engineering',
    })
  })

  it('parses publication post', () => {
    expect(parse('https://medium.com/airbnb-engineering/example-post-abc123def456')).toEqual({
      type: 'post',
      entities: { publication: 'airbnb-engineering', post_id: 'abc123def456' },
      url: 'https://medium.com/airbnb-engineering/example-post-abc123def456',
    })
  })

  it('returns null for invalid/reserved paths', () => {
    expect(parse('https://medium.com/')).toBeNull()
    expect(parse('https://medium.com/@')).toBeNull()
    expect(parse('https://medium.com/topics')).toBeNull()
    expect(parse('https://medium.com/@ev/post-without-id')).toBeNull()
    expect(parse('https://medium.com/@/post-abc123def456')).toBeNull()
    expect(parse('https://medium.com/some-publication/postwithoutdash')).toBeNull()
    expect(parse('https://medium.com/some-publication/post-nothexid')).toBeNull()
  })
})
