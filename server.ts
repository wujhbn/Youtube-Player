import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth helper for iOS PWAs
  app.get("/api/auth", (req, res) => {
    // Once this route is reached, it means the proxy let it through.
    res.redirect("/");
  });

  // API Route to fetch YouTube info avoiding CORS
  app.get("/api/yt-info", async (req, res) => {
    try {
      const url = req.query.url;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Missing url parameter" });
      }

      // Fetch from YouTube oEmbed API
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch info" });
      }

      const data = await response.json();
      res.json({
        title: data.title,
        thumbnail: data.thumbnail_url,
        author: data.author_name
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/yt-search", async (req, res) => {
    try {
      const q = req.query.q;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Missing q parameter" });
      }
      
      const ytSearch = (await import("yt-search")).default;
      const r = await ytSearch(q);
      const videos = r.videos.slice(0, 10).map(v => ({
        videoId: v.videoId,
        title: v.title,
        thumbnail: v.thumbnail,
        author: v.author.name
      }));
      
      res.json(videos);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
