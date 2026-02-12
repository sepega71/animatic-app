import http from 'node:http';

const PORT = Number(process.env.PORT || 8787);
const TARGET_URL = 'https://betlab.club/live';

const sanitize = (value) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.replace(/\s+/g, ' ').trim();
  return trimmed || undefined;
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

function normalizeMatches(payload) {
  const variants = [
    payload?.props?.pageProps?.matches,
    payload?.props?.pageProps?.events,
    payload?.matches,
    payload?.events,
    payload?.data?.matches,
    payload?.state?.matches,
  ];

  const rawMatches = variants.find((item) => Array.isArray(item)) ?? [];

  return rawMatches.map((item, index) => ({
    id: String(item.id ?? `${item.homeTeam ?? 'home'}-${item.awayTeam ?? 'away'}-${index}`),
    league: sanitize(item.league ?? item.tournament ?? item.championship ?? 'Неизвестная лига'),
    homeTeam: sanitize(item.homeTeam ?? item.home?.name ?? item.team1?.name ?? 'Home'),
    awayTeam: sanitize(item.awayTeam ?? item.away?.name ?? item.team2?.name ?? 'Away'),
    homeScore: Number(item.homeScore ?? item.score?.home ?? item.score1 ?? 0),
    awayScore: Number(item.awayScore ?? item.score?.away ?? item.score2 ?? 0),
    minute: sanitize(item.minute ?? item.timer ?? item.time ?? 'LIVE'),
    status: sanitize(item.status ?? 'LIVE'),
    startTime: sanitize(item.startTime ?? item.kickoff),
    homeStats: {
      possession: sanitize(item.stats?.home?.possession),
      shotsOnTarget: sanitize(item.stats?.home?.shotsOnTarget),
      shotsOffTarget: sanitize(item.stats?.home?.shotsOffTarget),
      corners: sanitize(item.stats?.home?.corners),
      yellowCards: sanitize(item.stats?.home?.yellowCards),
      redCards: sanitize(item.stats?.home?.redCards),
      dangerousAttacks: sanitize(item.stats?.home?.dangerousAttacks),
      attacks: sanitize(item.stats?.home?.attacks),
    },
    awayStats: {
      possession: sanitize(item.stats?.away?.possession),
      shotsOnTarget: sanitize(item.stats?.away?.shotsOnTarget),
      shotsOffTarget: sanitize(item.stats?.away?.shotsOffTarget),
      corners: sanitize(item.stats?.away?.corners),
      yellowCards: sanitize(item.stats?.away?.yellowCards),
      redCards: sanitize(item.stats?.away?.redCards),
      dangerousAttacks: sanitize(item.stats?.away?.dangerousAttacks),
      attacks: sanitize(item.stats?.away?.attacks),
    },
  }));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,OPTIONS',
  });
  res.end(JSON.stringify(payload));
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

  if (req.method === 'GET' && req.url.startsWith('/api/live')) {
    try {
      const response = await fetch(TARGET_URL, {
        headers: {
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          accept: 'text/html,application/xhtml+xml',
        },
      });

      if (!response.ok) {
        throw new Error(`Target responded with ${response.status}`);
      }

      const html = await response.text();
      const payload = extractJsonPayload(html);
      const matches = normalizeMatches(payload);

      sendJson(res, 200, {
        fetchedAt: new Date().toISOString(),
        source: TARGET_URL,
        count: matches.length,
        matches,
      });
      return;
    } catch (error) {
      const details = error instanceof Error ? error.message : 'Unknown parser error';
      sendJson(res, 502, {
        error: 'Failed to parse target website in real time',
        details,
        source: TARGET_URL,
      });
      return;
    }
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Live parser server running on http://localhost:${PORT}`);
});
