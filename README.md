# social-media-parser

A lightweight, zero-dependency TypeScript library for parsing, identifying, and normalizing social media URLs. Feed it any link from 39+ supported platforms and get back structured data — the platform name, content type, extracted entities (usernames, post IDs, video IDs), and a clean canonical URL with tracking parameters stripped away.

Built for link previews, analytics pipelines, content aggregators, social bookmarking tools, or anywhere you need to make sense of messy social media URLs.

## Features

- ⚡ Fast URL parsing and canonical normalization
- 🌍 39+ platforms supported out of the box
- 🧩 Extensible — bring your own parsers or use only the ones you need
- 🧼 Cleans tracking params (`utm_*`, `fbclid`, `gclid`, `si`, `igshid`, etc.)
- 🔒 Zero runtime dependencies
- ✅ Fully typed API with 100% test coverage

## Supported Platforms

- 🐦 Twitter / X
- 📸 Instagram
- 🎵 TikTok
- 👽 Reddit
- 🧑‍💻 GitHub
- ▶️ YouTube
- 🎧 Spotify
- 🐘 Mastodon
- ☁️ SoundCloud
- ☁️ Mixcloud
- 💬 Discord
- 📰 Substack
- ✍️ Medium
- 🇷🇺 Vkontakte (VK)
- 📺 Rumble
- 🎥 Kick
- 📻 Radio Javan
- 💸 Patreon
- 💬 LINE
- 🐧 QQ / Qzone
- 🎧 Last.fm
- ☕ Ko-fi
- 📘 Facebook
- 🔎 Search engines (Google, Bing, DuckDuckGo, Yahoo, Yandex, Baidu, Brave, Ecosia, Qwant, Startpage)
- 💼 LinkedIn
- 🧵 Threads
- 🦋 Bluesky
- 📌 Pinterest
- 🎮 Twitch
- ✈️ Telegram
- 👻 Snapchat
- 🎬 Vimeo
- ▶️ Dailymotion

## Short Link & Redirect Domain Support

The parser recognizes official short link and redirect domains for major platforms. When a short URL can be fully resolved (e.g., `youtu.be/{video_id}`), it returns the parsed content. When it can't be resolved without following a redirect, it returns `type: 'short'` so you can still identify the platform.

| Platform | Short / Redirect Domains |
| --- | --- |
| Twitter / X | `t.co` |
| TikTok | `vm.tiktok.com`, `vt.tiktok.com`, `tiktok.com/t/{code}` |
| YouTube | `youtu.be` (resolved), `yt.be` |
| Facebook | `fb.me`, `fb.watch` (resolved), `m.me` |
| Instagram | `instagr.am`, `ig.me` |
| Reddit | `redd.it` (resolved) |
| Spotify | `spotify.link` |
| LinkedIn | `lnkd.in` |
| Pinterest | `pin.it` |
| SoundCloud | `snd.sc` |
| Discord | `discord.gg` (resolved), `discordapp.com` (full parsing), `dis.gd` |
| Telegram | `t.me`, `telegram.me`, `telegram.dog` (all full parsing) |
| Dailymotion | `dai.ly` (resolved) |
| LINE | `lin.ee` (resolved) |

```ts
parse('https://vm.tiktok.com/ZSabc/')
// { platform: 'tiktok', type: 'short', entities: {}, url: 'https://vm.tiktok.com/ZSabc/' }

parse('https://youtu.be/dQw4w9WgXcQ')
// { platform: 'youtube', type: 'video', entities: { video_id: 'dQw4w9WgXcQ' }, url: 'https://youtube.com/watch?v=dQw4w9WgXcQ' }
```

## Installation

```bash
npm install social-media-parser
```

## Quick Example

```ts
import { parse, identify, normalize, shorten } from 'social-media-parser'

parse('https://twitter.com/elonmusk/status/1234567890')
// {
//   platform: 'twitter',
//   type: 'post',
//   entities: { username: 'elonmusk', post_id: '1234567890' },
//   url: 'https://x.com/i/status/1234567890'
// }

identify('https://www.instagram.com/johndoe/')
// 'instagram'

normalize('https://youtu.be/dQw4w9WgXcQ?si=abc&utm_source=test')
// 'https://youtube.com/watch?v=dQw4w9WgXcQ'

shorten('https://instagram.com/p/ABC123')
// 'ABC123'

shorten('https://twitter.com/elonmusk/status/1234567890')
// 'elonmusk/1234567890'

shorten('https://www.example.com/some/path?ref=123')
// 'example.com/some/path'
```

## API

### `parse(input, options?)`

Returns:

- `SocialLinkParsedLink` when recognized
- `null` when input is invalid or unsupported

### `identify(input, parsers?)`

Returns:

- platform string (`'twitter'`, `'instagram'`, etc.)
- `null` when unsupported

### `normalize(input, parsers?)`

Returns:

- canonical URL string
- `null` when unsupported

### `shorten(input, options?)`

Returns the shortest meaningful identifier from a URL. For recognized platforms, it joins the parsed entity values (e.g., `username/post_id`). For short links with no entities, it extracts the path. For unrecognized URLs, it strips the protocol, `www.`, query string, and hash.

Returns:

- shortened string identifier
- `null` when input is unparseable

## Custom Parsers

```ts
import { parse, twitter } from 'social-media-parser'

const result = parse('https://x.com/elonmusk', { parsers: [twitter] })
```

## Forced Network

```ts
import { parse } from 'social-media-parser'

const result = parse('@elonmusk', { network: 'twitter' })
```

## Development

- `bun run typecheck`
- `bun run lint`
- `bun run lint:fix`
- `bun run test`
- `bun run test:coverage`
- `bun run build`
- `bun run check`
- `bun run release`
- `bun run release:dry-run`

`bun run check` enforces 100% coverage thresholds.
