# Daily Brief — Changelog

## v18.0 (2026-03-14) — COMPREHENSIVE SOURCE MANAGEMENT

### New: 81개 소스 (11개 카테고리)
- **JP-정책·데이터** (8): BOJ, MOF, 내각부, 총무성, 후생노동성, 국토교통성, METI, TSE
- **JP-언론** (10): 닛케이, Nikkei Asia, 아사히, 요미우리, 마이니치, Jiji, Kyodo, NHK, Diamond, BI Japan
- **JP-부동산/RE** (7): 닛케이부동산, NLI, JLL, CBRE, Savills, C&W, ULI Japan
- **JP-딜/액티비즘** (3): DealStreetAsia, Mergermarket, PE Hub
- **KR-정책·데이터** (7): BOK, 기재부, 금융위, 금감원, KOSIS, DART, KRX
- **KR-뉴스/딜** (8): 연합뉴스, 한경, 매경, 조선, 중앙, 동아, Korea Herald, KED Global
- **KR-부동산** (4): 젠스타메이트, CBRE Korea, JLL Korea, Savills Korea
- **US-정책·데이터** (8): Fed, Treasury, BLS, BEA, USTR, DoD, State, SEC EDGAR
- **US-뉴스/마켓** (8): Bloomberg, Reuters, WSJ, FT, CNBC, Axios, Politico, The Information
- **글로벌 기구** (5): IMF, World Bank, OECD, IEA, WTO
- **사용자 추가**: 자유 추가 가능

### New: 소스 관리 UI
- 카테고리별 접기/펼치기 (아코디언)
- 각 소스 개별 ON/OFF 토글 (iOS 스타일)
- 활성 소스 카운트 실시간 표시 (예: 52/81)
- "기본값 복원" / "전체 삭제" 버튼
- 사용자 추가 소스만 삭제 가능 (기본 소스는 토글만)

### New: 소스 자동 발견
- 검색/딥다이브에서 새로운 소스 URL 발견 시 자동 감지
- confirm 팝업으로 소스 리스트 추가 여부 확인
- google/twitter/wikipedia 등 일반 사이트 자동 제외

### Changed
- Gemini 프롬프트에 활성 소스 리스트 주입 (우선 검색 대상)

---

## v17.0 — ANTI-HALLUCINATION (validateBrief, 강제최소 제거)
## v16.0 — PRO TOOLS (Comp, Deal Tracker, Weekly Memo, Alert)
## v15.0 — MAJOR FEATURES (Rerun, Deep Dive, Rich Search, Script Viewer)
## v14.0 — FULL BUG AUDIT (35+ runtime bugs)
