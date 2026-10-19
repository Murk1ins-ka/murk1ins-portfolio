const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
let p='work/v4-copy.json',copy=JSON.parse(read(p));
Object.assign(copy,{
fruit:['Ягодные','Fructe de pădure'],ice:['Лимонад','Limonadă'],classic:['Цитрусовые','Citrice'],
v4d:['Голубая малина, ментол','Zmeură albastră, mentol'],v5d:['Клубничный лимонад, лимон','Limonadă de căpșuni, lămâie'],v6d:['Лайм, лимон','Lime, lămâie'],ml:['мл','ml'],
vapeAssetCredit:['Предметные фотографии Vaporesso и Riot. Цены и остатки демонстрационные.','Fotografii de produs Vaporesso și Riot. Prețurile și stocurile sunt demonstrative.']});
fs.writeFileSync(p,JSON.stringify(copy,null,2));
p='work/v4-salon-copy.json';copy=JSON.parse(read(p));copy.atelierStylingPhoto=['Фен для укладки волос','Uscător de păr'];fs.writeFileSync(p,JSON.stringify(copy,null,2));
p='work/v4-stores.txt';let src=read(p);src=src.replace('[0,10,20].map(n=>','[...new Set(concepts.filter(p=>p.type===\'liquid\').map(p=>p.nicotine))].map(n=>');src=src.replace("t(p.family)+' · '+p.nicotine+' '+t('mg')", "t(p.id+'d')+'<br>50 '+t('ml')+' · '+p.nicotine+' '+t('mg')");fs.writeFileSync(p,src);
