var e=[],t=[],n=!1,r=null,i=document.getElementById(`global-search`),a=document.getElementById(`tech-search`),o=document.getElementById(`lang-search`),s=document.getElementById(`tech-suggestions`),c=document.getElementById(`lang-suggestions`),l=document.getElementById(`tech-selected`),u=document.getElementById(`lang-selected`),d=document.getElementById(`featured-toggle`),f=document.getElementById(`featured-track`),p=document.getElementById(`featured-knob`),m=document.getElementById(`clear-filters`),h=document.getElementById(`results-count`),g=document.getElementById(`skeleton-grid`),_=document.getElementById(`porfolios-grid`),v=document.getElementById(`no-results`);function y(e,t=350){clearTimeout(r),r=setTimeout(e,t)}function b(){let r=new URLSearchParams,a=i.value.trim();return a&&(r.set(`title`,a),r.set(`user`,a)),e.length&&r.set(`technology`,e.map(e=>e._id).join(`,`)),t.length&&r.set(`language`,t.map(e=>e._id).join(`,`)),n&&r.set(`featured`,`true`),r.toString()}function x(e){let t=e.owner?.name||`usuario`,n=e.media?.find(e=>e.type===`image`),r=(e.technologies||[]).slice(0,3).map(e=>`<span class="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-400">${e.name}</span>`).join(``),i=e.technologies?.length>3?`<span class="text-[10px] font-mono text-slate-600">+${e.technologies.length-3}</span>`:``;return`
    <article
    class="group bg-[#0f0f18] border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 cursor-pointer"
    onclick="window.location='/porfolios/${e._id}'"
    >
    <div class="aspect-video bg-[#0d0d14] relative overflow-hidden">
        ${n?`<img src="${n.url}" alt="${e.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>`:`<div class="w-full h-full flex items-center justify-center flex-col gap-2">
            <svg class="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 9 4-4 4 4 4-4 4 4"/>
            </svg>
            <span class="text-xs font-mono text-slate-700">sin imagen</span>
            </div>`}
        ${e.featured?`<span class="absolute top-2 right-2 bg-emerald-500/90 text-[#0a0a0f] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">★ featured</span>`:``}
    </div>
    <div class="p-4">
        <h3 class="text-sm font-bold text-slate-100 mb-2 truncate group-hover:text-emerald-400 transition-colors">${e.title}</h3>
        <div class="flex items-center gap-2 mb-3">
        <div class="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-black shrink-0">
            ${t[0].toUpperCase()}
        </div>
        <span class="text-xs text-slate-500 font-mono truncate">${t}</span>
        </div>
        <div class="flex flex-wrap gap-1.5">${r}${i}</div>
    </div>
    </article>`}async function S(){let e=b(),t=e?`/api/porfolios/find?${e}`:`/api/porfolios`;try{let e=await fetch(t),n=await e.json();if(g.classList.add(`hidden`),!e.ok||!n.result?.length){_.classList.add(`hidden`),v.classList.remove(`hidden`),h.textContent=`0`;return}_.innerHTML=n.result.map(x).join(``),_.classList.remove(`hidden`),v.classList.add(`hidden`),h.textContent=n.result.length}catch(e){console.error(e),g.classList.add(`hidden`),v.classList.remove(`hidden`)}}async function C(e,t,n,r){if(!t.trim()){n.classList.add(`hidden`);return}try{let i=await(await fetch(`/api/${e}/search?q=${encodeURIComponent(t)}`)).json();if(!i.result?.length){n.innerHTML=`<p class="px-4 py-3 text-xs font-mono text-slate-600">Sin resultados</p>`,n.classList.remove(`hidden`);return}n.innerHTML=i.result.map(e=>`
    <button
        class="w-full text-left px-4 py-2.5 text-sm font-mono text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors flex items-center justify-between"
        data-id="${e._id}" data-name="${e.name}"
    >
        <span>${e.name}</span>
        <span class="text-[10px] text-slate-600">${e.category}</span>
    </button>`).join(``),n.querySelectorAll(`button`).forEach(e=>{e.addEventListener(`click`,()=>{r({_id:e.dataset.id,name:e.dataset.name}),n.classList.add(`hidden`)})}),n.classList.remove(`hidden`)}catch(e){console.error(e)}}function w(e,t,n,r){e.innerHTML=t.map(e=>`
    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono border ${n}">
    ${e.name}
    <button data-id="${e._id}" class="remove-tag ml-0.5 hover:text-white">×</button>
    </span>`).join(``),e.querySelectorAll(`.remove-tag`).forEach(e=>{e.addEventListener(`click`,()=>r(e.dataset.id))})}a.addEventListener(`input`,()=>{y(()=>C(`technologies`,a.value,s,t=>{if(e.find(e=>e._id===t._id))return;e.push(t),a.value=``;let n=()=>w(l,e,`border-emerald-500/40 text-emerald-400 bg-emerald-500/10`,t=>{e=e.filter(e=>e._id!==t),n(),y(S)});n(),y(S)}),250)}),o.addEventListener(`input`,()=>{y(()=>C(`languages`,o.value,c,e=>{if(t.find(t=>t._id===e._id))return;t.push(e),o.value=``;let n=()=>w(u,t,`border-violet-500/40 text-violet-400 bg-violet-500/10`,e=>{t=t.filter(t=>t._id!==e),n(),y(S)});n(),y(S)}),250)}),document.addEventListener(`click`,e=>{!a.contains(e.target)&&!s.contains(e.target)&&s.classList.add(`hidden`),!o.contains(e.target)&&!c.contains(e.target)&&c.classList.add(`hidden`)}),i.addEventListener(`input`,()=>y(S)),d.addEventListener(`click`,()=>{n=!n,n?(f.classList.replace(`bg-slate-700`,`bg-emerald-500`),p.classList.add(`translate-x-4`),p.classList.replace(`bg-slate-400`,`bg-white`)):(f.classList.replace(`bg-emerald-500`,`bg-slate-700`),p.classList.remove(`translate-x-4`),p.classList.replace(`bg-white`,`bg-slate-400`)),y(S)}),m.addEventListener(`click`,()=>{i.value=``,a.value=``,o.value=``,e=[],t=[],n=!1,l.innerHTML=``,u.innerHTML=``,s.classList.add(`hidden`),c.classList.add(`hidden`),f.classList.replace(`bg-emerald-500`,`bg-slate-700`),p.classList.remove(`translate-x-4`),p.classList.replace(`bg-white`,`bg-slate-400`),S()}),S();