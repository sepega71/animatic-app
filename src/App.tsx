import { useCallback, useEffect, useMemo, useState } from 'react';

export type DemoShape = 'square' | 'circle' | 'text';

type TeamStats = {
  possession?: string;
  shotsOnTarget?: string;
  shotsOffTarget?: string;
  corners?: string;
  yellowCards?: string;
  redCards?: string;
  dangerousAttacks?: string;
  attacks?: string;
};

type Match = {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: string;
  status: string;
  startTime?: string;
  homeStats?: TeamStats;
  awayStats?: TeamStats;
};

type LiveResponse = {
  fetchedAt: string;
  source: string;
  transportSource?: string;
  count: number;
  matches: Match[];
};

type ApiError = {
  error?: string;
  details?: string;
  hint?: string;
};

const API_URL = import.meta.env.VITE_LIVE_API_URL ?? '/api/live';

const fmt = (value?: string) => value ?? '—';

function App() {
  const [data, setData] = useState<LiveResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, { cache: 'no-store' });
      const text = await response.text();
      const parsed = text ? (JSON.parse(text) as LiveResponse | ApiError) : null;

      if (!response.ok) {
        const details = parsed && 'details' in parsed ? parsed.details : undefined;
        const hint = parsed && 'hint' in parsed ? parsed.hint : undefined;
        throw new Error([`HTTP ${response.status}`, details, hint].filter(Boolean).join(' · '));
      }

      setData(parsed as LiveResponse);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Неизвестная ошибка';
      setError(`Не удалось получить live-матчи: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMatches();
    const id = setInterval(() => {
      void loadMatches();
    }, 30_000);

    return () => clearInterval(id);
  }, [loadMatches]);

  const content = useMemo(() => {
    if (isLoading && !data) {
      return <p className="state">Загружаем реальные live-матчи…</p>;
    }

    if (error) {
      return (
        <div className="state error">
          <p>{error}</p>
          <p>Убедитесь, что backend запущен: <code>npm run start:api</code></p>
          <button type="button" onClick={() => void loadMatches()}>Повторить</button>
        </div>
      );
    }

    if (!data || data.matches.length === 0) {
      return <p className="state">Сейчас нет доступных онлайн матчей.</p>;
    }

    return (
      <div className="matches-grid">
        {data.matches.map((match) => (
          <article key={match.id} className="match-card">
            <header>
              <p className="league">{match.league}</p>
              <p className="minute">{match.minute} · {match.status}</p>
            </header>

            <div className="scoreboard">
              <div>
                <p className="team">{match.homeTeam}</p>
                <p className="team">{match.awayTeam}</p>
              </div>
              <div className="score">
                <p>{match.homeScore}</p>
                <p>{match.awayScore}</p>
              </div>
            </div>

            <dl className="stats-table">
              <div>
                <dt>Владение</dt>
                <dd>{fmt(match.homeStats?.possession)} : {fmt(match.awayStats?.possession)}</dd>
              </div>
              <div>
                <dt>Удары в створ</dt>
                <dd>{fmt(match.homeStats?.shotsOnTarget)} : {fmt(match.awayStats?.shotsOnTarget)}</dd>
              </div>
              <div>
                <dt>Угловые</dt>
                <dd>{fmt(match.homeStats?.corners)} : {fmt(match.awayStats?.corners)}</dd>
              </div>
              <div>
                <dt>Жёлтые карточки</dt>
                <dd>{fmt(match.homeStats?.yellowCards)} : {fmt(match.awayStats?.yellowCards)}</dd>
              </div>
            </dl>

            {match.startTime ? <p className="start-time">Старт: {match.startTime}</p> : null}
          </article>
        ))}
      </div>
    );
  }, [data, error, isLoading, loadMatches]);

  return (
    <main className="live-app">
      <div className="headline">
        <h1>Live футбол · BetLab</h1>
        <p>Реальный парсинг сайта с автообновлением каждые 30 секунд.</p>
      </div>

      <div className="actions">
        <button type="button" onClick={() => void loadMatches()} disabled={isLoading}>
          {isLoading ? 'Обновляем…' : 'Обновить'}
        </button>
        <p>{data ? `Матчей онлайн: ${data.count}` : 'Матчей онлайн: —'}</p>
      </div>

      {data?.transportSource ? <p className="source">Источник загрузки: {data.transportSource}</p> : null}

      {content}
    </main>
  );
}

export default App;
