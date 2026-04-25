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

// 测试方案1：禁用图片点击，让事件穿透到父元素
const style = document.createElement('style');
style.textContent = `
  .atk-grp .atk-item img {
    pointer-events: none !important;
  }
`;
document.head.appendChild(style);
console.log('✅ 已禁用表情包图片的点击事件，现在点击图片区域会穿透到父元素');
