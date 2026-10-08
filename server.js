// Run Kasi Markets on your own computer or server: `npm start` (Node 18+).
// Serves the pages in public/ and the same API that runs on Netlify, saving content to a JSON file.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handle } from "./lib/core.js";
import { fileStorage } from "./lib/storage.js";
import { config } from "./lib/config.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, "public");
const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = process.env.DATA_FILE || path.join(ROOT, "data", "kasi-db.json");

const storage = fileStorage(DATA_FILE);
if (process.argv.includes("--reset")) {
  storage.reset();
  console.log("All content and accounts deleted. Run `npm start` to begin again with fresh starter content.");
  process.exit(0);
}

const options = {
  allowGeneratedAdmin: true,
  onAdminCreated(email, password) {
    console.log("\n  First admin account created");
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log("  Sign in at /newsroom and change the password under Settings.\n");
  },
};

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".json": "application/json", ".webmanifest": "application/manifest+json", ".txt": "text/plain; charset=utf-8" };
// Same security headers as netlify.toml
const SECURITY = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; script-src 'self'; frame-ancestors 'none'",
};

function serveStatic(req, res, pathname) {
  const file = pathname === "/" ? "/index.html" : pathname === "/newsroom" ? "/newsroom.html" : pathname;
  const full = path.normalize(path.join(PUBLIC, decodeURIComponent(file)));
  if (!full.startsWith(PUBLIC + path.sep)) { res.writeHead(404); return res.end("Not found"); }
  fs.readFile(full, (e, buf) => {
    if (e) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("Page not found"); }
    const ext = path.extname(full);
    res.writeHead(200, { ...SECURITY, "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=300" });
    res.end(req.method === "HEAD" ? undefined : buf);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/") || url.pathname === "/rss.xml") {
    const chunks = []; let size = 0;
    req.on("data", c => { size += c.length; if (size <= 70 * 1024) chunks.push(c); });
    req.on("end", async () => {
      const proto = req.headers["x-forwarded-proto"] || "http";
      const out = await handle({
        method: req.method,
        path: url.pathname,
        query: url.searchParams,
        headers: { get: n => req.headers[n.toLowerCase()] },
        body: Buffer.concat(chunks).toString("utf8"),
        ip: String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim(),
        secure: proto === "https",
        origin: `${proto}://${req.headers.host}`,
      }, storage, options);
      res.writeHead(out.status, { ...SECURITY, ...out.headers });
      res.end(out.body);
    });
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405); return res.end(); }
  serveStatic(req, res, url.pathname);
});

// Create the first admin and starter content straight away, so the password prints on start-up.
handle({ method: "GET", path: "/api/health", query: new URLSearchParams(), headers: { get: () => "" }, body: "", ip: "local", secure: false, origin: "" }, storage, options).then(() => {
  server.listen(PORT, () => {
    console.log(`${config.siteName} is running`);
    console.log(`  Live site: http://localhost:${PORT}`);
    console.log(`  Newsroom:  http://localhost:${PORT}/newsroom`);
  });
});
