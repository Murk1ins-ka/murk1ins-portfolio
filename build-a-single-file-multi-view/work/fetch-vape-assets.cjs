const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'assets-v4','vape');
fs.mkdirSync(root,{recursive:true});
async function get(url,file){const r=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error(`${r.status} ${url}`);const b=Buffer.from(await r.arrayBuffer());fs.writeFileSync(path.join(root,file),b);console.log(file,b.length);return b.toString();}
(async()=>{await Promise.allSettled([
 get('https://store.vaporesso.com/products/xros-4-mini.js','xros-4-mini.json'),
 get('https://store.vaporesso.com/products/xros-4-nano.js','xros-4-nano.json'),
 get('https://www.elfbar.com/elfliq.html','elfliq-source.html'),
 get('https://cdn.shopify.com/s/files/1/0071/4758/5626/files/XROSPRO-silver_b212b555-659a-4b37-a713-6e9ca8bbf264.png?v=1783425126','xros-pro-silver.png')
]).then(r=>r.forEach(x=>{if(x.status==='rejected')console.error(x.reason.message)}));})();
