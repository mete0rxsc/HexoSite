(function fixTOCWithoutClone() {
    var tocLinks = document.querySelectorAll('.toc a[href^="#"]');
    var fixedCount = 0;

    tocLinks.forEach(function (link) {
        // 跳过折叠按钮
        if (link.classList.contains('cap-action')) return;

        var encodedHref = link.getAttribute('href');
        if (!encodedHref || encodedHref === '#') return;

        var targetId = decodeURIComponent(encodedHref.substring(1));
        var target = document.getElementById(targetId);

        if (!target) return;

        // 检查是否已经修复过
        if (link.hasAttribute('data-toc-fixed')) return;
        link.setAttribute('data-toc-fixed', 'true');

        // 不克隆，直接添加新的事件（但放在捕获阶段，优先级最高）
        link.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            history.pushState(null, null, encodedHref);
            return false;
        }, true); // 捕获阶段

        fixedCount++;
    });

    console.log('✅ 已修复', fixedCount, '个链接（无克隆）');
})();