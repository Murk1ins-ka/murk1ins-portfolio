const fs=require('node:fs');
const p='work/v4-salon-copy.json';const c=JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));c.atelierBookingTitle=c.atelierBookingTitle.map(s=>s.replace('<br><em>','<br> <em>'));fs.writeFileSync(p,JSON.stringify(c,null,2));
