// /source/js/slogan.js
(function () {
    function fetchSlogan(region) {
        if (!region) {
            console.log('未获取到地区信息');
            return;
        }

        const apiUrl = `https://region.xscnet.cn/api/slogan?region=${encodeURIComponent(region)}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const sloganDiv = document.getElementById('welcome-slogan');
                if (sloganDiv) {
                    const text = data.slogan || data.content || '欢迎来到我的博客！';
                    sloganDiv.textContent = text;
                }
            })
            .catch(error => {
                console.error('获取欢迎语失败:', error);
            });
    }

    // 监听 location.js 触发的事件
    window.addEventListener('regionReady', function (e) {
        fetchSlogan(e.detail.region);
    });

    // 如果 location.js 已经执行完（作为备用）
    if (window.visitorRegion) {
        fetchSlogan(window.visitorRegion);
    }
})();