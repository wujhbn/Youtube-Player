import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).json({ error: "Missing url parameter" });
    }
    
    // Server-side fetch to avoid CORS in browser
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error("Failed to fetch info from noembed");
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    
    res.status(200).json({
      title: data.title,
      thumbnail: data.thumbnail_url
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
