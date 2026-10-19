const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const html = path.join(__dirname,'index.html');
http.createServer((req,res) => {
  if (req.url === '/favicon.ico') { res.writeHead(204); res.end(); return; }
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  res.end(fs.readFileSync(html));
}).listen(4173,'127.0.0.1',() => console.log('Local: http://127.0.0.1:4173'));
