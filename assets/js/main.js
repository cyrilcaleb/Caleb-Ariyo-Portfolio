
(() => {
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse=matchMedia('(pointer: coarse)').matches;

  // Loading veil
  addEventListener('load',()=>setTimeout(()=>$('.page-loading')?.classList.add('hide'),120));

  // Header + reading progress
  const header=$('.site-header'), progress=$('.progress');
  const scrollUI=()=>{
    header?.classList.toggle('scrolled',scrollY>18);
    const max=document.documentElement.scrollHeight-innerHeight;
    if(progress) progress.style.width=`${max>0?Math.min(100,scrollY/max*100):0}%`;
  };
  addEventListener('scroll',scrollUI,{passive:true}); scrollUI();

  // Mobile nav
  const menu=$('.menu-btn'), nav=$('.nav-links');
  menu?.addEventListener('click',()=>{
    const open=nav.classList.toggle('open'); menu.classList.toggle('open',open); menu.setAttribute('aria-expanded',String(open));
  });
  $$('.nav-links a').forEach(a=>a.addEventListener('click',()=>{nav?.classList.remove('open');menu?.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));

  // Active nav by path
  const path=location.pathname.replace(/\/$/,'')||'/';
  $$('.nav-links a').forEach(a=>{const href=new URL(a.href).pathname.replace(/\/$/,'')||'/';a.classList.toggle('active',href===path||(path.startsWith('/projects/')&&href==='/work'))});

  // Cursor glow + card spotlight
  if(!reduced&&!coarse){
    const glow=$('.cursor-glow'); let x=innerWidth/2,y=innerHeight/2,tx=x,ty=y;
    addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY});
    const loop=()=>{x+=(tx-x)*.1;y+=(ty-y)*.1;if(glow){glow.style.left=x+'px';glow.style.top=y+'px'}requestAnimationFrame(loop)};loop();
    $$('.project-card').forEach(card=>card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--mx',`${e.clientX-r.left}px`);card.style.setProperty('--my',`${e.clientY-r.top}px`)}));
  }

  // Reveal
  const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -35px'});
  $$('.reveal').forEach((el,i)=>{el.style.transitionDelay=`${Math.min(i%6,5)*60}ms`;obs.observe(el)});

  // Desktop tilt only
  if(!reduced&&!coarse&&innerWidth>980){
    $$('[data-tilt]').forEach(card=>{
      card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1200px) rotateX(${(-py*2.6).toFixed(2)}deg) rotateY(${(px*3.4).toFixed(2)}deg) translateY(-5px)`});
      card.addEventListener('pointerleave',()=>card.style.transform='');
    });
  }

  // Filters with smooth hide
  $$('.filter').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    const cat=btn.dataset.filter;
    $$('.project-card[data-category]').forEach(card=>{const show=cat==='all'||card.dataset.category.split(' ').includes(cat);card.hidden=!show});
  }));

  // Video UX: don't preload; optional hover previews only if explicitly marked
  $$('video[data-hover-play]').forEach(v=>{
    v.muted=true;v.playsInline=true;const card=v.closest('.project-card');
    card?.addEventListener('pointerenter',()=>{if(!coarse)v.play().catch(()=>{})});
    card?.addEventListener('pointerleave',()=>{v.pause();try{v.currentTime=0}catch{}});
  });

  // Native page transition when supported; graceful fallback
  if(!reduced && 'startViewTransition' in document){ document.documentElement.classList.add('view-transitions') }
  if(!reduced){
    $$('a[href]').forEach(a=>{
      const u=new URL(a.href,location.href); if(u.origin!==location.origin||a.target||a.download||a.href.includes('#'))return;
      a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return; if('startViewTransition' in document)return; e.preventDefault();document.body.classList.add('leaving');setTimeout(()=>location.href=a.href,160)});
    });
  }

  // Contact form -> mail client, no backend required
  const form=$('#contact-form');
  form?.addEventListener('submit',e=>{
    e.preventDefault(); const data=new FormData(form);
    const name=(data.get('name')||'').trim(),email=(data.get('email')||'').trim(),type=(data.get('type')||'').trim(),message=(data.get('message')||'').trim();
    const subject=encodeURIComponent(`Portfolio enquiry${type?' — '+type:''}`);
    const body=encodeURIComponent(`Name: ${name}\nEmail: ${email}\nProject type: ${type}\n\n${message}`);
    location.href=`mailto:cyrilcaleb12@gmail.com?subject=${subject}&body=${body}`;
    const status=$('.form-status');if(status){status.textContent='Opening your email app…';status.hidden=false}
  });

  // Back to top
  const top=$('.back-top'); top?.addEventListener('click',()=>scrollTo({top:0,behavior:reduced?'auto':'smooth'}));
  $$('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
})();
