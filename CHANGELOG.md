# Daily Brief — Changelog

## v8.0 (2026-03-14)
### Fixed
- Black screen: localStorage sandboxed in iframe → graceful fallback + demo mode
- localStorage access wrapped in try-catch throughout
- Error boundary added to init() — shows error message instead of blank screen

### Added
- Responsive layout: iPhone / iPad (768px+) / Desktop (1024px+)
- iPad: 2-column headline grid, wider market strip
- Desktop: sidebar navigation, 3-column layout
- Nikkei manual paste panel: user pastes paywalled article → AI analysis + adds to briefing
- Demo mode: loads sample data when no API keys set (for preview/testing)

### Changed
- File versioning: daily-brief-vN.html + CHANGELOG.md

---

## v7.0 (2026-03-13)
### Fixed
- miniPlayer reference removed (was causing JS crash → black screen)
- TTS ピリオド repetition bug fixed

### Added
- OpenAI TTS API integration (high quality voice)
- Korean number converter: 53,746.50 → 오만 삼천칠백사십육점오
- Light/dark mode automatic (prefers-color-scheme)
- Apple HIG compliant redesign: SF Pro font, 44pt touch targets, 8pt grid
- iOS native grouped list, bottom sheet, tab bar blur

### Changed
- generate.js: stronger news curation prompt (딜 4+, 화제 2+ enforced)

---

## v6.0 (2026-03-13)
### Added
- Sticky player bar on brief pane
- Category tabs dynamic show/hide (Japan/Korea/US/Deal/Trend toggles)
- Korea tab option
- Font size increases across all text

### Fixed
- Header duplicate settings button removed

---

## v5.0 (2026-03-13)
### Added
- GitHub remote fetch (server pre-generated at 4:30 AM JST)
- GitHub repo URL setting
- Falls back to on-device generation if GitHub unavailable

---

## v4.0 (2026-03-13)
### Added
- Schedule settings (designated time pre-generation)
- Pre-generate tomorrow's briefing button
- Evening auto pre-gen (after 9pm, silently generates next day)
- Toast notifications

---

## v3.0 (2026-03-13)
### Added
- Full auto-generation pipeline: Gemini Flash → Claude/OpenAI
- Gemini Google Search grounding for news collection
- OpenAI fallback when Claude unavailable
- Special topic for slow news days
- Deal/trending category enforcement in prompts

---

## v2.0 (2026-03-13)
### Added
- Podcast player with Web Speech TTS
- Section-based playback (skip by section)
- Speed control (0.9x–1.8x)
- Short/Medium/Long podcast formats
- Search tab with past briefing search + AI custom topic generation

---

## v1.0 (2026-03-12)
- Initial version
- Manual script input + Web Speech TTS
- Brief, Podcast, Search, Settings tabs

## v9.0 (2026-03-14) — CLEAN REBUILD
### Fixed (root cause of all black screens)
- Complete rewrite from scratch — no more patch accumulation
- togSetting() was defined twice (silent JS fatal error)
- Multiple broken template literals from Python string escaping
- localStorage crash → safe S.get/S.set/S.keys wrapper
- mainArea/tabbar now properly shown via JS (were display:none)
- Error boundary around init() with visible fallback

### Architecture
- Single clean 1550-line file, zero dead code
- Storage layer: S.get/set/rm/getJ/setJ/keys (sandbox-safe)
- All IDs verified to exist in DOM before use
- No external dependencies except Google Fonts + APIs

### Features (all preserved)
- Auto-generate on open (GitHub fetch → fallback to on-device)
- OpenAI TTS + Korean number converter
- Nikkei paste analyzer
- Responsive: iPhone / iPad (2-col) / Desktop (sidebar)
- Light/Dark auto mode
- Schedule + evening pre-gen
- Search + custom AI topic
- Tab visibility toggles
