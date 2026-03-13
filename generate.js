// generate.js — Daily Brief Generator
// Runs on GitHub Actions at 4:30 AM JST
// Step 1: Gemini Flash fetches today's news (free, Google Search grounding)
// Step 2: Claude or OpenAI structures into briefing JSON
// Output: data/briefing-YYYY-MM-DD.json + data/latest.json

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const GEMINI_KEY  = process.env.GEMINI_API_KEY;
const CLAUDE_KEY  = process.env.CLAUDE_API_KEY;
const OPENAI_KEY  = process.env.OPENAI_API_KEY;

// JST date (UTC+9)
function jstDate() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

function jstDateLabel(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });
}

const TODAY = jstDate();
console.log(`\n=== Daily Brief Generator ===`);
console.log(`Target date: ${TODAY} (JST)`);
console.log(`Run time: ${new Date().toISOString()}`);
console.log(`APIs: Gemini=${!!GEMINI_KEY} Claude=${!!CLAUDE_KEY} OpenAI=${!!OPENAI_KEY}\n`);

// ── STEP 1: GEMINI NEWS FETCH ─────────────────────────────────────────────────
async function fetchNewsWithGemini(date) {
  if (!GEMINI_KEY) {
    console.log('No Gemini key — skipping to Claude web search');
    return null;
  }

  console.log('Step 1: Fetching news with Gemini Flash + Google Search...');

  const prompt = `Today is ${date} (JST). You are collecting morning news for a Japan-focused PE/Real Estate investor.

Search for and collect the following:

JAPAN (priority):
- BOJ policy signals, JGB yields, JPY moves
- Nikkei/TOPIX market open and direction
- Japan morning newspaper headlines (Nikkei, Sankei, Yomiuri)
- J-REIT activity, real estate transactions
- Corporate PE deals, TOB/MBO activity
- Japan economic data releases today
- Major Japanese corporate news

US/GLOBAL (overnight events):
- S&P500, Nasdaq close (previous session)
- Fed speakers / FOMC signals
- Key US economic data
- Major geopolitical developments
- Oil, gold, crypto movements

ASIA:
- China economic/policy news
- Korea market news
- SE Asia business developments

MACRO:
- Interest rate developments globally
- Inflation data
- Currency market moves

DEALS & PE:
- Any significant M&A, PE buyouts, carve-outs announced

TRENDING:
- 1-2 must-know cultural or social news items

For each story provide: headline in Korean, category, 2-sentence summary, source name and URL.
Also provide current market levels: JGB 10Y, USD/JPY, Nikkei, S&P500, WTI, USD/KRW.

Write clearly. Include 15-20 stories. Be specific with numbers.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
      })
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${err.error?.message || res.status}`);
  }

  const json = await res.json();
  const parts = json.candidates?.[0]?.content?.parts || [];
  const text = parts.filter(p => p.text).map(p => p.text).join('\n');

  if (!text) throw new Error('Gemini returned empty response');
  console.log(`  ✓ Gemini fetched ~${text.length} chars of news`);
  return text;
}

// ── STEP 2: STRUCTURE WITH CLAUDE ────────────────────────────────────────────
async function structureWithClaude(rawNews, date, useWebSearch = false) {
  if (!CLAUDE_KEY) return null;

  console.log(`Step 2: Structuring with Claude${useWebSearch ? ' (with web search)' : ''}...`);

  const prompt = `${useWebSearch
    ? `Search the web for today's (${date} JST) top news stories for a Japan PE/Real Estate investor. Find: Japan morning papers, BOJ/JGB news, J-REIT activity, US overnight market close, global macro, major deals.`
    : `Structure this raw news data into a clean investment briefing JSON.

Raw news from Gemini (${date} JST):
---
${rawNews.slice(0, 7000)}
---`
  }

Return ONLY valid JSON (absolutely no markdown fences, no explanation text before or after):
{
  "date": "${date}",
  "generatedAt": ${Date.now()},
  "generatedBy": "github-actions",
  "model": "${useWebSearch ? 'claude-search' : 'gemini+claude'}",
  "headlines": [
    {
      "id": "h1",
      "cat": "일본",
      "title": "헤드라인 (최대 55자)",
      "summary": "2문장 한국어 요약",
      "detail": "3-4문장 한국어 분석",
      "implications": "PE/부동산 투자 관점 임플리케이션 (한국어)",
      "source": "Nikkei Asia",
      "url": "https://asia.nikkei.com/..."
    }
  ],
  "market": {
    "jgb10y":  { "v": "1.52%",  "d": "+3bp",  "t": 1  },
    "usdjpy":  { "v": "148.2",  "d": "-0.4",  "t": -1 },
    "nikkei":  { "v": "38,450", "d": "+0.4%", "t": 1  },
    "sp500":   { "v": "5,680",  "d": "-0.2%", "t": -1 },
    "wti":     { "v": "$72.4",  "d": "-0.8%", "t": -1 },
    "usdkrw":  { "v": "1,340",  "d": "+2",    "t": -1 }
  },
  "deals": [
    {
      "id": "d1",
      "title": "딜 제목",
      "value": "JPY Xbn",
      "type": "카브아웃",
      "summary": "2-3줄 한국어 요약",
      "source": "Nikkei Asia",
      "url": "https://..."
    }
  ],
  "watch": [
    { "n": 1, "text": "오늘 주목할 포인트 #1 (한국어)" },
    { "n": 2, "text": "오늘 주목할 포인트 #2" },
    { "n": 3, "text": "오늘 주목할 포인트 #3" }
  ]
}

Categories for headlines: 글로벌 | 일본 | 미국 | 아시아 | 매크로 | 딜 | 화제
Include 12-16 headlines across all categories. Include 2-6 deals. t: 1=up, -1=down, 0=flat.
Use real URLs from the news sources. Market values should reflect actual current levels.`;

  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 5000,
    messages: [{ role: 'user', content: prompt }]
  };
  if (useWebSearch) {
    body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Claude API error: ${err.error?.message || res.status}`);
  }

  const json = await res.json();
  const text = json.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  console.log(`  ✓ Claude structured ~${text.length} chars`);
  return parseJSON(text);
}

// ── FALLBACK: OPENAI ──────────────────────────────────────────────────────────
async function structureWithOpenAI(rawNews, date) {
  if (!OPENAI_KEY) return null;

  console.log('Step 2 (fallback): Structuring with OpenAI GPT-4o...');

  const prompt = rawNews
    ? `Structure this news into a daily investment brief JSON for ${date}.\n\nNews:\n${rawNews.slice(0, 6000)}\n\nReturn ONLY JSON in this exact format: {"date":"${date}","generatedAt":${Date.now()},"generatedBy":"github-actions","model":"gemini+gpt4o","headlines":[{"id":"h1","cat":"일본","title":"...","summary":"...","detail":"...","implications":"...","source":"...","url":"..."}],"market":{"jgb10y":{"v":"—","d":"—","t":0},"usdjpy":{"v":"—","d":"—","t":0},"nikkei":{"v":"—","d":"—","t":0},"sp500":{"v":"—","d":"—","t":0},"wti":{"v":"—","d":"—","t":0},"usdkrw":{"v":"—","d":"—","t":0}},"deals":[],"watch":[{"n":1,"text":"..."},{"n":2,"text":"..."},{"n":3,"text":"..."}]}`
    : `Search for today's top news (${date} JST) for a Japan PE investor and return a JSON briefing.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 5000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const json = await res.json();
  const text = json.choices[0].message.content;
  console.log(`  ✓ OpenAI structured ~${text.length} chars`);
  return parseJSON(text);
}

// ── JSON PARSER ───────────────────────────────────────────────────────────────
function parseJSON(text) {
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const s = clean.indexOf('{');
  const e = clean.lastIndexOf('}');
  if (s === -1) throw new Error('No JSON object found in response');
  return JSON.parse(clean.slice(s, e + 1));
}

// ── SAVE TO FILE ──────────────────────────────────────────────────────────────
function saveBriefing(date, data) {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Save dated file
  const dated = path.join(dir, `briefing-${date}.json`);
  fs.writeFileSync(dated, JSON.stringify(data, null, 2));
  console.log(`  ✓ Saved: data/briefing-${date}.json`);

  // Save latest.json (app reads this on open)
  const latest = path.join(dir, 'latest.json');
  fs.writeFileSync(latest, JSON.stringify(data, null, 2));
  console.log(`  ✓ Saved: data/latest.json`);

  // Save index of all available dates
  const files = fs.readdirSync(dir).filter(f => f.match(/^briefing-\d{4}-\d{2}-\d{2}\.json$/));
  const dates = files.map(f => f.replace('briefing-','').replace('.json','')).sort().reverse();
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify({ dates, updatedAt: Date.now() }, null, 2));
  console.log(`  ✓ Index updated: ${dates.length} dates`);
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  let rawNews = null;
  let briefing = null;

  try {
    // Step 1: Gemini news fetch
    rawNews = await fetchNewsWithGemini(TODAY);
  } catch (e) {
    console.warn(`  ⚠ Gemini failed: ${e.message}`);
  }

  try {
    // Step 2a: Claude structure (with web search if no Gemini data)
    briefing = await structureWithClaude(rawNews, TODAY, !rawNews);
  } catch (e) {
    console.warn(`  ⚠ Claude failed: ${e.message}`);
  }

  if (!briefing) {
    try {
      // Step 2b: OpenAI fallback
      briefing = await structureWithOpenAI(rawNews, TODAY);
    } catch (e) {
      console.error(`  ✗ OpenAI failed: ${e.message}`);
    }
  }

  if (!briefing) {
    console.error('\n✗ All APIs failed. No briefing generated.');
    process.exit(1);
  }

  // Ensure required fields
  briefing.date = TODAY;
  briefing.generatedAt = briefing.generatedAt || Date.now();
  briefing.serverGenerated = true;

  saveBriefing(TODAY, briefing);

  console.log(`\n✓ Done! ${briefing.headlines?.length || 0} headlines, ${briefing.deals?.length || 0} deals`);
  console.log(`  Date: ${TODAY} | Model: ${briefing.model}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
