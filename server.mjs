import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const indexPath = path.join(distDir, 'index.html');
const port = Number(process.env.PORT || 4173);

const mimeByExt = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
};

const safeJoin = (baseDir, requestPath) => {
  const normalized = path.normalize(requestPath).replace(/^(\.\.[\\/])+/, '');
  return path.join(baseDir, normalized);
};

const sendFile = async (res, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeByExt[ext] ?? 'application/octet-stream';
  const content = await readFile(filePath);
  const isHtml = ext === '.html';
  const cacheControl = isHtml
    ? 'no-store, no-cache, must-revalidate'
    : 'public, max-age=31536000, immutable';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': cacheControl,
  });
  res.end(content);
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const requestedPath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const filePath = safeJoin(distDir, requestedPath);

    if (!filePath.startsWith(distDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    try {
      const fileInfo = await stat(filePath);
      if (fileInfo.isFile()) {
        await sendFile(res, filePath);
        return;
      }
    } catch {
      // SPA fallback to index.html
    }

    await sendFile(res, indexPath);
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});
