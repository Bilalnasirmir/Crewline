/* ================= LIVE ENGINE (demo) + BOOT ================= */
let liveN=0;
function liveTick(){if(!S.live)return;liveN++;
 const busy=S.modal||(document.activeElement&&document.activeElement.matches('input,textarea,select,[contenteditable]'));
 const k=liveN%4;
 if(k===1){// an agent moves a lead forward
  const pool=D.contacts.filter(c=>{const cp=camp(c.camp);if(!cp||cp.status!=='running')return false;const L=stagesOf(cp);const i=L.findIndex(s=>s.n===c.stage);return i>=0&&i<L.length-3&&L[i].t==='open'});
  const c=liveN===1?byId('c4'):pick(pool);if(!c)return;const cp=camp(c.camp),L=stagesOf(cp);const i=L.findIndex(s=>s.n===c.stage);let nx=L[i+1];if(nx&&nx.t==='pending')nx=L[i+2]||nx;
  const by=c.agent||cp.agents.find(a=>/^s/.test(a))||'s1';c.agent=by;
  if(!busy||S.view!=='stages')moveLead(c.id,nx.n,by);else{c.stage=nx.n;D.activity.unshift({i:'kanban',text:`<b>${agName(by)}</b> moved <b>${esc(cname(c))}</b> to <b>${esc(nx.n)}</b>`,time:'just now',k:'stage',nw:1})}
 }else if(k===2){// new inbound lead
  const f=pick(FN_F.concat(FN_M)),l=pick(LN);const c={id:'c'+uid(''),first:f,last:l,name:f+' '+l,gender:'F',age:rint(22,60),phone:`(905) 555-${rint(1000,9999)}`,email:'',address:'',city:'Mississauga',region:'ON',country:'Canada',zip:'L5A '+rint(1,9)+'K'+rint(1,9),folder:'f7',camp:'k4',stage:'New inquiry',dir:'in',source:pick(['Ad campaign','Landing page','Inbound call']),agent:'s2',purchase:null,last:0,attempts:0,noReply:0,consent:{sms:true,call:true,email:true,wa:true},dnc:false,tags:[],lang:'English',notes:'',custom:{}};D.contacts.push(c);camp('k4').people++;
  D.activity.unshift({i:'in',text:`New inbound lead <b>${esc(c.name)}</b> from ${esc(c.source.toLowerCase())} — Ellie replied in 4 seconds`,time:'just now',k:'in',nw:1});
 }else if(k===3){// receptionist books
  const b={id:uid('b'),camp:'k3',staff:pick(['Hygienist Maya','Hygienist Tom','Dr. Lee']),svc:pick(['Cleaning','Check-up']),who:pick(FN_F)+' '+pick(LN),date:dISO(1),start:rint(2,16)*30,dur:45,status:'booked',by:pick(['r1','r2']),created:'Today',price:120,conf:['sms']};D.bookings.push(b);
  D.activity.unshift({i:'calendar',text:`<b>${agName(b.by)}</b> booked ${esc(b.svc.toLowerCase())} for <b>${esc(b.who)}</b> tomorrow at ${bkT(b.start)}`,time:'just now',k:'book',nw:1});
 }else{const c=camp('k1');c.reached+=rint(2,6);c.replied+=rint(0,2);D.activity.unshift({i:'sms',text:`<b>Mia</b> sent the first message to ${rint(3,9)} people in <b>Mississauga Leads</b>`,time:'just now',k:'sys',nw:1})}
 D.activity.forEach((a,i)=>{if(i>0){a.nw=0;if(a.time==='just now')a.time='1 min ago'}});D.activity=D.activity.slice(0,30);
 if(busy)return;
 if(S.view==='home'){const f=$('#homefeed');if(f)f.innerHTML=D.activity.slice(0,7).map(a=>`<div class="fe ${a.nw?'new':''}"><span class="aimark">${ic(a.i,14)}</span><div>${a.text}<div class="small faint">${a.time}</div></div></div>`).join('')}
 if(S.view==='stages'&&k!==1)rr();
}
setInterval(liveTick,9000);
applyTheme();
render();
