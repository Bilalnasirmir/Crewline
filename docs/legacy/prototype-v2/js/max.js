/* ================= MAX — the AI assistant that operates the app ================= */
S.maxc='mh0';S.panelc='mp0';
D.maxHist.unshift({id:'mh0',title:'New chat',msgs:[]});
D.maxPanel={id:'mp0',title:'Side panel',msgs:[]};
const mxFind=id=>id==='mp0'?D.maxPanel:D.maxHist.find(c=>c.id===id);
const MXI=()=>`<span class="who">${ic('orb',15)}</span>`;

function mxRender(cv){
  if(!cv.msgs.length)return '';
  return `<div class="chat">${cv.msgs.map((m,mi)=>m.r==='u'?`<div class="cm u"><div class="bb">${esc(m.h)}${m.att?`<div class="row" style="margin-top:6px">${m.att.map(a=>`<span class="att">${ic('file',12)}${esc(a)}</span>`).join('')}</div>`:''}</div></div>`:
   `<div class="cm x">${MXI()}<div class="bb">${m.h}${m.o?mxOpts(cv,m,mi):''}</div></div>`).join('')}${cv.typing?`<div class="cm x">${MXI()}<div class="bb"><span class="typing"><i></i><i></i><i></i></span></div></div>`:''}</div>`;
}
function mxOpts(cv,m,mi){const o=m.o;return `<div class="opts ${o.done?'done':''}">${o.items.map(([v,l,i])=>`<button class="${o.sel.includes(v)?'on':''}" data-act="mx" data-c="${cv.id}" data-m="${mi}" data-v="${esc(v)}">${i?ic(i,14):''}${l}</button>`).join('')}${o.multi&&!o.done?`<button data-act="mx" data-c="${cv.id}" data-m="${mi}" data-v="__go" style="background:var(--primary);color:#fff;border-color:var(--primary)">Continue ${ic('arrowr',13)}</button>`:''}</div>`}
function mxRefresh(){
  const L=$('#mxlog');if(L){L.innerHTML=mxRender(mxFind(S.maxc))||mxHello();const sc=$('#mxscroll');if(sc)sc.scrollTop=sc.scrollHeight}
  const PL=$('#mplog');if(PL){PL.innerHTML=mxPanelBody();PL.scrollTop=PL.scrollHeight}
  const H=$('#mxhist');if(H)H.innerHTML=mxHistList();
}
function mxSay(cv,h,o){cv.msgs.push({r:'x',h,o:o?Object.assign({sel:[],done:false},o):null})}
function mxSend(cvId,text){
  const cv=mxFind(cvId);text=String(text||'').trim();if(!text&&!(S.attached||[]).length)return;
  cv.msgs.push({r:'u',h:text||'(attachment)',att:S.attached&&S.attached.length?S.attached.slice():null});const att=S.attached||[];S.attached=[];
  if(cv.title==='New chat')cv.title=text.slice(0,42)||'Attachment';
  cv.typing=true;mxRefresh();
  setTimeout(()=>{cv.typing=false;mxReply(cv,text,att);mxRefresh()},650);
}

/* ---------- understanding the request ---------- */
function mxParseCamp(t){const d={};t=t.toLowerCase();
  if(/\binbound\b/.test(t))d.dir='in';else if(/\boutbound\b|broadcast|reach out/.test(t))d.dir='out';
  const fm=[['mississauga','f1'],['toronto','f2'],['telecom lead','f3'],['brampton','f3'],['brooklyn','f4'],['nyc fiber','f5'],['karachi','f6'],['dental patient','f8']].find(x=>t.includes(x[0]));if(fm)d.folder=fm[1];
  const ch=[];if(/\b(text|sms)\b/.test(t))ch.push('sms');if(/\bcall/.test(t))ch.push('call');if(/email/.test(t))ch.push('email');if(/whatsapp/.test(t))ch.push('wa');if(ch.length)d.ch=ch;
  if(/dental|patient/.test(t))d.pipe='dental';else if(/real estate|buyer|property/.test(t))d.pipe='realestate';else if(/telecom|internet|fiber|mobility|5g/.test(t))d.pipe='telecom';
  if(/appointment|booking|book /.test(t))d.booking='yes';
  if(/\bnow\b|right away|today/.test(t))d.when='now';else if(/tomorrow/.test(t))d.when='tomorrow';
  return d}
const MXSTEPS=['mode','dir','folder','ch','pipe','agents','booking','when','review'];
function mxAsk(cv){
  const f=cv.flow,d=f.d;const step=MXSTEPS.find(s=>d[s]==null);f.step=step;
  const FL=D.folders.filter(x=>!x.grp);
  const Q={
   mode:['Would you like to do it <b>manually</b>, should I <b>guide you</b> through the screens, or should I <b>do it for you</b> right here?',{k:'mode',items:[['manual','Manually','edit'],['guide','Guide me','orb'],['do','Do it for you','spark']]}],
   dir:['Is this an <b>outbound</b> campaign (we reach out) or <b>inbound</b> (people come to us from ads, landing pages or calls)?',{k:'dir',items:[['out','Outbound','out'],['in','Inbound','in'],['both','Both','swap']]}],
   folder:d.dir==='in'?['Where will inbound leads come from? Pick all that apply.',{k:'folder',multi:1,items:[['Landing page','Landing page','globe'],['Facebook & Instagram ads','Facebook & Instagram ads','thumb'],['Google ads','Google ads','search'],['Phone number','Phone number','phone'],['Website chat','Website chat','chat']]}]:
     ['Who should we contact? Pick a saved folder from Contacts.',{k:'folder',items:FL.map(x=>[x.id,`${x.name} · ${nf(x.count)}`,'folder']).concat([['filter','Filter the database myself','filter']])}],
   ch:['How should we reach them? Pick one, several or all.',{k:'ch',multi:1,items:[['sms','Text (SMS)','sms'],['call','Call','phone'],['email','Email','mail'],['wa','WhatsApp','whatsapp'],['msg','Messenger','messenger'],['ig','Instagram','camera']]}],
   pipe:['Which stages should this campaign follow? Stages decide where each lead sits as agents talk.',{k:'pipe',items:[['telecom','Telecom stages (New → Installed)','kanban'],['realestate','Real estate stages (New → Closed)','kanban'],['dental','Dental stages (Requested → Completed)','kanban'],['ai','Let AI build them from my business','spark']]}],
   agents:['Which agents should do the work? These are my picks for this kind of campaign — change them if you like.',{k:'agents',multi:1,items:[['m1','Mia · Marketing (opens conversations)','megaphone'],['s1','Sarah · Sales (86% review score)','target'],['s3','Robert · Sales (calls)','target'],['s2','Ellie · Sales (fun tone)','target'],['r1','Rhea · Receptionist (bookings)','bell'],['p1','Grace · Support','lifebuoy']],sel:['m1','s1','s3']}],
   booking:['Should this campaign <b>book appointments</b>? If you say no, the receptionist still steps in when someone asks for one.',{k:'booking',items:[['yes','Yes, it books appointments','calendar'],['no','No','x']]}],
   when:['When should it go live? Agents work 9 AM – 8 PM in each person’s time zone.',{k:'when',items:[['now','Go live now','zap'],['tomorrow','Tomorrow at 9 AM','clock'],['later','I’ll pick a date later','calendar']]}],
  };
  if(step==='review'){mxReview(cv);return}
  const q=Q[step];mxSay(cv,q[0],Object.assign({step},q[1],{sel:q[1].sel||[]}));
}
function mxReview(cv){const d=cv.flow.d;
  const fold=d.dir==='in'?(Array.isArray(d.folder)?d.folder.join(', '):d.folder):((D.folders.find(x=>x.id===d.folder)||{name:'Filtered list'}).name);
  const chs=(d.ch||[]).map(k=>PL[k].l).join(', ');const ags=(d.agents||[]).map(agName).join(', ');
  mxSay(cv,`Here’s everything I’ll set up. Nothing is live until you say so.<div class="ccard"><div class="h">${ic('megaphone',14)} New campaign ${dirTag(d.dir==='both'?'both':d.dir)}</div><div class="b"><dl class="kv"><dt>Contacts</dt><dd>${esc(fold)}</dd><dt>Channels</dt><dd>${esc(chs)}</dd><dt>Stages</dt><dd>${{telecom:'Telecom',realestate:'Real estate',dental:'Dental',ai:'Built by AI from your business'}[d.pipe]}</dd><dt>Agents</dt><dd>${esc(ags)} <span class="muted">+ receptionist steps in for bookings</span></dd><dt>Bookings</dt><dd>${d.booking==='yes'?'Yes — uses your booking settings':'No'}</dd><dt>Follow-ups</dt><dd>Let AI handle it (text → call after 4 h → email after 1 day, stop after 5 tries)</dd><dt>Goes live</dt><dd>${{now:'Now',tomorrow:'Tomorrow 9:00 AM',later:'Saved as a draft'}[d.when]}</dd></dl></div></div>`,{k:'review',step:'review',items:[['launch',d.when==='later'?'Save draft':'Launch campaign','zap'],['change','Change something','edit'],['open','Open in the campaign screens','ext']]});
}
function mxLaunch(cv){const d=cv.flow.d;const n=D.campaigns.length+1;const pipe=d.pipe==='ai'?'telecom':d.pipe;const fo=D.folders.find(x=>x.id===d.folder);
  const c={id:'k'+n+uid(''),name:(fo?fo.name:'Inbound leads')+' — '+(d.dir==='in'?'Inbound':'Outbound')+' (by Max)',dir:d.dir==='both'?'out':d.dir,sub:d.dir==='in'?'Inbound ad campaign':'Sales outreach',biz:pipe==='dental'?'BrightSmile Dental':pipe==='realestate'?'Keystone Realty':'Metro Mobile',pipe,folder:d.folder&&!Array.isArray(d.folder)?d.folder:'f7',ch:d.ch||['sms'],status:d.when==='now'?'running':d.when==='tomorrow'?'scheduled':'draft',started:d.when==='now'?'Sep 27':d.when==='tomorrow'?'Starts Sep 28, 9 AM':'Draft',people:fo?fo.count:0,reached:0,replied:0,interested:0,booked:0,installed:0,revenue:0,cost:0,agents:d.agents||['s1'],weights:{},booking:d.booking==='yes',metrics:['people','reached','replied','booked','revenue']};
  D.campaigns.unshift(c);D.products[c.id]=clone(D.products[pipe==='dental'?'k3':pipe==='realestate'?'k2':'k1']);
  mxSay(cv,`<b>The campaign is done. ${c.status==='running'?'It’s live.':c.status==='scheduled'?'It goes live tomorrow at 9 AM.':'It’s saved as a draft.'}</b> ${c.status==='running'?'Mia is sending the first messages now; replies will land in your Inbox and leads will move through the stages on their own.':''}<div class="row">${btn('Open campaign','nav',{k:'sm primary',a:`data-v="campaign" data-p='{"id":"${c.id}"}'`})}${btn('Watch stages live','nav',{k:'sm',a:'data-v="stages"'})}</div>`);
  toast(c.status==='running'?'Campaign is live':'Campaign saved',true);
}

/* ---------- replies ---------- */
function mxReply(cv,text,att){
  const t=text.toLowerCase();
  if(att&&att.length&&!t){mxAnalyze(cv,'k5',true);return}
  // theme
  if(/theme|mode|colou?r/.test(t)||/^(dark|light)/.test(t)){const th=/dark blue|navy/.test(t)?'navy':/mixed|both/.test(t)?'mixed':/dark/.test(t)?'dark':/light|white/.test(t)?'light':null;if(th){setTheme(th);renderSide();mxSay(cv,`Done — I switched the whole app to the <b>${({navy:'dark blue',mixed:'mixed (dark menu, light pages)',dark:'dark',light:'light'})[th]}</b> theme. You can switch back anytime, or ask me.`,{k:'theme',items:[['light','Light','sun'],['dark','Dark','moon'],['navy','Dark blue','moon'],['mixed','Mixed','palette']]});return}}
  // campaign builder
  if(/campaign/.test(t)&&/(build|create|make|set ?up|start|new|launch|run)/.test(t)&&!/analy|report|winning|best/.test(t)){
    const d=mxParseCamp(t);cv.flow={k:'camp',d:Object.assign({mode:null},d)};
    const known=[];if(d.dir)known.push(DIRL[d.dir]);if(d.folder)known.push((D.folders.find(x=>x.id===d.folder)||{}).name);if(d.ch)known.push(d.ch.map(k=>PL[k].l).join(' + '));if(d.pipe)known.push({telecom:'Telecom stages',realestate:'Real estate stages',dental:'Dental stages'}[d.pipe]);if(d.booking)known.push('books appointments');if(d.when)known.push(d.when==='now'?'goes live now':'starts tomorrow');
    if(known.length)mxSay(cv,`Got it. From your message I already have: <b>${esc(known.join(' · '))}</b>. I won’t ask for those again.`);
    mxAsk(cv);return}
  // find people
  if(/(find|show|who|list|get)\b/.test(t)&&/(people|contacts|leads|customers|women|men|in |who )/.test(t)&&typeof parseNL==='function'){const f=parseNL(t);const L=runFilters(D.contacts,f,'all');
    mxSay(cv,`I found <b>${L.length} people</b> in the sample${f.length?` matching: ${f.map(sayF).map(esc).join(' · ')}`:''}. (In your full database that’s about ${nf(L.length*560)}.)<div class="ccard"><div class="tw"><table class="t compact"><thead><tr><th>Name</th><th>City</th><th>Stage</th><th>Source</th></tr></thead><tbody>${L.slice(0,6).map(c=>`<tr><td><button class="lnk" data-act="openContact" data-id="${c.id}">${esc(cname(c))}</button></td><td>${c.city}</td><td>${c.stage}</td><td>${c.source}</td></tr>`).join('')}</tbody></table></div></div><div class="row">${btn('Open in Contacts','mxPeople',{k:'sm primary',a:`data-q="${esc(t)}"`})}${btn('Save as a folder','mxPeopleSave',{k:'sm',i:'folderplus',a:`data-q="${esc(t)}"`})}${btn('Start a campaign with them','mxPeopleCamp',{k:'sm',i:'megaphone',a:`data-q="${esc(t)}"`})}</div>`);return}
  // analyze / optimize
  if(/analy|what.*wrong|problem|suggest|optimi|improve|why .*drop|not working/.test(t)&&!/agent|sarah|robert|ellie|rhea/.test(t)){const k=/win.?back/.test(t)?'k5':/brooklyn|real estate/.test(t)?'k2':/dental/.test(t)?'k3':/ads|fiber/.test(t)?'k4':/telecom|mobility/.test(t)?'k1':'k5';mxAnalyze(cv,k);return}
  // agent edits
  const ag=D.agents.find(a=>t.includes(a.name.toLowerCase()));
  if(ag&&/(friendl|tone|soft|aggress|pushy|change|edit|update|improve|make)/.test(t)){cv.pending={k:'agent',id:ag.id};
    mxSay(cv,`Here’s exactly what I’ll change on <b>${ag.name}</b> (${AT[ag.type].l}). This only changes it inside your account.<ol><li>Call style: “${esc(ag.style.call)}” → “Very friendly, relaxed, never pushy”</li><li>Sales posture: ${esc(ag.job.posture)} → Consultative</li><li>Add a rule: “Ask permission before explaining prices”</li><li>Save as version ${ag.ver+1} (“Friendlier tone — by Max”)</li></ol>Should I go ahead?`,{k:'approve',items:[['yes','OK, go ahead','check'],['no','Not now','x']]});return}
  // bookings questions
  if(/booking|appointment/.test(t)&&/(how many|count|number of|did we)/.test(t)){mxBookings(cv,t);return}
  // costs
  if(/cost|spend|expens|cheaper|reduce|save money|bill/.test(t)){const tot=D.exp.reduce((a,e)=>a+e.cost,0);const top=D.exp.slice().sort((a,b)=>b.cost-a.cost).slice(0,3);
    const r={id:uid('rp'),name:'How to reduce costs — '+dShort(dISO(0)),folder:'r3',date:dISO(0),by:'Max',kind:'Expenses'};D.reports.unshift(r);
    mxSay(cv,`You’ve spent <b>${money(tot,2)}</b> this month. The biggest costs are ${top.map(e=>`<b>${esc(e.n)}</b> (${money(e.cost,2)})`).join(', ')}.<br><br><b>How to cut about 18%:</b><ol><li>Move Win-back from SMS to WhatsApp — about 45% cheaper per conversation (saves ~$60/mo).</li><li>Let Mia send the first text and only call people who reply — cuts call minutes ~30% (saves ~$140/mo).</li><li>Stop calling after 3 unanswered calls instead of 5 (saves ~$35/mo).</li><li>Clean 212 dead numbers so we stop paying for failed texts.</li></ol><div class="row">${btn('Open the report','openReport',{k:'sm primary',i:'file',a:`data-id="${r.id}"`})}${btn('Apply suggestions','mxApplyCost',{k:'sm ai',i:'spark'})}</div><span class="small muted">Saved to Reports › Expenses.</span>`);return}
  // research / presentation
  if(/competitor|research|presentation|slides|best campaign|market/.test(t)){const r={id:uid('rp'),name:'Research: best Q4 campaign to run',folder:'r6',date:dISO(0),by:'Max',kind:'Research'};D.reports.unshift(r);
    mxSay(cv,`I looked outside the app at 14 public sources (competitor websites, ad libraries and telecom news) and compared them with your own results.<div class="ccard"><div class="h">${ic('present',14)} Presentation · 6 slides <span class="bdg ai">${ic('spark',11)}Made by Max</span></div><div class="b"><div class="slides"><div class="slide"><b>What competitors run now</b><span>3 of 4 competitors push “bundle internet + mobile” with a free month.</span></div><div class="slide"><b>Your best performer</b><div class="bars"><i style="height:40%"></i><i style="height:62%"></i><i style="height:90%"></i><i style="height:55%"></i></div><span>Fiber ads: 15% of inquiries install</span></div><div class="slide"><b>Recommended campaign</b><span>Bundle offer to “Fiber · no Mobility” folder (2,210 people), text first, call on reply.</span></div><div class="slide"><b>Expected result</b><span>≈ 190 bundles · ≈ $10,600/month new revenue · cost ≈ $420</span></div></div></div></div><div class="row">${btn('Open presentation','openReport',{k:'sm primary',i:'present',a:`data-id="${r.id}"`})}${btn('Build this campaign','mxQuick',{k:'sm ai',i:'spark',a:'data-q="Build an outbound campaign for Fiber no Mobility by text and call"'})}</div><span class="small muted">Saved to Reports › Max reports. I can also export it as a PDF.</span>`);return}
  // report / pdf
  if(/report|pdf|document|summary/.test(t)){const r={id:uid('rp'),name:'Performance summary — '+dShort(dISO(0)),folder:'r6',date:dISO(0),by:'Max',kind:'Campaign'};D.reports.unshift(r);
    mxSay(cv,`Your report is ready — campaigns, agents, bookings and costs for September in one document.<div class="ccard"><div class="h">${ic('file',14)} ${esc(r.name)} <span class="muted small">4 pages · PDF</span></div><div class="b">Revenue ${money(D.campaigns.reduce((a,c)=>a+c.revenue,0))} · ${nf(D.campaigns.reduce((a,c)=>a+c.booked,0))} bookings · best agent: Rhea (Receptionist) · biggest saving: move win-back to WhatsApp.</div></div><div class="row">${btn('Open report','openReport',{k:'sm primary',a:`data-id="${r.id}"`})}${btn('Analyze it again','mxQuick',{k:'sm ai',i:'spark',a:'data-q="Analyze the telecom campaign"'})}</div><span class="small muted">Saved to Reports › Max reports.</span>`);return}
  // stages
  if(/stage/.test(t)){mxSay(cv,`Stages show where each lead is (for example New → Contacted → Interested → Order Booked → Installed). Agents read every call, text and email and move people automatically, always following the <b>latest</b> message. If they’re not sure, the lead goes to <b>Review</b> for you.`,{k:'go',items:[['stages','Open Stages','kanban'],['newstage','Create a new stage','plus'],['review','Show leads waiting for review','usercheck']]});return}
  // knowledge
  if(/knowledge|upload|files?|pdf|price list/.test(t)){mxSay(cv,`Attach files, pictures or links with the ${ic('clip',12)} button (or paste text) and tell me which agent should learn them. I’ll put everything in one knowledge folder.`,{k:'kb',items:[['s1','Add to Sarah','target'],['r1','Add to Rhea','bell'],['all','Add to all agents','users']]});return}
  // winning / campaign questions
  if(/winning|which (message|agent|script)|most bookings|best day/.test(t)){mxSay(cv,`In <b>Telecom — Mobility Q4</b>:<ul><li><b>Message:</b> version B (“Customers in your area are switching…”) wins with a 34% reply rate vs 28% and 22%.</li><li><b>Call script:</b> “Ask permission first” books 44% vs 31%.</li><li><b>Agent:</b> Sarah converts 21%, Robert 17%, Ellie 15%.</li><li><b>Best day:</b> Tuesday Sep 22 — 19 bookings.</li></ul>`,{k:'go',items:[['camp','Open the campaign dashboard','chart'],['ab','Send the winner to everyone left','zap']]});return}
  // default
  mxSay(cv,`I can do anything in the app for you — just ask. For example:`,{k:'quick',items:[['Build an outbound campaign for Mississauga Leads by text and call','Build a campaign','megaphone'],['Find women in Brooklyn with an email','Find people','users'],['Analyze the Win-back campaign','Analyze a campaign','chart'],['How many bookings did we have on September 23?','Ask about bookings','calendar'],['How can I reduce my costs?','Reduce costs','wallet'],['Switch to dark theme','Change the theme','moon']]});
}
function mxAnalyze(cv,k,fromFile){const c=camp(k);cv.pending={k:'camp',id:k};
  mxSay(cv,`${fromFile?'I read your report. ':''}I checked every message and call in <b>${esc(c.name)}</b>.<div class="ccard"><div class="h">${ic('chart',14)} What’s happening</div><div class="b"><ul><li>Reply rate ${Math.round(c.replied/Math.max(c.reached,1)*100)}% — ${k==='k5'?'down 40% since Sep 14':'steady'}.</li><li>Most common reply: “how much?” (31%) — the first message doesn’t say the price.</li><li>${k==='k5'?'228 people were never contacted because the campaign is paused.':'Calls after 6 PM book 2× more than morning calls.'}</li><li>Mistake: agents ask for the address before explaining the offer — 22% stop replying there.</li></ul></div></div>Here’s <b>exactly what I’ll change</b> if you approve:<ol><li>Put the price in the first message (new opening text, version B).</li><li>Move the address question after the customer says they’re interested.</li><li>Switch calls to 4–8 PM.</li>${k==='k5'?'<li>Swap Nora for Ellie (18% better on win-backs) and resume the campaign.</li>':''}</ol>`,{k:'approve',items:[['yes','OK, go ahead','check'],['no','Not now','x'],['dash','Show full analysis','chart']]});
}
function mxBookings(cv,t){let iso=null,label='';const mm=t.match(/(sep|september|oct|october|aug|august)\w*\s*(\d{1,2})/);
  if(mm){const mon={sep:9,oct:10,aug:8}[mm[1].slice(0,3)];iso=`2026-${String(mon).padStart(2,'0')}-${String(mm[2]).padStart(2,'0')}`;label=dNice(iso)}else if(/today/.test(t)){iso=dISO(0);label='today'}else if(/yesterday/.test(t)){iso=dISO(-1);label='yesterday'}
  let L=D.bookings;if(iso)L=L.filter(b=>b.date===iso);else{const mo=/october/.test(t)?'2026-10':/august/.test(t)?'2026-08':'2026-09';L=L.filter(b=>b.date.startsWith(mo));label=({'2026-10':'October','2026-08':'August','2026-09':'September'})[mo]}
  const canc=/cancel/.test(t);const by=s=>L.filter(b=>b.status===s).length;const ai=L.filter(b=>/^[rs]\d/.test(b.by)).length;
  mxSay(cv,canc?`<b>${by('cancelled')} bookings were cancelled</b> ${label}. ${by('noshow')} more were no-shows.`:`We had <b>${L.length} bookings</b> ${label}: ${by('completed')} completed, ${by('booked')} booked, ${by('arrived')} arrived, ${by('requested')} requested, ${by('cancelled')} cancelled and ${by('noshow')} no-shows. <b>${ai}</b> were booked by AI agents (mostly Rhea and Sam).`,{k:'go',items:[['cal:'+(iso||dISO(0)),'Show on the calendar','calendar'],['bkdash','Open bookings dashboard','chart']]});
}
function mxApprove(cv,yes){const p=cv.pending;cv.pending=null;if(!yes){mxSay(cv,'No problem — nothing was changed.');return}
  if(p.k==='agent'){const a=agent(p.id);a.style.call='Very friendly, relaxed, never pushy';a.job.posture='Consultative';a.job.restrict.push('Ask permission before explaining prices');a.ver++;a.versions.push({v:a.ver,label:'Friendlier tone — by Max',date:'Sep 27'});a.edited=true;
    mxSay(cv,`Done. <b>${a.name}</b> is now on version ${a.ver} and live for new conversations.`,{k:'go',items:[['agent:'+a.id,'Open '+a.name,'bot']]});toast(a.name+' updated to v'+a.ver,true);return}
  if(p.k==='camp'){const c=camp(p.id);if(c.id==='k5'){c.status='running';c.agents=['m3','s2'];}
    D.activity.unshift({i:'spark',text:`<b>Max</b> updated <b>${esc(c.name)}</b>: new opening text, address question moved, calls 4–8 PM`,time:'just now',k:'sys'});
    mxSay(cv,`All changes are applied and <b>${esc(c.name)}</b> is live. I’ll check the reply rate again in 24 hours and tell you how it went.`,{k:'go',items:[['campid:'+c.id,'Open campaign','megaphone']]});toast('Changes applied — campaign is live',true)}
}
A.mx=el=>{const cv=mxFind(el.dataset.c),msg=cv.msgs[+el.dataset.m],o=msg.o,v=el.dataset.v;if(o.done)return;
  if(o.multi&&v!=='__go'){const i=o.sel.indexOf(v);i<0?o.sel.push(v):o.sel.splice(i,1);mxRefresh();return}
  if(o.multi&&v==='__go'){if(!o.sel.length){toast('Pick at least one');return}o.done=true;cv.msgs.push({r:'u',h:o.items.filter(x=>o.sel.includes(x[0])).map(x=>x[1]).join(', ')});if(cv.flow)cv.flow.d[o.k]=o.sel.slice();cv.typing=true;mxRefresh();setTimeout(()=>{cv.typing=false;mxAsk(cv);mxRefresh()},450);return}
  o.sel=[v];o.done=true;const lbl=(o.items.find(x=>x[0]===v)||[,v])[1];
  if(o.k==='quick'){o.done=false;o.sel=[];mxSend(cv.id,v);return}
  cv.msgs.push({r:'u',h:lbl.replace(/<[^>]+>/g,'')});
  if(o.k==='theme'){setTheme(v);renderSide();mxSay(cv,'Switched.');mxRefresh();return}
  if(o.k==='approve'){if(v==='dash'){o.done=false;o.sel=[];openM('analyze',{k:(cv.pending||{}).id||'k5'});mxRefresh();return}mxApprove(cv,v==='yes');mxRefresh();return}
  if(o.k==='kb'){mxSay(cv,`Great — attach the files with ${ic('clip',12)} and I’ll add them to ${v==='all'?'every agent':agName(v)}’s knowledge base.`);mxRefresh();return}
  if(o.k==='go'){if(v==='stages')go('stages');else if(v==='newstage'){go('stages');A.stageNew({dataset:{}})}else if(v==='review'){S.sg.tab='review';go('stages')}else if(v.startsWith('cal:')){S.bk.date=v.slice(4);S.bk.view='day';S.bk.tab='cal';go('bookings')}else if(v==='bkdash'){S.bk.tab='dash';go('bookings')}else if(v.startsWith('agent:')){const a=agent(v.slice(6));S.ag.type=a.type;S.ag.sel=a.id;go('agents')}else if(v.startsWith('campid:'))go('campaign',{id:v.slice(7)});else if(v==='camp')go('campaign',{id:'k1'});else if(v==='ab'){mxSay(cv,'Done — version B is now the only opening message for everyone not contacted yet.');toast('Winner applied',true)}mxRefresh();return}
  if(cv.flow&&o.k==='review'){if(v==='launch'){mxLaunch(cv);cv.flow=null}else if(v==='change'){mxSay(cv,'What would you like to change?',{k:'redo',items:[['dir','Campaign type'],['folder','Contacts'],['ch','Channels'],['pipe','Stages'],['agents','Agents'],['booking','Bookings'],['when','Start time']]})}else{S.wz=wzFromMax(cv.flow.d);go('wizard')}mxRefresh();return}
  if(cv.flow&&o.k==='redo'){cv.flow.d[v]=null;cv.flow.d.review=null;mxAsk(cv);mxRefresh();return}
  if(cv.flow&&o.k==='mode'){if(v==='manual'){cv.flow=null;mxSay(cv,'Opening the campaign screens for you. I’m here in the side panel if you need me.');mxRefresh();newWizard();return}
    if(v==='guide'){cv.flow=null;mxSay(cv,'Let’s do it together. I’ll open the real screens and tell you what to click at each step.');mxRefresh();S.guide={flow:'campaign'};S.maxOpen=true;newWizard();return}
    cv.flow.d.mode='do';}
  else if(cv.flow&&o.k==='folder'&&v==='filter'){cv.flow=null;mxSay(cv,'Opening Contacts — filter who you want, then press “Start campaign”.');mxRefresh();go('contacts');return}
  else if(cv.flow)cv.flow.d[o.k]=v;
  cv.typing=true;mxRefresh();setTimeout(()=>{cv.typing=false;if(cv.flow)mxAsk(cv);mxRefresh()},450);
};
A.mxPeople=el=>{S.ct.filters=parseNL(el.dataset.q);S.ct.folder=null;S.ct.tab='all';S.maxOpen=false;go('contacts')};
A.mxPeopleSave=el=>{const f=parseNL(el.dataset.q);openM('saveFolder',{filters:f,name:f.map(sayF).join(' · ').slice(0,40)||'Saved from Max'})};
A.mxPeopleCamp=el=>{S.ct.filters=parseNL(el.dataset.q);newWizard({src:'filter'})};
A.mxQuick=el=>{const c=el.closest('[data-cv]');mxSend(c?c.dataset.cv:S.maxc,el.dataset.q)};
A.mxApplyCost=()=>{toast('3 cost changes applied: WhatsApp for Win-back, call-on-reply, 3-call limit',true)};

/* ---------- Max page ---------- */
TITLES.max='<b>Max</b> · your AI assistant';
function mxHello(){return `<div class="maxhello"><div class="orb">${ic('orb',24)}</div><h1>Hi Bilal, what do you want to do?</h1><p class="muted" style="max-width:56ch">I can read, create, change or delete anything in Crewline — campaigns, agents, stages, contacts, bookings and settings. I always show you what I’ll change before I change it.</p><div class="sugg" style="justify-content:center;max-width:640px">${[['Build an outbound campaign for Mississauga Leads by text and call','megaphone'],['Find people in Brooklyn','users'],['Analyze the Win-back campaign — what’s wrong?','chart'],['How many bookings did we have on September 23?','calendar'],['Research competitors and suggest my best Q4 campaign','present'],['Make Sarah friendlier','bot'],['Switch to dark blue theme','moon']].map(([q,i])=>`<button data-act="mxQuick" data-q="${esc(q)}">${ic(i,13)}${esc(q)}</button>`).join('')}</div></div>`}
function mxHistList(){return D.maxHist.map(c=>`<button class="${c.id===S.maxc?'on':''}" data-act="mxOpen" data-id="${c.id}">${esc(c.title)}</button>`).join('')}
VIEWS.max=()=>{const cv=mxFind(S.maxc);return `<div class="maxpage"><aside class="maxhist"><div style="padding:12px">${btn('New chat','mxNew',{k:'sm',i:'plus',a:'style="width:100%"'})}</div><div class="eyebrow" style="padding:4px 18px">Saved chats</div><div class="lst" id="mxhist">${mxHistList()}</div><div style="padding:12px;border-top:1px solid var(--line-2)" class="small muted">Chats, files and results are saved. Reports Max makes go to Reports.</div></aside>
 <section class="maxmain"><div class="maxscroll" id="mxscroll"><div class="maxinner" id="mxlog" data-cv="${cv.id}">${mxRender(cv)||mxHello()}</div></div><div class="maxfoot">${aiBox('mxIn','Ask Max anything — type, speak, or attach a file, photo or screenshot','mxSendPage',{sample:'Build an outbound campaign for Mississauga Leads by text and call, and make it go live now',voice:1})}<div class="small faint" style="text-align:center;margin-top:6px">Max asks before changing anything important.</div></div></section></div>`};
AFTER.max=()=>{const sc=$('#mxscroll');if(sc)sc.scrollTop=sc.scrollHeight;const i=$('#mxIn');if(i)i.focus()};
A.mxSendPage=()=>{const i=$('#mxIn');const v=i.value;i.value='';i.style.height='';mxSend(S.maxc,v)};
A.mxNew=()=>{const c={id:uid('mh'),title:'New chat',msgs:[]};D.maxHist.unshift(c);S.maxc=c.id;rr()};
A.mxOpen=el=>{S.maxc=el.dataset.id;const c=mxFind(S.maxc);if(!c.msgs.length&&c.title!=='New chat'){c.msgs.push({r:'u',h:c.title});mxReply(c,c.title,[])}rr()};

/* ---------- side panel (every screen) + guided mode ---------- */
function guideFor(){
  if(S.view==='wizard'&&S.wz){const G={0:['Pick <b>Outbound</b> if you’re reaching out, <b>Inbound</b> if people come from ads or calls.','For inbound, choose the subtype (e.g. Appointment booking).','Press <b>Continue</b>.'],1:['Choose a <b>saved folder</b> — e.g. Mississauga Leads.','Or press “Filter the database myself”.','Check the DNC count — those are skipped automatically.'],2:['Tick <b>Text</b> and <b>Call</b>. Add Email if you have addresses.','You don’t write messages here — that comes in Campaign details.'],3:['Keep the <b>Telecom stages</b> or press “Build with AI”.','Toggle <b>Revenue</b> on the stage where you get paid (Installed).'],4:['Tick <b>Mia</b> (Marketing) to open conversations.','Tick <b>Sarah</b> and <b>Robert</b> (Sales) — they share the work.','Leave the receptionist on so bookings are handled.'],5:['Leave <b>Let AI handle this</b> ON if you’re not sure.','Or add steps: no reply to text → call after 4 hours.'],6:['Toggle <b>This campaign books appointments</b> only if you want bookings.','Press <b>Write with AI</b> next to each opening message.','Add qualifying criteria one sentence at a time.'],7:['Add your products and their value.','Choose the stage that counts as revenue.'],8:['Choose <b>Go live now</b> or pick days on the calendar.','Set working hours, e.g. 9 AM – 8 PM.'],9:['Check the summary, then press <b>Launch campaign</b>.']};return {t:'New campaign — step '+(S.wz.step+1),l:G[S.wz.step]||[]}}
  const V={agents:{t:'AI Agents',l:['Pick an agent type at the top (e.g. Sales).','Click a tile to open that agent below.','Press <b>Create / edit with AI</b> to set it up by talking.']},contacts:{t:'Contacts',l:['Use <b>Build filters with AI</b> to describe who you want.','Right-click a folder to start a campaign.','Switch Rows ↔ Folders at the top right.']},stages:{t:'Stages',l:['Drag a card to move a lead.','Press <b>New stage</b> to add one.','Leads the AI isn’t sure about wait in <b>Review</b>.']},bookings:{t:'Bookings',l:['Pick the campaign at the top.','Click an empty time to book.','Click a booking to mark Arrived or Completed.']}};
  return V[S.view]||{t:'This screen',l:['Ask me anything about this screen.','Or tell me what you want done — I’ll do it for you.']}
}
function mxPanelBody(){const g=S.guide?guideFor():null;return `${g?`<div class="guide-step"><div class="row between"><b>${ic('orb',14)} Guiding you · ${g.t}</b>${btn('Stop guiding','guideStop',{k:'xs ghost'})}</div><ol>${g.l.map(x=>`<li>${x}</li>`).join('')}</ol></div><div style="height:12px"></div>`:''}<div data-cv="mp0">${mxRender(D.maxPanel)||`<div class="stack-s"><p class="muted small">I’m Max. I can do anything on this screen for you, or guide you step by step.</p><div class="sugg">${['What’s on this screen?','Do it for me','Guide me step by step','Analyze this with AI'].map(q=>`<button data-act="mxQuick" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div></div>`}</div>`}
function renderMaxPanel(){const p=$('#maxpanel');if(!S.maxOpen||S.view==='max'){p.hidden=true;p.innerHTML='';return}p.hidden=false;
  p.innerHTML=`<div class="mp-h"><span class="orb" style="width:28px;height:28px;border-radius:8px">${ic('orb',15)}</span><b>Max</b><span class="bdg ai">${S.guide?'Guided mode':'Assistant'}</span><span class="grow"></span>${iconBtn('ext','mxToPage','Open full screen')}${iconBtn('x','maxPanel','Close')}</div><div class="mp-b" id="mplog">${mxPanelBody()}</div><div class="mp-f">${aiBox('mpIn','Ask Max or say what to do','mxSendPanel',{sample:'Do this step for me please'})}</div>`;
  const l=$('#mplog');l.scrollTop=l.scrollHeight}
A.maxPanel=()=>{S.maxOpen=!S.maxOpen;renderMaxPanel();renderFab()};
A.mxToPage=()=>{S.maxOpen=false;D.maxHist.unshift({id:'mhp'+uid(''),title:'From side panel',msgs:D.maxPanel.msgs.slice()});S.maxc=D.maxHist[0].id;go('max')};
A.mxSendPanel=()=>{const i=$('#mpIn');const v=i.value;i.value='';if(/do it for me|do this step/i.test(v)&&S.view==='wizard'){D.maxPanel.msgs.push({r:'u',h:v});mxSay(D.maxPanel,'Done — I filled in this step with the recommended settings. Check it and press Continue.');wzAutofill();mxRefresh();return}if(/guide me/i.test(v)){D.maxPanel.msgs.push({r:'u',h:v});S.guide={flow:S.view};mxSay(D.maxPanel,'Guided mode is on. Follow the steps at the top — I update them as you move.');renderMaxPanel();return}mxSend('mp0',v)};
A.guideStop=()=>{S.guide=null;renderMaxPanel()};
A.homeSend=()=>{const i=$('#homeIn');const v=(i.value||'').trim();if(!v&&!(S.attached||[]).length){toast('Type, speak or attach something first');return}const c={id:uid('mh'),title:'New chat',msgs:[]};D.maxHist.unshift(c);S.maxc=c.id;go('max');mxSend(c.id,v)};
A.homeQuick=el=>{const c={id:uid('mh'),title:'New chat',msgs:[]};D.maxHist.unshift(c);S.maxc=c.id;go('max');mxSend(c.id,el.dataset.q)};

/* ---------- live voice conversation ---------- */
M.voice=m=>MS('Talking to Max',`<div class="voice"><div class="vorb">${ic(m.i%2?'wave':'voice',44)}</div><b>${m.i%2?'Max is speaking…':'Listening…'}</b><div class="stack-s" style="width:100%;max-width:460px">${m.lines.slice(0,m.i+1).map(l=>`<div class="${l[0]==='you'?'cm u':'cm x'}">${l[0]==='you'?'':MXI()}<div class="bb">${esc(l[1])}</div></div>`).join('')}</div></div>`,`<span class="l small muted">Prototype: scripted voice demo — your microphone isn’t used.</span>${btn('End conversation','close',{k:'danger',i:'phoneoff'})}`,'',"Live voice");
A.voiceLive=()=>{openM('voice',{i:0,lines:[['max','Hi Bilal, I’m listening. What do you need?'],['you','How many people replied today, and is anything wrong?'],['max','412 conversations today and 312 replies. One problem: the Win-back campaign’s replies dropped 40%. Want me to fix it?'],['you','Yes, fix it.'],['max','Done. I changed the opening message, moved the address question and resumed the campaign. I’ll report back tomorrow.']]});let i=0;const t=setInterval(()=>{if(!S.modal||S.modal.t!=='voice'){clearInterval(t);return}i++;S.modal.i=i;renderModal();if(i>=4)clearInterval(t)},1800)};

/* ---------- command palette ---------- */
M.cmd=m=>{const q=(m.q||'').toLowerCase();const pages=NAV.filter(n=>typeof n!=='string'&&(!q||n[1].toLowerCase().includes(q))).map(n=>({l:'Go to '+n[1],i:n[2],act:'nav',a:`data-v="${n[0]}"`,k:'Page'}));
  const ppl=q?D.contacts.filter(c=>cname(c).toLowerCase().includes(q)||c.phone.includes(q)).slice(0,5).map(c=>({l:cname(c)+' · '+c.city,i:'user',act:'openContact',a:`data-id="${c.id}"`,k:'Contact'})):[];
  const cps=q?D.campaigns.filter(c=>c.name.toLowerCase().includes(q)).map(c=>({l:c.name,i:'megaphone',act:'nav',a:`data-v="campaign" data-p='{"id":"${c.id}"}'`,k:'Campaign'})):[];
  const ags=q?D.agents.filter(a=>a.name.toLowerCase().includes(q)).map(a=>({l:a.name+' · '+AT[a.type].l,i:'bot',act:'openAgent',a:`data-id="${a.id}"`,k:'Agent'})):[];
  const L=[...(q?[{l:`Ask Max: “${m.q}”`,i:'spark',act:'cmdAsk',a:'',k:'Max'}]:[{l:'Build a campaign with Max',i:'spark',act:'homeQuick',a:'data-q="Build a new campaign"',k:'Max'}]),...ppl,...cps,...ags,...pages].slice(0,12);
  return `<div class="mb" data-act="bgclose"><div class="modal" style="align-self:start;margin-top:10vh"><div class="aibox" style="border:0;border-bottom:1px solid var(--line-2);border-radius:0;padding:10px 12px">${ic('search',16)}<input id="cmdq" value="${esc(m.q||'')}" placeholder="Search contacts, campaigns, agents — or ask Max to do something" data-inp="cmdq" data-enter="cmdAsk" data-autofocus aria-label="Search or ask"><span class="kbd">Esc</span></div><div style="padding:6px;max-height:56vh;overflow-y:auto" id="cmdl">${L.map(x=>`<button class="lr" style="border:0;border-radius:7px" data-act="${x.act}" ${x.a}>${ic(x.i,15)}<span class="m">${esc(x.l)}</span><span class="small faint">${x.k}</span></button>`).join('')}</div></div></div>`};
A.cmd=()=>openM('cmd',{q:''});
I.cmdq=el=>{S.modal.q=el.value;const pos=el.selectionStart;renderModal();const n=$('#cmdq');n.focus();n.setSelectionRange(pos,pos)};
A.cmdAsk=()=>{const q=S.modal.q;closeM();if(!q)return;const c={id:uid('mh'),title:'New chat',msgs:[]};D.maxHist.unshift(c);S.maxc=c.id;go('max');mxSend(c.id,q)};

/* ---------- notifications ---------- */
A.notifs=el=>{openPop(el,`<div class="card-h" style="min-height:44px"><h3>Notifications</h3>${btn('Mark all read','notifsRead',{k:'xs ghost'})}</div>${D.notifs.map((n,i)=>`<button class="lr" data-act="notifGo" data-i="${i}">${n.read?'<span style="width:8px"></span>':'<span class="ud" style="width:8px;height:8px;border-radius:50%;background:var(--primary)"></span>'}<span class="m"><span class="t1" style="font-weight:${n.read?400:600}">${esc(n.text)}</span><div class="t2">${n.time}</div></span></button>`).join('')}<div style="padding:10px 16px" class="small muted">Choose where you get notified in Settings › Notifications.</div>`)};
A.notifsRead=()=>{D.notifs.forEach(n=>n.read=true);hidePop();renderTop()};
A.notifGo=el=>{const n=D.notifs[+el.dataset.i];n.read=true;hidePop();go(n.go)};
