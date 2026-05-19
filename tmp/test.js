const https = require('https');
https.get('https://ais-pre-ckct6lmj7pbmjk2xfoo4ci-674681889592.asia-east1.run.app/', (res) => {
  console.log('statusCode:', res.statusCode);
  res.on('data', (d) => process.stdout.write(d));
}).on('error', (e) => console.error(e));
