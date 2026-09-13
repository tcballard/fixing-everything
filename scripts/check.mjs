import {readFileSync,readdirSync,existsSync,statSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
const root=resolve(process.argv[2]||'dist');
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(f=>f.isDirectory()?walk(join(p,f.name)):[join(p,f.name)]);
const htmlFiles=walk(root).filter(f=>f.endsWith('.html'));
const failures=[];
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
for(const file of htmlFiles){
 const html=readFileSync(file,'utf8');
 if((html.match(/<h1\b/g)||[]).length!==1)failures.push(`${file}: needs one h1`);
 if(!html.includes('name="viewport"')||!html.includes('Skip to content'))failures.push(`${file}: missing responsive/accessibility shell`);
 for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const link=decode(m[1]);if(!link.startsWith('/')&&!link.startsWith('#'))continue;
  const [path,hash]=link.split('#');let target=path?join(root,path):file;
  if(existsSync(target)&&statSync(target).isDirectory())target=join(target,'index.html');
  if(!existsSync(target)){failures.push(`${file}: missing ${link}`);continue;}
  if(hash&&!readFileSync(target,'utf8').includes(`id="${hash}"`))failures.push(`${file}: missing fragment ${link}`);
 }
 for(const m of html.matchAll(/<img\b[^>]*>/g))if(!/\balt="[^"]*"/.test(m[0]))failures.push(`${file}: image missing alt`);
}
for(const file of walk(root).filter(f=>f.endsWith('.css'))){
 for(const m of readFileSync(file,'utf8').matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)){
  const p=m[1].startsWith('/')?join(root,m[1]):resolve(dirname(file),m[1]);
  if(!existsSync(p))failures.push(`${file}: missing asset ${m[1]}`);
 }
}
for(const file of ['rss.xml','today/rss.xml','explaining/rss.xml','sitemap.xml','robots.txt','404.html'])if(!existsSync(join(root,file)))failures.push(`Missing ${file}`);
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`Checked ${htmlFiles.length} HTML pages: internal links, fragments, image alt attributes, CSS assets, headings, responsive metadata and feeds present.`);
