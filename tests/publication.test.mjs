import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,rmSync,existsSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {parseArticle,loadArticles,pathFor} from '../scripts/content.mjs';
import vm from 'node:vm';
const base={id:'test-source',series:'today',slug:'test-edition',title:'Fixture: edition & sources',summary:'Fixture only.',author:'Tom Ballard',status:'published',publishedAt:'2026-09-01',updatedAt:'2026-09-02',originalXUrl:'https://x.com/tcballard/status/123456789',topics:['Releases'],sources:['https://example.com/source'],media:[{src:'/favicon.svg',alt:'Fixture masthead',width:1500,height:500,caption:'Source caption.'}]};
const encode=(meta,body='The complete body.\n\n## Source\n\nA [source](https://example.com/source).\n')=>'---json\n'+JSON.stringify(meta)+'\n---\n'+body;
test('reject invalid publication data and unsafe article content',()=>{
 for(const change of [{publishedAt:null},{publishedAt:'2026-02-31'},{slug:'../escape'},{lessonId:'unknown'},{originalXUrl:'javascript:alert(1)'},{media:[{src:'/image.png',alt:''}]}])assert.throws(()=>parseArticle(encode({...base,...change})));
 for(const body of ['<script>alert(1)</script>','[unsafe](javascript:alert%281%29)','![](/image.png)'])assert.throws(()=>parseArticle(encode(base,body)));
});
const draft={...base,id:'unpublished-test-fixture',series:'explaining',slug:'review-fixture',title:'Unpublished test fixture',status:'draft',publishedAt:null,updatedAt:null,originalXUrl:null,draftDate:'2026-09-01',order:1,lessonId:'super',media:[]};
mkdirSync('tests/tmp-drafts',{recursive:true});
writeFileSync('tests/tmp-drafts/draft.md',encode(draft,'PRIVATE TEST BODY.'));
after(()=>rmSync('tests/tmp-drafts',{recursive:true,force:true}));
test('article model preserves stable identity and preview lesson data',()=>{
 const a=parseArticle(encode(draft));assert.equal(a.id,draft.id);assert.equal(a.status,'draft');assert.equal(a.lessonId,'super');assert.equal(a.publishedAt,null);
});
test('public build excludes draft body, route, feed entry and sitemap entry',()=>{
 execFileSync('node',['scripts/build.mjs'],{env:{...process.env,OUTPUT_DIR:'test-dist',CONTENT_DIR:'tests/tmp-drafts'}});
 const files=['index.html','explaining/index.html','rss.xml','explaining/rss.xml','today/rss.xml','sitemap.xml'].map(p=>readFileSync('test-dist/'+p,'utf8')).join('\n');
 assert.ok(!existsSync('test-dist'+pathFor(draft)));assert.ok(!files.includes(draft.title));assert.ok(!files.includes(draft.id));assert.ok(!files.includes('PRIVATE TEST BODY.'));
 assert.match(files,/The explanations are moving in/);assert.doesNotMatch(files,/Private editorial preview/);
});
test('review build renders draft but excludes it from feeds and sitemap',()=>{
 execFileSync('node',['scripts/build.mjs','--review'],{env:{...process.env,OUTPUT_DIR:'test-review-dist',CONTENT_DIR:'tests/tmp-drafts'}});
 const html=readFileSync('test-review-dist/explaining/review-fixture/index.html','utf8');
 assert.match(html,/noindex,nofollow/);assert.match(html,/Source draft/);assert.doesNotMatch(html,/article:published_time|rel="canonical"|datePublished/);assert.match(html,/Copy command/);assert.match(html,/101 PR #3/);assert.match(html,/does not install 101/);
 assert.doesNotMatch(readFileSync('test-review-dist/sitemap.xml','utf8'),/review-fixture/);assert.doesNotMatch(readFileSync('test-review-dist/rss.xml','utf8'),/<item>/);
});
test('published daily template preserves body, dates, source URL, image and metadata',()=>{
 mkdirSync('tests/tmp',{recursive:true});writeFileSync('tests/tmp/edition.md',encode(base));
 try {
  execFileSync('node',['scripts/build.mjs'],{env:{...process.env,OUTPUT_DIR:'test-dist',CONTENT_DIR:'tests/tmp'}});
  const html=readFileSync('test-dist/today/test-edition/index.html','utf8');
  for(const s of ['The complete body.','https://example.com/source','https://x.com/tcballard/status/123456789','Source caption.','alt="Fixture masthead"','2026-09-01','2026-09-02','https://omarchy.tcballard.dev/today/test-edition','"@type":"Article"'])assert.ok(html.includes(s),s);
  const rss=readFileSync('test-dist/today/rss.xml','utf8');assert.match(rss,/<guid isPermaLink="false">test-source/);assert.match(rss,/content:encoded/);assert.match(rss,/The complete body/);assert.match(rss,/Fixture: edition &amp; sources/);
 } finally {rmSync('tests/tmp',{recursive:true,force:true});}
});
test('copy command preserves exact shell text; denied clipboard selects a usable fallback',async()=>{
 const text=`omarchy-shell shell summon io.github.tcballard.omarchy-101 '{"lesson":"super"}'`;
 for(const fail of [false,true]){
  let handler,copied,selected=false;const status={textContent:''};const code={textContent:text};const button={dataset:{copy:'command'},parentElement:{querySelector:()=>status},addEventListener:(_,fn)=>handler=fn};
  const context={document:{querySelectorAll:()=>[button],querySelector:()=>null,getElementById:()=>code,createRange:()=>({selectNodeContents:()=>selected=true})},navigator:{clipboard:{writeText:async t=>{if(fail)throw Error('denied');copied=t;}}},window:{getSelection:()=>({removeAllRanges(){},addRange(){}})}};
  vm.runInNewContext(readFileSync('assets/site.js','utf8'),context);await handler();
  if(fail){assert.ok(selected);assert.match(status.textContent,/Copy unavailable/);}else{assert.equal(copied,text);assert.equal(status.textContent,'Command copied.');}
 }
});
test('topic filter narrows and resets the learning index',()=>{
 let handler;const select={value:'Coding agents',addEventListener:(_,fn)=>handler=fn};const rows=[{dataset:{topics:'["Coding agents"]'}},{dataset:{topics:'["Desktop"]'}}];const status={};
 vm.runInNewContext(readFileSync('assets/site.js','utf8'),{document:{querySelectorAll:s=>s==='[data-copy]'?[]:rows,querySelector:s=>s==='#topic'?select:status}});
 handler();assert.deepEqual(rows.map(r=>r.hidden),[false,true]);assert.equal(status.textContent,'1 explanation');select.value='all';handler();assert.ok(rows.every(r=>!r.hidden));
});
