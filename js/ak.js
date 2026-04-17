/**
 * 评论区表情包放大弹出层 完整实现
 * 适配：Artalk/Valine/Waline/自定义评论系统
 */
class EmojiEnlarge {
  constructor(options = {}) {
    // 配置项（可自定义修改）
    this.config = {
      zoomRatio: 3, // 放大倍数
      maxSize: 220, // 最大宽高
      // 表情包选择器（适配你的评论系统，默认兼容Artalk）
      emojiSelector: 'img[atk-emoticon],.atk-grp img,.atk-comment-wrap img',
      ...options
    };

    // 创建全局弹出层
    this.popup = this.createPopup();
    // 初始化监听
    this.init();
  }

  // 1. 创建悬浮弹出层DOM
  createPopup() {
    const popup = document.createElement('div');
    popup.className = 'emoji-popup';
    popup.innerHTML = `
      <img class="emoji-img" src="" alt="">
      <div class="emoji-alt"></div>
    `;
    document.body.appendChild(popup);
    return popup;
  }

  // 2. 计算图片放大尺寸（核心算法，沿用并优化你的代码）
  calculateSize(img) {
    const { zoomRatio, maxSize } = this.config;
    const { clientWidth, clientHeight } = img;
    const { naturalWidth, naturalHeight } = img;

    // 基础放大尺寸
    let tempW = clientWidth * zoomRatio;
    let tempH = clientHeight * zoomRatio;

    // 等比约束：不超过最大尺寸
    const ratio = tempW / tempH;
    if (tempW > maxSize) {
      tempW = maxSize;
      tempH = tempW / ratio;
    }
    if (tempH > maxSize) {
      tempH = maxSize;
      tempW = tempH * ratio;
    }

    return { width: tempW, height: tempH };
  }

  // 3. 鼠标悬浮触发放大
  handleMouseOver(e) {
    // 仅鼠标触发，排除触屏/触控笔
    if (e.pointerType !== 'mouse') return;
    
    const target = e.target;
    // 判断是否为表情包图片
    if (!target.matches(this.config.emojiSelector)) return;

    const img = target;
    if (!img.src) return;

    // 计算尺寸
    const { width, height } = this.calculateSize(img);
    const popupImg = this.popup.querySelector('.emoji-img');
    const popupAlt = this.popup.querySelector('.emoji-alt');

    // 设置弹出层内容
    popupImg.src = img.src;
    popupImg.width = width;
    popupImg.height = height;
    popupAlt.textContent = img.getAttribute('atk-emoticon') || img.alt || '小窗预览';

    // 设置位置（鼠标右下角，避免超出屏幕）
    const gap = 10;
    let left = e.clientX + gap;
    let top = e.clientY + gap;

    // 右边界检测
    if (left + width > window.innerWidth) {
      left = e.clientX - width - gap;
    }
    // 下边界检测
    if (top + height + 30 > window.innerHeight) {
      top = e.clientY - height - 30;
    }

    this.popup.style.left = `${left}px`;
    this.popup.style.top = `${top}px`;
    this.popup.style.display = 'block';
  }

  // 4. 鼠标离开隐藏弹出层
  handleMouseOut() {
    this.popup.style.display = 'none';
  }

  // 5. 绑定事件到元素
  bindEvents(element) {
    element.addEventListener('pointerover', this.handleMouseOver.bind(this));
    element.addEventListener('pointerout', this.handleMouseOut.bind(this));
    element.addEventListener('pointermove', this.handleMouseOver.bind(this)); // 跟随鼠标
  }

  // 6. 监听动态新增评论（MutationObserver）
  observeComments() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            // 给新增节点绑定事件
            this.bindEvents(node);
            // 递归处理子元素
            if (node.querySelectorAll) {
              node.querySelectorAll('*').forEach(el => this.bindEvents(el));
            }
          }
        });
      });
    });

    // 监听整个body（适配所有评论区容器）
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 初始化
  init() {
    // 给现有元素绑定事件
    document.querySelectorAll('*').forEach(el => this.bindEvents(el));
    // 监听动态新增元素
    this.observeComments();
  }
}

// ========== 初始化使用 ==========
// 默认配置（适配Artalk）
window.emojiEnlarge = new EmojiEnlarge();

// 自定义配置示例（适配其他评论系统）
// window.emojiEnlarge = new EmojiEnlarge({
//   zoomRatio: 2.5,
//   maxSize: 250,
//   emojiSelector: 'img.emoji,.comment-content img'
// });