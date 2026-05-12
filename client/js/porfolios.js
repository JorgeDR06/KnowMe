let selectedTechs = [], selectedLangs = [], featuredOnly = false, debounceTimer = null

const globalSearch   = document.getElementById('global-search')
const techSearch     = document.getElementById('tech-search')
const langSearch     = document.getElementById('lang-search')
const techSugg       = document.getElementById('tech-suggestions')
const langSugg       = document.getElementById('lang-suggestions')
const techSelected   = document.getElementById('tech-selected')
const langSelected   = document.getElementById('lang-selected')
const featuredToggle = document.getElementById('featured-toggle')
const featuredTrack  = document.getElementById('featured-track')
const featuredKnob   = document.getElementById('featured-knob')
const clearBtn       = document.getElementById('clear-filters')
const resultsCount   = document.getElementById('results-count')
const skeletonGrid   = document.getElementById('skeleton-grid')
const porfoliosGrid  = document.getElementById('porfolios-grid')
const noResults      = document.getElementById('no-results')

function debounce(fn, ms = 350) {
clearTimeout(debounceTimer)
debounceTimer = setTimeout(fn, ms)
}

function buildQueryString() {
const params = new URLSearchParams()
const title = globalSearch.value.trim()
if (title)                params.set('title', title)
if (selectedTechs.length) params.set('technology', selectedTechs.map(t => t._id).join(','))
if (selectedLangs.length) params.set('language',   selectedLangs.map(l => l._id).join(','))
if (featuredOnly)         params.set('featured', 'true')
return params.toString()
}

function renderCard(p) {
const ownerName = p.owner?.username || 'usuario'
const thumb     = p.media?.find(m => m.type === 'image')
const techTags  = (p.technologies || []).slice(0, 3).map(t =>
    `<span class="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-400">${t.name}</span>`
).join('')
const extra = p.technologies?.length > 3
    ? `<span class="text-[10px] font-mono text-slate-600">+${p.technologies.length - 3}</span>` : ''

return `
    <article
    class="group bg-[#0f0f18] border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 cursor-pointer"
    onclick="window.location='/porfolios/${p._id}'"
    >
    <div class="aspect-video bg-[#0d0d14] relative overflow-hidden">
        ${thumb
        ? `<img src="${thumb.url}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>`
        : `<div class="w-full h-full flex items-center justify-center flex-col gap-2">
            <svg class="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 9 4-4 4 4 4-4 4 4"/>
            </svg>
            <span class="text-xs font-mono text-slate-700">sin imagen</span>
            </div>`
        }
        ${p.featured ? `<span class="absolute top-2 right-2 bg-emerald-500/90 text-[#0a0a0f] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">★ featured</span>` : ''}
    </div>
    <div class="p-4">
        <h3 class="text-sm font-bold text-slate-100 mb-2 truncate group-hover:text-emerald-400 transition-colors">${p.title}</h3>
        <div class="flex items-center gap-2 mb-3">
        <div class="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-black shrink-0">
            ${ownerName[0].toUpperCase()}
        </div>
        <span class="text-xs text-slate-500 font-mono truncate">${ownerName}</span>
        </div>
        <div class="flex flex-wrap gap-1.5">${techTags}${extra}</div>
    </div>
    </article>`
}

async function fetchPorfolios() {
const qs  = buildQueryString()
const url = qs ? `/api/porfolios/find?${qs}` : '/api/porfolios'
try {
    const res  = await fetch(url)
    const data = await res.json()
    skeletonGrid.classList.add('hidden')
    if (!res.ok || !data.result?.length) {
    porfoliosGrid.classList.add('hidden')
    noResults.classList.remove('hidden')
    resultsCount.textContent = '0'
    return
    }
    porfoliosGrid.innerHTML = data.result.map(renderCard).join('')
    porfoliosGrid.classList.remove('hidden')
    noResults.classList.add('hidden')
    resultsCount.textContent = data.result.length
} catch (err) {
    console.error(err)
    skeletonGrid.classList.add('hidden')
    noResults.classList.remove('hidden')
}
}

async function fetchSuggestions(endpoint, query, dropdownEl, onSelect) {
if (!query.trim()) { dropdownEl.classList.add('hidden'); return }
try {
    const res  = await fetch(`/api/${endpoint}/search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    if (!data.result?.length) {
    dropdownEl.innerHTML = `<p class="px-4 py-3 text-xs font-mono text-slate-600">Sin resultados</p>`
    dropdownEl.classList.remove('hidden')
    return
    }
    dropdownEl.innerHTML = data.result.map(item => `
    <button
        class="w-full text-left px-4 py-2.5 text-sm font-mono text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors flex items-center justify-between"
        data-id="${item._id}" data-name="${item.name}"
    >
        <span>${item.name}</span>
        <span class="text-[10px] text-slate-600">${item.category}</span>
    </button>`).join('')
    dropdownEl.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
        onSelect({ _id: btn.dataset.id, name: btn.dataset.name })
        dropdownEl.classList.add('hidden')
    })
    })
    dropdownEl.classList.remove('hidden')
} catch (err) { console.error(err) }
}

function renderSelectedTags(container, items, colorClass, onRemove) {
container.innerHTML = items.map(item => `
    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono border ${colorClass}">
    ${item.name}
    <button data-id="${item._id}" class="remove-tag ml-0.5 hover:text-white">×</button>
    </span>`).join('')
container.querySelectorAll('.remove-tag').forEach(btn => {
    btn.addEventListener('click', () => onRemove(btn.dataset.id))
})
}

techSearch.addEventListener('input', () => {
debounce(() => fetchSuggestions('technologies', techSearch.value, techSugg, (item) => {
    if (selectedTechs.find(t => t._id === item._id)) return
    selectedTechs.push(item)
    techSearch.value = ''
    const rerender = () => renderSelectedTags(techSelected, selectedTechs, 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', (id) => {
    selectedTechs = selectedTechs.filter(t => t._id !== id)
    rerender()
    debounce(fetchPorfolios)
    })
    rerender()
    debounce(fetchPorfolios)
}), 250)
})

langSearch.addEventListener('input', () => {
debounce(() => fetchSuggestions('languages', langSearch.value, langSugg, (item) => {
    if (selectedLangs.find(l => l._id === item._id)) return
    selectedLangs.push(item)
    langSearch.value = ''
    const rerender = () => renderSelectedTags(langSelected, selectedLangs, 'border-violet-500/40 text-violet-400 bg-violet-500/10', (id) => {
    selectedLangs = selectedLangs.filter(l => l._id !== id)
    rerender()
    debounce(fetchPorfolios)
    })
    rerender()
    debounce(fetchPorfolios)
}), 250)
})

document.addEventListener('click', (e) => {
if (!techSearch.contains(e.target) && !techSugg.contains(e.target)) techSugg.classList.add('hidden')
if (!langSearch.contains(e.target) && !langSugg.contains(e.target))  langSugg.classList.add('hidden')
})

globalSearch.addEventListener('input', () => debounce(fetchPorfolios))

featuredToggle.addEventListener('click', () => {
featuredOnly = !featuredOnly
if (featuredOnly) {
    featuredTrack.classList.replace('bg-slate-700', 'bg-emerald-500')
    featuredKnob.classList.add('translate-x-4')
    featuredKnob.classList.replace('bg-slate-400', 'bg-white')
} else {
    featuredTrack.classList.replace('bg-emerald-500', 'bg-slate-700')
    featuredKnob.classList.remove('translate-x-4')
    featuredKnob.classList.replace('bg-white', 'bg-slate-400')
}
debounce(fetchPorfolios)
})

clearBtn.addEventListener('click', () => {
globalSearch.value = ''; techSearch.value = ''; langSearch.value = ''
selectedTechs = []; selectedLangs = []; featuredOnly = false
techSelected.innerHTML = ''; langSelected.innerHTML = ''
techSugg.classList.add('hidden'); langSugg.classList.add('hidden')
featuredTrack.classList.replace('bg-emerald-500', 'bg-slate-700')
featuredKnob.classList.remove('translate-x-4')
featuredKnob.classList.replace('bg-white', 'bg-slate-400')
fetchPorfolios()
})

fetchPorfolios()