/**
 * 表情包生成器 - 主要JavaScript文件
 * 负责全局变量管理、页面初始化和事件协调
 */

// 全局变量定义
const App = {
    // 当前状态
    currentImage: null,           // 当前上传的图片对象
    canvas: null,                 // Canvas元素
    ctx: null,                    // Canvas上下文
    textSettings: {               // 文字设置
        text: '',                 // 文字内容
        font: 'Arial, sans-serif', // 字体
        size: 40,                 // 字体大小
        color: '#ffffff',         // 文字颜色
        effects: {                // 文字效果
            stroke: false,        // 描边效果
            shadow: false,        // 阴影效果
            gradient: false       // 渐变效果
        }
    },
    downloadFormat: 'png',        // 下载格式
    downloadQuality: 0.9,        // 下载质量
    
    // DOM元素引用
    elements: {
        uploadArea: null,
        uploadPreview: null,
        previewImage: null,
        removeImage: null,
        textSection: null,
        previewSection: null,
        downloadSection: null,
        textInput: null,
        fontSelect: null,
        fontSize: null,
        fontSizeValue: null,
        textColor: null,
        effectButtons: null,
        previewCanvas: null,
        resetText: null,
        clearCanvas: null,
        formatButtons: null,
        qualitySlider: null,
        qualityValue: null,
        downloadBtn: null
    }
};

/**
 * 页面初始化函数
 */
function initApp() {
    console.log('表情包生成器初始化开始...');
    
    // 获取DOM元素引用
    getDOMElements();
    
    // 初始化Canvas
    initCanvas();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 添加页面加载动画
    addPageAnimations();
    
    console.log('表情包生成器初始化完成');
}

/**
 * 获取DOM元素引用
 */
function getDOMElements() {
    App.elements = {
        uploadArea: document.getElementById('uploadArea'),
        uploadPreview: document.getElementById('uploadPreview'),
        previewImage: document.getElementById('previewImage'),
        removeImage: document.getElementById('removeImage'),
        textSection: document.getElementById('textSection'),
        previewSection: document.getElementById('previewSection'),
        downloadSection: document.getElementById('downloadSection'),
        textInput: document.getElementById('textInput'),
        fontSelect: document.getElementById('fontSelect'),
        fontSize: document.getElementById('fontSize'),
        fontSizeValue: document.querySelector('.font-size-value'),
        textColor: document.getElementById('textColor'),
        effectButtons: document.querySelectorAll('.effect-btn'),
        previewCanvas: document.getElementById('previewCanvas'),
        resetText: document.getElementById('resetText'),
        clearCanvas: document.getElementById('clearCanvas'),
        formatButtons: document.querySelectorAll('.format-btn'),
        qualitySlider: document.getElementById('qualitySlider'),
        qualityValue: document.querySelector('.quality-value'),
        downloadBtn: document.getElementById('downloadBtn')
    };
}

/**
 * 初始化Canvas
 */
function initCanvas() {
    App.canvas = App.elements.previewCanvas;
    App.ctx = App.canvas.getContext('2d');
    
    // 设置Canvas默认尺寸
    App.canvas.width = 400;
    App.canvas.height = 400;
    
    // 设置Canvas样式
    App.canvas.style.width = '400px';
    App.canvas.style.height = '400px';
    
    // 清空Canvas
    clearCanvas();
}

/**
 * 绑定事件监听器
 */
function bindEventListeners() {
    // 文字输入事件
    App.elements.textInput.addEventListener('input', handleTextChange);
    
    // 字体选择事件
    App.elements.fontSelect.addEventListener('change', handleFontChange);
    
    // 字体大小滑块事件
    App.elements.fontSize.addEventListener('input', handleFontSizeChange);
    
    // 文字颜色事件
    App.elements.textColor.addEventListener('change', handleColorChange);
    
    // 效果按钮事件
    App.elements.effectButtons.forEach(btn => {
        btn.addEventListener('click', handleEffectToggle);
    });
    
    // 预览控制按钮事件
    App.elements.resetText.addEventListener('click', resetText);
    App.elements.clearCanvas.addEventListener('click', clearCanvas);
    
    // 格式选择按钮事件
    App.elements.formatButtons.forEach(btn => {
        btn.addEventListener('click', handleFormatChange);
    });
    
    // 质量滑块事件
    App.elements.qualitySlider.addEventListener('input', handleQualityChange);
    
    // 下载按钮事件
    App.elements.downloadBtn.addEventListener('click', handleDownload);
    
    // 移除图片按钮事件
    App.elements.removeImage.addEventListener('click', removeImage);
}

/**
 * 添加页面加载动画
 */
function addPageAnimations() {
    const sections = document.querySelectorAll('.upload-section, .text-section, .preview-section, .download-section');
    
    // 使用Intersection Observer添加滚动动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

/**
 * 显示功能区域
 */
function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        section.classList.add('fade-in');
    }
}

/**
 * 隐藏功能区域
 */
function hideSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'none';
        section.classList.remove('fade-in');
    }
}

/**
 * 处理文字变化
 */
function handleTextChange(event) {
    App.textSettings.text = event.target.value;
    updatePreview();
}

/**
 * 处理字体变化
 */
function handleFontChange(event) {
    App.textSettings.font = event.target.value;
    updatePreview();
}

/**
 * 处理字体大小变化
 */
function handleFontSizeChange(event) {
    const size = parseInt(event.target.value);
    App.textSettings.size = size;
    App.elements.fontSizeValue.textContent = size + 'px';
    updatePreview();
}

/**
 * 处理颜色变化
 */
function handleColorChange(event) {
    App.textSettings.color = event.target.value;
    updatePreview();
}

/**
 * 处理效果切换
 */
function handleEffectToggle(event) {
    const effect = event.target.dataset.effect;
    const isActive = event.target.classList.contains('active');
    
    if (isActive) {
        event.target.classList.remove('active');
        App.textSettings.effects[effect] = false;
    } else {
        event.target.classList.add('active');
        App.textSettings.effects[effect] = true;
    }
    
    updatePreview();
}

/**
 * 处理格式变化
 */
function handleFormatChange(event) {
    // 移除所有按钮的active类
    App.elements.formatButtons.forEach(btn => btn.classList.remove('active'));
    
    // 添加当前按钮的active类
    event.target.classList.add('active');
    
    // 更新下载格式
    App.downloadFormat = event.target.dataset.format;
}

/**
 * 处理质量变化
 */
function handleQualityChange(event) {
    const quality = parseFloat(event.target.value);
    App.downloadQuality = quality;
    App.elements.qualityValue.textContent = Math.round(quality * 100) + '%';
}

/**
 * 重置文字
 */
function resetText() {
    App.textSettings.text = '';
    App.textSettings.font = 'Arial, sans-serif';
    App.textSettings.size = 40;
    App.textSettings.color = '#ffffff';
    App.textSettings.effects = {
        stroke: false,
        shadow: false,
        gradient: false
    };
    
    // 重置UI
    App.elements.textInput.value = '';
    App.elements.fontSelect.value = 'Arial, sans-serif';
    App.elements.fontSize.value = 40;
    App.elements.fontSizeValue.textContent = '40px';
    App.elements.textColor.value = '#ffffff';
    
    // 重置效果按钮
    App.elements.effectButtons.forEach(btn => btn.classList.remove('active'));
    
    updatePreview();
}

/**
 * 清空Canvas
 */
function clearCanvas() {
    if (App.ctx) {
        App.ctx.clearRect(0, 0, App.canvas.width, App.canvas.height);
        App.ctx.fillStyle = '#f3f4f6';
        App.ctx.fillRect(0, 0, App.canvas.width, App.canvas.height);
    }
}

/**
 * 移除图片
 */
function removeImage() {
    App.currentImage = null;
    App.elements.uploadPreview.style.display = 'none';
    App.elements.uploadArea.style.display = 'flex';
    
    hideSection('textSection');
    hideSection('previewSection');
    hideSection('downloadSection');
    
    clearCanvas();
}

/**
 * 更新预览
 */
function updatePreview() {
    if (!App.currentImage) return;
    
    // 清空Canvas
    clearCanvas();
    
    // 绘制图片
    drawImage();
    
    // 绘制文字
    if (App.textSettings.text) {
        drawText();
    }
}

/**
 * 绘制图片到Canvas
 */
function drawImage() {
    if (!App.currentImage || !App.ctx) return;
    
    const img = new Image();
    img.onload = function() {
        // 计算图片在Canvas中的位置和尺寸
        const canvasAspect = App.canvas.width / App.canvas.height;
        const imgAspect = img.width / img.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > canvasAspect) {
            // 图片更宽，以宽度为准
            drawWidth = App.canvas.width;
            drawHeight = App.canvas.width / imgAspect;
            drawX = 0;
            drawY = (App.canvas.height - drawHeight) / 2;
        } else {
            // 图片更高，以高度为准
            drawHeight = App.canvas.height;
            drawWidth = App.canvas.height * imgAspect;
            drawX = (App.canvas.width - drawWidth) / 2;
            drawY = 0;
        }
        
        // 绘制图片
        App.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        
        // 如果有文字，绘制文字
        if (App.textSettings.text) {
            drawText();
        }
    };
    img.src = App.currentImage;
}

/**
 * 绘制文字到Canvas
 */
function drawText() {
    if (!App.ctx || !App.textSettings.text) return;
    
    const ctx = App.ctx;
    const text = App.textSettings.text;
    
    // 设置字体
    ctx.font = `${App.textSettings.size}px ${App.textSettings.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 计算文字位置（居中）
    const x = App.canvas.width / 2;
    const y = App.canvas.height * 0.8; // 文字位置在底部
    
    // 应用文字效果
    if (App.textSettings.effects.stroke) {
        // 描边效果
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(text, x, y);
    }
    
    if (App.textSettings.effects.shadow) {
        // 阴影效果
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    }
    
    if (App.textSettings.effects.gradient) {
        // 渐变效果
        const gradient = ctx.createLinearGradient(0, y - App.textSettings.size/2, 0, y + App.textSettings.size/2);
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
 * 处理下载
 */
function handleDownload() {
    if (!App.currentImage) {
        alert('请先上传图片！');
        return;
    }
    
    try {
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `表情包_${Date.now()}.${App.downloadFormat}`;
        
        // 根据格式设置MIME类型
        const mimeType = App.downloadFormat === 'png' ? 'image/png' : 'image/jpeg';
        
        // 获取Canvas数据
        App.canvas.toBlob((blob) => {
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
        }, mimeType, App.downloadQuality);
        
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请重试！');
    }
}

/**
 * 显示成功消息
 */
function showSuccessMessage(message) {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = 'success-message';
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(messageEl);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

/**
 * 显示错误消息
 */
function showErrorMessage(message) {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = 'error-message';
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(messageEl);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);

// 导出全局函数供其他模块使用
window.App = App;
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage; 