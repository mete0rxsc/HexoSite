document.addEventListener('click', function (e) {
    const img = e.target.closest('img[atk-emoticon]')
    if (!img) return
    const owo = document.createElement('div')
    owo.id = 'owo-big'
    owo.innerHTML = `<img src="${img.src}">`
    document.body.appendChild(owo)
    owo.style.left = e.pageX + 10 + 'px'
    owo.style.top = e.pageY + 10 + 'px'
    owo.style.display = 'block'
    setTimeout(() => owo.style.opacity = 1, 10)
    setTimeout(() => {
        owo.remove()
    }, 1500)
})
