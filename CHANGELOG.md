# Daily Brief — Changelog

## v14.0 (2026-03-14) — FULL BUG AUDIT & FIX
### Root Cause
- v13 had valid JS syntax (braces balanced, no parse errors) but **35+ runtime bugs**
- All bugs were **name mismatches** between HTML/CSS and JS — invisible to syntax checkers

### Fixed — Function Name Mismatches (7)
- `onclick="switchTab()"` → `goTab()` (tabbar completely broken)
- `onclick="togglePlay()"` → `ptoggle()` (play buttons broken)
- `onclick="skip()"` → `pskip()` (skip buttons broken)
- `onclick="seekBar()"` → `pseek()` (progress bar click broken)
- `onclick="cycleBriefSpd()"` → `pbCycleSpd()` (speed button broken)
- `onclick="saveSchedule()"` → `saveSched()` (schedule save broken)
- `onclick="preGenTomorrow()"` → `preGenTom()` (pre-gen button broken)

### Fixed — DOM ID Mismatches (6)
- JS `'setup'` → DOM `'setupScreen'` (setup screen never hid)
- JS `'loading'` → DOM `'loadingScreen'` (loading screen never showed)
- JS `'podD'` → DOM `'podDateLbl'` (podcast date never updated)
- JS `'ttsSt'` → DOM `'ttsStatus'` (TTS status never showed)
- JS `'podTts'` → DOM `'ttsModeLabel'` (TTS mode label broken)
- JS `'schedLbl'` → DOM `'schedLabel'` (schedule label broken)

### Fixed — CSS Class Mismatches (~20)
- `nrow` → `news-row`, `nbody` → `news-body`, `ntitle` → `n-title`
- `nsum` → `n-sum`, `nright` → `news-right`, `nsrc` → `n-src`
- `grp` → `card-group`, `sec` → `sec-hdr`
- `deal` → `deal-card`, `deal-t/v/s` → `deal-title/val/sum`
- `wrow/wn/wt` → `watch-row/watch-n/watch-t`
- `psec-row/psec-n/psec-name/psec-dur` → `pod-sec-row/ps-n/ps-name/ps-dur`
- `cmsg` → `chat-msg`, `cbub` → `chat-bubble`
- `mc-v/mc-c` → `mkt-v/mkt-c`
- `sri/sri-d/sri-t/sri-p` → `srch-r-item/sri-date/sri-title/sri-prev`
- catCls values: `cg/cj/cu/ck/ca/cm/cd/ct` → `c-글로벌/c-일본/c-미국/...`
- Sheet overlay: `.add('on')` → `.add('show')`
- PlayerBar: `.add('on')` → `.add('show')`
- Toast: `.add('on')` → `.add('show')`
- Sheet imp: `sh-imp-l/sh-imp-t` → `sh-imp-lbl/sh-imp-txt`

### Fixed — Logic Bugs (4)
- `startApp()` never showed `mainArea`/`tabbar` → now sets display:flex
- `goTab()` selected `.tbb` (doesn't exist) → `.tb-btn`
- Config keys `japanTab/koreaTab/usTab` → `japanMode/koreaMode/usMode` (matching toggle IDs)
- `updateCatTabs()` IDs `cb-j/cb-k/cb-u` → `cb-일본/cb-한국/cb-미국` (matching DOM)

### Fixed — Typo
- Sheet type display `딄` → `딜`

### Added
- Error boundary around `init()` with visible fallback message

---

## v13.0 (2026-03-13)
- Pure ES5 rewrite (var/function only), zero template literals
- Braces balanced 379/379
- Removed reload on setup save

## v10.0 (2026-03-14)
### Fixed
- Only 3 articles bug: structureClaude prompt now explicitly enforces 14-18 headlines, 4-6 deals
- OpenAI system prompt added: "never return partial results"
- max_tokens raised to 6000 for briefing generation

### Added
- **딥다이브**: 기사 탭 → 시트에서 "딥다이브 분석" → 6섹션 심층 분석
- **AI 질문 탭**: 오늘 브리핑 컨텍스트를 가진 대화형 AI 채팅
- **토픽 팟캐스트**: 기사/딥다이브에서 바로 해당 토픽 팟캐스트 생성
- Chat tab 추가 (탭바 5번째)

## v9.0 (2026-03-14) — CLEAN REBUILD
### Fixed (root cause of all black screens)
- Complete rewrite from scratch — no more patch accumulation
- togSetting() was defined twice (silent JS fatal error)
- Multiple broken template literals from Python string escaping
- localStorage crash → safe S.get/S.set/S.keys wrapper

### Architecture
- Single clean file, zero dead code
- Storage layer: S.get/set/rm/getJ/setJ/keys (sandbox-safe)
- All IDs verified to exist in DOM before use
- No external dependencies except Google Fonts + APIs

## v8.0 (2026-03-14)
### Fixed
- Black screen: localStorage sandboxed in iframe → graceful fallback + demo mode

### Added
- Responsive layout: iPhone / iPad (768px+) / Desktop (1024px+)
- Nikkei manual paste panel
- Demo mode

## v7.0 (2026-03-13)
- OpenAI TTS API integration
- Korean number converter
- Light/dark mode automatic
- Apple HIG compliant redesign

## v6.0 (2026-03-13)
- Sticky player bar, category tab toggles, font size increases

## v5.0 (2026-03-13)
- GitHub remote fetch (server pre-generated at 4:30 AM JST)

## v4.0 (2026-03-13)
- Schedule settings, pre-generation

## v3.0 (2026-03-13)
- Full auto-generation pipeline: Gemini Flash → Claude/OpenAI

## v2.0 (2026-03-13)
- Podcast player with Web Speech TTS

## v1.0 (2026-03-12)
- Initial version
