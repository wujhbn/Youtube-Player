import type { VercelRequest, VercelResponse } from '@vercel/node';
import ytSearch from 'yt-search';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const q = req.query.q;
    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Missing q parameter" });
    }
    
    const r = await ytSearch(q);
    const videos = r.videos.slice(0, 10).map(v => ({
      videoId: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail,
      author: v.author.name
    }));
    
    res.status(200).json(videos);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
