import http from 'node:http';

const PORT = Number(process.env.PORT || 8787);
const TARGET_URL = 'https://betlab.club/live';
const TARGET_ORIGIN = 'https://betlab.club';
const MIRROR_URL = 'https://r.jina.ai/http://betlab.club/live';

const sanitize = (value) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.replace(/\s+/g, ' ').trim();
  return trimmed || undefined;
};

const asNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim();
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const pick = (obj, ...keys) => {
  for (const key of keys) {
    if (obj && Object.hasOwn(obj, key) && obj[key] !== null && obj[key] !== undefined) {
      return obj[key];
    }
  }
  return undefined;
};

function extractJsonPayload(html) {
  const next = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (next?.[1]) {
    try {
      return JSON.parse(next[1]);
    } catch {
      return null;
    }
  }

  const patterns = [
    /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/,
    /window\.__NUXT__\s*=\s*(\{[\s\S]*?\});/,
    /window\.__NEXT_DATA__\s*=\s*(\{[\s\S]*?\});/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      try {
        return JSON.parse(match[1]);
      } catch {
        return null;
      }
    }
  }

  return null;
}

function extractScore(value) {
  if (!value) return [0, 0];
  if (Array.isArray(value) && value.length >= 2) {
    return [asNumber(value[0]), asNumber(value[1])];
  }
  if (typeof value === 'object') {
    return [
      asNumber(pick(value, 'home', 'h', 'team1', 'local')),
      asNumber(pick(value, 'away', 'a', 'team2', 'visitor')),
    ];
  }
  if (typeof value === 'string') {
    const parts = value.split(/[:\-]/).map((p) => asNumber(p));
    if (parts.length >= 2) return [parts[0], parts[1]];
  }
  return [0, 0];
}

function normalizeOneMatch(item, index) {
  const homeObj = pick(item, 'home', 'homeTeam', 'team1', 'localTeam') ?? {};
  const awayObj = pick(item, 'away', 'awayTeam', 'team2', 'visitorTeam') ?? {};

  const [scoreFromCommonHome, scoreFromCommonAway] = extractScore(pick(item, 'score', 'scores', 'currentScore'));

  const homeScore = asNumber(pick(item, 'homeScore', 'score1', 'score_home', 'goalsHome')) || scoreFromCommonHome;
  const awayScore = asNumber(pick(item, 'awayScore', 'score2', 'score_away', 'goalsAway')) || scoreFromCommonAway;

  return {
    id: String(pick(item, 'id', 'matchId', 'eventId') ?? `${sanitize(String(pick(item, 'homeTeam', 'home_name') ?? 'home'))}-${sanitize(String(pick(item, 'awayTeam', 'away_name') ?? 'away'))}-${index}`),
    league: sanitize(String(pick(item, 'league', 'tournament', 'championship', 'competition', 'liga', 'leagueName') ?? 'Неизвестная лига')),
    homeTeam: sanitize(String(pick(item, 'homeTeam', 'home_name', 'team1Name', 'home') ?? pick(homeObj, 'name', 'title', 'teamName') ?? 'Home')),
    awayTeam: sanitize(String(pick(item, 'awayTeam', 'away_name', 'team2Name', 'away') ?? pick(awayObj, 'name', 'title', 'teamName') ?? 'Away')),
    homeScore,
    awayScore,
    minute: sanitize(String(pick(item, 'minute', 'timer', 'time', 'clock', 'matchTime') ?? 'LIVE')),
    status: sanitize(String(pick(item, 'status', 'state', 'matchStatus') ?? 'LIVE')),
    startTime: sanitize(String(pick(item, 'startTime', 'kickoff', 'start_at', 'startDate') ?? '')),
    homeStats: {
      possession: sanitize(String(pick(item?.stats?.home ?? {}, 'possession', 'ballPossession') ?? pick(item, 'homePossession') ?? '')),
      shotsOnTarget: sanitize(String(pick(item?.stats?.home ?? {}, 'shotsOnTarget', 'onTarget') ?? pick(item, 'homeShotsOnTarget') ?? '')),
      shotsOffTarget: sanitize(String(pick(item?.stats?.home ?? {}, 'shotsOffTarget', 'offTarget') ?? pick(item, 'homeShotsOffTarget') ?? '')),
      corners: sanitize(String(pick(item?.stats?.home ?? {}, 'corners', 'cornerKicks') ?? pick(item, 'homeCorners') ?? '')),
      yellowCards: sanitize(String(pick(item?.stats?.home ?? {}, 'yellowCards', 'yellow') ?? pick(item, 'homeYellowCards') ?? '')),
      redCards: sanitize(String(pick(item?.stats?.home ?? {}, 'redCards', 'red') ?? pick(item, 'homeRedCards') ?? '')),
      dangerousAttacks: sanitize(String(pick(item?.stats?.home ?? {}, 'dangerousAttacks') ?? pick(item, 'homeDangerousAttacks') ?? '')),
      attacks: sanitize(String(pick(item?.stats?.home ?? {}, 'attacks') ?? pick(item, 'homeAttacks') ?? '')),
    },
    awayStats: {
      possession: sanitize(String(pick(item?.stats?.away ?? {}, 'possession', 'ballPossession') ?? pick(item, 'awayPossession') ?? '')),
      shotsOnTarget: sanitize(String(pick(item?.stats?.away ?? {}, 'shotsOnTarget', 'onTarget') ?? pick(item, 'awayShotsOnTarget') ?? '')),
      shotsOffTarget: sanitize(String(pick(item?.stats?.away ?? {}, 'shotsOffTarget', 'offTarget') ?? pick(item, 'awayShotsOffTarget') ?? '')),
      corners: sanitize(String(pick(item?.stats?.away ?? {}, 'corners', 'cornerKicks') ?? pick(item, 'awayCorners') ?? '')),
      yellowCards: sanitize(String(pick(item?.stats?.away ?? {}, 'yellowCards', 'yellow') ?? pick(item, 'awayYellowCards') ?? '')),
      redCards: sanitize(String(pick(item?.stats?.away ?? {}, 'redCards', 'red') ?? pick(item, 'awayRedCards') ?? '')),
      dangerousAttacks: sanitize(String(pick(item?.stats?.away ?? {}, 'dangerousAttacks') ?? pick(item, 'awayDangerousAttacks') ?? '')),
      attacks: sanitize(String(pick(item?.stats?.away ?? {}, 'attacks') ?? pick(item, 'awayAttacks') ?? '')),
    },
  };
}

function isLikelyMatch(item) {
  if (!item || typeof item !== 'object') return false;
  const hasTeams = ['homeTeam', 'awayTeam', 'team1', 'team2', 'home_name', 'away_name'].some((key) => item[key]);
  const hasScoreOrTime = ['score', 'scores', 'minute', 'timer', 'status', 'homeScore', 'awayScore'].some((key) => item[key] !== undefined);
  return hasTeams || hasScoreOrTime;
}

function findArraysInObject(root) {
  const queue = [root];
  const seen = new Set();
  const arrays = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') continue;
    if (seen.has(current)) continue;
    seen.add(current);

    if (Array.isArray(current)) {
      if (current.length > 0 && current.some((item) => isLikelyMatch(item))) {
        arrays.push(current);
      }
      for (const item of current) queue.push(item);
      continue;
    }

    for (const value of Object.values(current)) {
      queue.push(value);
    }
  }

  return arrays;
}

function normalizeMatches(payload) {
  if (!payload || typeof payload !== 'object') return [];

  const candidates = [
    pick(payload, 'matches', 'events', 'games', 'live', 'fixtures'),
    payload?.props?.pageProps?.matches,
    payload?.props?.pageProps?.events,
    payload?.data?.matches,
    payload?.state?.matches,
    ...findArraysInObject(payload),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (!Array.isArray(candidate) || candidate.length === 0) continue;
    const normalized = candidate
      .filter((item) => typeof item === 'object' && item)
      .map((item, index) => normalizeOneMatch(item, index))
      .filter((item) => item.homeTeam && item.awayTeam);

    if (normalized.length > 0) {
      return normalized;
    }
  }

  return [];
}

function extractCandidateJsonUrls(html) {
  const urls = new Set();

  const direct = html.matchAll(/https?:\/\/[^"'\s)]+/g);
  for (const match of direct) {
    urls.add(match[0]);
  }

  const rel = html.matchAll(/(["'])(\/[^"'\s]+(?:api|json|match|event|live)[^"'\s]*)\1/gi);
  for (const match of rel) {
    try {
      urls.add(new URL(match[2], TARGET_ORIGIN).toString());
    } catch {
      // ignore malformed URL
    }
  }

  return [...urls]
    .filter((url) => /api|json|match|event|live|score/i.test(url))
    .filter((url) => !url.includes('google') && !url.includes('gstatic') && !url.includes('facebook'))
    .slice(0, 25);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      accept: 'application/json,text/plain,*/*',
      referer: TARGET_URL,
      origin: TARGET_ORIGIN,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const type = response.headers.get('content-type') ?? '';
  if (!/json|javascript|text\/plain/i.test(type)) {
    throw new Error(`Unsupported content-type: ${type}`);
  }

  const raw = await response.text();
  return JSON.parse(raw);
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      accept: 'text/html,application/xhtml+xml',
      'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      pragma: 'no-cache',
      'cache-control': 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }

  return response.text();
}

async function loadSourceHtml() {
  const attempts = [];

  for (const url of [TARGET_URL, MIRROR_URL]) {
    try {
      const html = await fetchHtml(url);
      return { html, usedUrl: url, attempts };
    } catch (error) {
      attempts.push(`${url} -> ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  throw new Error(attempts.join(' | '));
}

async function parseFromHtmlAndLinkedApis(html, debug) {
  const payload = extractJsonPayload(html);
  const directMatches = normalizeMatches(payload);
  if (directMatches.length > 0) {
    debug.push('matches extracted from inline JSON state');
    return directMatches;
  }

  const candidates = extractCandidateJsonUrls(html);
  debug.push(`inline JSON state empty, probing API urls: ${candidates.length}`);

  for (const url of candidates) {
    try {
      const json = await fetchJson(url);
      const matches = normalizeMatches(json);
      if (matches.length > 0) {
        debug.push(`matches extracted from API: ${url}`);
        return matches;
      }
      debug.push(`API has no match-like data: ${url}`);
    } catch (error) {
      debug.push(`API probe failed: ${url} -> ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  return [];
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,OPTIONS',
      'access-control-allow-headers': 'content-type',
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/api/health')) {
    sendJson(res, 200, { ok: true, service: 'live-proxy', target: TARGET_URL });
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/api/live')) {
    try {
      const debug = [];
      const { html, usedUrl, attempts } = await loadSourceHtml();
      const matches = await parseFromHtmlAndLinkedApis(html, debug);

      if (matches.length === 0) {
        throw new Error('HTML получен, но не найдены данные матчей ни во встроенном JSON, ни в API-эндпоинтах страницы');
      }

      sendJson(res, 200, {
        fetchedAt: new Date().toISOString(),
        source: TARGET_URL,
        transportSource: usedUrl,
        count: matches.length,
        matches,
        attempts,
        debug,
      });
      return;
    } catch (error) {
      const details = error instanceof Error ? error.message : 'Unknown parser error';
      sendJson(res, 502, {
        error: 'Failed to parse target website in real time',
        details,
        source: TARGET_URL,
        hint: 'Проверьте доступность betlab.club и api-эндпоинтов betlab.club с вашего сервера. Если блокируется — используйте сервер/VPS с другим IP или прокси.',
      });
      return;
    }
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Live parser server running on http://localhost:${PORT}`);
});
