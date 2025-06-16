/**
 * 表情包生成器 - Canvas操作模块
 * 负责图像绘制、文字渲染和特效处理
 */

// Canvas配置
const CanvasConfig = {
    defaultWidth: 400,
    defaultHeight: 400,
    maxWidth: 1200,
    maxHeight: 1200,
    textPadding: 20,
    strokeWidth: 3,
    shadowBlur: 10,
    shadowOffset: 2
};

/**
 * 初始化Canvas
 */
function initCanvasModule() {
    console.log('初始化Canvas模块...');
    
    // 设置Canvas尺寸
    setupCanvasSize();
    
    // 绑定Canvas事件
    bindCanvasEvents();
    
    console.log('Canvas模块初始化完成');
}

/**
 * 设置Canvas尺寸
 */
function setupCanvasSize() {
    if (!App.canvas) return;
    
    // 获取容器尺寸
    const container = App.canvas.parentElement;
    const containerWidth = container.clientWidth;
    
    // 计算Canvas尺寸
    let canvasWidth = Math.min(CanvasConfig.defaultWidth, containerWidth - 40);
    let canvasHeight = canvasWidth; // 保持正方形
    
    // 设置Canvas尺寸
    App.canvas.width = canvasWidth;
    App.canvas.height = canvasHeight;
    App.canvas.style.width = canvasWidth + 'px';
    App.canvas.style.height = canvasHeight + 'px';
    
    // 清空Canvas
    clearCanvas();
}

/**
 * 绑定Canvas事件
 */
function bindCanvasEvents() {
    if (!App.canvas) return;
    
    // 窗口大小改变时重新设置Canvas尺寸
    window.addEventListener('resize', debounce(() => {
        setupCanvasSize();
        if (App.currentImage) {
            updatePreview();
        }
    }, 250));
    
    // Canvas点击事件（用于文字位置调整）
    App.canvas.addEventListener('click', handleCanvasClick);
    
    // Canvas拖拽事件（用于文字拖拽）
    App.canvas.addEventListener('mousedown', handleCanvasMouseDown);
    App.canvas.addEventListener('mousemove', handleCanvasMouseMove);
    App.canvas.addEventListener('mouseup', handleCanvasMouseUp);
    
    // 触摸事件支持
    App.canvas.addEventListener('touchstart', handleCanvasTouchStart);
    App.canvas.addEventListener('touchmove', handleCanvasTouchMove);
    App.canvas.addEventListener('touchend', handleCanvasTouchEnd);
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 清空Canvas
 */
function clearCanvas() {
    if (!App.ctx) return;
    
    // 清空画布
    App.ctx.clearRect(0, 0, App.canvas.width, App.canvas.height);
    
    // 填充背景色
    App.ctx.fillStyle = '#f3f4f6';
    App.ctx.fillRect(0, 0, App.canvas.width, App.canvas.height);
}

/**
 * 绘制图片到Canvas
 */
function drawImageToCanvas() {
    if (!App.currentImage || !App.ctx) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = function() {
            try {
                // 计算图片在Canvas中的位置和尺寸
                const { drawWidth, drawHeight, drawX, drawY } = calculateImagePosition(img);
                
                // 绘制图片
                App.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                
                resolve();
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = reject;
        img.src = App.currentImage;
    });
}

/**
 * 计算图片位置和尺寸
 */
function calculateImagePosition(img) {
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
    
    return { drawWidth, drawHeight, drawX, drawY };
}

/**
 * 绘制文字到Canvas
 */
function drawTextToCanvas() {
    if (!App.ctx || !App.textSettings.text) return;
    
    const ctx = App.ctx;
    const text = App.textSettings.text;
    
    // 设置字体
    ctx.font = `${App.textSettings.size}px ${App.textSettings.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 计算文字位置
    const { x, y } = calculateTextPosition();
    
    // 应用文字效果
    applyTextEffects(ctx, x, y, text);
}

/**
 * 计算文字位置
 */
function calculateTextPosition() {
    // 默认文字位置在底部
    const x = App.canvas.width / 2;
    const y = App.canvas.height * 0.85;
    
    return { x, y };
}

/**
 * 应用文字效果
 */
function applyTextEffects(ctx, x, y, text) {
    const effects = App.textSettings.effects;
    
    // 描边效果
    if (effects.stroke) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = CanvasConfig.strokeWidth;
        ctx.strokeText(text, x, y);
    }
    
    // 阴影效果
    if (effects.shadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = CanvasConfig.shadowBlur;
        ctx.shadowOffsetX = CanvasConfig.shadowOffset;
        ctx.shadowOffsetY = CanvasConfig.shadowOffset;
    }
    
    // 渐变效果
    if (effects.gradient) {
        const gradient = createTextGradient(ctx, x, y);
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
 * 创建文字渐变
 */
function createTextGradient(ctx, x, y) {
    const size = App.textSettings.size;
    const gradient = ctx.createLinearGradient(0, y - size/2, 0, y + size/2);
    
    // 彩虹渐变
    gradient.addColorStop(0, '#ff6b6b');    // 红色
    gradient.addColorStop(0.2, '#ffa726');  // 橙色
    gradient.addColorStop(0.4, '#ffeb3b');  // 黄色
    gradient.addColorStop(0.6, '#4caf50');  // 绿色
    gradient.addColorStop(0.8, '#2196f3');  // 蓝色
    gradient.addColorStop(1, '#9c27b0');    // 紫色
    
    return gradient;
}

/**
 * 更新预览
 */
function updateCanvasPreview() {
    if (!App.currentImage) return;
    
    // 清空Canvas
    clearCanvas();
    
    // 绘制图片
    drawImageToCanvas().then(() => {
        // 绘制文字
        if (App.textSettings.text) {
            drawTextToCanvas();
        }
    }).catch(error => {
        console.error('预览更新失败:', error);
        showErrorMessage('预览更新失败，请重试！');
    });
}

/**
 * 处理Canvas点击事件
 */
function handleCanvasClick(event) {
    const rect = App.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 检查是否点击了文字区域
    if (App.textSettings.text) {
        const textX = App.canvas.width / 2;
        const textY = App.canvas.height * 0.85;
        const textWidth = App.ctx.measureText(App.textSettings.text).width;
        const textHeight = App.textSettings.size;
        
        if (x >= textX - textWidth/2 && x <= textX + textWidth/2 &&
            y >= textY - textHeight/2 && y <= textY + textHeight/2) {
            // 点击了文字，可以在这里添加文字编辑功能
            console.log('点击了文字区域');
        }
    }
}

/**
 * 处理Canvas鼠标按下事件
 */
function handleCanvasMouseDown(event) {
    // 可以在这里添加拖拽功能
    console.log('Canvas鼠标按下');
}

/**
 * 处理Canvas鼠标移动事件
 */
function handleCanvasMouseMove(event) {
    // 可以在这里添加拖拽功能
}

/**
 * 处理Canvas鼠标抬起事件
 */
function handleCanvasMouseUp(event) {
    // 可以在这里添加拖拽功能
}

/**
 * 处理Canvas触摸开始事件
 */
function handleCanvasTouchStart(event) {
    event.preventDefault();
    // 可以在这里添加触摸拖拽功能
}

/**
 * 处理Canvas触摸移动事件
 */
function handleCanvasTouchMove(event) {
    event.preventDefault();
    // 可以在这里添加触摸拖拽功能
}

/**
 * 处理Canvas触摸结束事件
 */
function handleCanvasTouchEnd(event) {
    event.preventDefault();
    // 可以在这里添加触摸拖拽功能
}

/**
 * 添加滤镜效果
 */
function applyFilter(filterType) {
    if (!App.ctx || !App.currentImage) return;
    
    const ctx = App.ctx;
    const imageData = ctx.getImageData(0, 0, App.canvas.width, App.canvas.height);
    const data = imageData.data;
    
    switch (filterType) {
        case 'grayscale':
            // 灰度滤镜
            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;
            }
            break;
            
        case 'sepia':
            // 复古滤镜
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
            }
            break;
            
        case 'invert':
            // 反色滤镜
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
            break;
            
        case 'brightness':
            // 亮度滤镜
            const brightness = 1.2;
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * brightness);
                data[i + 1] = Math.min(255, data[i + 1] * brightness);
                data[i + 2] = Math.min(255, data[i + 2] * brightness);
            }
            break;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // 重新绘制文字
    if (App.textSettings.text) {
        drawTextToCanvas();
    }
}

/**
 * 添加边框效果
 */
function addBorder(borderWidth = 10, borderColor = '#ffffff') {
    if (!App.ctx) return;
    
    const ctx = App.ctx;
    
    // 保存当前状态
    ctx.save();
    
    // 绘制边框
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth/2, borderWidth/2, App.canvas.width - borderWidth, App.canvas.height - borderWidth);
    
    // 恢复状态
    ctx.restore();
}

/**
 * 添加圆角效果
 */
function addRoundedCorners(radius = 20) {
    if (!App.ctx) return;
    
    const ctx = App.ctx;
    
    // 保存当前状态
    ctx.save();
    
    // 创建圆角路径
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(App.canvas.width - radius, 0);
    ctx.quadraticCurveTo(App.canvas.width, 0, App.canvas.width, radius);
    ctx.lineTo(App.canvas.width, App.canvas.height - radius);
    ctx.quadraticCurveTo(App.canvas.width, App.canvas.height, App.canvas.width - radius, App.canvas.height);
    ctx.lineTo(radius, App.canvas.height);
    ctx.quadraticCurveTo(0, App.canvas.height, 0, App.canvas.height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    
    // 应用裁剪
    ctx.clip();
    
    // 重新绘制内容
    updateCanvasPreview();
    
    // 恢复状态
    ctx.restore();
}

/**
 * 获取Canvas数据URL
 */
function getCanvasDataURL(format = 'png', quality = 0.9) {
    if (!App.canvas) return null;
    
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    return App.canvas.toDataURL(mimeType, quality);
}

/**
 * 获取Canvas Blob
 */
function getCanvasBlob(format = 'png', quality = 0.9) {
    return new Promise((resolve, reject) => {
        if (!App.canvas) {
            reject(new Error('Canvas未初始化'));
            return;
        }
        
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        App.canvas.toBlob(resolve, mimeType, quality);
    });
}

/**
 * 调整Canvas尺寸
 */
function resizeCanvas(width, height) {
    if (!App.canvas) return;
    
    // 创建临时Canvas保存当前内容
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = App.canvas.width;
    tempCanvas.height = App.canvas.height;
    tempCtx.drawImage(App.canvas, 0, 0);
    
    // 调整Canvas尺寸
    App.canvas.width = width;
    App.canvas.height = height;
    App.canvas.style.width = width + 'px';
    App.canvas.style.height = height + 'px';
    
    // 重新绘制内容
    App.ctx.drawImage(tempCanvas, 0, 0, width, height);
}

// 页面加载完成后初始化Canvas模块
document.addEventListener('DOMContentLoaded', initCanvasModule);

// 导出函数供其他模块使用
window.CanvasConfig = CanvasConfig;
window.updateCanvasPreview = updateCanvasPreview;
window.applyFilter = applyFilter;
window.addBorder = addBorder;
window.addRoundedCorners = addRoundedCorners;
window.getCanvasDataURL = getCanvasDataURL;
window.getCanvasBlob = getCanvasBlob;
window.resizeCanvas = resizeCanvas; 