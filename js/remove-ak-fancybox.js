// 放在页面最底部，任何 Fancybox 相关代码之后
(function () {
    // 阻止表情包区域所有图片被 Fancybox 识别
    function hijackFancybox() {
        // 方法：给表情包所有图片加一个特殊的 data 属性，然后用 CSS 选择器排除
        document.querySelectorAll('.atk-grp img, .atk-editor-plug-emoticons img').forEach(function (img) {
            img.setAttribute('data-fancybox', 'disabled');
            img.setAttribute('data-fancybox-gallery', 'disabled');
            // 添加一个特殊 class
            img.classList.add('no-fancybox');
        });

        // 强制重新绑定 Fancybox，排除有 no-fancybox 类的图片
        if (typeof Fancybox !== 'undefined') {
            try {
                Fancybox.unbind();
            } catch (e) { }
            Fancybox.bind('.timenode p>img, .md-text img:not(.no-fancybox), .atk-main-editor .atk-textarea-wrap img:not(.no-fancybox)');
        }
    }

    // 立即执行
    hijackFancybox();

    // 监听动态添加
    var observer = new MutationObserver(function () {
        hijackFancybox();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 每隔一秒检查一次（保险）
    setInterval(hijackFancybox, 1000);
})();