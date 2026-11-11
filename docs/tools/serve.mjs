// A small static file server for running the site on your own machine. It needs nothing installed but Node.
// Usage: node tools/serve.mjs [folder] [port]      (npm start serves the source as it is on port 8000; npm run preview serves dist/ on 8001)
// It answers only on this machine (127.0.0.1) and serves only files inside the folder it was given.
// Served from source, the gallery asks once for atlas.json, a file only the build makes: that one "not found" is expected.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', process.argv[2] || '.');
const port = Number(process.argv[3] || process.env.PORT || 8000);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.wav': 'audio/wav', '.mp3': 'audio/mpeg',
};
if (!fs.existsSync(root)) { console.error(`there is no folder ${root}` + (process.argv[2] === 'dist' ? ' yet: run "npm run build" first' : '')); process.exit(1); }
const server = http.createServer((req, res) => {
  const say = (code, text) => { res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(text); };
  let url, rel;
  try { url = new URL(req.url, 'http://localhost'); rel = decodeURIComponent(url.pathname); } catch (e) { return say(400, 'bad request'); }
  if (rel.includes('\0')) return say(400, 'bad request');
  let file = path.join(root, rel);
  if (file !== root && !file.startsWith(root + path.sep)) return say(403, 'forbidden');
  fs.stat(file, (err, st) => {
    if (!err && st.isDirectory()) {
      // a folder is its index.html; without the closing slash the page's relative addresses would point one level too high
      if (!rel.endsWith('/')) { res.writeHead(301, { Location: url.pathname + '/' + url.search }); return res.end(); }
      file = path.join(file, 'index.html');
    }
    // Saved films can be large. Stream them and honor a single byte range so
    // browser playback/seeking never loads the entire movie into server memory.
    const ext = path.extname(file).toLowerCase();
    if (['.mp4', '.webm', '.wav', '.mp3'].includes(ext)) {
      fs.stat(file, (error, media) => {
        if (error || !media.isFile()) return say(404, 'not found');
        const headers = { 'Content-Type': TYPES[ext], 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
        if (media.size === 0) {
          res.writeHead(req.headers.range ? 416 : 200, req.headers.range ? { 'Content-Range': 'bytes */0' } : { ...headers, 'Content-Length': 0 });
          res.end(); return;
        }
        let start = 0, end = media.size - 1, status = 200;
        if (req.headers.range) {
          const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
          if (!match || (!match[1] && !match[2])) { res.writeHead(416, { 'Content-Range': `bytes */${media.size}` }); res.end(); return; }
          if (!match[1]) { start = Math.max(0, media.size - Number(match[2])); }
          else { start = Number(match[1]); if (match[2]) end = Math.min(end, Number(match[2])); }
          if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= media.size || start < 0) {
            res.writeHead(416, { 'Content-Range': `bytes */${media.size}` }); res.end(); return;
          }
          status = 206; headers['Content-Range'] = `bytes ${start}-${end}/${media.size}`;
        }
        headers['Content-Length'] = end - start + 1;
        res.writeHead(status, headers);
        if (req.method === 'HEAD') { res.end(); return; }
        const stream = fs.createReadStream(file, { start, end });
        stream.on('error', () => res.destroy());
        res.on('close', () => stream.destroy());
        stream.pipe(res);
      });
      return;
    }
    fs.readFile(file, (e2, body) => {
      if (e2) return say(404, 'not found');
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : body);
    });
  });
});
server.on('error', (e) => { console.error(e.code === 'EADDRINUSE' ? `port ${port} is in use (is another copy of this server still running?): try "node tools/serve.mjs ${process.argv[2] || '.'} ${port + 10}"` : String(e)); process.exit(1); });
server.listen(port, '127.0.0.1', () => console.log(`Portals is running at http://localhost:${port}/   (Ctrl+C stops it)`));
