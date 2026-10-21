/* Smart Parking System - gate-level schematic simulator
   All gate outputs are computed live in ev(); the schematic is drawn from a netlist. */
const $=id=>document.getElementById(id), bits=n=>[n>>2&1,n>>1&1,n&1];
const S={swE:0,swX:0,count:0,clk:0,t:{}};

/* ---------- NETLIST: [type,id,x,y,label,sub,{pin:net}] ---------- */
const C=[
['V','V1',20,20,'V1','5V',{p:'VCC',g:'GND'}],
['R','R_E',40,70,'R_ENTER','10k',{a:'VCC',b:'E_IN'}],['SW','SW_E',150,70,'SW_ENTER','1',{a:'E_IN',b:'GND'}],
['R','R_X',40,170,'R_EXIT','10k',{a:'VCC',b:'X_IN'}],['SW','SW_X',150,170,'SW_EXIT','1',{a:'X_IN',b:'GND'}],
['NOT','N1',290,60,'U1A','74HC04 NOT',{a:'E_IN',o:'ENT'}],['NOT','N2',290,150,'U1B','74HC04 NOT',{a:'X_IN',o:'EXT'}],
['AND','A1',400,40,'U2A','74HC08 AND',{a:'ENT',b:'FULLn',o:'ENT_OK'}],
['NAND','G1',400,130,'U3A','74HC00 NAND',{a:'EXT',b:'EMPTYn',o:'EXT_N'}],
['NOT','N5',490,130,'U1C','74HC04 NOT',{a:'EXT_N',o:'EXT_OK'}],
['XOR','X1',580,60,'U4A','74HC86 XOR',{a:'ENT_OK',b:'EXT_OK',o:'CLK'}],
['IC','CNT',700,60,'U5','74HC191 UP/DOWN',{clk:'CLK',du:'EXT_OK',q2:'Q2',q1:'Q1',q0:'Q0'}],
['NOT','N3',290,250,'U1D','74HC04 NOT',{a:'Q2',o:'FULLn'}],['NOT','N4',290,330,'U1E','74HC04 NOT',{a:'EMPTY',o:'EMPTYn'}],
['OR','O2',900,230,'U6A','74HC32 OR',{a:'Q1',b:'Q2',o:'L2'}],
['OR','O1',1010,300,'U6B','74HC32 OR',{a:'L2',b:'Q0',o:'L1'}],
['AND','A2',900,360,'U2B','74HC08 AND',{a:'Q1',b:'Q0',o:'T'}],
['OR','O3',1010,420,'U6C','74HC32 OR',{a:'Q2',b:'T',o:'L3'}],
['NOR','G2',1010,490,'U7A','74HC02 NOR',{a:'L2',b:'Q0',o:'EMPTY'}]];
[['L1','nL1',312,'#22c55e','GREEN'],['L2','nL2',242,'#22c55e','GREEN'],['L3','nL3',432,'#22c55e','GREEN'],
 ['L4','nL4',172,'#22c55e','GREEN',  'Q2'],['FULL','nF',90,'#ef4444','RED','Q2'],['EMPTY','nE',502,'#3b82f6','BLUE','EMPTY']]
.forEach(([n,w,y,col,cn,src])=>{
  C.push(['R','R_'+n,1120,y,'R_'+n,'330',{a:src||n,b:w}]);
  C.push(['LED','LED_'+n,1210,y,'LED_'+n,cn,{a:w,k:'GND'},col]);});
const WD={AND:52,OR:52,XOR:52,NAND:60,NOR:60,NOT:52};
function pp(c,n){const t=c[0],x=c[2],y=c[3];
 if(t=='R'||t=='SW')return n=='a'?[x,y+10]:[x+70,y+10];
 if(t=='LED')return n=='a'?[x,y+10]:[x+60,y+10];
 if(t=='V')return n=='p'?[x+50,y+20]:[x+10,y+20];
 if(t=='IC')return{clk:[x,y+30],du:[x,y+60],q2:[x+130,y+40],q1:[x+130,y+75],q0:[x+130,y+110]}[n];
 if(t=='NOT')return n=='a'?[x,y+22]:[x+52,y+22];
 return n=='a'?[x,y+12]:n=='b'?[x,y+32]:[x+WD[t],y+22];}

/* ---------- LOGIC: every gate evaluated here ---------- */
function ev(){
 const [q2,q1,q0]=bits(S.count),N={VCC:1,GND:0,Q2:q2,Q1:q1,Q0:q0};
 N.E_IN=S.swE?0:1; N.X_IN=S.swX?0:1;          // pull-up + switch to GND
 N.ENT=+!N.E_IN; N.EXT=+!N.X_IN;               // NOT gates
 N.L2=q1|q2; N.L1=N.L2|q0; N.T=q1&q0; N.L3=q2|N.T; // OR / AND decoder
 N.EMPTY=+!(N.L2|q0);                          // NOR
 N.FULLn=+!q2; N.EMPTYn=+!N.EMPTY;             // NOT
 N.ENT_OK=N.ENT&N.FULLn;                       // AND
 N.EXT_N=+!(N.EXT&N.EMPTYn); N.EXT_OK=+!N.EXT_N; // NAND + NOT
 N.CLK=N.ENT_OK^N.EXT_OK;                      // XOR
 Object.assign(N,{nL1:N.L1,nL2:N.L2,nL3:N.L3,nL4:q2,nF:q2,nE:N.EMPTY});
 return N;}

/* ---------- DRAW schematic ---------- */
const drv={},nets=[]; let h='';
C.forEach((c,i)=>{for(const[p,n]of Object.entries(c[6])){if(n=='VCC'||n=='GND')continue;
  const o=/^(o|q\d)$/.test(p);if(!nets.includes(n))nets.push(n);if(o||!drv[n])drv[n]=[i,p];}});
let lane=0;
nets.forEach((n,k)=>{const d=drv[n],P=pp(C[d[0]],d[1]);
 C.forEach((c,i)=>{for(const[p,m]of Object.entries(c[6])){if(m!=n||(i==d[0]&&p==d[1]))continue;
  const Q=pp(c,p);let s;
  if(Q[0]>P[0]+16){const xm=P[0]+14+(k*6)%30;s=`M${P} H${xm} V${Q[1]} H${Q[0]}`;}
  else{const ly=580+lane*16,ox=Q[0]-10-lane*7;lane++;s=`M${P} H${P[0]+12} V${ly} H${ox} V${Q[1]} H${Q[0]}`;}
  h+=`<path class="w" data-n="${n}" d="${s}"/>`;}});});
const gp={AND:'M0 0H26A22 22 0 0 1 26 44H0Z',NAND:'M0 0H26A22 22 0 0 1 26 44H0Z',
 OR:'M0 0Q24 0 52 22Q24 44 0 44Q14 22 0 0Z',NOR:'M0 0Q24 0 52 22Q24 44 0 44Q14 22 0 0Z',XOR:'M0 0Q24 0 52 22Q24 44 0 44Q14 22 0 0Z',NOT:'M0 0L44 22L0 44Z'};
C.forEach((c,i)=>{const[t,id,x,y,lb,sb,pins,col]=c;let s=`<g transform="translate(${x},${y})">`;
 if(t=='R')s+=`<rect class="bx" x="6" y="-8" width="58" height="36" rx="6"/><path class="sym" d="M0 10H14L18 2L26 18L34 2L42 18L50 2L54 10H70"/>`;
 if(t=='SW')s+=`<g class="sw" id="${id}"><rect class="bx" x="6" y="-12" width="58" height="40" rx="6"/><path class="sym" d="M0 10H20M50 10H70"/><path class="sym" id="${id}c" d="M20 10H50" style="display:none"/><g class="pl"><path class="sym" d="M22 -2H48M35 -2V8"/></g><rect x="0" y="-14" width="70" height="44" fill="transparent"/></g>`;
 if(t=='LED')s+=`<rect class="bx" x="4" y="-8" width="52" height="36" rx="6"/><circle id="g${id}" cx="30" cy="10" r="19" fill="${col}" opacity="0"/><path class="sym" d="M0 10H16M44 10H60M16 0V20L38 10ZM40 0V20"/>`;
 if(t=='V')s+=`<circle class="bx" cx="30" cy="20" r="20"/><text class="tx" x="22" y="24">-</text><text class="tx" x="38" y="24">+</text>`;
 if(t=='IC')s+=`<rect class="bx" width="130" height="150" rx="8"/><text class="tx" x="65" y="20">74HC191</text><text class="tx" x="65" y="36" style="font-size:9px">UP/DOWN COUNTER</text><text class="pn" x="6" y="34">CLK</text><text class="pn" x="6" y="64">D/U'</text><text class="pn" x="104" y="44">Q2</text><text class="pn" x="104" y="79">Q1</text><text class="pn" x="104" y="114">Q0</text><text class="tx" x="65" y="140" id="cntv" style="font-weight:700">000</text>`;
 if(gp[t]){s+=`<path class="gt" d="${gp[t]}"/>`;if(t=='XOR')s+=`<path class="sym" d="M-7 0Q7 22 -7 44"/>`;
  if(/^(NAND|NOR|NOT)$/.test(t))s+=`<circle class="gt" cx="${t=='NOT'?48:56}" cy="22" r="4"/>`;}
 const w=t=='IC'?65:t=='LED'?30:t=='V'?30:t=='R'||t=='SW'?35:26,ly=t=='IC'?162:t=='V'?52:gp[t]?60:t=='LED'?32:32;
 if(t!='V'||1)s+=`<text class="nm" x="${w}" y="${ly}">${lb}</text><text class="ty" x="${w}" y="${ly+11}">${sb}</text>`;
 s+='</g>';h+=s;
 for(const[p,n]of Object.entries(pins)){const[px,py]=pp(c,p);
  if(n=='VCC'||n=='GND'){const v=n=='VCC';h+=`<path class="st" data-n="${n}" d="M${px} ${py}V${py+(v?-14:10)}${v?'':'M'+(px-8)+' '+(py+10)+'H'+(px+8)+'M'+(px-5)+' '+(py+14)+'H'+(px+5)}"/>${v?`<text class="pn" x="${px-6}" y="${py-17}">5V</text>`:''}`;}
  if(drv[n]&&drv[n][0]==i&&drv[n][1]==p&&!/^n/.test(n))h+=`<text class="pn" x="${px+4}" y="${py-6}">${n}</text>`;
  h+=`<circle class="pin" cx="${px}" cy="${py}" r="3"/>`;}});
$('svg').innerHTML=h;

/* ---------- UI helpers ---------- */
const car='<svg class="car" viewBox="0 0 80 50"><path class="b" d="M6 34V24l10-4 8-10h30l10 10 10 3v11z"/><path class="w" d="M26 13h12v8H20zM42 13h10l6 8H42z"/><circle cx="22" cy="36" r="7"/><circle cx="60" cy="36" r="7"/></svg>';
for(let i=1;i<=4;i++)$('lot').insertAdjacentHTML('beforeend',`<div class="slot" id="s${i}"><b>Slot ${i}</b>${car}<span>EMPTY</span></div>`);
function log(t,c=''){const li=document.createElement('li');li.className=c;li.textContent=new Date().toLocaleTimeString([],{hour12:false})+'  '+t;$('log').prepend(li);}
function flash(t,bad){const m=$('msg');m.textContent=t;m.classList.remove('bad');void m.offsetWidth;m.classList.toggle('bad',!!bad);}
const bin=n=>bits(n).join('');
function slot(i,occ){const e=$('s'+i);e.classList.remove('in','out');
 if(occ){e.classList.add('occ');void e.offsetWidth;e.classList.add('in');}else{e.classList.add('out');setTimeout(()=>e.classList.remove('occ','out'),800);}
 e.querySelector('span').textContent=occ?'OCCUPIED':'EMPTY';}

/* ---------- main update: evaluate gates, detect CLK rising edge, redraw ---------- */
function tick(){
 let N=ev();
 if(N.CLK&&!S.clk){const old=S.count,up=!N.EXT_OK;
  log(up?'ENTER pulse -> counter counts UP':'EXIT pulse -> counter counts DOWN',up?'up':'dn');
  S.count+=up?1:-1; log(`Counter updated: ${bin(old)} to ${bin(S.count)}`,up?'up':'dn');
  if(up){slot(S.count,1);log(`Slot ${S.count} occupied, LED${S.count} ON`,'up');}else{slot(old,0);log(`Slot ${old} vacated, LED${old} OFF`,'dn');}
  log('Available spaces: '+(4-S.count),up?'up':'dn');N=ev();}
 S.clk=N.CLK;
 document.querySelectorAll('[data-n]').forEach(e=>e.classList.toggle('hi',!!N[e.dataset.n]));
 [['L1','nL1'],['L2','nL2'],['L3','nL3'],['L4','nL4'],['FULL','nF'],['EMPTY','nE']].forEach(([n,w])=>$('gLED_'+n).setAttribute('opacity',N[w]?.45:0));
 $('SW_E').classList.toggle('on',!!S.swE);$('SW_X').classList.toggle('on',!!S.swX);
 $('SW_Ec').style.display=S.swE?'':'none';$('SW_Xc').style.display=S.swX?'':'none';
 $('bE').classList.toggle('on',!!S.swE);$('bX').classList.toggle('on',!!S.swX);
 $('cntv').textContent=bin(S.count);
 const c=S.count;$('sCars').textContent=c;$('sFree').textContent=4-c;
 $('sSt').textContent=c==4?'FULL':c==0?'EMPTY':'AVAILABLE';$('sSt').classList.toggle('full',c==4);
 $('logic').innerHTML=[['Q2',N.Q2],['Q1',N.Q1],['Q0',N.Q0],['Binary',bin(c)],['Cars',c],['Available',4-c],['E_IN',N.E_IN],['X_IN',N.X_IN],['CLK',N.CLK],['FULL',N.Q2],['EMPTY',N.EMPTY]]
  .map(([a,v])=>`<div class="${v===0||v==='000'?'z':''}">${a}<b>${v}</b></div>`).join('');}

/* ---------- switches (circuit switches + big buttons share the same inputs) ---------- */
function sw(k,v){
 if(v){ if(S[k])return; const N=ev();
  log((k=='swE'?'ENTER':'EXIT')+' button pressed',k=='swE'?'up':'dn');
  if(k=='swE'&&!N.FULLn){flash('PARKING FULL',1);log('ENTER blocked by FULL (AND gate output 0)','er');}
  else if(k=='swX'&&!N.EMPTYn){flash('PARKING EMPTY',1);log('EXIT blocked by EMPTY (NAND gate output 1)','er');}
  else flash('');
  S.t[k]=Date.now();S[k]=1;tick();}
 else{ if(!S[k])return; const d=Math.max(0,280-(Date.now()-S.t[k]));setTimeout(()=>{S[k]=0;tick();},d);}}
function bind(el,k){['pointerup','pointerleave','pointercancel'].forEach(e=>el.addEventListener(e,()=>sw(k,0)));
 el.addEventListener('pointerdown',ev=>{ev.preventDefault();sw(k,1);});}
bind($('SW_E'),'swE');bind($('SW_X'),'swX');bind($('bE'),'swE');bind($('bX'),'swX');
[['bE','swE'],['bX','swX']].forEach(([b,k])=>{$(b).addEventListener('keydown',e=>{if((e.key==' '||e.key=='Enter')&&!e.repeat){e.preventDefault();sw(k,1);}});
 $(b).addEventListener('keyup',e=>{if(e.key==' '||e.key=='Enter')sw(k,0);});});

/* ---------- reset ---------- */
$('reset').onclick=()=>{Object.assign(S,{swE:0,swX:0,count:0,clk:0});
 for(let i=1;i<=4;i++){$('s'+i).classList.remove('occ','in','out');$('s'+i).querySelector('span').textContent='EMPTY';}
 $('log').innerHTML='';log('Circuit reset: 5V applied, counter = 000');log('Available spaces: 4');flash('Ready');tick();};
$('reset').click();
