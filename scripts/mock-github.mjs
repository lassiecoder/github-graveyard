// A tiny stand-in for api.github.com so screenshots are deterministic and need no token.
// The app reaches it through the env-gated GRAVEYARD_GITHUB_API_URL override in lib/github.ts.
// Any login gets the same fixed set of repos, all pushed years ago so they all count as dead.
import { createServer } from 'node:http';

const repo = (name, o) => ({
  name,
  description: null,
  html_url: `https://github.com/mock/${name}`,
  fork: false,
  archived: false,
  created_at: '2021-03-01T00:00:00Z',
  pushed_at: '2021-03-20T00:00:00Z',
  stargazers_count: 0,
  language: 'TypeScript',
  size: 120,
  open_issues_count: 0,
  topics: [],
  ...o,
});

const REPOS = [
  repo('todo-app-v3', { description: 'A todo app, third attempt', stargazers_count: 412, created_at: '2022-02-01T00:00:00Z', pushed_at: '2023-03-14T00:00:00Z' }),
  repo('uber-for-dogs', { language: 'JavaScript', created_at: '2021-06-01T00:00:00Z', pushed_at: '2021-06-02T00:00:00Z', stargazers_count: 3 }),
  repo('rust-rewrite', { language: 'Rust', stargazers_count: 1480, created_at: '2023-01-10T00:00:00Z', pushed_at: '2023-02-01T00:00:00Z', open_issues_count: 31 }),
  repo('gpt-wrapper', { description: 'chatbot over openai', language: 'Python', stargazers_count: 57, created_at: '2023-04-01T00:00:00Z', pushed_at: '2023-04-30T00:00:00Z' }),
  repo('old-portfolio', { description: 'my portfolio site', language: 'HTML', archived: true, created_at: '2019-09-01T00:00:00Z', pushed_at: '2020-01-15T00:00:00Z' }),
  repo('dotfiles', { language: 'Shell', stargazers_count: 9, created_at: '2020-05-01T00:00:00Z', pushed_at: '2022-08-01T00:00:00Z' }),
];

const avatarSvg = (login) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="#556"/><text x="80" y="100" font-size="72" text-anchor="middle" fill="#fff" font-family="sans-serif">${login[0].toUpperCase()}</text></svg>`;

/** Starts the mock on `port` (0 = any free port) and resolves to { url, close }. */
export function startMockGithub(port = 0) {
  let url = '';
  const server = createServer((req, res) => {
    const { pathname } = new URL(req.url, 'http://x');
    const json = (status, body) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    };
    let m;
    if ((m = pathname.match(/^\/avatars\/([^/]+)\.svg$/))) {
      res.writeHead(200, { 'content-type': 'image/svg+xml' });
      return res.end(avatarSvg(decodeURIComponent(m[1])));
    }
    if ((m = pathname.match(/^\/users\/([^/]+)\/repos$/))) {
      const page = Number(new URL(req.url, 'http://x').searchParams.get('page') ?? 1);
      return json(200, page === 1 ? REPOS : []);
    }
    if ((m = pathname.match(/^\/users\/([^/]+)$/))) {
      const login = decodeURIComponent(m[1]);
      return json(200, {
        login,
        name: `${login[0].toUpperCase()}${login.slice(1)} Mock`,
        avatar_url: `${url}/avatars/${login}.svg`,
        html_url: `https://github.com/${login}`,
        public_repos: REPOS.length,
      });
    }
    if (pathname.startsWith('/repos/')) return json(200, { stargazers_count: 123 });
    json(404, { message: 'Not Found' });
  });
  return new Promise((ok) =>
    server.listen(port, '127.0.0.1', () => {
      url = `http://127.0.0.1:${server.address().port}`;
      ok({ url, close: () => server.close() });
    }),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { url } = await startMockGithub(Number(process.env.PORT ?? 4010));
  console.log(`mock GitHub API on ${url}`);
}
