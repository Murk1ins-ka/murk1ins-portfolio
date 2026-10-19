const fs=require('node:fs'),path=require('node:path');
const read=n=>fs.readFileSync(path.join(__dirname,n),'utf8');
let js=read('v2.js');
const dict=JSON.parse(read('v3-copy.json'));
js=js.replace("const photo=(id,w=850)=>", "const assets=__EMBEDDED_ASSETS__;\nconst photo=(id,w=850)=>assets[id]||");
js=js.replace("const t=k=>",`Object.assign(copy,${JSON.stringify(dict)});\nconst t=k=>`);
js=js.replace(/const clothes=\[[\s\S]*?\n\];/,`const clothes=[
 {id:'s1',category:'tops',price:49,image:'raglan',sizes:['S','M','L','XL'],stock:12},
 {id:'s2',category:'layers',price:78,image:'hoodie',sizes:['S','M','L','XL'],stock:18},
 {id:'s3',category:'bottoms',price:92,image:'jeans',sizes:['26','28','30','32','34'],stock:7},
 {id:'s4',category:'accessories',price:35,image:'belt',sizes:['OS'],stock:10},
 {id:'s5',category:'tops',price:39,image:'tee',sizes:['S','M','L','XL'],stock:15}
];`);
js=js.replace("cartKey='murk1ins-carts-v2'","cartKey='murk1ins-carts-v3'");
js=js.replace(/\['street','fashion','OFFGRID®'/,"['street','fashion','fashionCard'").replace(/\['vapor','vape','VOLT \/'/,"['vapor','vape','vapeCard'").replace(/\['salon','beauty','Maison Éclat'/,"['salon','beauty','beautyCard'");
js=js.replaceAll('${p[2]}','${t(p[2])}');
js=js.replace('${t(\'book\')} ↗</button>`;}','${t(\'book\')}</button>`;}');
js=js.replace("${i===0?'OFF<br>THE GRID.':i===1?'VOLT<br>STUDIO.':lang==='ro'?'Doar<br>pentru tine.':'Только<br>для тебя.'}","${t(['fashionOverlay','vapeOverlay','beautyOverlay'][i])}");
const start=js.indexOf('function street(){'),end=js.indexOf('function renderApp(){');
js=js.slice(0,start)+read('v3-templates.js.txt')+'\n'+js.slice(end);
js=js.replace("street:'#101112',vapor:'#edf2f1',salon:'#f6f0e9'","street:'#f8f8f6',vapor:'#ffffff',salon:'#fcfaf7'");
js=js.replace("document.documentElement.lang=lang||'ru';","document.documentElement.lang=lang||'ru';document.body.dataset.view=current;");
const footstart=js.indexOf(' const credits=route==='),footend=js.indexOf('\n}\nfunction portfolio()',footstart);
js=js.slice(0,footstart)+` const credits=route==='street'?t('assetNote'):route==='vapor'?'<a href="https://unsplash.com/photos/M8CrCzlS78Y" target="_blank" rel="noopener noreferrer">Vaporesso</a> · <a href="https://unsplash.com/photos/3iT5Hdkbg4w" target="_blank" rel="noopener noreferrer">Paul Bill</a> · <a href="https://unsplash.com/photos/6jLWY4myaOw" target="_blank" rel="noopener noreferrer">Dovpo Offical</a> · <a href="https://unsplash.com/photos/1AR9kNZ6jMI" target="_blank" rel="noopener noreferrer">Sierra Alpha Juliet</a>':'Unsplash';
 return \`<footer class="footer"><span>\${route==='street'?'OFFGRID®':route==='vapor'?'VOLT /':'maison éclat'}</span><div><span>\${t(route==='salon'?'salonFooter':'shortDemo')}</span><details><summary>\${t(route==='street'?'assetCredits':'photoCredits')}</summary>\${credits}\${route==='vapor'?'<p>'+t('photosNote')+'</p>':''}</details></div><a href="#portfolio">Murk1ins ↗</a></footer>\`;
`+js.slice(footend);
fs.writeFileSync(path.join(__dirname,'v3.js'),js);
fs.writeFileSync(path.join(__dirname,'v3.css'),read('v2.css')+'\n'+read('v3-overrides.css'));
let builder=read('build-v2.cjs').replaceAll("'v2.css'","'v3.css'").replace("const js=fs.readFileSync(path.join(__dirname,'v2.js'),'utf8');",`const assets=Object.fromEntries(['raglan','hoodie','jeans','belt','tee'].map(n=>[n,'data:image/png;base64,'+fs.readFileSync(path.join(__dirname,'assets-v3',n+'.png')).toString('base64')]));
const js=fs.readFileSync(path.join(__dirname,'v3.js'),'utf8').replace('__EMBEDDED_ASSETS__',JSON.stringify(assets));`);
fs.writeFileSync(path.join(__dirname,'build-v3.cjs'),builder);
console.log('Prepared v3 source');
