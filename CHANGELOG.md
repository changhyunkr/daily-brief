# Daily Brief — Changelog

## v17.0 (2026-03-14) — ANTI-HALLUCINATION

### Root Cause Analysis
스크린샷의 "일본 부동산 펀드, 도쿄 오피스 빌딩 인수 JPY 40bn" 같은 헤드라인은 100% 허구.
마켓 데이터 0%, 0bp도 가짜. 원인 3가지:

1. **강제 최소 개수**: "14-18 headlines 필수" → Gemini가 10개만 찾아도 Claude가 나머지를 지어냄
2. **스키마 샘플 데이터**: 예시 `"v":"1.52%"` 를 Claude가 그대로 복사
3. **검증 레이어 부재**: 0%, 제네릭 헤드라인이 그대로 통과

### Fixed — Gemini Prompt (뉴스 수집)
- "ONLY report news you ACTUALLY find. NEVER fabricate"
- "5 real items > 20 fake items"
- 일본어/영어/한국어 별도 검색어 10개 지정
- Market data: "use EXACT numbers, write N/A if not found"
- Temperature 0.2 → 0.1 (더 factual)

### Fixed — Claude Prompt (구조화)
- system prompt에 ANTI-HALLUCINATION RULES 8조항 별도 전달
- "FORBIDDEN: generic headlines without specific names"
- 강제 최소 개수 제거 ("return only real items")
- 스키마 예시: "1.52%" → "실제수치 또는 N/A"

### Added — validateBrief() (클라이언트 + 서버)
- 제네릭 패턴 정규식 필터 (URL 없는 "일본 부동산 펀드, X 인수" 제거)
- 마켓 데이터 0%/0bp → N/A 자동 치환
- 제목 10자 미만 제거
- 서버(generate.js)와 클라이언트(index.html) 양쪽에 적용

### Efficiency
- Gemini temp 0.1 (factual)
- Claude system prompt 분리 (토큰 효율)
- 12시간 캐시 유지 (중복 생성 방지)

---

## v16.0 — PRO TOOLS (Comp Table, Deal Tracker, Weekly Memo, Alert)
## v15.0 — MAJOR FEATURE UPGRADE
## v14.0 — FULL BUG AUDIT (35+ runtime bugs)
## v13.0–v1.0 — See previous versions
