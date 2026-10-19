const fs=require('node:fs'),path=require('node:path');
const read=n=>fs.readFileSync(path.join(__dirname,n),'utf8').replace(/^\uFEFF/,'');
let js=read('v3.js');
const dict={...JSON.parse(read('v4-copy.json')),...JSON.parse(read('v4-salon-copy.json'))};
const manifestPath=path.join(__dirname,'assets-v4/vape/manifest.json');
const manifest=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8').replace(/^\uFEFF/,'')):{};
['pod1','pod2','pod3','liquid1','liquid2','liquid3'].forEach((key,i)=>{const label=manifest[key]?.name;if(label)dict['v'+(i+1)]=[label,label];});
js=js.replace('const t=k=>',`Object.assign(copy,${JSON.stringify(dict)});\nconst t=k=>`);
js=js.replace("let category='all',flavor='all',nicotine='all';","let category='all',flavor='all',nicotine='all',vapeType='all';");
js=js.replace("assets[id]||`https://images.unsplash.com/", "assets[id]||(id.startsWith('https://')?id:`https://images.unsplash.com/").replace('q=85`;','q=85`);');
js=js.replace(/const concepts=\[[\s\S]*?\n\];/,`const concepts=[
 {id:'v1',type:'device',family:null,nicotine:null,price:29,stock:8,image:'pod1'},
 {id:'v2',type:'device',family:null,nicotine:null,price:35,stock:4,image:'pod2'},
 {id:'v3',type:'device',family:null,nicotine:null,price:39,stock:12,image:'pod3'},
 {id:'v4',type:'liquid',family:'fruit',nicotine:0,price:9,stock:6,image:'liquid1'},
 {id:'v5',type:'liquid',family:'ice',nicotine:0,price:9,stock:0,image:'liquid2'},
 {id:'v6',type:'liquid',family:'classic',nicotine:0,price:9,stock:3,image:'liquid3'}
];`);
js=js.replace("cartKey='murk1ins-carts-v3'","cartKey='murk1ins-carts-v4'");
const imageStart=js.indexOf('const img='),imageEnd=js.indexOf('\nconst arrow=',imageStart);
js=js.slice(0,imageStart)+`const assetBounds=__ASSET_BOUNDS__;
const img=(id,alt,extra='',w=850)=>{
 const bounds=assetBounds[id];
 if(!bounds)return \`<img src="\${photo(id,w)}" alt="\${alt}" \${extra}>\`;
 const [x,y,right,bottom]=bounds.visibleBounds,pad=16,cls=extra.match(/class="([^"]*)"/)?.[1]||'';
 return \`<svg class="asset-cutout \${cls}" \${extra.replace(/class="[^"]*"/,'')} viewBox="\${x-pad} \${y-pad} \${right-x+pad*2} \${bottom-y+pad*2}" preserveAspectRatio="xMidYMid meet" role="img" \${alt?'aria-label="'+alt+'"':'aria-hidden="true"'}><image href="\${photo(id,w)}" width="\${bounds.size[0]}" height="\${bounds.size[1]}"/></svg>\`;
};`+js.slice(imageEnd);
js=js.replace("salon:'photo-1600948836101-f9ffda59d250'","salon:'photo-1522337360788-8b13dee7a37e'");
js=js.replace("${img(imageIds.street,'','',600)}","${img('raglan','','',600)}");
js=js.replace("${lang==='ro'?'FĂRĂ<br>REGULI.<br>DOAR TU.':'ВНЕ<br>РАМОК.<br>ВНЕ<br>ПРАВИЛ.'}","${t('streetNew')}");
const oldProject=js.indexOf('<div class="project-image ${p[1]}">'),projectEnd=js.indexOf('<div class="project-heading">',oldProject);
if(oldProject<0||projectEnd<0)throw Error('Portfolio image anchor not found');
js=js.slice(0,oldProject)+'<div class="project-image ${p[1]}">${projectPreview(p[0])}</div>'+js.slice(projectEnd);
const start=js.indexOf('function street(){'),end=js.indexOf('function renderApp(){');
js=js.slice(0,start)+read('v4-stores.txt')+'\n'+read('v4-salon-template.txt')+'\n'+js.slice(end);
js=js.replace("street:'#f8f8f6',vapor:'#ffffff',salon:'#fcfaf7'","street:'#f4f3ef',vapor:'#f1f4f7',salon:'#f7f4ee'");
js=js.replace("i.p.nicotine+' '+t('mg')+' · '+t('demo')","i.p.type==='device'?t('deviceOnly'):i.p.nicotine+' '+t('mg')+' · '+t('demo')");
js=js.replace("if(b.hasAttribute('data-category'))",()=>`if(b.hasAttribute('data-size-option')){const id=b.dataset.sizeOption,value=b.dataset.sizeValue;chosenSizes.set(id,value);$('#size-'+id).value=value;$('#size-'+id).removeAttribute('aria-invalid');$$('[data-size-option="'+id+'"]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}
 if(b.hasAttribute('data-vape-type')){vapeType=b.dataset.vapeType;if(vapeType==='device'){flavor='all';nicotine='all';$('#flavor-filter').value='all';$('#nicotine-filter').value='all';}$$('[data-vape-type]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#flavor-filter').disabled=vapeType==='device';$('#nicotine-filter').disabled=vapeType==='device';renderConcepts();}
 if(b.hasAttribute('data-category'))`);
js=js.replace("select.focus();toast(t('sizeRequired'))", "e.target.querySelector('[data-size-option]').focus();toast(t('sizeRequired'))");
const creditStart=js.indexOf(' const credits=route==='),creditEnd=js.indexOf('\n return `<footer',creditStart);
const sourceLinks=Object.values(manifest).filter(x=>x.sourceUrl).map(x=>`<a href="${x.sourceUrl}" target="_blank" rel="noopener noreferrer">${x.name}</a>`).join(' · ');
js=js.slice(0,creditStart)+` const credits=route==='street'?t('assetNote'):route==='vapor'?t('vapeAssetCredit')+'<br>'+${JSON.stringify(sourceLinks)}:'<a href="https://unsplash.com/photos/WCPg9ROZbM0" target="_blank" rel="noopener noreferrer">Element5 Digital</a> · <a href="https://unsplash.com/photos/yutgPvmHxYQ" target="_blank" rel="noopener noreferrer">Unsplash</a>';
`+js.slice(creditEnd);
new Function(js);
fs.writeFileSync(path.join(__dirname,'v4.js'),js);
fs.writeFileSync(path.join(__dirname,'v4.css'),read('v3.css')+'\n'+read('v4-stores.css')+'\n'+read('v4-salon.css'));
let builder=read('build-v3.cjs').replaceAll("'v3.css'","'v4.css'").replaceAll("'v3.js'","'v4.js'");
builder=builder.replace('const js=fs.readFileSync',`const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'assets-v4/vape/manifest.json'),'utf8').replace(/^\\uFEFF/,''));
for(const [key,asset] of Object.entries(manifest)){const filename=path.join(__dirname,'assets-v4/vape',asset.file);const mime=asset.file.endsWith('.webp')?'image/webp':'image/png';assets[key]='data:'+mime+';base64,'+fs.readFileSync(filename).toString('base64');}
const js=fs.readFileSync`);
builder=builder.replace(".replace('__EMBEDDED_ASSETS__',JSON.stringify(assets));", ".replace('__EMBEDDED_ASSETS__',JSON.stringify(assets)).replace('__ASSET_BOUNDS__',fs.readFileSync(path.join(__dirname,'assets-v4/vape/verified-metadata.json'),'utf8').replace(/^\\uFEFF/,''));");
builder=builder.replace("fs.writeFileSync(path.join(__dirname,'index.html'),html);\nfs.writeFileSync(path.join(__dirname,'../outputs/index.html'),html);", "fs.writeFileSync(path.join(__dirname,'v4-preview.html'),html);\nif(process.argv.includes('--release')){fs.writeFileSync(path.join(__dirname,'index.html'),html);fs.writeFileSync(path.join(__dirname,'../outputs/index.html'),html);}");
// Build source may retain CRLF from v3.
builder=builder.replace("fs.writeFileSync(path.join(__dirname,'index.html'),html);\r\nfs.writeFileSync(path.join(__dirname,'../outputs/index.html'),html);", "fs.writeFileSync(path.join(__dirname,'v4-preview.html'),html);\nif(process.argv.includes('--release')){fs.writeFileSync(path.join(__dirname,'index.html'),html);fs.writeFileSync(path.join(__dirname,'../outputs/index.html'),html);}");
fs.writeFileSync(path.join(__dirname,'build-v4.cjs'),builder);
console.log('Prepared v4 source and build script');
