const ytSearch = require('yt-search');
ytSearch('cat').then(r => console.log(r.videos[0].title)).catch(console.error);
