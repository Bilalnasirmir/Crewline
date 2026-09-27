/* ================= DATA (sample workspace: Bilal's Group) ================= */
let _s=20260927;const R=()=>(_s=_s*16807%2147483647)/2147483647;const pick=a=>a[Math.floor(R()*a.length)];const rint=(a,b)=>a+Math.floor(R()*(b-a+1));
const TODAY=new Date(2026,8,27,12);
const dISO=off=>{const d=new Date(TODAY);d.setDate(d.getDate()+off);return d.toISOString().slice(0,10)};
const dNice=iso=>{const d=new Date(iso+'T12:00:00');return d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})};
const dShort=iso=>{const d=new Date(iso+'T12:00:00');return d.toLocaleDateString('en-US',{month:'short',day:'numeric'})};
const agoTxt=d=>d<1?'today':d<2?'yesterday':d<14?d+' days ago':d<60?Math.round(d/7)+' weeks ago':Math.round(d/30)+' months ago';

const D={};
D.biz=[{id:'b1',n:'Metro Mobile',ind:'Telecom'},{id:'b2',n:'Keystone Realty',ind:'Real estate'},{id:'b3',n:'BrightSmile Dental',ind:'Dental clinic'}];

/* ---------- folders (Windows-style) ---------- */
D.folders=[
 {id:'g1',name:'Canada',parent:null,grp:1,saved:'2026-09-02 09:14'},
 {id:'f1',name:'Mississauga Leads',parent:'g1',count:20000,saved:'2026-09-12 10:42',src:'Imported file · mississauga_leads.xlsx'},
 {id:'f2',name:'Toronto Leads',parent:'g1',count:8450,saved:'2026-09-14 16:05',src:'Imported file · toronto_q3.csv'},
 {id:'f3',name:'Telecom Leads',parent:'g1',count:12300,saved:'2026-09-18 11:20',src:'Saved from filters'},
 {id:'g2',name:'United States',parent:null,grp:1,saved:'2026-08-28 13:02'},
 {id:'f4',name:'Brooklyn Buyers',parent:'g2',count:4120,saved:'2026-09-10 08:55',src:'Imported file · brooklyn_buyers.csv'},
 {id:'f5',name:'NYC Fiber Customers',parent:'g2',count:6780,saved:'2026-08-30 17:40',src:'Imported file · nyc_fiber.xlsx'},
 {id:'f5a',name:'Fiber · no Mobility',parent:'f5',count:2210,saved:'2026-09-21 14:32',src:'Saved from filters'},
 {id:'g3',name:'Pakistan',parent:null,grp:1,saved:'2026-09-05 12:00'},
 {id:'f6',name:'Karachi Leads',parent:'g3',count:3900,saved:'2026-09-15 19:10',src:'Imported file · karachi.csv'},
 {id:'f7',name:'Inbound · Ads & landing pages',parent:null,count:1240,saved:'2026-09-01 00:00',src:'Inbound (auto-filled by campaigns)'},
 {id:'f8',name:'Dental patients 2025',parent:null,count:2310,saved:'2026-07-19 10:12',src:'Imported file · patients_2025.csv'},
];

/* ---------- campaigns ---------- */
D.campaigns=[
 {id:'k1',name:'Telecom — Mobility Q4',dir:'out',sub:'Sales outreach',biz:'Metro Mobile',pipe:'telecom',folder:'f1',ch:['sms','call','email','wa'],status:'running',started:'Sep 8',people:1240,reached:1102,replied:344,interested:198,booked:121,installed:74,revenue:36300,cost:418,agents:['m1','s1','s2','s3','p1','r1'],weights:{s1:40,s2:30,s3:30},booking:false,metrics:['people','reached','replied','booked','revenue']},
 {id:'k2',name:'Real Estate — Brooklyn Buyers',dir:'out',sub:'Sales outreach',biz:'Keystone Realty',pipe:'realestate',folder:'f4',ch:['sms','call','email'],status:'running',started:'Sep 12',people:860,reached:790,replied:201,interested:96,booked:41,installed:6,revenue:55200,cost:260,agents:['m2','s3','r3'],weights:{s3:100},booking:true,metrics:['people','reached','replied','booked','revenue']},
 {id:'k3',name:'Dental — Appointment Booking',dir:'in',sub:'Appointment booking',biz:'BrightSmile Dental',pipe:'dental',folder:'f8',ch:['call','sms','chat','wa'],status:'running',started:'Aug 1',people:2310,reached:2310,replied:1874,interested:0,booked:612,installed:540,revenue:81400,cost:388,agents:['r1','r2','f1','p2'],weights:{r1:60,r2:40},booking:true,metrics:['people','replied','booked','revenue','cpb']},
 {id:'k4',name:'Fiber — Facebook & Google Ads',dir:'in',sub:'Inbound ad campaign',biz:'Metro Mobile',pipe:'telecom',folder:'f7',ch:['call','sms','msg','ig','tt'],status:'running',started:'Sep 1',people:1240,reached:1240,replied:902,interested:410,booked:188,installed:121,revenue:12100,cost:302,agents:['s1','s2','m1','t1'],weights:{s1:50,s2:50},booking:false,metrics:['people','replied','interested','booked','revenue']},
 {id:'k5',name:'Telecom — Fiber Win-back',dir:'out',sub:'Reactivate old customers',biz:'Metro Mobile',pipe:'telecom',folder:'f5a',ch:['sms','email'],status:'paused',started:'Aug 30',people:540,reached:312,replied:40,interested:22,booked:9,installed:6,revenue:600,cost:48,agents:['m3','s2'],weights:{s2:100},booking:false,metrics:['people','reached','replied','booked','revenue']},
];
D.products={
 k1:{cur:'$',rev:'Installed',cancel:'full',cats:[{n:'Mobility',items:[['Phone line',20],['5G Unlimited line',35]]},{n:'Home',items:[['Internet 1 Gig',50],['TV package',10]]}]},
 k2:{cur:'$',rev:'Closed',cancel:'partial',cats:[{n:'Buyer services',items:[['Buyer commission (average)',9200],['Mortgage referral',400]]}]},
 k3:{cur:'$',rev:'Completed',cancel:'full',cats:[{n:'Treatments',items:[['Cleaning',120],['Check-up',90],['Filling',180],['Root canal',950],['Whitening',350]]}]},
 k4:{cur:'$',rev:'Installed',cancel:'full',cats:[{n:'Home',items:[['Internet 1 Gig',50],['TV package',10]]},{n:'Mobility',items:[['Phone line',20]]}]},
 k5:{cur:'$',rev:'Installed',cancel:'partial',cats:[{n:'Home',items:[['Internet 1 Gig',50]]}]},
};
const camp=id=>D.campaigns.find(c=>c.id===id);

/* ---------- stages (per pipeline, separate inbound / outbound) ---------- */
const st=(n,c,i,crit,o={})=>({id:uid('st'),n,c,i,crit,rev:!!o.rev,t:o.t||'open'});
D.stages={
 telecom:{out:[
  st('New','#8A93A6','user',['Lead was added to the campaign']),
  st('Contacted','#4C8BF5','send',['The agent sent the first text, call or email','No reply from the customer yet']),
  st('Interested','#7048E8','star',['Customer says they are interested','Customer asks about price or plans','Customer says “yes, tell me more”']),
  st('Pending','#C68A12','clock',['Customer says they need time to think','Customer asks to be contacted later','AI could not decide the stage with confidence'],{t:'pending'}),
  st('Order Booked','#0F766E','check',['Customer says “OK, go ahead”','Customer confirms plan, lines and address','An order number was created']),
  st('Shipped','#2A55B0','package',['Carrier system reports the order shipped']),
  st('Installed','#15803D','zap',['Technician confirms the installation','Customer confirms the service works'],{rev:1,t:'won'}),
  st('Cancelled','#D92D20','x',['Customer cancels after the order was booked'],{t:'lost'}),
  st('Not interested','#6B6B6B','minus',['Customer says no or not interested','Customer asks us to stop'],{t:'lost'})],
 in:[
  st('New inquiry','#8A93A6','in',['Customer called, messaged or filled a form']),
  st('Qualified','#7048E8','star',['Customer lives in a service area','Customer wants internet or TV','Customer meets all required qualifying questions']),
  st('Pending','#C68A12','clock',['Customer needs time to think','Customer asks for a call-back later'],{t:'pending'}),
  st('Order Booked','#0F766E','check',['Customer confirms the order']),
  st('Installed','#15803D','zap',['Technician confirms the installation'],{rev:1,t:'won'}),
  st('Not qualified','#6B6B6B','minus',['Address is outside the service area','Customer is under 18'],{t:'lost'})]},
 realestate:{out:[
  st('New','#8A93A6','user',['Lead was added to the campaign']),
  st('Contacted','#4C8BF5','send',['The agent sent the first message']),
  st('Qualified','#7048E8','star',['Customer is interested','Customer says “OK, go ahead”','Customer says “yes, I need this”','Customer meets all qualifying questions']),
  st('Pending','#C68A12','clock',['Customer needs time to think'],{t:'pending'}),
  st('Viewing Booked','#0F766E','calendar',['A viewing was booked on the calendar']),
  st('Offer Made','#2A55B0','file',['Customer made an offer (moved by a person)']),
  st('Closed','#15803D','check',['Deal closed and commission confirmed'],{rev:1,t:'won'}),
  st('Not interested','#6B6B6B','minus',['Customer says no'],{t:'lost'})],
 in:[
  st('New inquiry','#8A93A6','in',['Customer asked about a listing']),
  st('Qualified','#7048E8','star',['Budget and area confirmed']),
  st('Viewing Booked','#0F766E','calendar',['A viewing was booked']),
  st('Closed','#15803D','check',['Deal closed'],{rev:1,t:'won'}),
  st('Not interested','#6B6B6B','minus',['Customer says no'],{t:'lost'})]},
 dental:{in:[
  st('Requested','#C68A12','query',['Patient asks for an appointment']),
  st('Contacted','#4C8BF5','send',['Receptionist replied with times']),
  st('Appointment Booked','#0F766E','calendar',['Time confirmed on the calendar']),
  st('Arrived','#7048E8','pin',['Front desk marked the patient arrived']),
  st('Completed','#15803D','check',['Treatment finished and paid'],{rev:1,t:'won'}),
  st('No-show','#D92D20','x',['Patient missed the appointment'],{t:'lost'}),
  st('Cancelled','#6B6B6B','minus',['Patient cancelled'],{t:'lost'})],
 out:[
  st('New','#8A93A6','user',['Patient due for a check-up']),
  st('Contacted','#4C8BF5','send',['Recall text or call sent']),
  st('Appointment Booked','#0F766E','calendar',['Time confirmed']),
  st('Completed','#15803D','check',['Visit completed'],{rev:1,t:'won'}),
  st('No reply','#6B6B6B','minus',['No reply after 3 tries'],{t:'lost'})]},
};
const stagesOf=c=>D.stages[c.pipe][c.dir==='in'?'in':'out'];
const revStage=c=>(stagesOf(c).find(s=>s.rev)||{}).n;

/* ---------- contacts ---------- */
const FN_F=['Aisha','Maria','Sofia','Emily','Fatima','Grace','Hannah','Priya','Chloe','Nadia','Olivia','Leila','Zara','Rosa','Mei','Ayesha','Sana'];
const FN_M=['James','Omar','Daniel','Carlos','Ethan','Noah','Arjun','Lucas','Samir','Marcus','Kevin','Hassan','Diego','Leo','Imran','Ahmed','Bilal'];
const LN=['Khan','Rivera','Chen','Patel','Johnson','Garcia','Nguyen','Ali','Brown','Martinez','Cohen','Okafor','Rossi','Kim','Hughes','Umar','Lopez','Walker','Siddiqui','Park'];
const CITY={f1:['Mississauga','ON','Canada','L5B'],f2:['Toronto','ON','Canada','M5V'],f3:['Brampton','ON','Canada','L6P'],f4:['Brooklyn','NY','United States','11215'],f5:['Manhattan','NY','United States','10001'],f5a:['Manhattan','NY','United States','10003'],f6:['Karachi','Sindh','Pakistan','75500'],f7:['Mississauga','ON','Canada','L5A'],f8:['Manhattan','NY','United States','10011']};
const STREETS=['King St W','Hurontario St','Queen St E','7th Ave','Atlantic Ave','Clifton Rd','Burnhamthorpe Rd','Bay St','Main St','Shahrah-e-Faisal','Dundas St'];
const SOURCES=[['Imported file','out'],['Referral','out'],['Web form','in'],['Landing page','in'],['Ad campaign','in'],['Inbound call','in'],['Other','out']];
D.contacts=[];
const plan=[['k1','f1',24],['k1','f3',6],['k2','f4',14],['k3','f8',14],['k4','f7',14],['k5','f5a',8],[null,'f2',5],[null,'f6',5]];
let cn=0;
plan.forEach(([k,f,n])=>{for(let i=0;i<n;i++){cn++;
  const g=R()<.5?'F':'M',first=pick(g==='F'?FN_F:FN_M),last=pick(LN),cy=CITY[f],cp=k?camp(k):null;
  const stg=cp?stagesOf(cp):null;const sIdx=stg?Math.min(stg.length-1,Math.floor(Math.pow(R(),1.3)*stg.length)):-1;
  const srcPool=cp&&cp.dir==='in'?SOURCES.filter(s=>s[1]==='in'):SOURCES.filter(s=>s[1]==='out');const src=pick(srcPool);
  const hasE=R()<.72,hasA=R()<.9;const stage=stg?stg[sIdx].n:'—';const isRev=stg&&stg[sIdx].rev;
  const prods=k?D.products[k].cats.flatMap(c=>c.items):[];const pr=prods.length?pick(prods):null;
  const c={id:'c'+cn,first,last,name:first+' '+last,gender:g,age:rint(21,72),phone:cy[2]==='Pakistan'?`+92 3${rint(0,4)}${rint(0,9)} ${rint(100,999)} ${rint(1000,9999)}`:`(${cy[2]==='Canada'?pick(['905','416','647']):pick(['718','347','212','646'])}) 555-${String(rint(1000,9999))}`,
   email:hasE?`${first.toLowerCase()}.${last.toLowerCase()}${rint(1,89)}@${pick(['gmail.com','outlook.com','yahoo.com','icloud.com'])}`:'',
   address:hasA?`${rint(12,980)} ${pick(STREETS)}`:'',city:cy[0],region:cy[1],country:cy[2],zip:cy[3]+(cy[2]==='Canada'?' '+rint(1,9)+pick(['A','B','K','R'])+rint(1,9):''),
   folder:f,camp:k,stage,dir:cp?cp.dir:(src[1]),source:src[0],agent:cp?pick(cp.agents.filter(a=>/^[sr]/.test(a))):null,
   purchase:isRev&&pr?{product:pr[0],amount:pr[1],date:dISO(-rint(1,60))}:(R()<.25&&pr?{product:pr[0],amount:pr[1],date:dISO(-rint(60,400))}:null),
   last:rint(0,40),attempts:rint(0,6),noReply:0,consent:{sms:R()<.9,call:R()<.8,email:R()<.93,wa:R()<.7},dnc:R()<.04,tags:[],lang:pick(['English','English','English','Urdu','Spanish']),notes:'',unknownName:cn%23===7,custom:{}};
  c.noReply=Math.min(c.attempts,rint(0,6));if(isRev&&c.purchase)c.sold=c.purchase.date;
  D.contacts.push(c)}});
// recognisable people used across the demo
const fix=(i,o)=>Object.assign(D.contacts[i],o);
fix(0,{first:'Maria',last:'Rivera',name:'Maria Rivera',gender:'F',email:'maria.rivera@gmail.com',address:'214 King St W',stage:'Order Booked',agent:'s1',unknownName:false,consent:{sms:true,call:true,email:true,wa:true},dnc:false,phone:'(905) 555-2187',source:'Imported file',attempts:3,noReply:0,last:0,purchase:{product:'Internet 1 Gig',amount:50,date:dISO(-41)}});
fix(1,{first:'Kevin',last:'Brown',name:'Kevin Brown',stage:'Pending',agent:'s2',unknownName:false,last:0,attempts:2,noReply:0});
fix(2,{first:'Ahmed',last:'Umar',name:'Ahmed Umar',stage:'Contacted',agent:'s3',unknownName:false,attempts:6,noReply:6,last:3,phone:'(905) 555-0161'});
fix(3,{first:'Umar',last:'Ali',name:'Umar Ali',stage:'New',agent:'s1',unknownName:false,attempts:0,noReply:0,last:0});
fix(4,{first:'Priya',last:'Patel',name:'Priya Patel',stage:'Installed',unknownName:false,purchase:{product:'5G Unlimited line',amount:35,date:dISO(-12)},sold:dISO(-12)});
fix(30,{first:'James',last:'Okafor',name:'James Okafor',stage:'Viewing Booked',agent:'s3',unknownName:false,email:'james.okafor@outlook.com'});
fix(32,{first:'Daniel',last:'Nguyen',name:'Daniel Nguyen',gender:'M',stage:'Pending',agent:'s3',unknownName:false,email:'daniel.n@outlook.com'});
fix(31,{first:'Sofia',last:'Rossi',name:'Sofia Rossi',stage:'Qualified',agent:'s3',unknownName:false});
fix(44,{first:'Grace',last:'Kim',name:'Grace Kim',stage:'Appointment Booked',agent:'r1',unknownName:false,email:'grace.kim@icloud.com'});
fix(45,{first:'Emily',last:'Park',name:'Emily Park',stage:'Requested',agent:'r1',unknownName:false});
fix(46,{first:'Leila',last:'Cohen',name:'Leila Cohen',stage:'Requested',agent:'r3',unknownName:false});
fix(58,{first:'Priya',last:'Chen',name:'Priya Chen',stage:'Qualified',agent:'s1',unknownName:false,source:'Ad campaign'});
fix(59,{first:'Hassan',last:'Ali',name:'Hassan Ali',stage:'New inquiry',agent:'m1',unknownName:false,source:'Landing page'});
fix(60,{first:'Omar',last:'Siddiqui',name:'Omar Siddiqui',stage:'New inquiry',agent:'s2',unknownName:false,source:'Ad campaign'});
fix(72,{first:'Carlos',last:'Garcia',name:'Carlos Garcia',stage:'Not interested',agent:'s2',unknownName:false,lang:'Spanish',consent:{sms:false,call:true,email:true,wa:false}});
D.contacts.forEach(c=>{if(c.unknownName){c.first='';c.last='';c.name=''}});
const byId=id=>D.contacts.find(c=>c.id===id);
const cname=c=>c&&c.name?c.name:'Name missing';
const scoreOf=c=>c.noReply>=5?'Dead':c.noReply>=3?'Not responding':/Booked|Installed|Completed|Closed|Qualified|Interested|Arrived/.test(c.stage)?'Hot':c.last<14?'Warm':'Cold';

/* ---------- Do-Not-Contact ---------- */
D.dnc=[
 {name:'Robert Hale',phone:'(905) 555-0199',reason:'Litigator',added:'Sep 02',by:'Imported · litigator_list.csv',comment:'Known TCPA plaintiff — never contact'},
 {name:'Carlos Garcia',phone:D.contacts[72].phone,reason:'Opted out',added:'Sep 26',by:'Nora · AI (replied STOP)',comment:'Replied STOP on WhatsApp'},
 {name:'Dana White',phone:'(416) 555-0102',reason:'Opted out',added:'Sep 21',by:'Sarah · AI',comment:'“Please don’t text me again”'},
 {name:'—',phone:'(647) 555-0133',reason:'National Do-Not-Call list',added:'Sep 01',by:'Auto-sync',comment:''},
 {name:'Frank Moore',phone:'(718) 555-0144',reason:'Litigator',added:'Aug 28',by:'Imported · litigator_list.csv',comment:''},
 {name:'Lina Haddad',phone:'(212) 555-0171',reason:'Asked by email',added:'Sep 18',by:'Ali Raza',comment:'Emailed support asking to be removed'},
 {name:'—',phone:'(905) 555-0120',reason:'National Do-Not-Call list',added:'Sep 01',by:'Auto-sync',comment:''},
 {name:'Tom Becker',phone:'(347) 555-0108',reason:'Manual',added:'Sep 11',by:'Bilal Nasir',comment:'Existing business partner'},
];
D.contacts.filter(c=>c.dnc).forEach(c=>D.dnc.push({name:c.name||'—',phone:c.phone,reason:'National Do-Not-Call list',added:'Sep 20',by:'Auto-sync',comment:''}));
D.dups=[
 {a:{name:'Maria Rivera',phone:'(905) 555-2187',email:'maria.rivera@gmail.com',src:'mississauga_leads.xlsx'},b:{name:'Maria Rivera',phone:'(905) 555-2187',email:'',src:'Web form'},why:'Same phone'},
 {a:{name:'Kevin Brown',phone:'(416) 555-3310',email:'kevin.b@yahoo.com',src:'toronto_q3.csv'},b:{name:'Kevin Browne',phone:'(416) 555-3310',email:'kevin.b@yahoo.com',src:'Referral'},why:'Same phone + email'},
 {a:{name:'Ayesha Khan',phone:'+92 321 555 1201',email:'',src:'karachi.csv'},b:{name:'Aisha Khan',phone:'+92 321 555 1201',email:'ayesha.k@gmail.com',src:'Landing page'},why:'Same phone, similar name'},
 {a:{name:'Leo Martinez',phone:'(718) 555-9012',email:'leo.m@gmail.com',src:'brooklyn_buyers.csv'},b:{name:'Leo Martinez',phone:'(718) 555-9013',email:'leo.m@gmail.com',src:'Ad campaign'},why:'Same email'},
 {a:{name:'Grace Kim',phone:'(212) 555-8812',email:'grace.kim@icloud.com',src:'patients_2025.csv'},b:{name:'Grace Kim',phone:'(212) 555-8812',email:'grace.kim@icloud.com',src:'Inbound call'},why:'Exact match'},
];
D.deadRules=[{on:true,t:'No reply after 5 texts'},{on:true,t:'Never answered 3 outbound calls'},{on:true,t:'Number is not in service (message failed twice)'},{on:false,t:'Email bounced twice'},{on:true,t:'No activity for 180 days'}];
D.sources=[{n:'Imported file',dir:'out',on:true},{n:'Referral',dir:'out',on:true},{n:'Web form',dir:'in',on:true},{n:'Landing page',dir:'in',on:true},{n:'Ad campaign',dir:'in',on:true},{n:'Inbound call',dir:'in',on:true},{n:'Walk-in',dir:'in',on:false},{n:'Other',dir:'out',on:true}];
D.fields=[['Current carrier','Dropdown'],['Contract end date','Date'],['Property type','Dropdown'],['Budget','Number'],['Insurance provider','Text'],['Last visit','Date']];

/* ---------- AI agents: 6 types × 3 defaults ---------- */
const AT={
 sales:{l:'Sales',i:'target',d:'Qualifies leads and closes sales',m:[['conv','Conversion','%'],['sales','Sales closed',''],['calls','Calls','']]},
 marketing:{l:'Marketing',i:'megaphone',d:'Starts every conversation: promotions, reviews, referrals',m:[['reply','Reply rate','%'],['msgs','Messages sent',''],['leads','Leads created','']]},
 support:{l:'Support',i:'lifebuoy',d:'Solves problems, after-sales, routes billing & tech issues',m:[['resolved','Resolved',''],['success','Success rate','%'],['routed','Routed','']]},
 tech:{l:'Tech support',i:'wrench',d:'Fixes technical issues and calls your systems (HTTP)',m:[['resolved','Queries resolved',''],['success','Success rate','%'],['http','API actions','']]},
 reception:{l:'Receptionist',i:'bell',d:'Answers calls & texts, books appointments',m:[['calls','Calls handled',''],['texts','Texts answered',''],['appts','Appointments','']]},
 finance:{l:'Finance',i:'receipt',d:'Invoices, billing questions and payment reminders',m:[['invoices','Invoices sent',''],['collected','Collected','$'],['success','Paid on time','%']]},
};
const AGDEF=[
 ['s1','sales','Sarah','F','Sarah · warm female (US)','Warm, patient and confident','Voice agent'],
 ['s2','sales','Ellie','F','Ellie · fun, upbeat female','Fun, upbeat, uses light humour','Chat agent'],
 ['s3','sales','Robert','M','Robert · calm male (US)','Calm, direct, consultative','Voice agent'],
 ['m1','marketing','Mia','F','Mia · bright female','Bright, friendly, short messages','Chat agent'],
 ['m2','marketing','Jay','M','Jay · energetic male','Energetic, playful','Chat agent'],
 ['m3','marketing','Nora','F','Nora · soft female (UK)','Soft, polite, warm','Chat agent'],
 ['p1','support','Grace','F','Grace · caring female','Caring, patient, step by step','Voice agent'],
 ['p2','support','Leo','M','Leo · steady male','Steady, reassuring','Chat agent'],
 ['p3','support','Hana','F','Hana · clear female','Clear, efficient','Chat agent'],
 ['t1','tech','Theo','M','Theo · technical male','Precise, technical but simple','Chat agent'],
 ['t2','tech','Ava','F','Ava · calm female','Calm, methodical','Voice agent'],
 ['t3','tech','Dev','M','Dev · friendly male (PK)','Friendly, bilingual English/Urdu','Chat agent'],
 ['r1','reception','Rhea','F','Rhea · bright female (US)','Welcoming, efficient','Voice agent'],
 ['r2','reception','Sam','M','Sam · friendly male','Friendly, relaxed','Voice agent'],
 ['r3','reception','Lily','F','Lily · gentle female','Gentle, reassuring','Chat agent'],
 ['f1','finance','Quinn','F','Quinn · clear female','Clear, polite, exact','Chat agent'],
 ['f2','finance','Maya','F','Maya · warm female','Warm, understanding','Voice agent'],
 ['f3','finance','Victor','M','Victor · formal male','Formal, precise','Chat agent'],
];
const baseJob=type=>({
 purposes:type==='sales'?['Qualify leads','Sell products','Follow up with leads']:type==='marketing'?['Generate leads','Reactivate old leads','Collect customer information']:type==='reception'?['Book appointments','Collect customer information']:type==='support'?['Solve customer problems','Transfer to the right agent']:type==='tech'?['Solve technical problems']:['Send invoices','Collect payments'],
 goal:type==='sales'?'Make the sale':type==='reception'?'Book an appointment':type==='marketing'?'Qualify the lead':'Resolve the request',
 target:'Individuals',exclude:{on:true,who:'Existing business accounts and anyone under 18'},
 products:'Mobility 5G Unlimited ($35 per line), Internet 1 Gig ($50/month), TV package ($10/month), Phone line ($20/month).',
 pricing:'Phone line $20/mo · Internet 1 Gig $50/mo · TV $10/mo · 5G Unlimited $35/line/mo. Taxes included.',
 billing:'Monthly',
 eligible:['Lives in Mississauga, Toronto or Brampton','18 years or older','Has a valid photo ID'],
 notEligible:['Addresses outside our service area','Customers with an unpaid balance over $200'],
 important:['Free installation this month','Customers can keep their current number','No contract — cancel anytime'],
 qual:[{t:'Customer lives in a service area',imp:'Required'},{t:'Customer is the account holder or decision maker',imp:'Required'},{t:'Customer pays more than $60 today for internet',imp:'Preferred'},{t:'Customer is open to switching this month',imp:'Optional'}],
 disq:[{t:'Address is outside the service area',imp:'Required'},{t:'Customer is under 18',imp:'Required'},{t:'Customer is locked into a contract for 6+ months',imp:'Preferred'}],
 questions:[{q:'Do you currently have home internet?',req:'Required',att:'Twice',cond:'Yes → ask who the provider is · No → ask if they need it'},{q:'What is your service address?',req:'Required',att:'Until answered',cond:''},{q:'How many people use the internet at home?',req:'Optional',att:'Once',cond:''},{q:'When would be a good day for installation?',req:'Required',att:'Twice',cond:''}],
 collect:['Full name','Mobile number','Service address','Email','Best time to call'],
 rec:['1–2 people and light use → Internet 500 or Phone line','3+ people or streaming/gaming → Internet 1 Gig','Watches sports → add TV package'],
 whenQual:'Order Booked',whenDisq:['Add tag','Add reason','End conversation politely','Update database'],cantDecide:'Mark as “Needs review”',
 triggers:['Customer asks for a human','Customer is angry','Customer requests a manager','Agent doesn’t know the answer','Qualification is unclear'],handTo:'Sales team',
 restrict:['Never change pricing','Never offer discounts above 10%','Never promise installation dates not in the calendar','Never ask for card numbers in chat'],
 follow:['First follow-up by email after 1 day','Then a call after 2 days','Stop after 5 tries with no reply'],
 tone:'Friendly',style:'Short and clear',posture:type==='sales'?'Consultative':'Neutral',
 compliance:['Say it is an AI assistant at the start of calls','Honour STOP and opt-out words right away','Do not store health or card information in notes'],
 script:type==='sales'?'Hi {first_name}, it’s {agent} from Metro Mobile. You can get Internet 1 Gig for $50 a month with free installation this month. Do you have home internet right now?':'',
});
D.agents=AGDEF.map(([id,type,name,g,voice,style,mode],i)=>{
  const w={conv:rint(12,31),success:rint(62,94),msgs:rint(800,9000),replies:rint(300,3000),calls:rint(120,2400),sales:type==='sales'?rint(40,190):0,reply:rint(18,44),leads:rint(90,620),resolved:rint(120,980),routed:rint(40,300),http:rint(20,640),texts:rint(300,2600),appts:rint(90,640),invoices:rint(120,900),collected:rint(12000,88000)};
  const camps=D.campaigns.filter(c=>c.agents.includes(id)).map(c=>c.id);
  return {id,type,name,g,voice,mode,dir:type==='reception'?'in':type==='marketing'?'out':'both',langs:id==='t3'?['English','Urdu']:id==='s2'?['English','Spanish']:['English'],camps,status:camps.length||i%3===0?'live':'ready',
   style:{call:style,text:type==='marketing'?'Short, 1–2 sentences, one emoji max':'Friendly, short, 1–3 sentences',email:'Clear, polite, with a subject that says what it is about'},
   edited:['s1','r1','s3'].includes(id),ver:['s1','r1'].includes(id)?4:['s3'].includes(id)?3:1,
   versions:(['s1','r1'].includes(id)?[[1,'Default from Crewline','Aug 30'],[2,'Added Metro Mobile prices','Sep 04'],[3,'Softer tone on calls','Sep 12'],[4,'New qualifying questions','Sep 22']]:['s3'].includes(id)?[[1,'Default from Crewline','Aug 30'],[2,'Real estate script','Sep 11'],[3,'Faster follow-ups','Sep 20']]:[[1,'Default from Crewline','Aug 30']]).map(v=>({v:v[0],label:v[1],date:v[2]})),
   global:{success:rint(64,88),conv:rint(14,29),accounts:nf(rint(1400,6200))},ws:w,
   history:camps.map(k=>{const c=camp(k);return {camp:c.name,ind:c.biz,calls:rint(100,1200),texts:rint(200,3000),conv:rint(10,32)}}).concat([{camp:'Summer Promo (ended)',ind:'Metro Mobile',calls:rint(100,600),texts:rint(300,1800),conv:rint(10,25)}]),
   instr:`You are ${name}, ${AT[type].l.toLowerCase()} agent for {business}. Keep replies short and friendly. Ask one question at a time. Confirm names, dates and prices back to the customer. If you are not sure, say so and hand over to a person.`,
   template:'Default '+AT[type].l+' template',job:baseJob(type),
   qa:[{q:'Do I need to sign a contract?',a:'No contract — you can cancel anytime.'},{q:'Can I keep my number?',a:'Yes, we move your number for free. It takes 1–2 days.'},{q:'Is installation free?',a:'Yes, installation is free this month.'}],
   kb:[{id:uid('kb'),name:(type==='reception'?'BrightSmile — Services & hours':'Metro Mobile — Plans & prices'),date:'Sep 12',items:[{k:'file',n:'Price list 2026.pdf',s:'12 pages'},{k:'link',n:'metromobile.example/plans',s:'24 pages read'},{k:'text',n:'Holiday offer notes',s:'Pasted text · 340 words'},{k:'video',n:'How number porting works.mp4',s:'3 min · transcribed'},{k:'image',n:'Coverage map.png',s:'Read by AI'}]},{id:uid('kb'),name:'FAQ & policies',date:'Sep 03',items:[{k:'file',n:'FAQ.docx',s:'38 questions'},{k:'file',n:'Refund policy.pdf',s:'2 pages'}]}],
   act:{callOut:type!=='finance',callIn:true,voicemail:true,transferCall:true,record:true,sms:true,wa:true,email:true,media:true,stages:true,fields:true,tags:true,comments:true,tasks:type==='support',booking:type==='reception',reminders:type==='reception',quote:type==='sales',paylink:type==='finance',sale:type==='sales',invoice:type==='finance',refund:false,http:type==='tech',route:type==='support',ticket:type==='tech',diag:type==='tech',status:type==='tech',reset:false,escalate:type==='tech',recurring:type==='finance',reminder:type==='finance',plans:false,tax:type==='finance',receipt:type==='finance',multicur:false},
   rules:{askHuman:true,angry:true,unknown:true,noInfo:true,unclear:true,legal:type==='reception',noPrice:true,noDiscount:true,noPromise:true,noPII:true,disclose:true,optout:true,recordNotice:true,quiet:true,hours24:type==='reception',afterHours:type!=='reception'},
   discount:10,handoff:{on:type==='sales',stage:'Order Booked',mode:'another',to:'r1'},
   follow:{ai:true,out:[{if:'No reply to text',after:'4 hours',then:'Call',by:id,tpl:'Friendly check-in call'},{if:'No answer to call',after:'1 day',then:'Email',by:id,tpl:'Offer recap email'},{if:'No reply to email',after:'2 days',then:'Call',by:id,tpl:'Last try call'}],in:[{if:'No reply to text',after:'15 minutes',then:'Call',by:id,tpl:'Quick call-back'},{if:'No answer to call',after:'2 hours',then:'Text',by:id,tpl:'Missed you text'}],drop:{on:true,n:5,cond:'no reply'}},
   booking:type==='reception',http:type==='tech'?[{name:'Check service status',prompt:'Use when a customer reports internet is down, to check if there is an outage at their address.',method:'GET',url:'https://api.metromobile.example/v1/status',params:[['address','{contact.address}']],headers:[['Authorization','Bearer ••••••••']],fields:['address']},{name:'Restart modem',prompt:'Use after the customer confirms they want a remote restart.',method:'POST',url:'https://api.metromobile.example/v1/modem/restart',params:[['account_id','{contact.custom.account_id}']],headers:[['Authorization','Bearer ••••••••']],fields:['account_id']}]:[],
   score:{s1:86,r1:91,s3:78}[id]||rint(58,74)};
});
const agent=id=>D.agents.find(a=>a.id===id);
const agName=id=>(agent(id)||{name:id||'—'}).name;

/* ---------- inbox: chats ---------- */
const m=(d,who,text,time,st='read')=>({t:'m',d,who,text,time,st});
const ev=(k,text,time,o={})=>Object.assign({t:'ev',k,text,time},o);
D.convos=[
 {id:'v1',cid:'c1',plat:'wa',dir:'out',camp:'k1',agent:'s1',unread:true,needs:false,human:false,time:'5:41 PM',items:[
  {t:'day',text:'Friday'},
  m('o','s1',"Hi Maria, it’s Sarah from Metro Mobile 👋 Since you have Internet 1 Gig with us, you can add 5G Unlimited for $35 a line this month. Want the details?",'10:02 AM'),
  m('i',null,'How much for 3 lines?','11:40 AM'),
  m('o','s1','3 lines comes to $105 a month with taxes included, and your internet bill drops by $10. Would you like Robert to call you to set it up?','11:40 AM'),
  m('i',null,'yes call me after 5','11:52 AM'),
  ev('stage','Stage moved to Interested by Sarah','11:52 AM',{stage:'Interested'}),
  {t:'call',d:'o',who:'s3',dur:'4m 32s',time:'5:12 PM',summary:'Confirmed 3 lines on 5G Unlimited ($105/mo). Porting 2 numbers. Wants delivery on Saturday.',tr:[['Robert','Hi Maria, this is Robert from Metro Mobile — Sarah said you wanted a call after five. Is now still good?'],['Maria','Yes, perfect.'],['Robert','Great. You asked about three lines. Would you like to keep your current numbers?'],['Maria','Two of them, yes.'],['Robert','No problem, I’ll move both. I can ship the SIMs for Saturday — does that work?'],['Maria','Saturday is great.']]},
  ev('stage','Stage moved to Order Booked by Robert · order #48213 created','5:17 PM',{stage:'Order Booked'}),
  {t:'day',text:'Today'},
  m('i',null,'Thanks! Can the installer come before noon on Saturday?','5:41 PM'),
  {t:'inchat',k:'book',text:'Maria wants an appointment (installation time). This campaign doesn’t book appointments.',time:'5:41 PM'},
 ]},
 {id:'v2',cid:'c31',plat:'sms',dir:'out',camp:'k2',agent:'s3',unread:true,needs:true,reason:'Asked to negotiate the price with a person',human:false,time:'4:58 PM',items:[
  {t:'day',text:'Yesterday'},
  m('o','m2','Hi James, Jay from Keystone Realty. A 2-bed on 7th Ave in Park Slope just listed at $1.15M, within the budget you shared. Want to see it this week?','9:15 AM'),
  m('i',null,'Yes, Thursday evening?','9:31 AM'),
  m('o','s3','Booked: Thursday 6:30 PM with Sofia at 412 7th Ave. I’ve texted you the address and a calendar invite.','9:31 AM'),
  ev('stage','Stage moved to Viewing Booked by Robert','9:31 AM',{stage:'Viewing Booked'}),
  {t:'day',text:'Today'},
  m('i',null,'Would the seller take 1.05? I’d rather talk to a person about this.','4:58 PM'),
  ev('hand','Robert handed this to your team: “Asked to negotiate the price with a person”','4:58 PM'),
 ]},
 {id:'v3',cid:'c59',plat:'ig',dir:'in',camp:'k4',agent:'s1',unread:false,needs:false,human:false,time:'3:20 PM',items:[
  {t:'day',text:'Today'},
  m('i',null,'Saw your fiber ad 👀 how much is it in Mississauga?','3:12 PM'),
  m('o','s1','Hi Priya! Internet 1 Gig is $50 a month with free installation this month. What’s your postal code so I can check your street?','3:12 PM'),
  m('i',null,'L5A 3T1','3:18 PM'),
  m('o','s1','Great news — you’re covered 🎉 Do you currently have home internet?','3:18 PM'),
  m('i',null,'Yes with Bell, paying $85','3:20 PM'),
  ev('stage','Stage moved to Qualified by Sarah · meets 3 of 3 required criteria','3:20 PM',{stage:'Qualified'}),
 ]},
 {id:'v4',cid:'c73',plat:'wa',dir:'out',camp:'k5',agent:'m3',unread:false,needs:false,human:false,time:'Yesterday',items:[
  {t:'day',text:'Yesterday'},
  m('o','m3','Hola Carlos, soy Nora de Metro Mobile. ¿Te gustaría volver a Internet 1 Gig con 3 meses gratis?','3:02 PM'),
  m('i',null,'STOP','3:10 PM'),
  ev('sys','Opted out of WhatsApp and texts · added to Do-Not-Contact · applied to every agent','3:10 PM'),
  m('o','m3','Entendido, Carlos. No te enviaremos más mensajes.','3:10 PM'),
 ]},
 {id:'v5',cid:'c46',plat:'chat',dir:'in',camp:'k3',agent:'r1',unread:true,needs:false,human:false,query:true,time:'2:36 PM',items:[
  {t:'day',text:'Today'},
  m('i',null,'Are you open on Sundays? And do you do whitening?','2:34 PM'),
  m('o','r1','Yes to both! We’re open Sundays 10 AM–4 PM. Whitening takes about an hour with Dr. Lee and costs $350. Want me to check times?','2:34 PM'),
  m('i',null,'Maybe next week, thanks','2:36 PM'),
  ev('sys','Logged as a receptionist query (information only, no booking)','2:36 PM',{query:true}),
 ]},
 {id:'v6',cid:'c60',plat:'msg',dir:'in',camp:'k4',agent:'m1',unread:false,needs:false,human:true,time:'1:05 PM',items:[
  {t:'day',text:'Today'},
  m('i',null,'Hi, I filled the form on your site. Is TV included?','12:48 PM'),
  m('o','m1','Hi Hassan! TV is a $10/month add-on. Can I ask a couple of quick questions to find the best plan?','12:48 PM'),
  ev('sys','You took over this conversation · Mia is paused for Hassan','12:55 PM'),
  m('o','you','Hi Hassan, Bilal here from Metro Mobile. How many people are at home?','12:56 PM','read'),
  m('i',null,'4 of us, lots of streaming. OK, go ahead and set it up.','1:05 PM'),
  {t:'inchat',k:'stage',stage:'Qualified',text:'This lead meets the criteria for Qualified (“Customer says OK, go ahead”).',time:'1:05 PM'},
 ]},
 {id:'v7',cid:'c45',plat:'sms',dir:'in',camp:'k3',agent:'r1',unread:false,needs:false,human:false,time:'11:20 AM',items:[
  {t:'day',text:'Today'},
  {t:'call',d:'i',who:'r1',dur:'2m 05s',time:'11:14 AM',summary:'New patient. Tooth sensitivity, wants a cleaning. Booked today 2:00 PM with hygienist Maya. Has Delta Dental insurance.',tr:[['Rhea','Thank you for calling BrightSmile Dental, this is Rhea, the practice’s AI assistant. How can I help?'],['Grace','Hi, I’d like a cleaning as soon as possible.'],['Rhea','I have today at 2:00 PM with Maya, or tomorrow at 10:30 AM. Which works?'],['Grace','Today at two.'],['Rhea','You’re booked. I’ll text you the address and what to bring.']]},
  ev('book','Appointment booked · Today 2:00 PM · Cleaning with Maya · by Rhea','11:16 AM'),
  m('o','r1','You’re booked at BrightSmile Dental today at 2:00 PM with Maya (cleaning). 118 W 23rd St. Bring your insurance card. Reply R to reschedule.','11:16 AM','read'),
  m('i',null,'Thank you!','11:20 AM'),
 ]},
 {id:'v8',cid:'c61',plat:'tt',dir:'in',camp:'k4',agent:'s2',unread:true,needs:false,human:false,time:'10:02 AM',items:[
  {t:'day',text:'Today'},
  m('i',null,'is the $50 internet real?? 😂','9:58 AM'),
  m('o','s2','100% real 😄 Internet 1 Gig, $50/month, free install this month. Want me to check if your street is covered?','9:58 AM','delivered'),
  m('i',null,'yeah Brampton L6P','10:02 AM'),
 ]},
 {id:'v9',cid:'c2',plat:'sms',dir:'out',camp:'k1',agent:'s2',unread:false,needs:false,human:false,time:'9:40 AM',items:[
  {t:'day',text:'Yesterday'},
  m('o','s2','Hey Kevin! Ellie from Metro Mobile 😊 5G Unlimited is $35 a line this month. Interested?','4:30 PM'),
  m('i',null,'Yes I’m interested','4:30 PM'),
  ev('stage','Stage moved to Interested by Ellie','4:30 PM',{stage:'Interested'}),
  {t:'day',text:'Today'},
  m('i',null,'Actually I need some time to think about it','9:35 AM'),
  ev('stage','Stage moved to Pending by Ellie · follows the latest message','9:35 AM',{stage:'Pending'}),
  m('o','s2','Totally fine! I’ll check in on Thursday. The offer is good until Oct 31.','9:40 AM','delivered'),
 ]},
 {id:'v10',cid:'c32',plat:'fb',dir:'in',camp:'k2',agent:'s3',unread:false,needs:false,human:false,time:'Yesterday',items:[
  {t:'day',text:'Yesterday'},
  m('i',null,'Hello, is the Hicks St condo still available?','6:10 PM'),
  m('o','s3','Hi Sofia! Yes, 88 Hicks St is available at $985,000. Is your budget around that range?','6:10 PM'),
  m('i',null,'Yes, pre-approved up to 1M','6:14 PM'),
  ev('stage','Stage moved to Qualified by Robert','6:14 PM',{stage:'Qualified'}),
 ]},
 {id:'v11',cid:'c3',plat:'sms',dir:'out',camp:'k1',agent:'s3',unread:false,needs:false,human:false,time:'Wed',items:[
  {t:'day',text:'Wednesday'},
  m('o','s3','Hi Ahmed, Robert from Metro Mobile. Internet 1 Gig is $50/month with free installation. Interested?','10:00 AM','sent'),
  ev('sys','Message failed — number not in service (2nd time). Contact moved to Dead numbers.','10:01 AM'),
 ]},
 {id:'v12',cid:'c47',plat:'wa',dir:'in',camp:'k3',agent:'r3',unread:true,needs:false,human:false,time:'8:15 AM',items:[
  {t:'day',text:'Today'},
  m('i',null,'Hi! Can I book a check-up for my son on Tuesday after school?','8:12 AM'),
  m('o','r3','Of course! Tuesday I have 3:30 PM or 4:15 PM with Dr. Lee. Which works best?','8:12 AM','read'),
  m('i',null,'3:30 please','8:15 AM'),
  ev('book','Appointment requested · Tue Sep 29 · 3:30 PM · Check-up with Dr. Lee · waiting for confirmation','8:15 AM'),
 ]},
];
D.emails=[
 {id:'e1',box:'inbox',cid:'c1',from:'Maria Rivera',addr:'maria.rivera@gmail.com',to:'orders@metromobile.example',subj:'Re: Your Metro Mobile order #48213 is confirmed',body:'Thanks! Can the installer come before noon on Saturday?\n\nMaria',time:'5:41 PM',unread:true,camp:'k1',agent:'s1',dir:'out'},
 {id:'e2',box:'inbox',cid:'c33',from:'Daniel Nguyen',addr:'daniel.n@outlook.com',to:'hello@keystonerealty.example',subj:'Viewing at 88 Hicks St',body:'Hi, could we move Saturday’s viewing to 11 AM instead of 10?\n\nThanks,\nDaniel',time:'2:10 PM',unread:true,camp:'k2',agent:'s3',dir:'out'},
 {id:'e3',box:'inbox',cid:null,from:'Sunrise Bakery',addr:'owner@sunrisebakery.example',to:'business@metromobile.example',subj:'Quote for 5 business lines?',body:'Hi, we run a small bakery in Mississauga and need 5 lines plus a hotspot. Can you send a quote?\n\n— Leila',time:'1:52 PM',unread:false,camp:'k4',agent:'s1',dir:'in'},
 {id:'e4',box:'inbox',cid:'c45',from:'Grace Kim',addr:'grace.kim@icloud.com',to:'frontdesk@brightsmile.example',subj:'Insurance form',body:'Attached is my insurance card for today.',time:'11:30 AM',unread:false,camp:'k3',agent:'r1',dir:'in',att:['insurance_card.jpg']},
 {id:'e5',box:'inbox',cid:null,from:'Carrier Portal',addr:'noreply@carrier.example',to:'orders@metromobile.example',subj:'Order #48213 shipped',body:'Order #48213 has shipped. Tracking: 1Z99 8842 1102.',time:'9:03 AM',unread:false,camp:'k1',agent:null,dir:'out'},
 {id:'e6',box:'inbox',cid:'c5',from:'Priya Patel',addr:'priya.p@gmail.com',to:'support@metromobile.example',subj:'Internet keeps dropping',body:'Since yesterday the internet drops every hour. Can someone help?',time:'Yesterday',unread:false,camp:'k1',agent:'p1',dir:'in'},
 {id:'e7',box:'sent',cid:'c1',from:'Sarah (AI) · Metro Mobile',addr:'orders@metromobile.example',to:'maria.rivera@gmail.com',subj:'Your Metro Mobile order #48213 is confirmed',body:'Hi Maria, thanks for your order: 3 lines on 5G Unlimited, $105/month. Your SIMs arrive Saturday.',time:'Fri 5:18 PM',unread:false,camp:'k1',agent:'s1',dir:'out'},
 {id:'e8',box:'sent',cid:null,from:'Sarah (AI) · Metro Mobile',addr:'business@metromobile.example',to:'owner@sunrisebakery.example',subj:'Your Metro Mobile quote Q-2291',body:'Hi Leila, here is your quote: 5 × 5G Unlimited ($175), 1 × Hotspot ($30), business discount −10%. Total $184.50/month.',time:'1:55 PM',unread:false,camp:'k4',agent:'s1',dir:'in',att:['Quote-Q-2291.pdf']},
 {id:'e9',box:'sent',cid:'c33',from:'Robert (AI) · Keystone Realty',addr:'hello@keystonerealty.example',to:'daniel.n@outlook.com',subj:'Your viewing is confirmed',body:'Hi Daniel, your viewing at 88 Hicks St is on Saturday at 10 AM with Agent Ali.',time:'Wed',unread:false,camp:'k2',agent:'s3',dir:'out'},
 {id:'e10',box:'drafts',cid:'c5',from:'Bilal Nasir',addr:'support@metromobile.example',to:'priya.p@gmail.com',subj:'Re: Internet keeps dropping',body:'Hi Priya, sorry about this. We’ve restarted your modem remotely…',time:'Draft',unread:false,camp:'k1',agent:null,dir:'in'},
 {id:'e11',box:'scheduled',cid:null,from:'Mia (AI) · Metro Mobile',addr:'news@metromobile.example',to:'NYC Fiber Customers (6,780)',subj:'Your October offer is here',body:'Scheduled for Oct 1, 9:00 AM.',time:'Oct 1',unread:false,camp:'k5',agent:'m1',dir:'out'},
];
D.calls=[
 {id:'l1',cid:'c1',dir:'out',status:'answered',by:'s3',camp:'k1',dur:'4:32',time:'Fri 5:12 PM',summary:'Order booked — 3 lines, porting 2 numbers.'},
 {id:'l2',cid:'c45',dir:'in',status:'answered',by:'r1',camp:'k3',dur:'2:05',time:'Today 11:14 AM',summary:'Booked cleaning today 2:00 PM.'},
 {id:'l3',cid:null,num:'(647) 555-0188',dir:'in',status:'missed',by:null,camp:null,dur:'—',time:'Today 10:48 AM',summary:'Missed while all lines busy — Rhea texted back automatically.'},
 {id:'l4',cid:'c3',dir:'out',status:'failed',by:'s3',camp:'k1',dur:'—',time:'Wed 10:05 AM',summary:'Number not in service.'},
 {id:'l5',cid:'c31',dir:'out',status:'answered',by:'s3',camp:'k2',dur:'3:10',time:'Yesterday 9:25 AM',summary:'Viewing booked Thursday 6:30 PM.'},
 {id:'l6',cid:'c5',dir:'in',status:'answered',by:'p1',camp:'k1',dur:'6:44',time:'Yesterday 4:02 PM',summary:'Internet dropping — routed to Theo (Tech support), modem restarted via API.'},
 {id:'l7',cid:'c2',dir:'out',status:'voicemail',by:'s2',camp:'k1',dur:'0:31',time:'Yesterday 1:10 PM',summary:'Left voicemail about 5G offer.'},
 {id:'l8',cid:'c60',dir:'in',status:'answered',by:'you',camp:'k4',dur:'2:48',time:'Today 12:40 PM',summary:'Handled by Bilal — plan questions.'},
 {id:'l9',cid:'c47',dir:'in',status:'answered',by:'r3',camp:'k3',dur:'1:52',time:'Today 8:05 AM',summary:'Query about check-ups for children.'},
];

/* ---------- bookings ---------- */
D.staff={k3:['Dr. Khan','Dr. Lee','Hygienist Maya','Hygienist Tom'],k1:['Install team A','Install team B','Install team C'],k2:['Agent Sofia','Agent Ali'],k4:['Install team A','Install team B']};
D.services={
 k3:[{n:'Cleaning',dur:45,staff:'Any hygienist',buf:10,price:120,cap:1},{n:'Check-up',dur:30,staff:'Any dentist',buf:5,price:90,cap:1},{n:'Filling',dur:60,staff:'Any dentist',buf:10,price:180,cap:1},{n:'Root canal',dur:90,staff:'Dr. Khan only',buf:15,price:950,cap:1},{n:'Whitening',dur:60,staff:'Dr. Lee only',buf:10,price:350,cap:1},{n:'Consultation',dur:30,staff:'Any dentist',buf:0,price:0,cap:1}],
 k1:[{n:'Fiber installation',dur:120,staff:'Any install team',buf:30,price:0,cap:1},{n:'Router swap',dur:60,staff:'Any install team',buf:15,price:0,cap:1}],
 k2:[{n:'Property viewing',dur:45,staff:'Any agent',buf:15,price:0,cap:4},{n:'Buyer consultation',dur:30,staff:'Any agent',buf:0,price:0,cap:1}],
 k4:[{n:'Fiber installation',dur:120,staff:'Any install team',buf:30,price:0,cap:1}],
};
D.hours={};['k1','k2','k3','k4'].forEach(k=>{D.hours[k]={Mon:['08:00','18:00',1],Tue:['08:00','18:00',1],Wed:['08:00','18:00',1],Thu:['08:00','19:00',1],Fri:['08:00','18:00',1],Sat:['09:00','15:00',1],Sun:k==='k3'?['10:00','16:00',1]:['10:00','14:00',0]}});
D.bookings=[];let bn=0;
const names=()=>pick(FN_F.concat(FN_M))+' '+pick(LN);
['k3','k1','k2'].forEach(k=>{const staff=D.staff[k],svcs=D.services[k];
  for(let off=-26;off<=23;off++){const iso=dISO(off);const dow=new Date(iso+'T12:00:00').getDay();if(k!=='k3'&&dow===0)continue;
   const per=k==='k3'?rint(8,14):k==='k1'?rint(3,6):rint(1,4);
   const used={};
   for(let j=0;j<per;j++){const si=rint(0,staff.length-1),svc=pick(svcs);let start=rint(0,18)*30;const key=si;used[key]=used[key]||[];if(used[key].some(([a,b])=>start<b&&a<start+svc.dur))continue;if(start+svc.dur>600)continue;used[key].push([start,start+svc.dur]);
    let status=off<0?(R()<.08?'noshow':R()<.08?'cancelled':'completed'):off===0?(start<360?(R()<.7?'completed':'arrived'):'booked'):(R()<.12?'requested':R()<.06?'cancelled':'booked');
    bn++;D.bookings.push({id:'b'+bn,camp:k,staff:staff[si],svc:svc.n,who:names(),date:iso,start,dur:svc.dur,status,by:R()<.72?(k==='k3'?pick(['r1','r2']):k==='k1'?'r1':'s3'):pick(['Front desk','Online booking page','You']),created:dShort(dISO(off-rint(1,9))),price:svc.price,conf:['sms','email']})}}});
// fixed, story bookings
D.bookings.push({id:'bx1',camp:'k3',staff:'Hygienist Maya',svc:'Cleaning',who:'Grace Kim',cid:'c45',date:dISO(0),start:360,dur:45,status:'booked',by:'r1',created:'Today',price:120,conf:['sms']});
D.bookings.push({id:'bx2',camp:'k3',staff:'Dr. Lee',svc:'Check-up',who:'Leila Cohen (son)',cid:'c47',date:dISO(2),start:450,dur:30,status:'requested',by:'r3',created:'Today',price:90,conf:['wa']});
D.bookings.push({id:'bx3',camp:'k1',staff:'Install team A',svc:'Fiber installation',who:'Maria Rivera',cid:'c1',date:dISO(6),start:60,dur:120,status:'requested',by:'r1',created:'Today',price:0,conf:['sms']});
D.bookings=D.bookings.filter(b=>!(b.camp==='k3'&&b.staff==='Dr. Khan'&&b.date===dISO(0)&&b.start<510&&b.start+b.dur>480));
D.queries=[
 {id:'q1',cid:'c46',who:'Emily Park',ch:'chat',q:'Open on Sundays? Do you do whitening?',a:'Open Sun 10–4. Whitening $350, 1 hour with Dr. Lee.',agent:'r1',camp:'k3',time:'Today 2:34 PM',out:'Answered'},
 {id:'q2',cid:null,who:'(647) 555-0188',ch:'call',q:'Do you accept Cigna insurance?',a:'Yes — Cigna, Delta, Aetna, MetLife.',agent:'r1',camp:'k3',time:'Today 10:50 AM',out:'Answered'},
 {id:'q3',cid:'c47',who:'Leila Cohen',ch:'call',q:'Do you see children?',a:'Yes, from age 3. Dr. Lee specialises in kids.',agent:'r3',camp:'k3',time:'Today 8:05 AM',out:'Turned into a booking'},
 {id:'q4',cid:null,who:'(416) 555-0143',ch:'sms',q:'Where do I park?',a:'Free parking behind the building, entrance on 23rd St.',agent:'r2',camp:'k3',time:'Yesterday',out:'Answered'},
 {id:'q5',cid:null,who:'(905) 555-0177',ch:'call',q:'Is fiber available on Clifton Rd?',a:'Yes — covered since August.',agent:'r1',camp:'k4',time:'Yesterday',out:'Turned into a booking'},
 {id:'q6',cid:null,who:'(212) 555-0190',ch:'wa',q:'How long is a root canal?',a:'About 90 minutes with Dr. Khan.',agent:'r3',camp:'k3',time:'Thu',out:'Answered'},
 {id:'q7',cid:null,who:'(718) 555-0102',ch:'call',q:'What are your hours on Saturday?',a:'9 AM–3 PM.',agent:'r2',camp:'k3',time:'Thu',out:'Answered'},
];

/* ---------- activity feed, assigned, notifications ---------- */
D.activity=[
 {i:'phone',text:'<b>Robert</b> booked an order for <b>Maria Rivera</b> — 3 lines, $105/mo',time:'2 min ago',k:'stage'},
 {i:'calendar',text:'<b>Rhea</b> booked a cleaning for <b>Grace Kim</b> today at 2:00 PM',time:'6 min ago',k:'book'},
 {i:'kanban',text:'<b>Ellie</b> moved <b>Kevin Brown</b> to Pending (“needs time to think”)',time:'9 min ago',k:'stage'},
 {i:'hand',text:'<b>Robert</b> handed <b>James Okafor</b> to your team — price negotiation',time:'12 min ago',k:'hand'},
 {i:'db',text:'Data filling found 214 missing emails in <b>Mississauga Leads</b>',time:'1 hr ago',k:'db'},
 {i:'x',text:'<b>Carlos Garcia</b> opted out — added to Do-Not-Contact',time:'yesterday',k:'sys'},
];
D.assigned=[
 {id:'a1',kind:'hand',title:'James Okafor wants to negotiate the price',desc:'Robert (AI) booked a viewing, then James asked if the seller would take $1.05M and asked for a person.',cid:'c31',camp:'k2',convo:'v2',time:'4:58 PM'},
 {id:'a2',kind:'book',title:'Maria Rivera wants an installation appointment',desc:'The Telecom — Mobility Q4 campaign doesn’t book appointments. Handle it yourself or let the receptionist (Rhea) book it.',cid:'c1',camp:'k1',convo:'v1',time:'5:41 PM'},
 {id:'a3',kind:'stage',title:'Choose a stage for Daniel Nguyen',desc:'We talked to Daniel: he liked the Hicks St condo, asked to move the viewing and said “we might wait until spring”. Please choose the stage.',cid:'c33',camp:'k2',convo:null,time:'2:14 PM',rec:true},
 {id:'a4',kind:'angry',title:'Upset caller about a billing charge',desc:'Caller (647) 555-0122 is upset about a $24.99 roaming charge. Grace (Support) routed to Finance but the caller asked for a manager.',cid:null,camp:'k1',convo:null,time:'1:02 PM',rec:true},
 {id:'a5',kind:'qual',title:'Unclear qualification: Omar Siddiqui',desc:'Omar answered 2 of 3 required questions. He wouldn’t share his address on TikTok. Ellie marked this as “Needs review”.',cid:'c61',camp:'k4',convo:'v8',time:'10:04 AM'},
 {id:'a6',kind:'number',title:'New number found for Ahmed Umar',desc:'AI search found the same name and address with a new number: (905) 555-0162. Update the contact?',cid:'c3',camp:'k1',convo:'v11',time:'9:10 AM'},
];
D.notifs=[
 {text:'James Okafor asked for a person (Keystone Realty)',time:'4:58 PM',read:false,go:'assigned'},
 {text:'Maria Rivera wants an appointment — assign to receptionist?',time:'5:41 PM',read:false,go:'assigned'},
 {text:'Your SMS sender registration is still in review',time:'1:30 PM',read:false,go:'settings'},
 {text:'Max: “Fiber — Win-back” reply rate dropped 40% this week',time:'9:00 AM',read:true,go:'campaigns'},
 {text:'Weekly report saved to Reports › Max reports',time:'Mon',read:true,go:'reports'},
];
D.suggestions=[
 {id:'o1',area:'Campaign',title:'Fiber Win-back is paused with 228 people never contacted',fix:'Resume it with Ellie (18% better reply rate on win-backs)',go:['campaign',{id:'k5'}]},
 {id:'o2',area:'Agent',title:'Robert’s qualifying criteria are not clear enough',fix:'Add 2 required criteria (Review score 78 → 88)',go:['agents',{type:'sales',id:'s3'}]},
 {id:'o3',area:'Setup',title:'Your SMS sender registration is pending',fix:'Texts are limited to 200/day until approved',go:['settings',{sec:'channels'}]},
 {id:'o4',area:'Contacts',title:'212 contacts look dead',fix:'Move them to Dead numbers or find updated info with AI',go:['contacts',{tab:'hygiene'}]},
];

/* ---------- get started ---------- */
D.gs=[
 {k:'app',l:'Install the web app (recommended)',d:'Get notifications and open Crewline from your dock or phone home screen.',done:false},
 {k:'profile',l:'Tell us about your business',d:'Name, industry, hours and what you sell — agents use this everywhere.',done:true},
 {k:'contacts',l:'Add your contacts',d:'Import a spreadsheet or add leads one by one. They become folders you can target.',done:true},
 {k:'channels',l:'Connect your channels',d:'Phone numbers, SMS, WhatsApp, Messenger, Instagram, TikTok and email in one inbox.',done:false},
 {k:'stages',l:'Learn how stages work, then set yours',d:'Stages show where each lead is. AI moves people between them as it talks.',done:true},
 {k:'agents',l:'Set up your AI agents',d:'Pick from ready-made agents and add your business details — about 2 minutes.',done:false},
 {k:'campaign',l:'Make your first campaign',d:'Choose who to reach, how, and which agents do the work.',done:true},
 {k:'team',l:'Invite teammates',d:'They get handovers and can step into any conversation.',done:false},
];

/* ---------- expenses ---------- */
D.exp=[
 {n:'AI calling (voice minutes)',prov:'Voice AI platform',cat:'AI',ch:'call',unit:'minutes',qty:6120,rate:.07},
 {n:'Voices (text-to-speech)',prov:'ElevenLabs',cat:'Voice',ch:'call',unit:'characters',qty:1900000,rate:.00009},
 {n:'Speech-to-text',prov:'Speech API',cat:'Voice',ch:'call',unit:'minutes',qty:6120,rate:.006},
 {n:'AI texting (tokens)',prov:'LLM API',cat:'AI',ch:'sms',unit:'tokens',qty:18400000,rate:.000005},
 {n:'AI email writing (tokens)',prov:'LLM API',cat:'AI',ch:'email',unit:'tokens',qty:4100000,rate:.000005},
 {n:'Max assistant (tokens)',prov:'LLM API',cat:'AI',ch:'all',unit:'tokens',qty:2200000,rate:.000005},
 {n:'SMS carrier',prov:'SMS provider',cat:'Messaging',ch:'sms',unit:'segments',qty:41880,rate:.0079},
 {n:'WhatsApp Business API',prov:'WhatsApp',cat:'Messaging',ch:'wa',unit:'conversations',qty:3120,rate:.0315},
 {n:'Messenger, Instagram, TikTok',prov:'Social APIs',cat:'Messaging',ch:'msg',unit:'conversations',qty:1840,rate:0},
 {n:'Phone numbers',prov:'Telephony',cat:'Telephony',ch:'call',unit:'numbers',qty:5,rate:2},
 {n:'Phone line minutes',prov:'Telephony',cat:'Telephony',ch:'call',unit:'minutes',qty:6120,rate:.0085},
 {n:'Email sending',prov:'Email provider',cat:'Messaging',ch:'email',unit:'emails',qty:22400,rate:.0002},
 {n:'Data filling lookups',prov:'Data providers',cat:'Data',ch:'all',unit:'lookups',qty:3812,rate:.012},
 {n:'AI web search (updated info)',prov:'Scraping API',cat:'Data',ch:'all',unit:'searches',qty:640,rate:.02},
 {n:'Crewline Growth plan',prov:'Crewline',cat:'Platform',ch:'all',unit:'month',qty:1,rate:299},
];
D.exp.forEach(e=>{e.cost=+(e.qty*e.rate).toFixed(2);const w=[R()+.6,R()+.2,R()+.5,R()+.4,R()*.4];const s=w.reduce((a,b)=>a+b,0);e.by={};['k1','k2','k3','k4','k5'].forEach((k,i)=>e.by[k]=w[i]/s)});
D.expDaily=Array.from({length:27},(_,i)=>+(32+Math.sin(i/2.3)*9+R()*14+(i>20?10:0)).toFixed(2));

/* ---------- reports ---------- */
D.rfolders=[{id:'r1',name:'Campaigns',parent:null},{id:'r1a',name:'Telecom',parent:'r1'},{id:'r1b',name:'Real estate',parent:'r1'},{id:'r2',name:'AI agents',parent:null},{id:'r3',name:'Expenses',parent:null},{id:'r4',name:'Bookings',parent:null},{id:'r5',name:'Database & folders',parent:null},{id:'r6',name:'Max reports',parent:null}];
D.reports=[
 {id:'rp1',name:'Telecom — Mobility Q4: week 3 review',folder:'r1a',date:'2026-09-21',by:'Max',kind:'Campaign'},
 {id:'rp2',name:'Which message is winning? (A/B)',folder:'r1a',date:'2026-09-18',by:'Max',kind:'Campaign'},
 {id:'rp3',name:'Brooklyn Buyers — viewing conversion',folder:'r1b',date:'2026-09-20',by:'You',kind:'Campaign'},
 {id:'rp4',name:'Agent leaderboard — September',folder:'r2',date:'2026-09-26',by:'Scheduled',kind:'Agents'},
 {id:'rp5',name:'How to cut costs by 18%',folder:'r3',date:'2026-09-24',by:'Max',kind:'Expenses'},
 {id:'rp6',name:'August expenses',folder:'r3',date:'2026-09-01',by:'Scheduled',kind:'Expenses'},
 {id:'rp7',name:'Bookings & no-shows — September',folder:'r4',date:'2026-09-26',by:'Max',kind:'Bookings'},
 {id:'rp8',name:'Mississauga Leads — how the 20,000 performed',folder:'r5',date:'2026-09-22',by:'Max',kind:'Database'},
 {id:'rp9',name:'Competitor research: best campaign to run in Q4',folder:'r6',date:'2026-09-19',by:'Max',kind:'Research'},
];

/* ---------- misc ---------- */
D.team=[['Bilal Nasir','Owner','All businesses','bilal@bilalsgroup.example'],['Ali Raza','Manager','Metro Mobile, Keystone Realty','ali@bilalsgroup.example'],['Sofia Mendes','Team member','Keystone Realty','sofia@keystonerealty.example'],['Dr. Sara Khan','Team member','BrightSmile Dental','sara@brightsmile.example'],['Front desk','Team member','BrightSmile Dental','frontdesk@brightsmile.example']];
D.numbers=[{n:'(905) 555-0142',l:'Metro Mobile sales',agent:'s1',ty:'Local · voice + SMS'},{n:'(718) 555-0199',l:'Keystone Realty',agent:'s3',ty:'Local · voice + SMS'},{n:'(646) 555-0170',l:'BrightSmile front desk',agent:'r1',ty:'Forwarded from your line'},{n:'(905) 555-0188',l:'Fiber ads line',agent:'s2',ty:'Local · voice + SMS'}];
D.voices=[['Sarah','Warm female · US'],['Ellie','Fun, upbeat female'],['Robert','Calm male · US'],['Mia','Bright female'],['Jay','Energetic male'],['Nora','Soft female · UK'],['Rhea','Bright female · US'],['Sam','Friendly male'],['Dev','Friendly male · Pakistan'],['Amara','Warm female · Nigeria'],['Luis','Friendly male · Spanish'],['Bilal (cloned)','Your own voice · cloned Sep 20']];
D.promptTemplates={sales:['Default Sales template','Telecom sales','Real estate buyer qualifier','Solar & home services','Insurance quotes'],marketing:['Default Marketing template','Promotion broadcast','Review request','Referral request','Event invite'],support:['Default Support template','After-sales care','Complaint handling'],tech:['Default Tech support template','Internet troubleshooting','Software help desk'],reception:['Default Receptionist template','Dental clinic','Restaurant reservations','Salon & spa','Doctor’s office'],finance:['Default Finance template','Invoice follow-up','Payment plans']};
D.maxHist=[{id:'mh1',title:'Why did Win-back replies drop?',msgs:[]},{id:'mh2',title:'Build a dental recall campaign',msgs:[]},{id:'mh3',title:'Find people in Brooklyn',msgs:[]},{id:'mh4',title:'Competitor research: Q4 ideas',msgs:[]}];
