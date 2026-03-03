import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

describe('forced-network with lax username patterns', () => {
  const laxPlatforms = [
    'soundcloud',
    'mixcloud',
    'kofi',
    'patreon',
    'radiojavan',
    'vkontakte',
  ] as const

  it.each(laxPlatforms)('rejects malformed scheme input for %s (http:)', (platform) => {
    // Inputs like "http:someuser" must not be treated as usernames
    expect(parse('http:someuser', { network: platform })).toBeNull()
  })

  it.each(laxPlatforms)('rejects malformed scheme input for %s (https:)', (platform) => {
    expect(parse('https:someuser', { network: platform })).toBeNull()
  })

  it.each(laxPlatforms)('still accepts plain usernames for %s', (platform) => {
    expect(parse('someuser', { network: platform })?.type).toBe('profile')
  })
})

