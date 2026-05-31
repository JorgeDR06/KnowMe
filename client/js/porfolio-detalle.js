document.addEventListener('DOMContentLoaded', () => {
    hljs.highlightAll()
})

window.switchMedia = function (url, type) {
    const container = document.querySelector('.aspect-video')
    const old = document.getElementById('main-media')

    let newEl
    if (type === 'video') {
        newEl = document.createElement('video')
        newEl.controls = true
        newEl.className = 'w-full h-full object-cover'
    } else {
        newEl = document.createElement('img')
        newEl.alt = '{{ porfolio.title }}'
        newEl.className = 'w-full h-full object-cover'
    }
    newEl.id = 'main-media'
    newEl.src = url
    old.replaceWith(newEl)

    document.querySelectorAll('.thumbnail-btn').forEach(btn => {
        btn.classList.remove('border-emerald-500')
        btn.classList.add('border-slate-800')
    })
    event.currentTarget.classList.remove('border-slate-800')
    event.currentTarget.classList.add('border-emerald-500')
}

window.switchTab = function (index) {
    document.querySelectorAll('.snippet-panel').forEach(p => p.classList.add('hidden'))
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('border-emerald-500', 'text-emerald-400')
        b.classList.add('border-transparent', 'text-slate-500')
    })
    document.getElementById('snippet-' + index).classList.remove('hidden')
    const tab = document.getElementById('tab-' + index)
    tab.classList.remove('border-transparent', 'text-slate-500')
    tab.classList.add('border-emerald-500', 'text-emerald-400')
}

window.copyCode = function (index, btn) {
    const code = document.getElementById('code-' + index).innerText
    navigator.clipboard.writeText(code).then(() => {
        const original = btn.innerHTML
        btn.innerHTML = '✓ copiado'
        btn.classList.add('text-emerald-400')
        setTimeout(() => { btn.innerHTML = original; btn.classList.remove('text-emerald-400') }, 2000)
    })
}

window.eliminarPorfolio = async function (id) {
    if (!confirm('¿Seguro que quieres eliminar este porfolio?')) return
    try {
        const res = await fetch(`/api/porfolios/${id}`, { method: 'DELETE' })
        if (res.ok) {
            window.location.href = '/porfolios'
        } else {
            const data = await res.json()
            alert(data.error || 'Error al eliminar')
        }
    } catch (err) {
        alert('Error de conexión')
    }
}