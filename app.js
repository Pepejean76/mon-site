const app=document.getElementById('app');
const NEW=()=>({done:[],xp:0,last:'',streak:0,dc:''});
let DB={cur:'',users:{}},S=NEW();
try{const p=JSON.parse(localStorage.getItem('lal')||'{}');if(p.users){DB=p}else if(p.done){DB={cur:'Moi',users:{Moi:p}}}}catch(e){}
if(DB.cur&&DB.users[DB.cur])S=Object.assign(NEW(),DB.users[DB.cur]);
function save(){try{DB.users[DB.cur]=S;localStorage.setItem('lal',JSON.stringify(DB))}catch(e){}}
function h(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
const day=o=>new Date(Date.now()-o*864e5).toISOString().slice(0,10);
const streakNow=()=>(S.last===day(0)||S.last===day(1))?S.streak:0;
const hearts=n=>'❤️'.repeat(Math.max(n,0))+'🖤'.repeat(3-Math.max(n,0));

function home(){
  if(!DB.cur)return login();
  app.replaceChildren();
  const top=h('header','top');
  top.append(h('h1',null,'Ligne à ligne'));
  const st=h('div','chips');
  const me=h('button','chip','👤 '+DB.cur);me.onclick=login;
  st.append(me,h('span','chip','🔥 '+streakNow()),h('span','chip','⚡ '+S.xp+' XP'));
  top.append(st);
  app.append(top,h('p','intro','Une leçon = 3 à 4 questions, avec du code à écrire. Finis Python, puis JavaScript, puis HTML et CSS. Ton profil est gardé sur cet appareil.'));
  const dn=S.dc===day(0);
  const dd=h('button','node'+(dn?' done':' cur'));
  dd.append(h('i',null,dn?'✓':'⭐'),h('span',null,dn?'Défi du jour fait, reviens demain':'Défi du jour : un nouveau truc à coder'));
  dd.disabled=dn;dd.style.marginTop='16px';
  dd.onclick=()=>lesson('d',{t:'Défi du jour',q:[DC[Math.floor(Date.now()/864e5)%DC.length]]});
  app.append(dd);
  let g=0;
  TR.forEach(t=>{
    app.append(h('h2','trk',t.e+' '+t.n));
    const ul=h('div','path');
    t.L.forEach(l=>{
      const i=g++,done=S.done.includes(i),cur=i===S.done.length;
      const b=h('button','node'+(done?' done':cur?' cur':''));
      b.append(h('i',null,done?'✓':cur?'▶':'🔒'),h('span',null,(i+1)+'. '+l.t));
      b.disabled=!(done||cur);
      b.onclick=()=>lesson(i,l);
      ul.append(b);
    });
    app.append(ul);
  });
}

function login(){
  app.replaceChildren();
  app.append(h('h1',null,'Ligne à ligne'),h('p','intro','Choisis un pseudo. Ton profil et tes points sont gardés sur cet appareil.'));
  const inp=h('input','in');inp.maxLength=20;inp.placeholder='Ton pseudo';inp.setAttribute('autocomplete','off');
  const go=h('button','go','Commencer');
  const start=n=>{n=n.trim();if(!n||n==='__proto__')return;DB.cur=n;S=Object.assign(NEW(),DB.users[n]||{});save();home()};
  go.onclick=()=>start(inp.value);
  app.append(inp,go);
  const ex=Object.keys(DB.users);
  if(ex.length){
    app.append(h('h2','trk','Profils sur cet appareil'));
    const ul=h('div','path');
    ex.forEach(n=>{const b=h('button','node');b.append(h('i',null,'👤'),h('span',null,n+' · '+DB.users[n].xp+' XP'));b.onclick=()=>start(n);ul.append(b)});
    app.append(ul);
  }
}

function lesson(i,l){
  let q=0,hp=3,ok=0;
  const Q=l.q;
  function show(){
    app.replaceChildren();
    const bar=h('div','bar');
    const x=h('button','x','✕');x.setAttribute('aria-label','Quitter la leçon');x.onclick=home;
    const pr=h('div','prog'),f=h('i');f.style.width=(q/Q.length*100)+'%';pr.append(f);
    const hpEl=h('span',null,hearts(hp));
    bar.append(x,pr,hpEl);
    const [qt,op,ans,ex,sol]=Q[q];
    const box=h('div'),fb=h('div','fb');
    box.append(h('h2','q',qt));
    function res(good,extra){
      if(good)ok++;else hp--;
      hpEl.textContent=hearts(hp);
      fb.className='fb show '+(good?'ok':'bad');
      fb.replaceChildren(h('strong',null,good?'Bien joué !':'Pas tout à fait'));
      if(extra)fb.append(h('p',null,extra));
      fb.append(h('p',null,ex));
      const retry=hp<=0&&i!=='d';
      const nx=h('button','go',retry?'Réessayer la leçon':q+1>=Q.length?'Voir le résultat':'Continuer');
      nx.onclick=()=>{if(retry)lesson(i,l);else if(++q<Q.length)show();else end()};
      fb.append(nx);nx.focus();
    }
    if(op){
      const order=op.map((_,k)=>k).sort(()=>Math.random()-.5);
      const btns=order.map(k=>{
        const b=h('button','opt'+(/[(){}=<>#;]/.test(op[k])?' mono':''),op[k]);
        b.onclick=()=>{btns.forEach(z=>z.disabled=true);const good=k===ans;b.classList.add(good?'ok':'bad');if(!good)btns[order.indexOf(ans)].classList.add('ok');res(good)};
        return b;
      });
      box.append(...btns);
    }else{
      const ta=h('textarea','code');ta.rows=2;ta.placeholder='Écris ton code ici';
      ['autocapitalize','autocorrect','spellcheck'].forEach(a=>ta.setAttribute(a,'off'));
      ta.setAttribute('autocomplete','off');
      const v=h('button','go','Valider');
      v.onclick=()=>{
        const t=ta.value.trim().replace(/\s+/g,' ').replace(/[“”]/g,'"').replace(/[‘’]/g,"'");
        const good=ans.some(r=>new RegExp(r).test(t));
        ta.disabled=v.disabled=true;
        res(good,good?'':'Une bonne réponse : '+sol);
      };
      box.append(ta,v);
    }
    app.append(bar,box,fb);
  }
  function end(){
    app.replaceChildren();
    let msg;
    if(i==='d'){
      const win=ok===1;
      S.dc=day(0);if(win)S.xp+=20;
      msg=win?'+20 XP. Reviens demain pour un nouveau défi !':'Raté cette fois. Retente demain avec un nouveau défi !';
    }else{
      const first=!S.done.includes(i);let gain=0;
      if(first){gain=ok*10+(ok===Q.length?5:0);S.xp+=gain;S.done.push(i)}
      msg=first?'+'+gain+' XP':'Leçon déjà validée, pas d’XP en plus.';
    }
    if(S.last!==day(0)){S.streak=(S.last===day(1)?S.streak:0)+1;S.last=day(0)}
    save();
    const r=h('div','end');
    r.append(h('div','big',ok===Q.length?'🎉':'💪'),h('h2',null,ok+'/'+Q.length+' bonnes réponses'),h('p',null,msg));
    const bt=h('button','go','Retour au parcours');bt.onclick=home;
    r.append(bt);app.append(r);
  }
  show();
}
home();
