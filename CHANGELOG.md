# Daily Brief — Changelog

## v19.0 (2026-03-14) — FOCUS CUSTOMIZATION + SOURCE UX

### Fixed
- **토글 클릭 → 아코디언 닫힘 버그**: event.stopPropagation() 추가 + togSource()가 DOM 전체 리빌드 대신 in-place 토글
- 카테고리 카운트 배지 실시간 업데이트

### New: 소스 스마트 추가
- URL 입력 → 바로 추가
- 키워드 입력 (toyokeizai, 東洋経済 등) → Claude 웹서치로 공식 URL 자동 검색 → confirm 팝업

### New: 브리핑 포커스 커스터마이제이션
- **국가 칩**: 일본, 한국, 미국, 중국, 아시아, 글로벌
- **섹터 칩**: 부동산/RE, PE/바이아웃, M&A/딜, 테크/AI, 매크로/금리, 에너지, 인프라, 물류, 헬스케어, 데이터센터
- AND 조합: "일본 + 부동산 + PE" → Gemini/Claude에 교차점 우선순위 지시
- 프리뷰: "일본 + 부동산 | 한국 + PE" 형태로 현재 포커스 표시
- Gemini prompt에 FOCUS PRIORITY 섹션 자동 주입
- Claude system prompt에도 포커스 컨텍스트 주입
- localStorage에 저장, 앱 재시작 시 복원

---

## v18.0 — 81개 소스 (11개 카테고리), 소스 자동 발견
## v17.0 — ANTI-HALLUCINATION (validateBrief, 강제최소 제거)
## v16.0 — PRO TOOLS (Comp, Deal Tracker, Weekly Memo, Alert)
## v15.0 — MAJOR FEATURES (Rerun, Deep Dive, Rich Search, Script Viewer)
## v14.0 — FULL BUG AUDIT (35+ runtime bugs)
