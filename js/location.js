// /source/js/location.js
(function () {
    // 添加毛玻璃样式
    const style = document.createElement('style');
    style.textContent = `
    .ip-glass {
      filter: blur(5px);
      cursor: pointer;
      transition: filter 0.3s ease;
      color: orange;
      font-weight: bold;
    }
    .ip-glass:hover {
      filter: blur(0);
    }
  `;
    document.head.appendChild(style);

    // 请求 API
    fetch('https://v1.nsuuu.com/api/ipip?key=d608352ca1ca5e3c')
        .then(response => response.json())
        .then(data => {
            if (data.code === 200 && data.data) {
                const { country, province, city, ip } = data.data;

                // 更新地理位置显示
                const locationSpan = document.getElementById('visitor-location');
                if (locationSpan) {
                    let locationText = '';
                    if (country) locationText += country;
                    if (province) locationText += province;
                    if (city) locationText += city;
                    locationSpan.textContent = locationText || '未知地区';

                    // 【关键】设置全局变量，供 slogan.js 使用
                    // 国外用户：只有 country，没有 province
                    // 中国用户：country + province + city
                    let regionForAPI = '';
                    if (country === '中国') {
                        // 中国的需要省份，格式如："中国吉林"
                        regionForAPI = country + (province || '');
                    } else {
                        // 国外的只需要国家
                        regionForAPI = country || '';
                    }
                    window.visitorRegion = regionForAPI;

                    // 触发自定义事件，通知 slogan.js
                    window.dispatchEvent(new CustomEvent('regionReady', {
                        detail: { region: regionForAPI }
                    }));
                }

                // 更新 IP 显示
                const ipSpan = document.getElementById('visitor-ip');
                if (ipSpan) {
                    ipSpan.textContent = ip;
                }
            }
        })
        .catch(error => {
            console.error('获取位置信息失败:', error);
            const locationSpan = document.getElementById('visitor-location');
            if (locationSpan) locationSpan.textContent = '神秘地区';
        });
})();