import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const SUBREDDIT_RE = /^[a-zA-Z0-9_]{3,21}$/
const POST_ID_RE = /^[a-zA-Z0-9]{6,10}$/
const COMMENT_ID_RE = /^[a-zA-Z0-9]{7,10}$/
const USERNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/

export const reddit: SocialLinksPlatformParser = {
  platform: 'reddit',

  domains(hostname) {
    return (
      hostname === 'reddit.com' ||
      hostname.endsWith('.reddit.com') ||
      hostname === 'redd.it' ||
      hostname === 'i.redd.it' ||
      hostname === 'v.redd.it'
    )
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)
    const hostname = url.hostname

    // Short post: redd.it/{post_id}
    if (hostname === 'redd.it' && segments.length === 1 && POST_ID_RE.test(segments[0])) {
      return {
        type: 'post',
        entities: { post_id: segments[0] },
        url: `https://reddit.com/comments/${segments[0]}`,
      }
    }

    // Comment: /r/{sub}/comments/{post_id}/{slug}/{comment_id}
    if (
      segments.length >= 6 &&
      segments[0] === 'r' &&
      SUBREDDIT_RE.test(segments[1]) &&
      segments[2] === 'comments' &&
      POST_ID_RE.test(segments[3]) &&
      COMMENT_ID_RE.test(segments[5])
    ) {
      return {
        type: 'comment',
        entities: {
          subreddit: segments[1],
          post_id: segments[3],
          comment_id: segments[5],
        },
        url: `https://reddit.com/r/${segments[1]}/comments/${segments[3]}/_/${segments[5]}`,
      }
    }

    // Post: /r/{sub}/comments/{id}[/{slug}]
    if (
      segments.length >= 4 &&
      segments[0] === 'r' &&
      SUBREDDIT_RE.test(segments[1]) &&
      segments[2] === 'comments' &&
      POST_ID_RE.test(segments[3])
    ) {
      return {
        type: 'post',
        entities: { subreddit: segments[1], post_id: segments[3] },
        url: `https://reddit.com/r/${segments[1]}/comments/${segments[3]}`,
      }
    }

    // Post/comment without subreddit: /comments/{id}[/slug][/comment_id]
    if (segments.length >= 2 && segments[0] === 'comments' && POST_ID_RE.test(segments[1])) {
      if (segments.length >= 4 && COMMENT_ID_RE.test(segments[3])) {
        return {
          type: 'comment',
          entities: { post_id: segments[1], comment_id: segments[3] },
          url: `https://reddit.com/comments/${segments[1]}/_/${segments[3]}`,
        }
      }
      if (segments.length === 3 && COMMENT_ID_RE.test(segments[2])) {
        return {
          type: 'comment',
          entities: { post_id: segments[1], comment_id: segments[2] },
          url: `https://reddit.com/comments/${segments[1]}/_/${segments[2]}`,
        }
      }
      return {
        type: 'post',
        entities: { post_id: segments[1] },
        url: `https://reddit.com/comments/${segments[1]}`,
      }
    }

    // Profile: /(user|u)/{name}
    if (
      segments.length === 2 &&
      (segments[0] === 'user' || segments[0] === 'u') &&
      USERNAME_RE.test(segments[1]) &&
      !/^-+$/.test(segments[1])
    ) {
      return {
        type: 'profile',
        entities: { username: segments[1] },
        url: `https://reddit.com/user/${segments[1]}`,
      }
    }

    // Subreddit: /r/{name}
    if (segments.length === 1 && segments[0] === 'r') return null
    if (
      segments.length === 2 &&
      segments[0] === 'r' &&
      SUBREDDIT_RE.test(segments[1])
    ) {
      return {
        type: 'subreddit',
        entities: { subreddit: segments[1] },
        url: `https://reddit.com/r/${segments[1]}`,
      }
    }

    return null
  },
}
