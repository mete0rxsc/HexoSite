(function () {
    'use strict';

    function enableMarkdownImages() {
        // 使用正确的选择器：article.md-text.content
        const mdTextContainer = document.querySelector('article.md-text.content');

        if (!mdTextContainer) {
            console.warn('未找到 article.md-text.content 容器');
            return;
        }

        // 获取容器内所有的 img 标签
        const images = mdTextContainer.querySelectorAll('img');

        images.forEach(function (img) {
            // 检查图片是否已经被包装过（避免重复处理）
            if (img.parentElement && img.parentElement.tagName === 'A') {
                // 如果已经有父级 A 标签，但可能不是 fancybox，可以添加 data-fancybox 属性
                if (!img.parentElement.hasAttribute('data-fancybox')) {
                    img.parentElement.setAttribute('data-fancybox', 'gallery');
                    img.parentElement.setAttribute('data-caption', img.alt || '');
                }
                return;
            }

            // 获取图片源地址和 alt 文本
            const imgSrc = img.src;
            const imgAlt = img.alt || '';

            // 创建 A 标签
            const aTag = document.createElement('a');
            aTag.href = imgSrc;
            aTag.setAttribute('data-fancybox', 'gallery');
            aTag.setAttribute('data-caption', imgAlt);
            aTag.setAttribute('class', 'fancybox');

            // 替换原图片
            img.parentNode.insertBefore(aTag, img);
            aTag.appendChild(img);
        });

        // 如果 fancybox 已经加载，重新绑定事件
        if (typeof $ !== 'undefined' && $.fancybox) {
            $('[data-fancybox="gallery"]').fancybox({
                animationDuration: 366,
                loop: true,
                protect: true
            });
        }
    }

    // 检查图片和fancybox是否都已加载完成
    function checkAndEnableMarkdownImages() {
        const container = document.querySelector('article.md-text.content');
        if (!container) {
            // 如果没有容器，稍后重试
            setTimeout(checkAndEnableMarkdownImages, 100);
            return;
        }

        const images = container.querySelectorAll('img');
        const allImagesLoaded = Array.from(images).every(img => img.complete || img.naturalWidth > 0);

        // 检查 jQuery 和 fancybox 是否可用
        const isFancyboxReady = typeof $ !== 'undefined' && typeof $.fancybox !== 'undefined';

        if (allImagesLoaded && isFancyboxReady) {
            // 所有条件满足，执行功能
            enableMarkdownImages();
        } else {
            // 继续等待
            setTimeout(checkAndEnableMarkdownImages, 100);
        }
    }

    // 等待页面完全加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            // 开始检查并启用功能
            checkAndEnableMarkdownImages();
        });
    } else {
        // 页面已经加载完成，开始检查
        checkAndEnableMarkdownImages();
    }

    // 如果是通过 PJAX 或类似技术加载的内容，可能需要额外的监听
    // 如果主题使用了 PJAX，可以取消下面的注释
    /*
    if (typeof $(document) !== 'undefined') {
        $(document).on('pjax:complete', function () {
            // PJAX 完成后重新检查和启用
            setTimeout(checkAndEnableMarkdownImages, 100);
        });
    }
        */

})();