import { readFileSync, readdirSync } from 'node:fs';
import { marked } from 'marked';

export const lessons = ['super','terminal','workspace','launcher','browser','focus','help'];
export const series = {explaining:'Explaining Omarchy', today:'Today in Omarchy', weekly:'The Unofficial Week in Omarchy'};
export const escape = s => String(s ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const pathFor = a => `/${a.series}/${a.slug}`;
export const validDate = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().startsWith(v);
export function safeUrl(value) {
  if (typeof value !== 'string') return false;
  if (/^\/(?!\/)[^\s\\]*$/.test(value) || /^#[\w-]+$/.test(value)) return true;
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; }
}
export function parseArticle(raw, filename='article') {
  const match=raw.match(/^---json\n([\s\S]*?)\n---\n([\s\S]+)$/);
  if (!match) throw new Error(`${filename}: expected JSON front matter and Markdown body`);
  const a={...JSON.parse(match[1]),body:match[2]};
  for (const key of ['id','title','slug','summary','author']) if(typeof a[key]!=='string'||!a[key].trim()) throw new Error(`${filename}: missing ${key}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.slug) || !series[a.series]) throw new Error(`${filename}: invalid route`);
  if (!['draft','published'].includes(a.status)) throw new Error(`${filename}: invalid status`);
  if (a.status==='draft' && !validDate(a.draftDate)) throw new Error(`${filename}: draftDate required for review`);
  if (a.status==='published' && !validDate(a.publishedAt)) throw new Error(`${filename}: publishedAt required for publication`);
  if (a.status==='published' && new Date(a.publishedAt)>new Date()) throw new Error(`${filename}: future publication requires keeping this article draft`);
  for(const k of ['publishedAt','updatedAt','draftDate']) if(a[k]&&!validDate(a[k])) throw new Error(`${filename}: invalid ${k}`);
  if(a.updatedAt&&a.publishedAt&&a.updatedAt<a.publishedAt) throw new Error(`${filename}: update precedes publication`);
  if(a.lessonId && (a.series!=='explaining'||!lessons.includes(a.lessonId))) throw new Error(`${filename}: unknown lesson`);
  if(a.order!=null && (!Number.isInteger(a.order)||a.order<1)) throw new Error(`${filename}: order must be positive`);
  if(!Array.isArray(a.topics)||!Array.isArray(a.sources)||!Array.isArray(a.media)) throw new Error(`${filename}: topics, sources and media must be arrays`);
  if(a.sources.some(u=>!safeUrl(u))) throw new Error(`${filename}: unsafe source`);
  if(a.originalXUrl && !/^https:\/\/(?:www\.)?x\.com\/(?:[A-Za-z0-9_]+\/status\/\d+|i\/article\/\d+)\/?$/.test(a.originalXUrl)) throw new Error(`${filename}: invalid original X URL`);
  for(const m of a.media) if(!m.alt?.trim()||!safeUrl(m.src)||!m.width||!m.height) throw new Error(`${filename}: image needs safe src, alt, width and height`);
  a.html=marked.parse(a.body,{gfm:true,walkTokens(token){
    if(token.type==='html') throw new Error(`${filename}: raw HTML is unsupported; use Markdown`);
    if(['link','image'].includes(token.type)&&!safeUrl(token.href)) throw new Error(`${filename}: unsafe URL`);
    if(token.type==='image'&&!token.text.trim()) throw new Error(`${filename}: missing image alt text`);
  }});
  a.html=a.html.replace(/<pre>/g,'<pre tabindex="0" aria-label="Code block">');
  a.minutes=Math.max(1,Math.ceil(a.body.split(/\s+/).length/220));
  return a;
}
export function loadArticles(dir='content/articles') {
 const all=readdirSync(dir).filter(f=>f.endsWith('.md')).map(f=>parseArticle(readFileSync(`${dir}/${f}`,'utf8'),f));
 for(const key of ['id']) if(new Set(all.map(a=>a[key])).size!==all.length) throw new Error(`Duplicate ${key}`);
 if(new Set(all.map(pathFor)).size!==all.length) throw new Error('Duplicate article route');
 const order=all.filter(a=>a.series==='explaining'&&a.order!=null).map(a=>a.order);
 if(new Set(order).size!==order.length) throw new Error('Duplicate learning order');
 return all;
}
