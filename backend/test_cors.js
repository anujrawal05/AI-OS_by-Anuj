const https = require('https');

const options = {
  hostname: '1bb9f9edd43cef.lhr.life',
  port: 443,
  path: '/api/auth/signup',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://ai-os-powerd-by-ar-labs.vercel.app',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type'
  }
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
});

req.on('error', (e) => {
  console.error('Request Error:', e);
});

req.end();
