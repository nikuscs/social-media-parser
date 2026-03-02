# social-media-parser

Parse, identify, and normalize social media URLs in one step.

## Features

- ⚡ Fast URL parsing and canonical normalization
- 🌍 Multi-platform support
- 🧩 Extensible parser architecture
- 🧼 Cleans tracking params (`utm_*`, `fbclid`, `gclid`, etc.)
- ✅ Typed API and full test coverage

## Supported Platforms

- 🐦 Twitter / X
- 📸 Instagram
- 🎵 TikTok
- 👽 Reddit
- 🧑‍💻 GitHub
- ▶️ YouTube
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

### `parse(input, parsers?)`

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

const result = parse('https://x.com/elonmusk', [twitter])
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

## Release

- Tags: `v*` (example: `v0.1.0`)
- Workflow: GitHub Actions `Release`
- Publish command: `npm publish --access public --provenance`

Uses npm provenance (OIDC) and supports `NPM_TOKEN` fallback.
