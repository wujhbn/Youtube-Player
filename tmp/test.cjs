const test = async () => { try { const ytSearch = (await import('yt-search')).default; const r = await ytSearch('cat'); console.log(r.videos[0].title); } catch (e) { console.error(e); } }; test();
