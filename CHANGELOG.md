# Daily Brief — Changelog

## v20.0 (2026-03-14) — RECENCY + INSIGHTFUL IMPLICATIONS

### Fixed — 당일 뉴스 강제
- Gemini: "Only include news from last 24-36 hours" 룰 추가
- Claude: "RECENCY: Reject anything older than 36 hours" 룰 추가
- JSON 스키마에 "time" 필드 추가 (헤드라인 + 딜 양쪽)

### Added — 뉴스 시간 표시
- 헤드라인 카드: 소스 아래에 "3/14 06:30" 형태로 시간 표시
- 딜 카드: 소스 옆에 시간 표시
- 시트 상세: footer에 시간 표시

### Changed — 임플리케이션 대폭 강화
- IMPLICATIONS GUIDE 프롬프트 추가 (클라이언트 + 서버)
- BAD 예시 명시 (금지): "주목할 만하다", "투자자들이 관심을 가질 것"
- GOOD 예시 4개:
  - "JGB 1.5% 돌파 시 캡레이트 3.5→4.0% 조정, 레버리지 60%+ 리파이 점검"
  - "세븐아이 MBO 실패 시 쿠시타르 독자 TOB. 편의점 EV/EBITDA 12x→15x 리레이팅"
  - "BOJ 동결 시 엔화 155엔 → LP 헤지비용 상승, 캐피탈콜 타이밍 조정"
  - "물류센터 공급과잉 사이타마/치바 8%+ 공실. 도심 라스트마일은 구조적 부족"
- 필수 3요소: (1) 구체적 수치/시나리오 (2) 포트폴리오 직접 영향 (3) 구체적 action item

---

## v19.0 — FOCUS CUSTOMIZATION (국가×섹터 AND 조합), 소스 스마트 추가
## v18.0 — 81개 소스 (11개 카테고리), 소스 자동 발견
## v17.0 — ANTI-HALLUCINATION (validateBrief, 강제최소 제거)
## v16.0 — PRO TOOLS (Comp, Deal Tracker, Weekly Memo, Alert)
## v15.0 — MAJOR FEATURES (Rerun, Deep Dive, Rich Search, Script Viewer)
## v14.0 — FULL BUG AUDIT (35+ runtime bugs)
