// generate.js — Daily Brief Generator v2
// Runs on GitHub Actions at 4:30 AM JST
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const GEMINI_KEY  = process.env.GEMINI_API_KEY;
const CLAUDE_KEY  = process.env.CLAUDE_API_KEY;
const OPENAI_KEY  = process.env.OPENAI_API_KEY;
const NIKKEI_ID   = process.env.NIKKEI_ID || '';
const NIKKEI_PW   = process.env.NIKKEI_PW || '';

function jstDate() {
  const jst = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

const TODAY = jstDate();
console.log(`\n=== Daily Brief Generator v3 ===`);
console.log(`Date: ${TODAY} | APIs: Gemini=${!!GEMINI_KEY} Claude=${!!CLAUDE_KEY} OpenAI=${!!OPENAI_KEY} Nikkei=${!!NIKKEI_ID}\n`);

async function fetchNewsWithGemini(date) {
  if (!GEMINI_KEY) return null;
  console.log('Step 1: Gemini Flash + Google Search...');
  const prompt = `Today is ${date} (JST) 4:30 AM. You are preparing a morning briefing for a Japan PE/Real Estate fund manager. Japanese morning papers just published, US markets closed.

CRITICAL: Only report news you ACTUALLY find via Google Search. NEVER fabricate. If you find fewer items, that's OK. 8 real items > 20 fake items.

Search ALL these areas exhaustively:

JAPAN (highest priority):
- BOJ rate signals, JGB yield moves, any board member speeches
- Nikkei/Sankei/Yomiuri top morning headlines (search in Japanese too: 日経 不動産 PE 買収)
- Nikkei Real Estate Market (日経不動産マーケット情報): any transactions, cap rates, vacancy
- J-REIT: unit prices, acquisitions, equity raises, distribution changes
- Tokyo office/logistics/residential: CBRE, JLL, Savills Japan reports
- Corporate Japan: TOB, MBO, carve-out, activist investor (物言う株主), earnings
- PE deals in Japan: Blackstone, KKR, Carlyle, Bain, PAG, Warburg Pincus, MBK Partners
- Japan economic data released today

US OVERNIGHT:
- S&P 500, Nasdaq exact closing numbers and main driver
- Fed speakers, FOMC signals, rate cut/hike expectations
- US economic data released yesterday
- Key political/policy news: tariffs, regulation changes
- Major earnings with investment angle

GLOBAL MACRO:
- USD/JPY overnight move and reason
- Oil WTI exact price and driver
- China: PBOC moves, property data, Xi policy
- Korea: BOK, Samsung/SK Hynix news, major corporate
- Geopolitics: Ukraine ceasefire, Middle East, US-China

DEALS AND ACTIVIST (be thorough):
- ANY M&A globally over $500M announced
- PE buyouts, carve-outs, take-privates
- Real estate transactions, data center deals, infrastructure
- New activist 13D/13G filings, shareholder letters
- Earnings with notable investment thesis angle
- PE/RE fund closings or launches

TRENDING MUST-KNOW:
- Sports: WBC, major Japanese athlete internationally, Olympics-related
- Tech/AI: major product, regulation, funding round
- Geopolitical flash: wars affecting markets, supply chains
- Cultural: anything educated investors are discussing globally

MARKET REPORTS PUBLISHED TODAY:
- CBRE, JLL, Cushman market reports
- BOJ/MOF statistics
- Any major investment bank market outlook

For each: Korean headline, category (글로벌|일본|미국|아시아|매크로|딜|화제|한국), published time (e.g. "3/14 06:30"), 2-sentence Korean summary, source, URL. Only include news from last 24-36 hours.
Market levels: JGB 10Y %, USD/JPY, Nikkei, S&P500, WTI, USD/KRW. Use EXACT numbers from search results. If not found, write "N/A".
Return only items you actually found. Quality over quantity. Include real source URLs.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 10000 }
      }) }
  );
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(`Gemini: ${e.error?.message||res.status}`); }
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.filter(p=>p.text).map(p=>p.text).join('\n') || '';
  if (!text) throw new Error('Gemini empty');
  console.log(`  ✓ Gemini: ${text.length} chars`);
  return text;
}

async function structureWithClaude(rawNews, date, useSearch = false) {
  if (!CLAUDE_KEY) return null;
  console.log(`Step 2: Claude${useSearch?' + search':' structuring'}...`);

  const sys = `Senior Japan PE/Real Estate investment analyst preparing daily morning brief.

CRITICAL ANTI-HALLUCINATION RULES:
- ONLY use information from the provided raw news data. NEVER invent or fabricate news.
- If a specific number, price, or fact is not in the raw data, write "정보 없음" or "N/A".
- Market data: use EXACT numbers from the raw data. If not found, use "N/A" for value and "—" for change.
- URLs: use the EXACT URL from the source. If no URL available, use "".
- If fewer than 10 real stories exist in the raw data, return fewer items. Quality > quantity.
- Every headline MUST reference a SPECIFIC company name, person, number, or event from the data.
- FORBIDDEN: Generic headlines like "일본 부동산 펀드, 빌딩 인수" without specific names.

HEADLINE RULES:
- Korean, max 55 chars, specific (include numbers/company names)
- Categories: 글로벌 | 일본 | 미국 | 아시아 | 매크로 | 딜 | 화제 | 한국
- implications = specific actionable PE/RE angle (not "주목할 만하다" — say WHY and WHAT to do/watch)
- No Japanese punctuation in Korean text`;

  const body_content = useSearch
    ? `Search for today's (${date} JST) complete news for Japan PE/RE investor. Cover: BOJ, Nikkei RE, J-REIT, US markets, Fed, deals, activist events, trending.`
    : `Structure this raw news into briefing JSON:\n\n${rawNews.slice(0, 8000)}`;

  const schema = `Return ONLY this JSON (no markdown fences, no text outside JSON):
{"date":"${date}","generatedAt":${Date.now()},"generatedBy":"github-actions","model":"${useSearch?'claude-search':'gemini+claude'}",
"headlines":[{"id":"h1","cat":"일본","title":"구체적 헤드라인","time":"3/14 06:30","summary":"팩트 기반 2문장.","detail":"3-4문장 분석.","implications":"아래 가이드 참조","source":"실제 출처","url":"실제 URL 또는 빈문자열"}],
"market":{"jgb10y":{"v":"실제수치 또는 N/A","d":"변동 또는 —","t":0},"usdjpy":{"v":"","d":"","t":0},"nikkei":{"v":"","d":"","t":0},"sp500":{"v":"","d":"","t":0},"wti":{"v":"","d":"","t":0},"usdkrw":{"v":"","d":"","t":0}},
"deals":[{"id":"d1","title":"실제 딜명","time":"3/14","value":"금액","type":"유형","summary":"팩트 기반 요약.","source":"출처","url":"URL"}],
"watch":[{"n":1,"text":"관전포인트1"},{"n":2,"text":"관전포인트2"},{"n":3,"text":"관전포인트3"}]}

IMPLICATIONS GUIDE — implications must have this depth:
BAD: "주목할 만하다", "투자자들이 관심을 가질 것"
GOOD: "JGB 10Y 1.5% 돌파 시 도쿄 오피스 캡레이트 3.5→4.0% 조정 압력. 레버리지 60%+ 건은 리파이 리스크 점검"
GOOD: "BOJ 4월 동결 시 엔화 155엔 돌파 → 해외 LP의 JPY 헤지 비용 상승. 신규 펀드 캐피탈콜 타이밍 조정"
Must include: (1) specific numbers/scenarios (2) direct portfolio impact (3) concrete action item

Include ONLY real items from the raw data. t=1 up, -1 down, 0 flat/unknown.`;

  const body = {
    model: 'claude-sonnet-4-20250514', max_tokens: 6000,
    system: sys,
    messages: [{ role: 'user', content: body_content + '\n\n' + schema }]
  };
  if (useSearch) body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': CLAUDE_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body)
  });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(`Claude: ${e.error?.message||res.status}`); }
  const json = await res.json();
  const text = json.content.filter(b=>b.type==='text').map(b=>b.text).join('');
  console.log(`  ✓ Claude: ${text.length} chars`);
  return parseJSON(text);
}

async function structureWithOpenAI(rawNews, date) {
  if (!OPENAI_KEY) return null;
  console.log('Step 2 (OpenAI fallback)...');
  const prompt = `Structure this news into a daily investment brief JSON for ${date} JST.
CRITICAL: Only use information from the raw data below. NEVER fabricate. If fewer items exist, return fewer.
${rawNews ? `News:\n${rawNews.slice(0, 6000)}` : 'Search for top news for Japan PE/RE investor.'}
Return ONLY JSON: {"date":"${date}","generatedAt":${Date.now()},"generatedBy":"github-actions","model":"gemini+gpt4o","headlines":[{"id":"h1","cat":"일본","title":"구체적 헤드라인","time":"3/14 06:30","summary":"팩트 기반 2문장","detail":"3-4문장 분석","implications":"구체적 수치 시나리오 + 포트폴리오 영향 + action item","source":"실제 출처","url":"실제 URL 또는 빈문자열"}],"market":{"jgb10y":{"v":"실제수치 또는 N/A","d":"변동 또는 —","t":0},"usdjpy":{"v":"","d":"","t":0},"nikkei":{"v":"","d":"","t":0},"sp500":{"v":"","d":"","t":0},"wti":{"v":"","d":"","t":0},"usdkrw":{"v":"","d":"","t":0}},"deals":[{"id":"d1","title":"실제 딜명","time":"3/14","value":"금액","type":"유형","summary":"요약","source":"출처","url":"URL"}],"watch":[{"n":1,"text":"관전1"},{"n":2,"text":"관전2"},{"n":3,"text":"관전3"}]}
Include ONLY real items. Categories: 글로벌|일본|미국|아시아|매크로|딜|화제|한국`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: 'gpt-4o', max_tokens: 5000, messages: [{ role: 'user', content: prompt }] })
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`OpenAI ${res.status}: ${errBody.slice(0, 200)}`);
  }
  const json = await res.json();
  console.log('  ✓ OpenAI done');
  return parseJSON(json.choices[0].message.content);
}

function addSpecialTopic(date, briefing) {
  const dealCount = briefing.deals?.length || 0;
  const trendCount = briefing.headlines?.filter(h => h.cat === '화제').length || 0;
  if (dealCount >= 4 && trendCount >= 2) return;

  const topics = [
    '일본 물류 부동산 시장 현황: 캡레이트, 공급, 이커머스 임차 트렌드',
    '도쿄 오피스 마켓: 프라임 vs 비프라임 양극화와 리파이 리스크',
    '일본 PE 시장 동향: 카브아웃, 테이크프라이빗, 승계 딜 파이프라인',
    '일본 호텔/호스피탈리티: 인바운드 폭증과 J-REIT 편입 기회',
    'BOJ 금리 인상과 부동산 캡레이트: 과거 사례와 현재 포지셔닝',
    '일본 콜드체인·데이터센터: 구조적 수요와 투자 진입 전략',
    '아시아 PE 파이프라인: 일본·한국·동남아 주요 타겟 섹터 비교'
  ];
  const idx = new Date(date + 'T00:00:00').getDay();
  briefing.specialTopic = { title: topics[idx % topics.length], type: 'deep-dive' };
  console.log(`  ✓ Special topic added: ${briefing.specialTopic.title}`);
}

function parseJSON(text) {
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}');
  if (s === -1) throw new Error('No JSON found');
  return JSON.parse(clean.slice(s, e + 1));
}

function save(date, data) {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `briefing-${date}.json`), JSON.stringify(data, null, 2));
  fs.writeFileSync(path.join(dir, 'latest.json'), JSON.stringify(data, null, 2));
  const files = fs.readdirSync(dir).filter(f => /^briefing-\d{4}-\d{2}-\d{2}\.json$/.test(f));
  const dates = files.map(f => f.replace('briefing-','').replace('.json','')).sort().reverse();
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify({ dates, updatedAt: Date.now() }, null, 2));
  console.log(`  ✓ Saved (${dates.length} total)`);
}

function validateBrief(b) {
  if (!b) return b;
  const genericPattern = /^(일본|미국|한국|중국|글로벌)\s*(부동산|기업|펀드|투자),?\s*(부동산|기업|펀드|투자|오피스|물류|빌딩)/;
  if (b.headlines) {
    const before = b.headlines.length;
    b.headlines = b.headlines.filter(h => {
      if (!h.title || h.title.length < 10) return false;
      if (genericPattern.test(h.title) && !h.url) return false;
      return true;
    });
    const removed = before - b.headlines.length;
    if (removed > 0) console.log(`  ⚠ Validation: removed ${removed} suspicious headlines`);
  }
  if (b.market) {
    for (const k of ['jgb10y','usdjpy','nikkei','sp500','wti','usdkrw']) {
      const m = b.market[k];
      if (!m) { b.market[k] = {v:'N/A',d:'—',t:0}; continue; }
      if (m.v === '0' || m.v === '0%' || m.v === '$0' || m.d === '0' || m.d === '0%' || m.d === '0bp') {
        b.market[k] = {v:'N/A',d:'—',t:0};
      }
    }
  }
  if (b.deals) {
    b.deals = b.deals.filter(d => d.title && d.title.length >= 8 && !(genericPattern.test(d.title) && !d.url));
  }
  return b;
}

async function main() {
  let rawNews = null, briefing = null;
  try { rawNews = await fetchNewsWithGemini(TODAY); } catch(e) { console.warn(`⚠ Gemini: ${e.message}`); }
  try { briefing = await structureWithClaude(rawNews, TODAY, !rawNews); } catch(e) { console.warn(`⚠ Claude: ${e.message}`); }
  if (!briefing) { try { briefing = await structureWithOpenAI(rawNews, TODAY); } catch(e) { console.error(`✗ OpenAI: ${e.message}`); } }
  if (!briefing) { console.error('✗ All failed'); process.exit(1); }
  briefing.date = TODAY;
  briefing.generatedAt = briefing.generatedAt || Date.now();
  briefing.serverGenerated = true;
  briefing = validateBrief(briefing);
  addSpecialTopic(TODAY, briefing);
  save(TODAY, briefing);
  const cats = [...new Set(briefing.headlines?.map(h=>h.cat)||[])];
  console.log(`\n✓ Done! ${briefing.headlines?.length||0} headlines, ${briefing.deals?.length||0} deals`);
  console.log(`  Categories: ${cats.join(', ')}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
