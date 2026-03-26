import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'issues', 'pulls', 'projects', 'actions', 'settings', 'pulse', 'graphs',
  'network', 'forks', 'stars', 'watchers', 'wiki', 'security', 'insights',
  'codespaces', 'packages', 'new', 'import', 'topics', 'collections', 'events',
  'marketplace', 'explore', 'sponsors', 'orgs', 'organizations', 'users', 'about',
  'contact', 'pricing', 'site', 'styleguide', 'enterprise', 'features', 'login',
  'logout', 'join', 'session', 'sessions', 'signup', 'dashboard', 'notifications',
  'account', 'gist', 'trending', 'search', 'assets', 'images', 'static', 'api', 'raw',
])

const REPO_SUB_PATHS = new Set([
  'issues', 'pulls', 'actions', 'projects', 'wiki', 'security', 'insights',
  'settings', 'releases', 'tags', 'branches', 'commits', 'graphs', 'network',
  'forks', 'stars', 'watchers', 'pulse',
])

const GIST_ID_RE = /^[0-9a-fA-F]+$/

export const github: SocialLinksPlatformParser = {
  platform: 'github',

  domains(hostname) {
    return hostname === 'github.com' || hostname.endsWith('.github.com')
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // Gist: gist.github.com/[{user}/]{hex_id}
    if (url.hostname === 'gist.github.com') {
      if (segments.length === 1 && GIST_ID_RE.test(segments[0])) {
        return {
          type: 'gist',
          entities: { gist_id: segments[0] },
          url: `https://gist.github.com/${segments[0]}`,
        }
      }
      if (segments.length === 2 && GIST_ID_RE.test(segments[1])) {
        return {
          type: 'gist',
          entities: { username: segments[0], gist_id: segments[1] },
          url: `https://gist.github.com/${segments[1]}`,
        }
      }
      return null
    }

    // Repository: /{owner}/{repo}
    if (segments.length >= 2) {
      const owner = segments[0]
      const repo = segments[1]

      // Skip if owner is reserved (unless it's orgs/ or sponsors/)
      if (RESERVED.has(owner.toLowerCase())) {
        return null
      }

      // If there's a third segment, it must be a known repo sub-path
      if (segments.length >= 3 && !REPO_SUB_PATHS.has(segments[2])) {
        return null
      }

      return {
        type: 'repository',
        entities: { owner, repo },
        url: `https://github.com/${owner}/${repo}`,
      }
    }

    // Profile: /{username}
    if (segments.length === 1) {
      const username = segments[0]
      if (!RESERVED.has(username.toLowerCase())) {
        return {
          type: 'profile',
          entities: { username },
          url: `https://github.com/${username}`,
        }
      }
    }

    return null
  },
}
