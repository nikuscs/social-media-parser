import { describe, expect, it } from 'vitest'
import { shorten } from '../src/index'

describe('shorten', () => {
  describe('parsed URLs with entities', () => {
    it('shortens Instagram post to post_id', () => {
      expect(shorten('https://instagram.com/p/ABC123')).toBe('ABC123')
    })

    it('shortens Instagram profile to username', () => {
      expect(shorten('https://www.instagram.com/johndoe/')).toBe('johndoe')
    })

    it('shortens Instagram post with username prefix', () => {
      expect(shorten('https://instagram.com/johndoe/p/ABC123')).toBe('johndoe/ABC123')
    })

    it('shortens Twitter post to username/post_id', () => {
      expect(shorten('https://twitter.com/elonmusk/status/1234567890')).toBe('elonmusk/1234567890')
    })

    it('shortens Twitter post without username to post_id', () => {
      expect(shorten('https://x.com/i/status/1234567890')).toBe('1234567890')
    })

    it('shortens Twitter profile to username', () => {
      expect(shorten('https://x.com/elonmusk')).toBe('elonmusk')
    })

    it('shortens YouTube video to video_id', () => {
      expect(shorten('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    })

    it('shortens YouTube short link to video_id', () => {
      expect(shorten('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    })

    it('shortens GitHub repo to owner/repo', () => {
      expect(shorten('https://github.com/facebook/react')).toBe('facebook/react')
    })

    it('shortens GitHub profile to username', () => {
      expect(shorten('https://github.com/torvalds')).toBe('torvalds')
    })

    it('shortens GitHub gist with user to username/gist_id', () => {
      expect(shorten('https://gist.github.com/johndoe/abc123def')).toBe('johndoe/abc123def')
    })

    it('shortens Discord message to guild_id/channel_id/message_id', () => {
      expect(shorten('https://discord.com/channels/123456789012345678/223456789012345678/323456789012345678')).toBe('123456789012345678/223456789012345678/323456789012345678')
    })

    it('shortens Discord channel to guild_id/channel_id', () => {
      expect(shorten('https://discord.com/channels/123456789012345678/223456789012345678')).toBe('123456789012345678/223456789012345678')
    })

    it('shortens Telegram channel post to channel/post_id', () => {
      expect(shorten('https://t.me/openai/123')).toBe('openai/123')
    })

    it('shortens Spotify track to track_id', () => {
      expect(shorten('https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7P')).toBe('7ouMYWpwJ422jRcDASZB7P')
    })

    it('shortens Reddit subreddit', () => {
      expect(shorten('https://reddit.com/r/typescript')).toBe('typescript')
    })

    it('shortens Bluesky post to handle/post_id', () => {
      expect(shorten('https://bsky.app/profile/alice.bsky.social/post/3kxy9')).toBe('alice.bsky.social/3kxy9')
    })

    it('shortens Threads post to username/post_id', () => {
      expect(shorten('https://threads.net/@johndoe/post/abc123')).toBe('johndoe/abc123')
    })

    it('shortens Pinterest board to username/board', () => {
      expect(shorten('https://pinterest.com/johndoe/home-decor')).toBe('johndoe/home-decor')
    })

    it('shortens SoundCloud track to username/track', () => {
      expect(shorten('https://soundcloud.com/porter-robinson/language')).toBe('porter-robinson/language')
    })

    it('shortens Facebook post to username/post_id', () => {
      expect(shorten('https://facebook.com/johndoe/posts/123456789')).toBe('johndoe/123456789')
    })

    it('shortens Mastodon post to username/post_id', () => {
      expect(shorten('https://mastodon.social/@gargron/112233445566778899')).toBe('gargron/112233445566778899')
    })
  })

  describe('short links with empty entities', () => {
    it('shortens t.co short link to path', () => {
      expect(shorten('https://t.co/abc123')).toBe('abc123')
    })

    it('shortens fb.me short link to path', () => {
      expect(shorten('https://fb.me/abc123xyz')).toBe('abc123xyz')
    })

    it('shortens instagr.am short link to path', () => {
      expect(shorten('https://instagr.am/p/ABC123')).toBe('p/ABC123')
    })

    it('shortens lnkd.in short link to path', () => {
      expect(shorten('https://lnkd.in/abc123')).toBe('abc123')
    })

    it('shortens pin.it short link to path', () => {
      expect(shorten('https://pin.it/abc123')).toBe('abc123')
    })

    it('shortens vm.tiktok.com short link to path', () => {
      expect(shorten('https://vm.tiktok.com/ZSabc')).toBe('ZSabc')
    })

    it('shortens spotify.link short link to path', () => {
      expect(shorten('https://spotify.link/abc123')).toBe('abc123')
    })
  })

  describe('unrecognized URLs (fallback)', () => {
    it('strips protocol and www', () => {
      expect(shorten('https://www.example.com/some/path')).toBe('example.com/some/path')
    })

    it('strips protocol without www', () => {
      expect(shorten('https://blog.example.com/post')).toBe('blog.example.com/post')
    })

    it('strips http protocol', () => {
      expect(shorten('http://example.com/page')).toBe('example.com/page')
    })

    it('strips trailing slash', () => {
      expect(shorten('https://example.com/')).toBe('example.com')
    })

    it('strips query parameters', () => {
      expect(shorten('https://example.com/page?ref=123&utm_source=x')).toBe('example.com/page')
    })

    it('strips hash fragments', () => {
      expect(shorten('https://example.com/page#section')).toBe('example.com/page')
    })

    it('returns domain only for root URL', () => {
      expect(shorten('https://example.com')).toBe('example.com')
    })
  })

  describe('edge cases', () => {
    it('returns null for empty string', () => {
      expect(shorten('')).toBeNull()
    })

    it('returns null for garbage input', () => {
      expect(shorten('not a url at all')).toBeNull()
    })

    it('returns null for whitespace', () => {
      expect(shorten('   ')).toBeNull()
    })

    it('shortens domain root to domain name', () => {
      expect(shorten('https://instagram.com')).toBe('instagram.com')
    })

    it('supports @handle with network option', () => {
      expect(shorten('@johndoe', { network: 'instagram' })).toBe('johndoe')
    })

    it('supports bare handle with network option', () => {
      expect(shorten('nikuscs', { network: 'twitter' })).toBe('nikuscs')
    })

    it('strips tracking params from recognized URLs', () => {
      expect(shorten('https://twitter.com/user/status/123?utm_source=share')).toBe('user/123')
    })

    it('recovers malformed scheme URLs', () => {
      expect(shorten('http:instagram.com/p/ABC123')).toBe('ABC123')
    })

    it('handles protocol-relative URLs in fallback', () => {
      expect(shorten('//example.com/path')).toBe('example.com/path')
    })

    it('handles bare domain without protocol in fallback', () => {
      expect(shorten('example.com/some/path')).toBe('example.com/some/path')
    })

    it('falls through to fallback with custom empty parsers', () => {
      expect(shorten('https://twitter.com/elonmusk', { parsers: [] })).toBe('twitter.com/elonmusk')
    })

    it('falls back for known domain with reserved/unparseable path', () => {
      expect(shorten('https://twitter.com/home')).toBe('twitter.com/home')
    })

    it('handles multiple trailing slashes in fallback', () => {
      expect(shorten('https://example.com/path///')).toBe('example.com/path')
    })

    it('extracts multi-segment path from short links', () => {
      expect(shorten('https://fb.me/story/abc123')).toBe('story/abc123')
    })
  })

  describe('more platform coverage', () => {
    it('shortens YouTube Shorts to video_id', () => {
      expect(shorten('https://youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    })

    it('shortens yt.be short link to path', () => {
      expect(shorten('https://yt.be/abc123')).toBe('abc123')
    })

    it('shortens Discord invite to invite_code', () => {
      expect(shorten('https://discord.gg/coolserver')).toBe('coolserver')
    })

    it('shortens dis.gd short link to path', () => {
      expect(shorten('https://dis.gd/abc123')).toBe('abc123')
    })

    it('shortens Reddit post to subreddit/post_id', () => {
      expect(shorten('https://reddit.com/r/typescript/comments/abc123/some_title')).toBe('typescript/abc123')
    })

    it('shortens redd.it short link to post_id', () => {
      expect(shorten('https://redd.it/abc123')).toBe('abc123')
    })

    it('shortens Instagram story to username/story_id', () => {
      expect(shorten('https://instagram.com/stories/johndoe/1234567890')).toBe('johndoe/1234567890')
    })

    it('shortens Substack publication post to publication/slug', () => {
      expect(shorten('https://platformer.substack.com/p/example-post')).toBe('platformer/example-post')
    })

    it('shortens Medium post to username/post_id', () => {
      expect(shorten('https://medium.com/@ev/example-post-abc123def456')).toBe('ev/abc123def456')
    })

    it('shortens VK wall post to owner_id/post_id', () => {
      expect(shorten('https://vk.com/wall-12345_67890')).toBe('-12345/67890')
    })

    it('shortens Last.fm track to artist/track', () => {
      expect(shorten('https://last.fm/music/Daft+Punk/_/One+More+Time')).toBe('Daft+Punk/One+More+Time')
    })

    it('shortens Last.fm album to artist/album', () => {
      expect(shorten('https://last.fm/music/Daft+Punk/+albums/Discovery')).toBe('Daft+Punk/Discovery')
    })

    it('shortens QQ post to uin/post_id', () => {
      expect(shorten('https://user.qzone.qq.com/123456789/mood/abc123')).toBe('123456789/abc123')
    })

    it('shortens Kick clip URL via fallback', () => {
      expect(shorten('https://kick.com/trainwreckstv/clips/clip_abc123')).toBe('kick.com/trainwreckstv/clips/clip_abc123')
    })

    it('shortens Patreon post without username to post_id', () => {
      expect(shorten('https://patreon.com/posts/some-title-123456')).toBe('123456')
    })

    it('shortens Vimeo channel video to channel/video_id', () => {
      expect(shorten('https://vimeo.com/channels/staffpicks/123456789')).toBe('staffpicks/123456789')
    })

    it('shortens Facebook video via fb.watch to video_id', () => {
      expect(shorten('https://fb.watch/abc123')).toBe('abc123')
    })

    it('shortens Facebook reel to video_id', () => {
      expect(shorten('https://facebook.com/reel/123456789')).toBe('123456789')
    })

    it('shortens Facebook group to group_id', () => {
      expect(shorten('https://facebook.com/groups/typescript.developers')).toBe('typescript.developers')
    })

    it('shortens Snapchat spotlight to video_id', () => {
      expect(shorten('https://snapchat.com/spotlight/abc123')).toBe('abc123')
    })

    it('shortens Snapchat profile to username', () => {
      expect(shorten('https://snapchat.com/add/johndoe')).toBe('johndoe')
    })

    it('shortens Dailymotion video to video_id', () => {
      expect(shorten('https://dailymotion.com/video/x9abcde')).toBe('x9abcde')
    })

    it('shortens dai.ly short link to path', () => {
      expect(shorten('https://dai.ly/x9abcde')).toBe('x9abcde')
    })

    it('shortens lin.ee short link to path', () => {
      expect(shorten('https://lin.ee/abc123')).toBe('abc123')
    })

    it('shortens snd.sc short link to path', () => {
      expect(shorten('https://snd.sc/abc123')).toBe('abc123')
    })

    it('shortens Twitch clip to clip_id', () => {
      expect(shorten('https://clips.twitch.tv/AmazingClipSlug')).toBe('AmazingClipSlug')
    })

    it('shortens Twitch channel clip to username/clip_id', () => {
      expect(shorten('https://twitch.tv/streamer/clip/AmazingClipSlug')).toBe('streamer/AmazingClipSlug')
    })

    it('shortens Rumble video to video_id', () => {
      expect(shorten('https://rumble.com/v5abcde-example-title.html')).toBe('5abcde')
    })

    it('shortens Ko-fi profile to username', () => {
      expect(shorten('https://ko-fi.com/somecreator')).toBe('somecreator')
    })

    it('shortens LinkedIn profile to username', () => {
      expect(shorten('https://linkedin.com/in/jane-doe')).toBe('jane-doe')
    })

    it('shortens Telegram invite to invite_code', () => {
      expect(shorten('https://t.me/+abc123invite')).toBe('abc123invite')
    })

    it('shortens search query to query text', () => {
      expect(shorten('https://www.google.com/search?q=hello+world')).toBe('hello world')
    })

    it('shortens Mixcloud show to username/show', () => {
      expect(shorten('https://mixcloud.com/nts/morning-show-001')).toBe('nts/morning-show-001')
    })

    it('shortens SoundCloud playlist to username/playlist', () => {
      expect(shorten('https://soundcloud.com/porter-robinson/sets/worlds')).toBe('porter-robinson/worlds')
    })

    it('shortens Pinterest pin to pin_id', () => {
      expect(shorten('https://pinterest.com/pin/123456789')).toBe('123456789')
    })

    it('shortens Spotify album to album_id', () => {
      expect(shorten('https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy')).toBe('4aawyAB9vmqN3uQ7FjRGTy')
    })

    it('shortens Spotify playlist to playlist_id', () => {
      expect(shorten('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M')).toBe('37i9dQZF1DXcBWIGoYBM5M')
    })

    it('shortens TikTok /t/ short link to path', () => {
      expect(shorten('https://tiktok.com/t/ZTRabc123')).toBe('t/ZTRabc123')
    })

    it('shortens Facebook permalink with page_id to post_id/page_id', () => {
      expect(shorten('https://facebook.com/permalink.php?story_fbid=abc123&id=page456')).toBe('abc123/page456')
    })
  })

  describe('more edge cases', () => {
    it('lowercases hostname in fallback', () => {
      expect(shorten('https://EXAMPLE.COM/Path')).toBe('example.com/Path')
    })

    it('handles URL with port in fallback (port stripped by cleanUrl)', () => {
      expect(shorten('https://example.com:8080/path')).toBe('example.com/path')
    })

    it('handles subdomain preservation in fallback', () => {
      expect(shorten('https://sub.domain.example.com/page')).toBe('sub.domain.example.com/page')
    })

    it('falls through to fallback for @handle without network', () => {
      expect(shorten('@johndoe')).toBe('johndoe')
    })

    it('falls through to fallback for unsupported forced network', () => {
      expect(shorten('@johndoe', { network: 'facebook' })).toBe('johndoe')
    })

    it('handles ig.me short link', () => {
      expect(shorten('https://ig.me/abc123')).toBe('abc123')
    })

    it('handles m.me short link', () => {
      expect(shorten('https://m.me/johndoe')).toBe('johndoe')
    })

    it('strips all query params even non-tracking ones in fallback', () => {
      expect(shorten('https://example.com/page?page=2&sort=date')).toBe('example.com/page')
    })

    it('handles URL with both query and hash in fallback', () => {
      expect(shorten('https://example.com/page?q=1#top')).toBe('example.com/page')
    })

    it('handles recognized URL with fbclid tracking param', () => {
      expect(shorten('https://instagram.com/johndoe?fbclid=abc123')).toBe('johndoe')
    })

    it('handles Twitter URL via x.com domain', () => {
      expect(shorten('https://x.com/user/status/999')).toBe('user/999')
    })

    it('handles mobile subdomain URLs', () => {
      expect(shorten('https://m.facebook.com/johndoe')).toBe('johndoe')
    })

    it('handles www subdomain on recognized URLs', () => {
      expect(shorten('https://www.instagram.com/p/ABC123')).toBe('ABC123')
    })
  })
})
