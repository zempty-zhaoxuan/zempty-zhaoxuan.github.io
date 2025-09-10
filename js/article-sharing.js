// Article Sharing - 文章底部分享功能
// 简化版分享功能，只在文章底部显示

class ArticleSharing {
  constructor() {
    this.currentUrl = window.location.href;
    this.currentTitle = document.title;
    this.currentDescription = this.getMetaDescription();
    
    this.init();
  }

  init() {
    try {
      this.createArticleShareButtons();
      this.bindEvents();
      
      console.log('Article sharing initialized');
    } catch (error) {
      console.error('Failed to initialize article sharing:', error);
    }
  }

  createArticleShareButtons() {
    // 防止重复创建
    if (document.querySelector('.article-share-container')) {
      return;
    }

    // 只在文章页面显示分享按钮
    const postContent = document.querySelector('.post .entry, .post-content, article');
    if (!postContent) return;

    const shareContainer = document.createElement('div');
    shareContainer.className = 'article-share-container';
    shareContainer.innerHTML = `
      <div class="share-header">
        <div class="share-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
          </svg>
          <span>分享这篇文章</span>
        </div>
      </div>
      <div class="share-buttons">
        ${this.generateShareButtonsHTML()}
        <button class="copy-link-btn" data-action="copy-link" title="复制文章链接">
          <span class="icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          </span>
          <span class="text">复制链接</span>
        </button>
      </div>
    `;

    // 将分享容器插入到固定位置
    this.insertShareContainer(shareContainer);
  }

  insertShareContainer(shareContainer) {
    // 查找文章内容区域
    const postContent = document.querySelector('.post .entry, .post-content, article');
    const postContainer = postContent ? postContent.closest('.post') : null;
    
    if (postContainer) {
      // 插入到文章容器的最后，保持固定位置
      postContainer.appendChild(shareContainer);
      console.log('Share container inserted at end of post container');
    } else if (postContent) {
      // 回退方案：插入到文章内容后面
      postContent.parentNode.insertBefore(shareContainer, postContent.nextSibling);
      console.log('Share container inserted after post content');
    } else {
      console.warn('Could not find suitable location for share container');
    }
  }

  generateShareButtonsHTML() {
    const platforms = [
      {
        name: 'wechat',
        label: '微信',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 4.882-1.900 7.6.5.5-3.187-2.75-6.874-8.343-6.874zm-3.375 7.25c-.518 0-.937-.42-.937-.937s.42-.938.937-.938.938.42.938.938-.42.937-.938.937zm6.625 0c-.518 0-.937-.42-.937-.937s.42-.938.937-.938.938.42.938.938-.42.937-.938.937z"/>
        </svg>`,
        action: 'showQRCode'
      },
      {
        name: 'weibo',
        label: '微博',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.31 8.17c-2.73-.13-4.3.53-4.3 2.26 0 .93.55 2.3 3.86 2.3 2.39 0 4.45-.93 4.45-2.16 0-1.06-1.65-2.27-4.01-2.4zm-.52 3.28c-.73 0-1.32-.32-1.32-.72s.59-.72 1.32-.72 1.32.32 1.32.72-.59.72-1.32.72zm2.19-.72c0-.27-.22-.49-.49-.49s-.49.22-.49.49.22.49.49.49.49-.22.49-.49z"/>
          <path d="M20.99 12c0 5.52-4.48 10-10 10s-10-4.48-10-10 4.48-10 10-10 10 4.48 10 10zm-2.5-1.5c0-2.5-3.5-4.5-7.5-4.5s-7.5 2-7.5 4.5 3.5 4.5 7.5 4.5 7.5-2 7.5-4.5z"/>
        </svg>`,
        url: `https://service.weibo.com/share/share.php?url=${encodeURIComponent(this.currentUrl)}&title=${encodeURIComponent(this.currentTitle)}`
      },
      {
        name: 'twitter',
        label: 'Twitter',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>`,
        url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(this.currentUrl)}&text=${encodeURIComponent(this.currentTitle)}`
      },
      {
        name: 'facebook',
        label: 'Facebook',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>`,
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.currentUrl)}`
      }
    ];

    return platforms.map(platform => `
      <button class="share-btn" 
              data-platform="${platform.name}" 
              data-url="${platform.url || ''}"
              data-action="${platform.action || 'share'}"
              title="分享到${platform.label}">
        <span class="icon">${platform.icon}</span>
        <span class="text">${platform.label}</span>
      </button>
    `).join('');
  }

  bindEvents() {
    // 分享按钮事件
    document.addEventListener('click', (e) => {
      const shareBtn = e.target.closest('.share-btn');
      if (shareBtn) {
        e.preventDefault();
        this.handleShareClick(shareBtn);
      }

      const copyBtn = e.target.closest('.copy-link-btn');
      if (copyBtn) {
        e.preventDefault();
        this.copyCurrentUrl();
      }
    });
  }

  handleShareClick(shareBtn) {
    const platform = shareBtn.getAttribute('data-platform');
    const action = shareBtn.getAttribute('data-action');
    const url = shareBtn.getAttribute('data-url');

    if (action === 'showQRCode') {
      this.showWeChatQR();
    } else if (action === 'share' && url) {
      this.openShareWindow(url, platform);
    }
  }

  openShareWindow(url, platform) {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      url,
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  }

  showWeChatQR() {
    // 创建二维码弹窗
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&margin=10&data=${encodeURIComponent(this.currentUrl)}`;
    
    // 弹窗HTML内容
    const popupContent = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>微信扫码分享</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
          }
          
          .qr-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            padding: 40px;
            text-align: center;
            max-width: 400px;
            width: 100%;
          }
          
          .header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 30px;
          }
          
          .wechat-icon {
            width: 32px;
            height: 32px;
            fill: #07c160;
          }
          
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #333;
          }
          
          .qr-wrapper {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            border: 1px solid #e9ecef;
          }
          
          .qr-code {
            width: 300px;
            height: 300px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .loading {
            width: 300px;
            height: 300px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }
          
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #07c160;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .instructions {
            color: #666;
            line-height: 1.6;
          }
          
          .main-text {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
          }
          
          .sub-text {
            font-size: 14px;
            color: #888;
          }
          
          .actions {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e9ecef;
          }
          
          .copy-btn {
            background: #07c160;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .copy-btn:hover {
            background: #06ad56;
            transform: translateY(-1px);
          }
          
          @media (max-width: 480px) {
            .qr-container {
              padding: 24px;
            }
            
            .qr-code, .loading {
              width: 240px;
              height: 240px;
            }
            
            .title {
              font-size: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">
            <svg class="wechat-icon" viewBox="0 0 24 24">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 4.882-1.900 7.6.5.5-3.187-2.75-6.874-8.343-6.874zm-3.375 7.25c-.518 0-.937-.42-.937-.937s.42-.938.937-.938.938.42.938.938-.42.937-.938.937zm6.625 0c-.518 0-.937-.42-.937-.937s.42-.938.937-.938.938.42.938.938-.42.937-.938.937z"/>
            </svg>
            <h1 class="title">微信扫码分享</h1>
          </div>
          
          <div class="qr-wrapper">
            <div class="loading" id="qr-loading">
              <div class="spinner"></div>
              <p>生成二维码中...</p>
            </div>
          </div>
          
          <div class="instructions">
            <p class="main-text">使用微信扫描二维码</p>
            <p class="sub-text">分享到朋友圈或发送给好友</p>
          </div>
          
          <div class="actions">
            <button class="copy-btn" onclick="copyUrl()">复制链接</button>
          </div>
        </div>
        
        <script>
          // 加载二维码
          function loadQRCode() {
            const img = new Image();
            img.onload = function() {
              const loading = document.getElementById('qr-loading');
              loading.innerHTML = '';
              img.className = 'qr-code';
              loading.appendChild(img);
            };
            img.onerror = function() {
              const loading = document.getElementById('qr-loading');
              loading.innerHTML = '<p style="color: #dc3545;">二维码生成失败</p><button onclick="loadQRCode()" style="margin-top: 12px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">重试</button>';
            };
            img.src = '${qrUrl}';
          }
          
          // 复制链接
          function copyUrl() {
            const url = '${this.currentUrl}';
            if (navigator.clipboard) {
              navigator.clipboard.writeText(url).then(() => {
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.textContent;
                btn.textContent = '已复制';
                btn.style.background = '#28a745';
                setTimeout(() => {
                  btn.textContent = originalText;
                  btn.style.background = '#07c160';
                }, 2000);
              });
            } else {
              // 回退方案
              const textArea = document.createElement('textarea');
              textArea.value = url;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              
              const btn = document.querySelector('.copy-btn');
              const originalText = btn.textContent;
              btn.textContent = '已复制';
              btn.style.background = '#28a745';
              setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '#07c160';
              }, 2000);
            }
          }
          
          // 页面加载完成后加载二维码
          window.onload = loadQRCode;
        </script>
      </body>
      </html>
    `;

    // 计算弹窗位置（屏幕中央）
    const width = 450;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    // 打开弹窗
    const popup = window.open(
      '',
      'wechat-qr-share',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=no,resizable=yes,status=no,toolbar=no,menubar=no,location=no`
    );

    if (popup) {
      popup.document.write(popupContent);
      popup.document.close();
      popup.focus();
    } else {
      // 如果弹窗被阻止，显示提示
      this.showToast('请允许弹窗以显示二维码', 'warning');
    }
  }

  generateQRCode(containerId, text) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&format=png&margin=10&data=${encodeURIComponent(text)}`;
    
    const img = document.createElement('img');
    img.alt = '微信分享二维码';
    img.style.width = '240px';
    img.style.height = '240px';
    img.style.borderRadius = '8px';
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    
    // 加载成功处理
    img.onload = () => {
      // 移除加载状态
      const loading = container.querySelector('.loading-state');
      if (loading) {
        loading.remove();
      }
      
      // 显示二维码
      img.style.opacity = '1';
      container.appendChild(img);
    };
    
    // 加载失败处理
    img.onerror = () => {
      const loading = container.querySelector('.loading-state');
      if (loading) {
        loading.innerHTML = `
          <div class="error-state">
            <p style="color: #dc3545; margin: 0; font-size: 14px;">二维码生成失败</p>
            <button onclick="location.reload()" style="margin-top: 12px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              重新加载
            </button>
          </div>
        `;
      }
    };
    
    img.src = qrUrl;
  }

  async copyCurrentUrl() {
    try {
      await navigator.clipboard.writeText(this.currentUrl);
      this.showToast('链接已复制到剪贴板', 'success');
    } catch (error) {
      // 回退方案
      this.fallbackCopyText(this.currentUrl);
    }
  }

  fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showToast('已复制到剪贴板', 'success');
    } catch (error) {
      this.showToast('复制失败，请手动复制', 'error');
    }
    
    document.body.removeChild(textArea);
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // 样式设置
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '10000',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease'
    });

    // 根据类型设置背景色
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#17a2b8'
    };
    toast.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(toast);

    // 动画显示
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);

    // 延时移除
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  getMetaDescription() {
    const metaDesc = document.querySelector('meta[name="description"]');
    return metaDesc ? metaDesc.getAttribute('content') : '';
  }
}

// 初始化文章分享功能
document.addEventListener('DOMContentLoaded', () => {
  new ArticleSharing();
});