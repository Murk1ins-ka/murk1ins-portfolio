const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
http.createServer((req,res)=>{
 if(req.url==='/favicon.ico'){res.writeHead(204);res.end();return;}
 res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');
 if(req.url.startsWith('/mobile')){const url=new URL(req.url,'http://localhost'),view=['street','vapor','salon','portfolio'].includes(url.searchParams.get('view'))?url.searchParams.get('view'):'street',width=url.searchParams.get('width')==='320'?320:390;res.end(`<html><head><title>Mobile preview</title></head><body style="margin:0;background:#b1b3b5"><iframe title="Mobile preview" src="/page#${view}" style="border:0;width:${width}px;height:890px"></iframe></body></html>`);return;}
 res.end(fs.readFileSync(path.join(__dirname,'v4-preview.html')));
}).listen(4175,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4175'));
