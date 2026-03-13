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

For each: Korean headline, category (글로벌|일본|미국|아시아|매크로|딜|화제|한국), 2-sentence Korean summary, source, URL.
Market levels: JGB 10Y %, USD/JPY, Nikkei, S&P500, WTI, USD/KRW.
Target 20-25 stories. ALWAYS find at least 3 deal items and 2 trending items.`;

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

HEADLINE RULES:
- Korean, max 55 chars, specific (include numbers/company names)
- Categories: 글로벌 | 일본 | 미국 | 아시아 | 매크로 | 딜 | 화제 | 한국
- 딜 category = ANY of: M&A, PE buyout, TOB/MBO, carve-out, RE transaction, activist campaign, fund closing, earnings with investment thesis, data center/infra deal. Minimum 4 deal items.
- 화제 category = MUST have at least 2: WBC/sports, AI/tech announcement, geopolitical flashpoint, trending investor topic, major cultural moment. These are "what educated investors are talking about today."
- implications = specific actionable PE/RE angle (not "주목할 만하다" — say WHY and WHAT to do/watch)
- Real URLs from news sources
- No Japanese punctuation in Korean text`;

  const body_content = useSearch
    ? `Search for today's (${date} JST) complete news for Japan PE/RE investor. Cover: BOJ, Nikkei RE, J-REIT, US markets, Fed, deals, activist events, trending.`
    : `Structure this raw news into briefing JSON:\n\n${rawNews.slice(0, 8000)}`;

  const schema = `Return ONLY this JSON (no markdown fences, no text outside JSON):
{"date":"${date}","generatedAt":${Date.now()},"generatedBy":"github-actions","model":"${useSearch?'claude-search':'gemini+claude'}",
"headlines":[{"id":"h1","cat":"일본","title":"헤드라인","summary":"2문장 요약.","detail":"3-4문장 분석.","implications":"PE/RE 투자 관점.","source":"Nikkei Asia","url":"https://..."}],
"market":{"jgb10y":{"v":"1.52%","d":"+3bp","t":1},"usdjpy":{"v":"148.2","d":"-0.4","t":-1},"nikkei":{"v":"38,450","d":"+0.4%","t":1},"sp500":{"v":"5,680","d":"-0.2%","t":-1},"wti":{"v":"$72.4","d":"-0.8%","t":-1},"usdkrw":{"v":"1,340","d":"+2","t":-1}},
"deals":[{"id":"d1","title":"딜 제목","value":"$Xbn","type":"카브아웃","summary":"구조와 왜 지금.","source":"Bloomberg","url":"https://..."}],
"watch":[{"n":1,"text":"관전포인트1"},{"n":2,"text":"관전포인트2"},{"n":3,"text":"관전포인트3"}]}

Include 14-20 headlines across ALL categories. Include 4-8 deals (be generous). t=1 up, -1 down, 0 flat.`;

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
${rawNews ? `News:\n${rawNews.slice(0, 6000)}` : 'Search for top news for Japan PE/RE investor.'}
Return ONLY JSON: {"date":"${date}","generatedAt":${Date.now()},"generatedBy":"github-actions","model":"gemini+gpt4o","headlines":[{"id":"h1","cat":"일본","title":"Korean title","summary":"Korean summary","detail":"Korean detail","implications":"PE/RE angle","source":"Source","url":"https://url"}],"market":{"jgb10y":{"v":"—","d":"—","t":0},"usdjpy":{"v":"—","d":"—","t":0},"nikkei":{"v":"—","d":"—","t":0},"sp500":{"v":"—","d":"—","t":0},"wti":{"v":"—","d":"—","t":0},"usdkrw":{"v":"—","d":"—","t":0}},"deals":[{"id":"d1","title":"Deal","value":"$Xbn","type":"M&A","summary":"Summary","source":"Source","url":"https://url"}],"watch":[{"n":1,"text":"Watch1"},{"n":2,"text":"Watch2"},{"n":3,"text":"Watch3"}]}
14-18 headlines, 4-8 deals. Categories: 글로벌|일본|미국|아시아|매크로|딜|화제|한국`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: 'gpt-4o', max_tokens: 5000, messages: [{ role: 'user', content: prompt }] })
  });
  if (!res.ok) throw new Error(`OpenAI: ${res.status}`);
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

async function main() {
  let rawNews = null, briefing = null;
  try { rawNews = await fetchNewsWithGemini(TODAY); } catch(e) { console.warn(`⚠ Gemini: ${e.message}`); }
  try { briefing = await structureWithClaude(rawNews, TODAY, !rawNews); } catch(e) { console.warn(`⚠ Claude: ${e.message}`); }
  if (!briefing) { try { briefing = await structureWithOpenAI(rawNews, TODAY); } catch(e) { console.error(`✗ OpenAI: ${e.message}`); } }
  if (!briefing) { console.error('✗ All failed'); process.exit(1); }
  briefing.date = TODAY;
  briefing.generatedAt = briefing.generatedAt || Date.now();
  briefing.serverGenerated = true;
  addSpecialTopic(TODAY, briefing);
  save(TODAY, briefing);
  const cats = [...new Set(briefing.headlines?.map(h=>h.cat)||[])];
  console.log(`\n✓ Done! ${briefing.headlines?.length||0} headlines, ${briefing.deals?.length||0} deals`);
  console.log(`  Categories: ${cats.join(', ')}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
