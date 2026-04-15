(function () {
    // ======================
    // ✅ 白名单（在这里添加）
    // ======================
    window.DOMAIN_WHITELIST = [
        "xscnet.cn",
        "blogscn.fun",
        "www.foreverblog.cn",
        "travellings.cn"
    ];

    var siteDomain = window.location.hostname;
    var redirectPage = '/go.html';
    var DOMAIN_WHITELIST = window.DOMAIN_WHITELIST || [];

    // ======================
    // ✅ Base64 编码函数（支持 UTF-8）
    // ======================
    function toBase64(str) {
        try {
            // 处理 UTF-8 字符
            var utf8Bytes = unescape(encodeURIComponent(str));
            var base64Str = btoa(utf8Bytes);
            // 转换为 URL 安全的 Base64 编码（替换 + 和 /）
            var urlSafeBase64 = base64Str.replace(/\+/g, '-').replace(/\//g, '_'); 
            // 移除填充字符 '='（因为 go.html 中的解码函数会自动处理）
            return urlSafeBase64.replace(/=+$/, '');
        } catch (e) {
            // 降级方案：直接编码并转换为 URL 安全格式
            var base64Str = btoa(str);
            var urlSafeBase64 = base64Str.replace(/\+/g, '-').replace(/\//g, '_');
            return urlSafeBase64.replace(/=+$/, '');
        }
    }

    function isExternalLink(url) {
        if (!url || !/^https?:\/\//.test(url)) return false;
        try {
            var h = new URL(url).hostname.replace(/^www\./, '');
            var s = siteDomain.replace(/^www\./, '');

            // 白名单匹配
            for (var i = 0; i < DOMAIN_WHITELIST.length; i++) {
                var whiteDomain = DOMAIN_WHITELIST[i].replace(/^www\./, '');
                if (h === whiteDomain || h.endsWith('.' + whiteDomain)) {
                    return false;
                }
            }

            return h !== s;
        } catch {
            return false;
        }
    }

    function fixLink(link) {
        var href = link.href;
        if (!href) return;
        if (href.includes(redirectPage)) return;
        if (isExternalLink(href)) {
            // 对 URL 进行 Base64 编码（已移除填充字符）
            var encodedUrl = toBase64(href);
            link.href = redirectPage + '?url=' + encodeURIComponent(encodedUrl);
        }
    }

    function run() {
        document.querySelectorAll('a[target="_blank"]').forEach(fixLink);
    }

    // 轮询强制覆盖，解决 Artalk 异步渲染问题
    setTimeout(run, 300);
    setTimeout(run, 800);
    setInterval(run, 2000);

    var observer = new MutationObserver(run);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();