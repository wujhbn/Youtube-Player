const ytSearch = require('yt-search');
ytSearch('cat').then(r => console.log('SUCCESS:', r.videos[0].title)).catch(e => console.error('FAIL:', e));
