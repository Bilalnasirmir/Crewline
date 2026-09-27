/* ================= CORE: helpers, icons, components, shell, events ================= */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf=n=>Math.round(+n||0).toLocaleString('en-US');
const money=(n,d=0,cur)=>{cur=cur||(window.S&&S.currency)||'$';const v=(+n||0);return (v<0?'−':'')+cur+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})};
const pct=n=>Math.round(n)+'%';
const initials=n=>String(n||'?').split(' ').filter(Boolean).map(x=>x[0]).slice(0,2).join('').toUpperCase()||'?';
const uid=(p='x')=>p+Math.random().toString(36).slice(2,8);
const clone=o=>JSON.parse(JSON.stringify(o));

/* ---------- icons (one stroke family) ---------- */
const P={
home:'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
rocket:'M5 15c-1.5 1.3-2 4-2 6 2 0 4.7-.5 6-2M9 18l-3-3 8.5-8.5C16.5 4.5 19 3.5 21 3c-.5 2-1.5 4.5-3.5 6.5zM14 7l3 3M8 12H4l3-3h4M12 16v4l3-3v-4',
orb:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5l1.2 3.3 3.3 1.2-3.3 1.2L12 16.5l-1.2-3.3L7.5 12l3.3-1.2z',
inbox:'M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5',
users:'M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-1a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
usercheck:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 11l2 2 4-4',
megaphone:'M3 10v4h4l6 4V6L7 10zM17 8a5 5 0 0 1 0 8M20 5a9 9 0 0 1 0 14',
kanban:'M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v13h-4z',
calendar:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
bot:'M12 5v4M5 9h14v10H5zM9 13v2M15 13v2M2 13v3M22 13v3M12 2.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3',
wallet:'M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2zM16 14.5h.01',
chart:'M4 20V10M10 20V4M16 20v-7M22 20H2',
gear:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
package:'M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8',
target:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
lifebuoy:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6',
wrench:'M15 4a5 5 0 0 0-4.6 6.9L3 18.3 5.7 21l7.4-7.4A5 5 0 0 0 20 9l-3 3-3-1-1-3z',
receipt:'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3',
bell:'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',
out:'M12 12h.01M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8',
in:'M6 3h4v8a2 2 0 0 0 4 0V3h4v8a6 6 0 0 1-12 0zM6 7h4M14 7h4',
swap:'M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7',
folder:'M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
folderplus:'M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM12 10v6M9 13h6',
mic:'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM19 11a7 7 0 0 1-14 0M12 18v3',
micoff:'M3 3l18 18M9 9v3a3 3 0 0 0 5 2.2M15 9.3V6a3 3 0 0 0-5.7-1.3M19 11a7 7 0 0 1-1.2 3.9M5 11a7 7 0 0 0 11 5.7M12 18v3',
clip:'M21 11.5l-8.5 8.5a5 5 0 0 1-7-7L14 4.5a3.5 3.5 0 0 1 5 5L10.5 18a2 2 0 0 1-3-3L15 7.5',
send:'M4 12l16-8-6 16-3-7z',
spark:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
check:'M5 12l5 5L20 7',
check2:'M1.5 12.5 6 17l9-9M10 16.5l1 1L20.5 8',
x:'M6 6l12 12M18 6L6 18',
plus:'M12 5v14M5 12h14',
minus:'M5 12h14',
down:'M6 9l6 6 6-6',
up2:'M6 15l6-6 6 6',
right:'M9 6l6 6-6 6',
left:'M15 6l-6 6 6 6',
arrowl:'M19 12H5M12 19l-7-7 7-7',
arrowr:'M5 12h14M12 5l7 7-7 7',
ext:'M7 17L17 7M8 7h9v9',
up:'M12 19V5M5 12l7-7 7 7',
dn:'M12 5v14M19 12l-7 7-7-7',
sms:'M4 5h16v11H9l-5 4z',
phone:'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1',
phoneoff:'M3 3l18 18M10.7 13.3a11 11 0 0 1-2.2-2.7L11 9 9 4H5a1 1 0 0 0-1 1 16 16 0 0 0 4.3 10.7M13.4 16.1 15 15l5 2v2a1 1 0 0 1-1 1 16 16 0 0 1-3.7-.7',
phonein:'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1M21 3l-6 6M15 4v5h5',
mail:'M3 6h18v12H3zM3 7l9 6 9-6',
whatsapp:'M4 20l1.5-4A8 8 0 1 1 8 18.5zM9 9.5c0 3 2.5 5.5 5.5 5.5',
camera:'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17 6.5h.01',
messenger:'M12 3a9 8.5 0 0 0-6.5 14.4L5 21l3.7-1.9A9.8 9.8 0 0 0 12 20a9 8.5 0 0 0 0-17zM7.5 13.5l3-3 2.5 2 3.5-3',
note:'M9 18a3 3 0 1 1-3-3M9 18V4c1 2.5 3.5 4 6 4',
thumb:'M7 10v11H4V10zM7 10l4-7a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.3 20H7',
globe:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
filter:'M4 5h16l-6 8v6l-4-2v-4z',
upload:'M12 16V4M7 9l5-5 5 5M4 20h16',
download:'M12 4v12M7 11l5 5 5-5M4 20h16',
play:'M7 4l13 8-13 8z',
pause:'M8 5v14M16 5v14',
stop:'M6 6h12v12H6z',
db:'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
zap:'M13 2L4 14h7l-1 8 9-12h-7z',
lock:'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4',
trash:'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
edit:'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
file:'M6 3h9l4 4v14H6zM15 3v4h4',
image:'M4 4h16v16H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01',
video:'M3 6h13v12H3zM16 10l5-3v10l-5-3',
link:'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
copy:'M9 9h11v11H9zM5 15H4V4h11v1',
clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
card:'M3 6h18v12H3zM3 10h18M7 15h4',
layers:'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
tag:'M3 12V4h8l10 10-8 8zM7.5 7.5h.01',
grip:'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
hand:'M8 13V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 4 16l-1-3a1.5 1.5 0 0 1 2.8-1L8 15',
refresh:'M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6',
star:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
alert:'M12 3l10 18H2zM12 10v4M12 17.5h.01',
info:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5h.01',
query:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01',
flow:'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9',
headset:'M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v6H5a1 1 0 0 1-1-1zM20 14h-3v6h2a1 1 0 0 0 1-1z',
moon:'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
sun:'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
panel:'M4 4h16v16H4zM9 4v16',
menu:'M4 6h16M4 12h16M4 18h16',
rows:'M4 6h16M4 12h16M4 18h16',
grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
more:'M5 12h.01M12 12h.01M19 12h.01',
dial:'M6 5h.01M12 5h.01M18 5h.01M6 11h.01M12 11h.01M18 11h.01M6 17h.01M12 17h.01M18 17h.01M12 22h.01',
transfer:'M17 3l4 4-4 4M21 7H9M7 21l-4-4 4-4M3 17h12',
gift:'M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8a3 3 0 1 1 3-3c0 1.5-1.5 3-3 3zM12 8a3 3 0 1 0-3-3c0 1.5 1.5 3 3 3z',
dollar:'M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
pin:'M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
flag:'M4 21V4M4 4h13l-2 4 2 4H4',
code:'M8 7l-5 5 5 5M16 7l5 5-5 5',
key:'M15 7a4 4 0 1 1-3.9 5H3v3h3v3h3v-3h2.1A4 4 0 0 1 15 7zM16 11h.01',
list:'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
present:'M3 4h18M4 4v11h16V4M12 15v5M8 20h8',
sort:'M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4',
volume:'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12',
wave:'M3 12h2M7 8v8M11 5v14M15 8v8M19 10v4M21 12h0',
voice:'M12 3v18M8 7v10M4 10v4M16 7v10M20 10v4',
heart:'M12 20s-7-4.5-9-9a4.5 4.5 0 0 1 9-3 4.5 4.5 0 0 1 9 3c-2 4.5-9 9-9 9z',
building:'M4 21V5l8-3v19M12 8h8v13M8 8h.01M8 12h.01M8 16h.01M16 12h.01M16 16h.01M2 21h20',
book:'M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2zM4 19V5M9 7h7',
palette:'M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3.5 3H15a2 2 0 0 0-1.5 3.3A1.6 1.6 0 0 1 12 21zM7.5 11h.01M10 7.5h.01M14.5 7.5h.01',
percent:'M19 5L5 19M7 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
skip:'M5 5l10 7-10 7zM19 5v14',
history:'M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2',
ticket:'M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3zM13 4v4M13 12v4',
};
const DOTS=new Set(['dial','more','grip']);
function ic(n,s=16){return `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${DOTS.has(n)?3:1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]||P.info}"/></svg>`}

/* ---------- registries ---------- */
const VIEWS={},AFTER={},A={},C={},I={},M={},CTX={},TITLES={};
const S={view:'getstarted',p:{},theme:'auto',col:false,mnav:false,modal:null,live:true,maxOpen:false,guide:null,currency:'$'};
try{const t=localStorage.getItem('cl-theme');if(t)S.theme=t;S.col=localStorage.getItem('cl-col')==='1'}catch(_){}

/* ---------- toasts ---------- */
function toast(msg,ai){const t=document.createElement('div');t.className='toast'+(ai?' ai':'');t.innerHTML=ic(ai?'spark':'check',15)+'<span>'+esc(msg)+'</span>';$('#toasts').appendChild(t);setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),220)},3600)}

/* ---------- components ---------- */
const tipA=t=>t?` data-tip="${esc(t)}"`:'';
function btn(label,act,o={}){const k=o.k||'';const sz=/\b(sm|xs)\b/.test(k)?14:15;return `<button class="btn ${k}"${act?` data-act="${act}"`:''} ${o.a||''}${tipA(o.t)}${o.d?' disabled':''}${o.lbl?` aria-label="${esc(o.lbl)}"`:''}>${o.i?ic(o.i,sz):''}${label||''}</button>`}
const aiBtn=(label,act,a='',k='')=>btn(label,act,{k:'ai '+k,i:'spark',a,t:'AI does this for you'});
const iconBtn=(i,act,tip,a='',k='')=>`<button class="btn icon ghost ${k}" data-act="${act}" ${a} data-tip="${esc(tip)}" aria-label="${esc(tip)}">${ic(i,15)}</button>`;
function micBtn(target,sample,k='sm'){return `<button class="btn icon ${k} mic" data-act="mic" data-target="${esc(target)}" data-sample="${esc(sample||'')}" data-tip="Speak instead of typing (voice message)" aria-label="Record a voice message">${ic('mic',15)}</button>`}
function attBtn(k='sm',tip='Attach files, photos or screenshots'){return `<label class="btn icon ${k}" data-tip="${esc(tip)}" aria-label="${esc(tip)}">${ic('clip',15)}<input type="file" hidden multiple data-chg="attach"></label>`}
function aiBox(id,ph,act,o={}){return `<div class="aibox">${o.noLead?'':`<span class="lead">${ic('spark',16)}</span>`}<textarea id="${id}" rows="1" placeholder="${esc(ph)}" data-enter="${act}" data-auto aria-label="${esc(ph)}">${esc(o.v||'')}</textarea>${attBtn()}${micBtn('#'+id,o.sample||'')}${o.voice?`<button class="btn icon sm" data-act="voiceLive" data-tip="Talk to Max live" aria-label="Live voice conversation">${ic('voice',15)}</button>`:''}<button class="btn primary icon sm" data-act="${act}" data-src="#${id}" aria-label="Send">${ic('send',14)}</button></div>`}
const DIRL={out:'Outbound',in:'Inbound',both:'In & out'},DIRD={out:'Outbound: we reach out to people',in:'Inbound: people call, message or email us',both:'Works for inbound and outbound'};
const dirTag=d=>`<span class="dir ${d}" data-tip="${DIRD[d]}">${ic(d==='both'?'swap':d,12)}${DIRL[d]}</span>`;
const dirIc=d=>`<span class="diric ${d}" data-tip="${DIRD[d]}" aria-label="${DIRL[d]}">${ic(d==='both'?'swap':d,12)}</span>`;
const PL={sms:{l:'SMS',i:'sms'},wa:{l:'WhatsApp',i:'whatsapp'},ig:{l:'Instagram',i:'camera'},msg:{l:'Messenger',i:'messenger'},tt:{l:'TikTok',i:'note'},fb:{l:'Facebook',i:'thumb'},chat:{l:'Website chat',i:'globe'},email:{l:'Email',i:'mail'},call:{l:'Call',i:'phone'}};
const platIc=(k,lg,tip)=>`<span class="plat p-${k}${lg?' lg':''}" data-tip="${esc(tip||PL[k].l)}" aria-label="${PL[k].l}">${ic(PL[k].i,lg?15:12)}</span>`;
const bdg=(t,k='')=>`<span class="bdg ${k}">${t}</span>`;
const sw=(on,act,a='')=>`<label class="sw"><input type="checkbox" ${on?'checked':''} data-act="${act}" ${a}><span></span></label>`;
const seg=(items,cur,act,a='')=>`<div class="seg" role="group">${items.map(x=>`<button class="${String(cur)===String(x[0])?'on':''}" data-act="${act}" data-v="${esc(x[0])}" ${a}${x[3]?tipA(x[3]):''}>${x[2]?ic(x[2],13):''}${x[1]}</button>`).join('')}</div>`;
const tabs=(items,cur,act,a='')=>`<div class="tabs" role="tablist">${items.map(x=>`<button class="tab ${cur===x[0]?'on':''}" role="tab" data-act="${act}" data-v="${x[0]}" ${a}>${x[2]?ic(x[2],14):''}${x[1]}${x[3]!=null?`<span class="n">${x[3]}</span>`:''}</button>`).join('')}</div>`;
const optRow=(t,d,right)=>`<div class="optrow"><div><div class="t">${t}</div>${d?`<div class="d">${d}</div>`:''}</div><div class="row nw">${right}</div></div>`;
const av=(n,k='')=>`<span class="av ${k}">${esc(initials(n))}</span>`;
const kpi=(l,v,d,o={})=>`<${o.act?'button':'div'} class="kpi" ${o.act?`data-act="${o.act}" ${o.a||''}`:''}${tipA(o.t)}><span class="l">${o.i?ic(o.i,13):''}${l}</span><span class="v">${v}</span>${d?`<span class="d ${o.dk||''}">${d}</span>`:''}</${o.act?'button':'div'}>`;
const empty=(msg,act='')=>`<div class="empty">${ic('info',20)}<div>${msg}</div>${act}</div>`;
const fld=(label,inner,help)=>`<div class="fld"><label>${label}</label>${inner}${help?`<span class="help">${help}</span>`:''}</div>`;
const sel=(opts,cur,a='',k='')=>`<select class="in ${k}" ${a}>${opts.map(o=>{const v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return `<option value="${esc(v)}" ${String(cur)===String(v)?'selected':''}>${esc(l)}</option>`}).join('')}</select>`;
function bars(vals,labels,o={}){
  const h=o.h||170,W=o.w||640,pl=30,pb=22,pt=10,max=Math.max(...vals,1),top=Math.ceil(max/(max>50?50:10))*(max>50?50:10)||10,bw=(W-pl)/vals.length;let g='';
  for(let i=0;i<=2;i++){const v=top*i/2,y=pt+(h-pt-pb)*(1-v/top);g+=`<line x1="${pl}" x2="${W}" y1="${y}" y2="${y}" class="gl"/><text x="${pl-8}" y="${y+4}" text-anchor="end">${nf(v)}</text>`}
  vals.forEach((v,i)=>{const bh=(h-pt-pb)*v/top,x=pl+i*bw+bw*.18;g+=`<rect class="bar${i===vals.length-1?' end':''}${o.cls?' '+o.cls:''}" x="${x}" y="${h-pb-bh}" width="${bw*.64}" height="${Math.max(bh,0)}" rx="3" data-tip="<b>${esc(labels[i])}</b><br>${o.fmt?o.fmt(v):nf(v)} ${esc(o.unit||'')}${o.extra?'<br>'+esc(o.extra(i)):''}"/>`;const every=Math.ceil(vals.length/8);if(i%every===0||i===vals.length-1)g+=`<text x="${x+bw*.32}" y="${h-6}" text-anchor="middle">${esc(labels[i])}</text>`});
  return `<svg class="chart" viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(o.aria||'Bar chart')}">${g}</svg>`;
}
const ring=(p,label,c)=>`<div class="ring" style="--p:${p};${c?`--c:${c}`:''}"><b>${label??p+'%'}</b></div>`;

/* ---------- sentence list editor ---------- */
const LED={};
function led(id,arr,ph,o={}){LED[id]={arr,ph,o};return `<div class="led" id="led-${id}">${arr.map((it,i)=>`<div class="led-i"><span class="n">${i+1}</span><span>${esc(o.imp?it.t:it)}</span>${o.imp?`<select class="in sm auto" data-chg="ledImp" data-l="${id}" data-i="${i}" aria-label="Importance">${(o.opts||['Required','Preferred','Optional']).map(x=>`<option ${it.imp===x?'selected':''}>${x}</option>`).join('')}</select>`:'<span></span>'}<button class="x" data-act="ledRm" data-l="${id}" data-i="${i}" aria-label="Remove" data-tip="Remove">${ic('x',13)}</button></div>`).join('')}<div class="led-add">${ic('plus',14)}<input placeholder="${esc(ph)} — press Enter to add" data-enter="ledAdd" data-l="${id}" aria-label="${esc(ph)}">${micBtn('#led-'+id+' input',o.sample||'','xs')}</div></div>`}
function ledRefresh(id,focus){const L=LED[id],el=$('#led-'+id);if(!el)return;el.outerHTML=led(id,L.arr,L.ph,L.o);if(focus){const i=$('#led-'+id+' input');if(i)i.focus()}if(L.o.onChange)L.o.onChange()}
A.ledAdd=el=>{const id=el.dataset.l,v=el.value.trim();if(!v)return;const L=LED[id];L.arr.push(L.o.imp?{t:v,imp:L.o.opts?L.o.opts[0]:'Required'}:v);ledRefresh(id,true)};
A.ledRm=el=>{LED[el.dataset.l].arr.splice(+el.dataset.i,1);ledRefresh(el.dataset.l)};
C.ledImp=el=>{LED[el.dataset.l].arr[+el.dataset.i].imp=el.value};

/* ---------- theme ---------- */
function applyTheme(){document.body.className=S.theme==='auto'?'':'th-'+S.theme;try{localStorage.setItem('cl-theme',S.theme)}catch(_){}}
function setTheme(t){S.theme=t;applyTheme();toast({auto:'Theme follows your device',light:'Light theme on',dark:'Dark theme on',navy:'Dark blue theme on',mixed:'Mixed theme on — dark menu, light pages'}[t]||'Theme changed')}

/* ---------- shell ---------- */
const NAV=[['getstarted','Get Started','rocket','Set up your account step by step'],['home','Home','home','Talk to Max and oversee your AI team'],['max','Max','orb','Your AI assistant — it can do anything in the app'],'Work',['inbox','Inbox','inbox','Every chat, email and call in one place'],['contacts','Contacts','users','Your database, folders and Do-Not-Contact list'],['campaigns','Campaigns','megaphone','Outbound and inbound campaigns'],['stages','Stages','kanban','Where every lead is, live'],['bookings','Bookings','calendar','Appointments, reservations and queries'],['agents','AI Agents','bot','Your AI team: sales, marketing, support and more'],'Business',['expenses','Expenses','wallet','What you spend on AI, calls, texts and apps'],['reports','Reports','chart','Dashboards and your report library'],['settings','Settings','gear','Everything you can set up']];
const NAVOF={contact:'contacts',campaign:'campaigns',wizard:'campaigns',agent:'agents',assigned:'home',pricing:'pricing'};
function renderSide(){
  const on=NAVOF[S.view]||S.view;const cnt={inbox:D.convos.filter(c=>c.unread).length,getstarted:D.gs.filter(s=>!s.done).length};
  $('#side').innerHTML=`<div class="side-top"><div class="brand"><span class="mark">${ic('zap',15)}</span><span>Crewline</span></div><button class="side-toggle" data-act="sideToggle" data-tip="${S.col?'Expand menu':'Collapse menu'}" aria-label="${S.col?'Expand menu':'Collapse menu'}">${ic('panel',16)}</button></div>
  <nav class="nav">${NAV.map(n=>typeof n==='string'?`<div class="nav-sec">${n}</div>`:`<button class="${on===n[0]?'on':''}" data-act="nav" data-v="${n[0]}"${S.col?` data-tip="<b>${n[1]}</b><br>${esc(n[3])}" data-tipside="right"`:''} aria-label="${n[1]}">${ic(n[2],17)}<span class="lbl">${n[1]}</span>${cnt[n[0]]?`<span class="cnt ${n[0]==='getstarted'?'ai':''}">${cnt[n[0]]}</span>`:''}</button>`).join('')}</nav>
  <div class="side-foot nav" style="flex:none"><button class="${on==='pricing'?'on':''}" data-act="nav" data-v="pricing"${S.col?' data-tip="<b>Plans & pricing</b>" data-tipside="right"':''} aria-label="Plans & pricing">${ic('package',17)}<span class="lbl">Plans & pricing</span></button><button data-act="themeCycle"${S.col?' data-tip="<b>Change theme</b>" data-tipside="right"':''} aria-label="Change theme">${ic(S.theme==='dark'||S.theme==='navy'?'moon':'sun',17)}<span class="lbl">Theme: ${({auto:'Device',light:'Light',dark:'Dark',navy:'Dark blue',mixed:'Mixed'})[S.theme]}</span></button></div>`;
  $('#app').classList.toggle('col',S.col);$('#app').classList.toggle('mnav',S.mnav);
}
function renderTop(){
  const t=TITLES[S.view];const title=typeof t==='function'?t():t||'';const asg=D.assigned.filter(a=>!a.done).length,nt=D.notifs.filter(n=>!n.read).length;
  $('#top').innerHTML=`<button class="btn icon ghost mobonly" data-act="mnav" aria-label="Open menu">${ic('menu',18)}</button><div class="crumbs">${title}</div><span class="grow"></span>
  <button class="cmdbtn" data-act="cmd">${ic('search',15)}<span>Search anything or ask Max</span><span class="kbd">Ctrl K</span></button>
  <button class="livedot ${S.live?'':'off'} hide-s" data-act="liveToggle" data-tip="${S.live?'Live updates are on — agents are working right now. Click to pause the demo feed.':'Live demo feed paused'}"><i></i>${S.live?'Live':'Paused'}</button>
  <button class="btn sm" data-act="nav" data-v="assigned" data-tip="Things only a person can decide">${ic('usercheck',14)}<span class="hide-s">Assigned to me</span>${asg?`<span class="bdg bad">${asg}</span>`:''}</button>
  <button class="btn icon sm" data-act="notifs" data-tip="Notifications" aria-label="Notifications" style="position:relative">${ic('bell',15)}${nt?`<span style="position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;border-radius:8px;background:var(--bad);color:#fff;font-size:10px;font-weight:600;display:grid;place-items:center;padding:0 4px">${nt}</span>`:''}</button>
  <span class="me" data-tip="Bilal Nasir · Owner">BN</span>`;
}
function renderFab(){$('#maxfab').innerHTML=ic('spark',16)+'<span>Ask Max</span>';$('#maxfab').hidden=S.view==='max'||S.maxOpen}
function render(){
  applyTheme();renderSide();renderTop();
  const m=$('#main');m.className=['inbox','max'].includes(S.view)?'flush':'';
  m.innerHTML=(VIEWS[S.view]||VIEWS.home)();
  if(AFTER[S.view])AFTER[S.view]();
  renderModal();renderMaxPanel();renderFab();
}
function rr(){const m=$('#main'),y=m.scrollTop;const keep=$$('[data-keep]').map(e=>[e.id,e.scrollTop]);m.innerHTML=(VIEWS[S.view]||VIEWS.home)();m.scrollTop=y;keep.forEach(([id,t])=>{const e=document.getElementById(id);if(e)e.scrollTop=t});if(AFTER[S.view])AFTER[S.view]()}
function go(v,p={}){S.view=v;S.p=p;S.mnav=false;S.modal=null;S.ctxOpen=false;hideCtx();hidePop();render();$('#main').scrollTop=0}

/* ---------- modals ---------- */
function MS(title,body,foot='',cls='',sub=''){return `<div class="mb" data-act="bgclose"><div class="modal ${cls}" role="dialog" aria-modal="true" aria-label="${esc(title.replace(/<[^>]+>/g,''))}"><div class="mh"><div><h2>${title}</h2>${sub?`<div class="small muted">${sub}</div>`:''}</div><button class="btn icon ghost sm" data-act="close" aria-label="Close">${ic('x',16)}</button></div><div class="mbd">${body}</div>${foot?`<div class="mf2">${foot}</div>`:''}</div></div>`}
function renderModal(){const o=$('#overlay');if(!S.modal){o.innerHTML='';return}const f=M[S.modal.t];o.innerHTML=f?f(S.modal):'';const fi=o.querySelector('[data-autofocus]');if(fi)fi.focus()}
function openM(t,o={}){S.modal=Object.assign({},o,{t});renderModal()}
function closeM(){S.modal=null;renderModal()}
A.close=()=>closeM();
A.bgclose=(el,e)=>{if(e.target===el)closeM()};

/* ---------- context menu / popovers ---------- */
function openCtx(x,y,items){const c=$('#ctx');c.innerHTML=items.map(it=>it==='-'?'<hr>':`<button class="${it.danger?'danger':''}" data-act="${it.act}" ${it.a||''}>${ic(it.i||'right',15)}${it.l}</button>`).join('');c.hidden=false;const w=c.offsetWidth,h=c.offsetHeight;c.style.left=Math.min(x,innerWidth-w-8)+'px';c.style.top=Math.min(y,innerHeight-h-8)+'px'}
function hideCtx(){const c=$('#ctx');if(c)c.hidden=true}
function openPop(anchor,html){const w=$('#popwrap');w.innerHTML=`<div class="pop" id="pop">${html}</div>`;const p=$('#pop'),r=anchor.getBoundingClientRect();p.style.top=Math.min(r.bottom+6,innerHeight-p.offsetHeight-8)+'px';p.style.left=Math.max(8,Math.min(r.right-p.offsetWidth,innerWidth-p.offsetWidth-8))+'px'}
function hidePop(){const w=$('#popwrap');if(w)w.innerHTML=''}

/* ---------- tooltips ---------- */
let tipEl=null;
document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest('[data-tip]');const tip=$('#tip');if(!t){if(tipEl){tip.classList.remove('on');tipEl=null}return}if(t===tipEl)return;tipEl=t;tip.innerHTML=t.dataset.tip;tip.classList.add('on');const r=t.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;
  if(t.dataset.tipside==='right'){tip.style.left=(r.right+8)+'px';tip.style.top=(r.top+r.height/2-h/2)+'px'}else{let x=r.left+r.width/2-w/2;x=Math.max(8,Math.min(x,innerWidth-w-8));let y=r.top-h-8;if(y<8)y=r.bottom+8;tip.style.left=x+'px';tip.style.top=y+'px'}});
document.addEventListener('scroll',()=>{$('#tip').classList.remove('on');tipEl=null},true);

/* ---------- mic / attachments / generic AI ---------- */
A.mic=el=>{if(el.classList.contains('rec'))return;el.classList.add('rec');el.dataset.tipOld=el.dataset.tip;const tgt=document.querySelector(el.dataset.target);toast('Listening… speak now (prototype: sample voice message)',true);
  setTimeout(()=>{el.classList.remove('rec');if(tgt){const s=el.dataset.sample||'Here is what I want: follow up with everyone who replied last week and book them for a call.';tgt.value=(tgt.value?tgt.value+' ':'')+s;tgt.dispatchEvent(new Event('input',{bubbles:true}));tgt.focus()}toast('Voice message transcribed',true)},1700)};
C.attach=el=>{const n=[...(el.files||[])].map(f=>f.name);if(!n.length)return;S.attached=(S.attached||[]).concat(n);toast(`Attached ${n.join(', ')} — AI will read ${n.length>1?'them':'it'}`,true)};
A.toast=el=>toast(el.dataset.m,el.dataset.ai==='1');
A.aiFill=el=>{const t=document.querySelector(el.dataset.target);if(!t)return;el.disabled=true;const o=el.innerHTML;el.innerHTML='<span class="spin"></span>Writing…';setTimeout(()=>{t.value=el.dataset.text;t.dispatchEvent(new Event('input',{bubbles:true}));el.disabled=false;el.innerHTML=o;toast(el.dataset.done||'AI wrote it — edit anything you like',true)},900)};
A.noop=()=>{};
A.sideToggle=()=>{S.col=!S.col;try{localStorage.setItem('cl-col',S.col?'1':'0')}catch(_){};renderSide()};
A.mnav=()=>{S.mnav=!S.mnav;renderSide()};
A.nav=el=>go(el.dataset.v,el.dataset.p?JSON.parse(el.dataset.p):{});
A.themeCycle=()=>{const o=['auto','light','dark','navy','mixed'];setTheme(o[(o.indexOf(S.theme)+1)%o.length]);renderSide()};
A.liveToggle=()=>{S.live=!S.live;renderTop();toast(S.live?'Live demo feed on':'Live demo feed paused')};

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  if(!e.target.closest('#ctx'))hideCtx();
  if(!e.target.closest('#pop')&&!e.target.closest('[data-pop]'))hidePop();
  const el=e.target.closest('[data-act]');if(!el)return;
  if(el.tagName==='LABEL')return;
  const f=A[el.dataset.act];if(f){f(el,e)}
});
document.addEventListener('change',e=>{const el=e.target.closest('[data-chg]');if(el&&C[el.dataset.chg])C[el.dataset.chg](el,e)});
document.addEventListener('input',e=>{const el=e.target;if(el.hasAttribute&&el.hasAttribute('data-auto')){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,160)+'px'}const x=el.closest&&el.closest('[data-inp]');if(x&&I[x.dataset.inp])I[x.dataset.inp](x,e)});
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();A.cmd();return}
  if(e.key==='Escape'){if(!$('#ctx').hidden){hideCtx();return}if($('#popwrap').innerHTML){hidePop();return}if(S.modal){closeM();return}if(S.maxOpen){S.maxOpen=false;renderMaxPanel();renderFab();return}}
  const el=e.target;if(e.key==='Enter'&&!e.shiftKey&&el.dataset&&el.dataset.enter&&A[el.dataset.enter]){e.preventDefault();A[el.dataset.enter](el,e);if(el.dataset.enter==='ledAdd'){}}
  if((e.key==='Enter'||e.key===' ')&&el.getAttribute&&el.getAttribute('role')==='button'&&el.dataset.act&&A[el.dataset.act]){e.preventDefault();A[el.dataset.act](el,e)}
});
document.addEventListener('contextmenu',e=>{const el=e.target.closest('[data-ctx]');if(!el||!CTX[el.dataset.ctx])return;e.preventDefault();openCtx(e.clientX,e.clientY,CTX[el.dataset.ctx](el))});
document.addEventListener('dblclick',e=>{const el=e.target.closest('[data-dbl]');if(el&&A[el.dataset.dbl])A[el.dataset.dbl](el,e)});
