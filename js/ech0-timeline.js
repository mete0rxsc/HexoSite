/* Ech0 Timeline 适配器 - 使用原生时间线结构 */
(function () {
    'use strict';

    // 缓存相关变量定义
    const CACHE_KEY = "Ech0TimelineCacheV2";
    const CACHE_TIME_KEY = "Ech0TimelineCacheTimeV2";

    // 配置区
    const xscConfig = {
        apiUrl: 'https://talk.xscnet.cn/api/echo/page',
        avatar: 'https://img.xscnet.cn//i/2025/07/09/686e64ec429db.png',
        nickname: 'Mete0r',
        ech0BaseUrl: 'https://talk.xscnet.cn'
    };

    // 格式化日期函数 - 返回完整日期用于时间线节点
    function formatDateForNode(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "刚刚";
        const pad = n => String(n).padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }

    // 格式化时间函数 - 返回详细时间
    function formatTime(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        const pad = n => String(n).padStart(2, "0");
        return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    // 获取标签数组
    function getTags(item) {
        return Array.isArray(item?.tags) && item.tags.length ?
            item.tags.map(tag => tag?.name || tag).filter(Boolean) :
            ["💬 碎碎念"];
    }

    // 提取扩展信息
    function getExtension(item) {
        const ext = item?.extension;
        return ext && typeof ext === "object" ? ext : null;
    }

    // 生成外部链接HTML
    function renderExternalLink(type, payload) {
        if (!payload) return "";

        let url = "", title = "";
        let iconUrl = "https://img.xscnet.cn//i/2026/03/14/69b5554165047.webp";

        if (type === "WEBSITE") {
            url = payload.site || payload.url || "";
            title = payload.title || url;
        }

        if (type === "GITHUBPROJ") {
            url = payload.repoUrl || payload.url || "";
            title = payload.title || (() => {
                if (!url) return "";
                const match = url.match(/^https?:\/\/github\.com\/[^/]+\/([^/?#]+)/i);
                return match ? match[1] : url;
            })();
            iconUrl = "https://img.xscnet.cn//i/2026/03/14/69b5554de2010.webp";
        }

        return url ? `
            <div class="timeline-external-link">
                <a class="external-link" href="${url}" target="_blank" rel="nofollow noopener">
                    <div class="external-link-left" style="background-image:url(${iconUrl})"></div>
                    <div class="external-link-right">
                        <div class="external-link-title">${escapeHtml(title)}</div>
                        <div>点击跳转 <i class="fa-solid fa-angle-right"></i></div>
                    </div>
                </a>
            </div>
        ` : "";
    }

    // 生成B站视频
    function renderBiliVideo(payload) {
        const videoId = payload?.videoId || payload?.url || "";
        if (!videoId) return "";

        let embedUrl = "";
        if (/^BV[0-9A-Za-z]+$/i.test(videoId)) {
            embedUrl = `https://www.bilibili.com/blackboard/html5mobileplayer.html?bvid=${videoId}&as_wide=1&high_quality=1&danmaku=0`;
        }

        return embedUrl ? `
            <div class="timeline-video-embed">
                <iframe src="${embedUrl}" frameborder="0" allowfullscreen loading="lazy"></iframe>
            </div>
        ` : "";
    }

    // 生成轮播图HTML
    function renderCarousel(images, liveVideos = []) {
        if (!images || images.length === 0) return '';

        const processedImages = images.map(img => {
            if (img && img.startsWith('/api/files/images/')) {
                return xscConfig.ech0BaseUrl + img;
            }
            return img;
        });

        const generateSlide = (img, index, isActive) => {
            const videoUrl = liveVideos[index];
            const hasLive = !!videoUrl;
            return `
                <div class="carousel-slide${isActive ? ' active' : ''}${hasLive ? ' has-live' : ''}">
                    <a href="${img}" class="carousel-image-link" data-fancybox="timeline-gallery" data-src="${img}">
                        <img src="${img}" loading="lazy" alt="图片">
                        ${hasLive ? `
                            <div class="live-badge">
                                <svg class="live-icon" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-352a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" fill="currentColor"/></svg>
                                <span>LIVE</span>
                            </div>
                            <video class="live-video" src="${videoUrl}" loop muted playsinline preload="metadata"></video>
                        ` : ''}
                    </a>
                </div>
            `;
        };

        if (processedImages.length === 1) {
            return `<div class="timeline-carousel single-image">${generateSlide(processedImages[0], 0, true)}</div>`;
        }

        let slides = processedImages.map((img, idx) => generateSlide(img, idx, idx === 0)).join('');
        let indicators = processedImages.map((_, idx) => `<span class="indicator${idx === 0 ? ' active' : ''}" data-index="${idx}"></span>`).join('');

        return `
            <div class="timeline-carousel multi-images">
                ${slides}
                <button class="carousel-btn prev-btn" type="button">❮</button>
                <button class="carousel-btn next-btn" type="button">❯</button>
                <div class="carousel-indicators">${indicators}</div>
            </div>
        `;
    }

    // 解析内容
    function parseContent(item) {
        const content = item?.content || "";

        const liveRegex = /\[live\](https?:\/\/[^\s<]+)/g;
        let liveVideos = [];
        let match;
        while ((match = liveRegex.exec(content)) !== null) {
            liveVideos.push(match[1]);
        }

        let cleanText = content.replace(liveRegex, '').trim();
        let processedText = (cleanText || "")
            .replace(/- \[ \]/g, "⬜ ")
            .replace(/- \[x\]/gi, "✅ ")
            .replace(/\n/g, "<br>");

        let html = `<div class="timeline-text-content">${escapeHtmlWithBreaks(processedText)}</div>`;

        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const bilibiliRegex = /(?:https?:\/\/)?(?:www\.)?bilibili\.com\/video\/(BV[0-9A-Za-z]+)/;

        const ytMatch = cleanText.match(youtubeRegex);
        const bMatch = cleanText.match(bilibiliRegex);

        if (ytMatch) {
            html += `<div class="timeline-video-embed"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allowfullscreen></iframe></div>`;
        } else if (bMatch) {
            html += `<div class="timeline-video-embed"><iframe src="https://www.bilibili.com/blackboard/html5mobileplayer.html?bvid=${bMatch[1]}&as_wide=1&high_quality=1&danmaku=0" frameborder="0" allowfullscreen></iframe></div>`;
        }

        const images = (item?.echo_files || [])
            .map(f => f?.file || f)
            .filter(f => String(f?.category || "").toLowerCase() === "image")
            .map(f => f?.url)
            .filter(Boolean);

        if (images.length > 0) {
            html += renderCarousel(images, liveVideos);
        }

        const ext = getExtension(item);
        if (ext) {
            if (ext.type === "WEBSITE" || ext.type === "GITHUBPROJ") {
                html += renderExternalLink(ext.type, ext.payload);
            }
            if (ext.type === "VIDEO") {
                html += renderBiliVideo(ext.payload);
            }
            if (ext.type === "MUSIC" && ext.payload?.url) {
                html += `<div class="timeline-music"><audio controls style="width:100%"><source src="${ext.payload.url}" type="audio/mpeg">您的浏览器不支持音频播放</audio></div>`;
            }
        }

        return html;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function escapeHtmlWithBreaks(text) {
        if (!text) return '';
        return escapeHtml(text).replace(/\n/g, '<br>');
    }

    function initCarousels(container) {
        const carousels = container.querySelectorAll('.timeline-carousel.multi-images');

        carousels.forEach(carousel => {
            const slides = carousel.querySelectorAll('.carousel-slide');
            const prevBtn = carousel.querySelector('.prev-btn');
            const nextBtn = carousel.querySelector('.next-btn');
            const indicators = carousel.querySelectorAll('.indicator');
            let currentIndex = 0;

            const showSlide = (index) => {
                slides.forEach((slide, i) => {
                    slide.classList.toggle('active', i === index);
                });
                indicators.forEach((indicator, i) => {
                    indicator.classList.toggle('active', i === index);
                });
                currentIndex = index;
            };

            const nextSlide = () => showSlide((currentIndex + 1) % slides.length);
            const prevSlide = () => showSlide((currentIndex - 1 + slides.length) % slides.length);

            if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); prevSlide(); });
            if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); nextSlide(); });

            indicators.forEach((indicator, idx) => {
                indicator.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); showSlide(idx); });
            });
        });

        const liveSlides = container.querySelectorAll('.carousel-slide.has-live');
        liveSlides.forEach(slide => {
            const video = slide.querySelector('.live-video');
            const img = slide.querySelector('img');
            let hasVideoPlayed = false;

            slide.addEventListener('mouseenter', () => {
                if (!hasVideoPlayed && video) {
                    video.currentTime = 0;
                    video.play().catch(e => console.warn("LivePhoto播放被阻挡"));
                    if (video.style) video.style.opacity = "1";
                    if (img) img.style.opacity = "0";
                    hasVideoPlayed = true;
                }
            });

            slide.addEventListener('mouseleave', () => {
                if (video) {
                    video.pause();
                    video.currentTime = 0;
                    if (video.style) video.style.opacity = "0";
                }
                if (img) img.style.opacity = "1";
                hasVideoPlayed = false;
            });

            if (video) {
                video.addEventListener('ended', () => {
                    if (video.style) video.style.opacity = "0";
                    if (img) img.style.opacity = "1";
                });
            }
        });
    }

    // 创建时间线条目 - 使用原生时间线结构
    function createTimelineItem(item) {
        const contentHtml = parseContent(item);
        const dateNode = formatDateForNode(item.created_at);
        const timeStr = formatTime(item.created_at);
        const echoId = item.id;

        const timelineDiv = document.createElement('div');
        timelineDiv.className = 'timeline-item';
        timelineDiv.setAttribute('data-echo-id', echoId);

        // 使用原生时间线结构
        timelineDiv.innerHTML = `
            <div class="timeline-node"></div>
            <div class="timeline-date">${dateNode}</div>
            <div class="timeline-cursor"><div class="cursor-point"></div></div>
            <div class="timeline-box">
                <div class="timeline-card">
                    <div class="timeline-card-time">${timeStr}</div>
                    <div class="timeline-card-body">
                        ${contentHtml}
                    </div>
                    <div class="timeline-card-footer">
                        <a href="/mmtalk/?id=${echoId}" class="timeline-readmore">发布评论 →</a>
                    </div>
                </div>
            </div>
        `;

        // 卡片点击跳转（点击卡片任意位置跳转）
        const card = timelineDiv.querySelector('.timeline-card');
        card.addEventListener('click', (e) => {
            // 防止点击轮播图按钮、链接等时触发重复跳转
            const target = e.target;
            const isInteractive = target.closest('.carousel-btn') ||
                target.closest('.carousel-image-link') ||
                target.closest('.external-link') ||
                target.closest('a') ||
                target.closest('video') ||
                target.closest('audio') ||
                target.closest('iframe') ||
                target.closest('button');

            if (!isInteractive) {
                window.location.href = `/mmtalk/?id=${echoId}`;
            }
        });

        return timelineDiv;
    }

    async function renderTimeline(element, apiUrl, user, limit) {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            const cacheTime = Number(localStorage.getItem(CACHE_TIME_KEY));
            const now = Date.now();

            let items = [];

            if (cached && cacheTime && now - cacheTime < 1800000) {
                items = JSON.parse(cached);
            } else {
                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ page: 1, pageSize: 50 })
                });
                const result = await response.json();

                if (result.code === 1 && result.data?.items) {
                    items = result.data.items;
                    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
                    localStorage.setItem(CACHE_TIME_KEY, now.toString());
                } else {
                    throw new Error('数据加载失败');
                }
            }

            if (user && user !== '') {
                const users = user.split(',').map(u => u.trim());
                items = items.filter(item => users.includes(item.username));
            }

            if (limit && items.length > parseInt(limit)) {
                items = items.slice(0, parseInt(limit));
            }

            element.innerHTML = '';

            if (items.length === 0) {
                element.innerHTML = '<div class="timeline-empty">✨ 暂无动态</div>';
                return;
            }

            const fragment = document.createDocumentFragment();
            items.forEach(item => {
                fragment.appendChild(createTimelineItem(item));
            });
            element.appendChild(fragment);

            initCarousels(element);

            if (typeof Fancybox === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js';
                script.onload = () => {
                    if (typeof Fancybox !== 'undefined') {
                        Fancybox.bind('[data-fancybox="timeline-gallery"]', {});
                    }
                };
                document.head.appendChild(script);

                const css = document.createElement('link');
                css.rel = 'stylesheet';
                css.href = 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css';
                document.head.appendChild(css);
            } else {
                Fancybox.bind('[data-fancybox="timeline-gallery"]', {});
            }

        } catch (error) {
            console.error('Ech0 Timeline 加载错误:', error);
            element.innerHTML = `<div class="timeline-error">❌ 加载失败: ${error.message}</div>`;
        }
    }

    function initAllTimelines() {
        const timelines = document.querySelectorAll('.tag-plugin.timeline');

        timelines.forEach(element => {
            if (element.dataset.ech0Initialized) return;

            const api = element.dataset.api;
            if (!api) return;

            const isEch0 = element.dataset.ech0 === 'true' || api.includes('/api/echo');

            if (isEch0) {
                const user = element.getAttribute('user') || '';
                const limit = element.getAttribute('limit') || '';

                element.dataset.ech0Initialized = 'true';

                const loadingDiv = element.querySelector('.timeline-loading');
                if (loadingDiv) loadingDiv.remove();

                const container = document.createElement('div');
                container.className = 'timeline-ech0-container';
                element.appendChild(container);

                renderTimeline(container, api, user, limit);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllTimelines);
    } else {
        initAllTimelines();
    }

    document.addEventListener('pjax:complete', initAllTimelines);
})();