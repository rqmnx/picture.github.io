/**
 * 表情包生成器 - 下载功能模块
 * 负责图片下载、格式转换和质量控制
 */

// 下载配置
const DownloadConfig = {
    defaultFormat: 'png',
    defaultQuality: 0.9,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedFormats: ['png', 'jpg', 'jpeg'],
    filenamePrefix: '表情包_',
    timestampFormat: 'YYYYMMDD_HHmmss'
};

/**
 * 初始化下载功能
 */
function initDownload() {
    console.log('初始化下载功能...');
    
    // 绑定下载事件
    bindDownloadEvents();
    
    // 设置默认下载格式
    setDefaultDownloadFormat();
    
    console.log('下载功能初始化完成');
}

/**
 * 绑定下载事件
 */
function bindDownloadEvents() {
    // 下载按钮点击事件已在main.js中绑定
    // 这里可以添加其他下载相关的事件
}

/**
 * 设置默认下载格式
 */
function setDefaultDownloadFormat() {
    App.downloadFormat = DownloadConfig.defaultFormat;
    App.downloadQuality = DownloadConfig.defaultQuality;
}

/**
 * 处理下载
 */
function handleDownload() {
    if (!App.currentImage) {
        showErrorMessage('请先上传图片！');
        return;
    }
    
    try {
        // 显示下载进度
        showDownloadProgress();
        
        // 生成文件名
        const filename = generateFilename();
        
        // 获取Canvas数据
        getCanvasBlob(App.downloadFormat, App.downloadQuality).then(blob => {
            // 验证文件大小
            if (blob.size > DownloadConfig.maxFileSize) {
                showErrorMessage('文件过大，请降低质量或选择较小的图片！');
                hideDownloadProgress();
                return;
            }
            
            // 执行下载
            downloadBlob(blob, filename);
            
            // 隐藏下载进度
            hideDownloadProgress();
            
            // 显示成功消息
            showSuccessMessage('下载成功！');
            
        }).catch(error => {
            console.error('下载失败:', error);
            showErrorMessage('下载失败，请重试！');
            hideDownloadProgress();
        });
        
    } catch (error) {
        console.error('下载处理失败:', error);
        showErrorMessage('下载处理失败，请重试！');
        hideDownloadProgress();
    }
}

/**
 * 生成文件名
 */
function generateFilename() {
    const timestamp = formatTimestamp(new Date());
    const format = App.downloadFormat;
    return `${DownloadConfig.filenamePrefix}${timestamp}.${format}`;
}

/**
 * 格式化时间戳
 */
function formatTimestamp(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

/**
 * 下载Blob数据
 */
function downloadBlob(blob, filename) {
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // 设置下载属性
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // 添加到页面并触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * 显示下载进度
 */
function showDownloadProgress() {
    // 创建进度条元素
    let progressContainer = document.querySelector('.download-progress');
    
    if (!progressContainer) {
        progressContainer = document.createElement('div');
        progressContainer.className = 'download-progress';
        progressContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            min-width: 200px;
            text-align: center;
        `;
        
        progressContainer.innerHTML = `
            <div style="margin-bottom: 10px;">
                <i class="fas fa-download" style="color: #4f46e5; font-size: 24px;"></i>
            </div>
            <div style="margin-bottom: 10px; font-weight: 500;">正在生成下载文件...</div>
            <div class="progress-bar" style="
                width: 100%;
                height: 4px;
                background: #e5e7eb;
                border-radius: 2px;
                overflow: hidden;
            ">
                <div class="progress-fill" style="
                    height: 100%;
                    background: linear-gradient(90deg, #4f46e5, #06b6d4);
                    width: 0%;
                    transition: width 0.3s ease;
                "></div>
            </div>
        `;
        
        document.body.appendChild(progressContainer);
    }
    
    // 显示进度条
    progressContainer.style.display = 'block';
    
    // 模拟进度
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        
        const progressFill = progressContainer.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
    }, 100);
}

/**
 * 隐藏下载进度
 */
function hideDownloadProgress() {
    const progressContainer = document.querySelector('.download-progress');
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
}

/**
 * 批量下载
 */
function batchDownload(formats = ['png', 'jpg']) {
    if (!App.currentImage) {
        showErrorMessage('请先上传图片！');
        return;
    }
    
    const promises = formats.map(format => {
        return getCanvasBlob(format, App.downloadQuality).then(blob => {
            const filename = generateFilename().replace(/\.[^.]+$/, `.${format}`);
            return { blob, filename, format };
        });
    });
    
    Promise.all(promises).then(results => {
        results.forEach(({ blob, filename }) => {
            downloadBlob(blob, filename);
        });
        
        showSuccessMessage(`批量下载完成！共下载 ${results.length} 个文件`);
    }).catch(error => {
        console.error('批量下载失败:', error);
        showErrorMessage('批量下载失败，请重试！');
    });
}

/**
 * 分享到社交媒体
 */
function shareToSocial(platform) {
    if (!App.currentImage) {
        showErrorMessage('请先上传图片！');
        return;
    }
    
    getCanvasBlob(App.downloadFormat, App.downloadQuality).then(blob => {
        const url = URL.createObjectURL(blob);
        
        switch (platform) {
            case 'wechat':
                // 微信分享（需要微信JS-SDK）
                shareToWeChat(url);
                break;
                
            case 'weibo':
                // 微博分享
                shareToWeibo(url);
                break;
                
            case 'qq':
                // QQ分享
                shareToQQ(url);
                break;
                
            default:
                // 复制链接
                copyToClipboard(url);
                break;
        }
        
        // 清理URL
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
        
    }).catch(error => {
        console.error('分享失败:', error);
        showErrorMessage('分享失败，请重试！');
    });
}

/**
 * 分享到微信
 */
function shareToWeChat(url) {
    // 这里需要集成微信JS-SDK
    // 暂时显示提示信息
    showSuccessMessage('请手动保存图片后分享到微信');
}

/**
 * 分享到微博
 */
function shareToWeibo(url) {
    const text = encodeURIComponent('我用表情包生成器制作了一个表情包！');
    const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(window.location.href)}&title=${text}`;
    window.open(shareUrl, '_blank');
}

/**
 * 分享到QQ
 */
function shareToQQ(url) {
    const text = encodeURIComponent('我用表情包生成器制作了一个表情包！');
    const shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(window.location.href)}&title=${text}`;
    window.open(shareUrl, '_blank');
}

/**
 * 复制到剪贴板
 */
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showSuccessMessage('链接已复制到剪贴板！');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

/**
 * 备用复制方法
 */
function fallbackCopyToClipboard(text) {
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
        showSuccessMessage('链接已复制到剪贴板！');
    } catch (err) {
        showErrorMessage('复制失败，请手动复制链接');
    }
    
    document.body.removeChild(textArea);
}

/**
 * 导出为不同尺寸
 */
function exportMultipleSizes(sizes = []) {
    if (!App.currentImage) {
        showErrorMessage('请先上传图片！');
        return;
    }
    
    const defaultSizes = [
        { width: 200, height: 200, name: '小尺寸' },
        { width: 400, height: 400, name: '标准尺寸' },
        { width: 800, height: 800, name: '大尺寸' }
    ];
    
    const exportSizes = sizes.length > 0 ? sizes : defaultSizes;
    
    exportSizes.forEach(size => {
        // 创建临时Canvas
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = size.width;
        tempCanvas.height = size.height;
        
        // 绘制图片
        const img = new Image();
        img.onload = function() {
            // 计算绘制参数
            const { drawWidth, drawHeight, drawX, drawY } = calculateImagePositionForSize(img, size);
            
            // 绘制图片
            tempCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            
            // 绘制文字
            if (App.textSettings.text) {
                drawTextToCanvasWithSize(tempCtx, size);
            }
            
            // 下载
            tempCanvas.toBlob(blob => {
                const filename = `${DownloadConfig.filenamePrefix}${size.name}_${formatTimestamp(new Date())}.${App.downloadFormat}`;
                downloadBlob(blob, filename);
            }, `image/${App.downloadFormat}`, App.downloadQuality);
        };
        img.src = App.currentImage;
    });
    
    showSuccessMessage(`已导出 ${exportSizes.length} 个不同尺寸的文件`);
}

/**
 * 计算指定尺寸的图片位置
 */
function calculateImagePositionForSize(img, size) {
    const canvasAspect = size.width / size.height;
    const imgAspect = img.width / img.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imgAspect > canvasAspect) {
        drawWidth = size.width;
        drawHeight = size.width / imgAspect;
        drawX = 0;
        drawY = (size.height - drawHeight) / 2;
    } else {
        drawHeight = size.height;
        drawWidth = size.height * imgAspect;
        drawX = (size.width - drawWidth) / 2;
        drawY = 0;
    }
    
    return { drawWidth, drawHeight, drawX, drawY };
}

/**
 * 在指定尺寸的Canvas上绘制文字
 */
function drawTextToCanvasWithSize(ctx, size) {
    if (!App.textSettings.text) return;
    
    // 设置字体（根据尺寸调整）
    const scale = size.width / 400; // 基于默认400px宽度
    const fontSize = Math.round(App.textSettings.size * scale);
    ctx.font = `${fontSize}px ${App.textSettings.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 计算文字位置
    const x = size.width / 2;
    const y = size.height * 0.85;
    
    // 应用文字效果
    applyTextEffectsForSize(ctx, x, y, App.textSettings.text, scale);
}

/**
 * 为指定尺寸应用文字效果
 */
function applyTextEffectsForSize(ctx, x, y, text, scale) {
    const effects = App.textSettings.effects;
    
    // 描边效果
    if (effects.stroke) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = CanvasConfig.strokeWidth * scale;
        ctx.strokeText(text, x, y);
    }
    
    // 阴影效果
    if (effects.shadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = CanvasConfig.shadowBlur * scale;
        ctx.shadowOffsetX = CanvasConfig.shadowOffset * scale;
        ctx.shadowOffsetY = CanvasConfig.shadowOffset * scale;
    }
    
    // 渐变效果
    if (effects.gradient) {
        const fontSize = Math.round(App.textSettings.size * scale);
        const gradient = ctx.createLinearGradient(0, y - fontSize/2, 0, y + fontSize/2);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(0.5, '#4ecdc4');
        gradient.addColorStop(1, '#45b7d1');
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = App.textSettings.color;
    }
    
    // 绘制文字
    ctx.fillText(text, x, y);
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

/**
 * 获取文件大小信息
 */
function getFileSizeInfo(blob) {
    const bytes = blob.size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// 页面加载完成后初始化下载功能
document.addEventListener('DOMContentLoaded', initDownload);

// 导出函数供其他模块使用
window.DownloadConfig = DownloadConfig;
window.handleDownload = handleDownload;
window.batchDownload = batchDownload;
window.shareToSocial = shareToSocial;
window.exportMultipleSizes = exportMultipleSizes;
window.getFileSizeInfo = getFileSizeInfo; 