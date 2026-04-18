(function () {
    // 配置参数
    const CONFIG = {
        textareaSelector: 'textarea.atk-textarea',  // 目标输入框选择器
        imageUrl: 'https://img.xscnet.cn//i/2026/04/18/69e371cce2099.gif',
        decorationId: 'atk-custom-decoration',
        maxRetries: 30,           // 最大重试次数
        retryInterval: 500,       // 重试间隔(ms)
        // 新增：图片样式配置
        imageSize: {
            width: '100px',        // 宽度，如 '80px', 'auto'
            height: '100px',       // 高度，如 '32px', 'auto'
            maxWidth: '100px',     // 最大宽度
            maxHeight: ''         // 最大高度，留空则不限制
        },
        position: {
            right: '12px',        // 距离右侧距离
            top: '12px'           // 距离顶部距离
        },
        opacity: 0.7,             // 透明度 0-1
        borderRadius: '6px'       // 圆角大小
    };

    let retryCount = 0;
    let observer = null;

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startWatching);
    } else {
        startWatching();
    }

    function startWatching() {
        // 先尝试直接查找
        if (tryInject()) return;

        // 使用 MutationObserver 监听 DOM 变化
        observer = new MutationObserver(function (mutations) {
            if (tryInject()) {
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 设置超时后备方案
        setTimeout(function () {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            // 最后再尝试一次
            tryInject(true);
        }, 10000);
    }

    function tryInject(force = false) {
        // 查找目标 textarea
        const textarea = document.querySelector(CONFIG.textareaSelector);

        if (!textarea) {
            if (force && retryCount < CONFIG.maxRetries) {
                // 后备重试机制
                retryCount++;
                setTimeout(() => tryInject(true), CONFIG.retryInterval);
            }
            return false;
        }

        // 避免重复注入
        if (document.getElementById(CONFIG.decorationId)) return true;

        // 找到后执行注入
        return injectDecoration(textarea);
    }

    function injectDecoration(textarea) {
        // 获取包裹 textarea 的容器 (.atk-textarea-wrap)
        const textareaWrap = textarea.closest('.atk-textarea-wrap');
        if (!textareaWrap) return false;

        // 设置容器为相对定位（如果还不是）
        if (getComputedStyle(textareaWrap).position === 'static') {
            textareaWrap.style.position = 'relative';
        }

        // 创建装饰图片容器
        const decoration = document.createElement('div');
        decoration.id = CONFIG.decorationId;
        decoration.style.cssText = `
            position: absolute;
            right: ${CONFIG.position.right};
            top: ${CONFIG.position.top};
            z-index: 10;
            pointer-events: none;
            user-select: none;
        `;

        // 创建图片
        const img = document.createElement('img');
        img.src = CONFIG.imageUrl;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');  // 隐藏辅助功能，解决无id/name警告

        // 构建图片样式
        let imgStyles = `
            display: block;
            pointer-events: none;
            opacity: ${CONFIG.opacity};
            border-radius: ${CONFIG.borderRadius};
        `;

        // 添加尺寸配置
        if (CONFIG.imageSize.width) imgStyles += `width: ${CONFIG.imageSize.width};`;
        if (CONFIG.imageSize.height) imgStyles += `height: ${CONFIG.imageSize.height};`;
        if (CONFIG.imageSize.maxWidth) imgStyles += `max-width: ${CONFIG.imageSize.maxWidth};`;
        if (CONFIG.imageSize.maxHeight) imgStyles += `max-height: ${CONFIG.imageSize.maxHeight};`;

        img.style.cssText = imgStyles;

        // 图片加载错误处理
        img.onerror = function () {
            console.warn('装饰图片加载失败:', CONFIG.imageUrl);
            decoration.style.display = 'none';
        };

        decoration.appendChild(img);
        textareaWrap.appendChild(decoration);

        // 给 textarea 添加右侧内边距，防止文字被图片遮挡
        const currentPaddingRight = parseInt(getComputedStyle(textarea).paddingRight) || 0;
        // 计算图片实际占用的宽度（优先取width，否则maxWidth，否则默认80）
        let imageWidth = parseInt(CONFIG.imageSize.width) ||
            parseInt(CONFIG.imageSize.maxWidth) || 80;
        const rightOffset = parseInt(CONFIG.position.right) || 12;
        const neededPadding = imageWidth + rightOffset;

        if (currentPaddingRight < neededPadding) {
            textarea.style.paddingRight = neededPadding + 'px';
        }

        console.log('Artalk 输入框装饰图案注入成功（覆盖在输入框右侧）');
        return true;
    }
})();