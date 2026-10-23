// منهي TLS أمام next start: الكعكات الآمنة (Secure) لا تُرسل عبر http،
// فالاختبار يجب أن يجري على https وإلا اختبرنا شيئاً غير ما يُنشَر.
import { createServer } from 'node:https';
import { request } from 'node:http';
import { readFileSync } from 'node:fs';

const certDir = process.env.TLS_DIR ?? new URL('.', import.meta.url).pathname;
const server = createServer(
  { key: readFileSync(`${certDir}/key.pem`), cert: readFileSync(`${certDir}/cert.pem`) },
  (req, res) => {
    const upstream = request(
      { host: '127.0.0.1', port: 3100, path: req.url, method: req.method, headers: { ...req.headers, host: 'localhost:3443', 'x-forwarded-host': 'localhost:3443', 'x-forwarded-proto': 'https' } },
      (up) => {
        res.writeHead(up.statusCode ?? 502, up.headers);
        up.pipe(res);
      },
    );
    upstream.on('error', (error) => {
      res.writeHead(502).end(String(error));
    });
    req.pipe(upstream);
  },
);
server.listen(3443, '127.0.0.1', () => console.log('tls proxy on 3443'));
