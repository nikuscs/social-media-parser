import { describe, expect, it } from 'vitest'
import { vkontakte } from '../src/parsers/vkontakte'

function parse(urlStr: string) {
  return vkontakte.parse(new URL(urlStr))
}

describe('vkontakte', () => {
  it('matches domains', () => {
    expect(vkontakte.domains('vk.com')).toBe(true)
    expect(vkontakte.domains('m.vk.com')).toBe(true)
    expect(vkontakte.domains('notvk.com')).toBe(false)
  })

  it('parses wall post URLs', () => {
    expect(parse('https://vk.com/wall-12345_67890')).toEqual({
      type: 'post',
      entities: { owner_id: '-12345', post_id: '67890' },
      url: 'https://vk.com/wall-12345_67890',
    })
  })

  it('parses profile URLs', () => {
    expect(parse('https://vk.com/durov')).toEqual({
      type: 'profile',
      entities: { username: 'durov' },
      url: 'https://vk.com/durov',
    })
  })

  it('accepts username with dots and underscores', () => {
    expect(parse('https://vk.com/user.name')?.entities.username).toBe('user.name')
    expect(parse('https://vk.com/user_name')?.entities.username).toBe('user_name')
  })

  it('rejects usernames with special characters', () => {
    expect(parse('https://vk.com/!!!invalid!!!')).toBeNull()
    expect(parse('https://vk.com/user name')).toBeNull()
    expect(parse('https://vk.com/user@name')).toBeNull()
  })

  it('rejects usernames starting with number', () => {
    expect(parse('https://vk.com/123user')).toBeNull()
  })

  it('rejects usernames shorter than 3 chars', () => {
    expect(parse('https://vk.com/ab')).toBeNull()
  })

  it('returns null for reserved or empty paths', () => {
    expect(parse('https://vk.com/')).toBeNull()
    expect(parse('https://vk.com/feed')).toBeNull()
    expect(parse('https://vk.com/durov/photos')).toBeNull()
  })
})
