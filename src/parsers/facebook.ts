import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'marketplace', 'gaming', 'watch', 'groups', 'events', 'pages', 'settings',
  'help', 'login', 'recover', 'signup', 'policies', 'privacy', 'terms',
  'ads', 'business', 'creators', 'developers', 'careers', 'about',
  'fundraisers', 'saved', 'bookmarks', 'notifications', 'messages',
  'friends', 'memories', 'stories', 'reels', 'feeds', 'search',
  'hashtag', 'share', 'sharer', 'dialog', 'connect', 'community',
  'marketplace', 'places', 'offers', 'live', 'directory', 'local',
  'biz', 'lite', 'flx', 'legal', 'r.php', 'photo', 'video', 'video.php',
  'permalink.php', 'profile.php', 'photo.php', 'sharer.php', 'story.php',
])

const USERNAME_RE = /^[a-zA-Z0-9.]{5,50}$/

export const facebook: SocialLinksPlatformParser = {
  platform: 'facebook',

  domains(hostname) {
    return (
      hostname === 'facebook.com' ||
      hostname.endsWith('.facebook.com') ||
      hostname === 'fb.com' ||
      hostname === 'fb.watch'
    )
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)
    const hostname = url.hostname

    // fb.watch/{id} → video
    if (hostname === 'fb.watch' && segments.length === 1) {
      return {
        type: 'video',
        entities: { video_id: segments[0] },
        url: `https://facebook.com/watch/?v=${segments[0]}`,
      }
    }

    // /profile.php?id={numeric_id}
    if (segments.length === 1 && segments[0] === 'profile.php') {
      const id = url.searchParams.get('id')
      if (id && /^\d+$/.test(id)) {
        return {
          type: 'profile',
          entities: { user_id: id },
          url: `https://facebook.com/profile.php?id=${id}`,
        }
      }
    }

    // /permalink.php?story_fbid={id}&id={page_id}
    if (segments.length === 1 && segments[0] === 'permalink.php') {
      const storyId = url.searchParams.get('story_fbid')
      const pageId = url.searchParams.get('id')
      if (storyId) {
        const entities: Record<string, string> = { post_id: storyId }
        if (pageId) entities.page_id = pageId
        return {
          type: 'post',
          entities,
          url: `https://facebook.com/permalink.php?story_fbid=${storyId}`,
        }
      }
    }

    // /photo/?fbid={id} or /photo.php?fbid={id}
    if (
      segments.length === 1 &&
      (segments[0] === 'photo' || segments[0] === 'photo.php')
    ) {
      const fbid = url.searchParams.get('fbid')
      if (fbid) {
        return {
          type: 'photo',
          entities: { photo_id: fbid },
          url: `https://facebook.com/photo/?fbid=${fbid}`,
        }
      }
    }

    // /watch/?v={id}
    if (segments.length === 1 && segments[0] === 'watch') {
      const v = url.searchParams.get('v')
      if (v) {
        return {
          type: 'video',
          entities: { video_id: v },
          url: `https://facebook.com/watch/?v=${v}`,
        }
      }
    }

    // /video.php?v={id}
    if (segments.length === 1 && segments[0] === 'video.php') {
      const v = url.searchParams.get('v')
      if (v) {
        return {
          type: 'video',
          entities: { video_id: v },
          url: `https://facebook.com/video.php?v=${v}`,
        }
      }
    }

    // /reel/{id}
    if (segments.length === 2 && segments[0] === 'reel') {
      return {
        type: 'video',
        entities: { video_id: segments[1] },
        url: `https://facebook.com/reel/${segments[1]}`,
      }
    }

    // /groups/{name_or_id}
    if (segments.length === 2 && segments[0] === 'groups') {
      return {
        type: 'group',
        entities: { group_id: segments[1] },
        url: `https://facebook.com/groups/${segments[1]}`,
      }
    }

    // /events/{id}
    if (segments.length === 2 && segments[0] === 'events') {
      return {
        type: 'event',
        entities: { event_id: segments[1] },
        url: `https://facebook.com/events/${segments[1]}`,
      }
    }

    // /{user}/posts/{post_id}
    if (segments.length === 3 && segments[1] === 'posts') {
      return {
        type: 'post',
        entities: { post_id: segments[2], username: segments[0] },
        url: `https://facebook.com/${segments[0]}/posts/${segments[2]}`,
      }
    }

    // /{user}/videos/{video_id}
    if (segments.length === 3 && segments[1] === 'videos') {
      return {
        type: 'video',
        entities: { video_id: segments[2], username: segments[0] },
        url: `https://facebook.com/${segments[0]}/videos/${segments[2]}`,
      }
    }

    // /{user}/photos/{photo_id}
    if (segments.length === 3 && segments[1] === 'photos') {
      return {
        type: 'photo',
        entities: { photo_id: segments[2], username: segments[0] },
        url: `https://facebook.com/${segments[0]}/photos/${segments[2]}`,
      }
    }

    // Profile: /{username}
    if (segments.length === 1) {
      const username = segments[0]
      if (!RESERVED.has(username.toLowerCase()) && USERNAME_RE.test(username)) {
        return {
          type: 'profile',
          entities: { username },
          url: `https://facebook.com/${username}`,
        }
      }
    }

    return null
  },
}
