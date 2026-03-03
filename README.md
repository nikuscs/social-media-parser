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

## Installation

```bash
npm install social-media-parser
```

## Quick Example

```ts
import { parse, identify, normalize } from 'social-media-parser'

parse('https://twitter.com/elonmusk/status/1234567890')
// {
//   platform: 'twitter',
//   type: 'post',
//   entities: { post_id: '1234567890', username: 'elonmusk' },
//   url: 'https://x.com/i/status/1234567890'
// }

identify('https://www.instagram.com/johndoe/')
// 'instagram'

normalize('https://youtu.be/dQw4w9WgXcQ?si=abc&utm_source=test')
// 'https://youtube.com/watch?v=dQw4w9WgXcQ'
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
