/**
 * 表情包生成器 - 图片上传处理模块
 * 负责图片上传、拖拽、验证和预览功能
 */

// 图片上传配置
const UploadConfig = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    maxWidth: 2000,
    maxHeight: 2000
};

/**
 * 初始化上传功能
 */
function initUpload() {
    console.log('初始化图片上传功能...');
    
    // 绑定拖拽事件
    bindDragEvents();
    
    // 绑定文件选择事件
    bindFileSelectEvents();
    
    console.log('图片上传功能初始化完成');
}

/**
 * 绑定拖拽事件
 */
function bindDragEvents() {
    const uploadArea = App.elements.uploadArea;
    
    if (!uploadArea) return;
    
    // 阻止默认拖拽行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // 拖拽进入和离开事件
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    // 文件放置事件
    uploadArea.addEventListener('drop', handleDrop, false);
    
    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => {
        document.getElementById('imageInput').click();
    });
}

/**
 * 绑定文件选择事件
 */
function bindFileSelectEvents() {
    const fileInput = document.getElementById('imageInput');
    
    if (!fileInput) return;
    
    fileInput.addEventListener('change', handleFileSelect);
}

/**
 * 阻止默认事件
 */
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * 高亮拖拽区域
 */
function highlight(e) {
    App.elements.uploadArea.classList.add('dragover');
}

/**
 * 取消高亮拖拽区域
 */
function unhighlight(e) {
    App.elements.uploadArea.classList.remove('dragover');
}

/**
 * 处理文件放置
 */
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        handleFiles(files);
    }
}

/**
 * 处理文件选择
 */
function handleFileSelect(e) {
    const files = e.target.files;
    
    if (files.length > 0) {
        handleFiles(files);
    }
}

/**
 * 处理文件
 */
function handleFiles(files) {
    const file = files[0];
    
    // 验证文件
    if (!validateFile(file)) {
        return;
    }
    
    // 读取文件
    readFile(file);
}

/**
 * 验证文件
 */
function validateFile(file) {
    // 检查文件类型
    if (!UploadConfig.allowedTypes.includes(file.type)) {
        showErrorMessage('只支持 JPG、PNG、GIF 格式的图片！');
        return false;
    }
    
    // 检查文件大小
    if (file.size > UploadConfig.maxFileSize) {
        showErrorMessage(`文件大小不能超过 ${UploadConfig.maxFileSize / 1024 / 1024}MB！`);
        return false;
    }
    
    return true;
}

/**
 * 读取文件
 */
function readFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const result = e.target.result;
        
        // 验证图片尺寸
        validateImageSize(result, (isValid, imageData) => {
            if (isValid) {
                processImage(imageData);
            } else {
                showErrorMessage('图片尺寸过大，请选择小于 2000x2000 的图片！');
            }
        });
    };
    
    reader.onerror = function() {
        showErrorMessage('文件读取失败，请重试！');
    };
    
    reader.readAsDataURL(file);
}

/**
 * 验证图片尺寸
 */
function validateImageSize(dataUrl, callback) {
    const img = new Image();
    
    img.onload = function() {
        const isValid = img.width <= UploadConfig.maxWidth && img.height <= UploadConfig.maxHeight;
        callback(isValid, dataUrl);
    };
    
    img.onerror = function() {
        callback(false, null);
    };
    
    img.src = dataUrl;
}

/**
 * 处理图片
 */
function processImage(imageData) {
    try {
        // 更新全局图片数据
        App.currentImage = imageData;
        
        // 显示预览
        showImagePreview(imageData);
        
        // 显示后续功能区域
        showSection('textSection');
        showSection('previewSection');
        showSection('downloadSection');
        
        // 更新Canvas预览
        updatePreview();
        
        // 显示成功消息
        showSuccessMessage('图片上传成功！');
        
    } catch (error) {
        console.error('图片处理失败:', error);
        showErrorMessage('图片处理失败，请重试！');
    }
}

/**
 * 显示图片预览
 */
function showImagePreview(imageData) {
    const uploadArea = App.elements.uploadArea;
    const uploadPreview = App.elements.uploadPreview;
    const previewImage = App.elements.previewImage;
    
    // 隐藏上传区域
    uploadArea.style.display = 'none';
    
    // 显示预览区域
    uploadPreview.style.display = 'block';
    
    // 设置预览图片
    previewImage.src = imageData;
    
    // 添加加载动画
    previewImage.classList.add('loading');
    
    // 图片加载完成后移除加载动画
    previewImage.onload = function() {
        previewImage.classList.remove('loading');
    };
}

/**
 * 压缩图片（如果需要）
 */
function compressImage(imageData, maxWidth, maxHeight, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 计算压缩后的尺寸
            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            
            // 设置Canvas尺寸
            canvas.width = width;
            canvas.height = height;
            
            // 绘制压缩后的图片
            ctx.drawImage(img, 0, 0, width, height);
            
            // 转换为Blob
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.onerror = reject;
        img.src = imageData;
    });
}

/**
 * 获取图片信息
 */
function getImageInfo(imageData) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = function() {
            resolve({
                width: img.width,
                height: img.height,
                aspectRatio: img.width / img.height,
                size: imageData.length
            });
        };
        
        img.onerror = reject;
        img.src = imageData;
    });
}

/**
 * 创建缩略图
 */
function createThumbnail(imageData, maxWidth = 200, maxHeight = 200) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 计算缩略图尺寸
            let { width, height } = img;
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            
            width *= ratio;
            height *= ratio;
            
            // 设置Canvas尺寸
            canvas.width = width;
            canvas.height = height;
            
            // 绘制缩略图
            ctx.drawImage(img, 0, 0, width, height);
            
            // 返回缩略图数据
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        
        img.onerror = reject;
        img.src = imageData;
    });
}

/**
 * 检查浏览器支持
 */
function checkBrowserSupport() {
    const support = {
        fileReader: typeof FileReader !== 'undefined',
        dragAndDrop: 'draggable' in document.createElement('div'),
        canvas: !!document.createElement('canvas').getContext,
        blob: typeof Blob !== 'undefined',
        url: typeof URL !== 'undefined' && URL.createObjectURL
    };
    
    if (!support.fileReader) {
        showErrorMessage('您的浏览器不支持文件读取功能！');
        return false;
    }
    
    if (!support.canvas) {
        showErrorMessage('您的浏览器不支持Canvas功能！');
        return false;
    }
    
    return true;
}

/**
 * 显示上传进度
 */
function showUploadProgress(progress) {
    // 创建进度条元素
    let progressBar = document.querySelector('.upload-progress');
    
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'upload-progress';
        progressBar.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
        `;
        
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressFill.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, #4f46e5, #06b6d4);
            width: 0%;
            transition: width 0.3s ease;
        `;
        
        progressBar.appendChild(progressFill);
        App.elements.uploadArea.appendChild(progressBar);
    }
    
    const progressFill = progressBar.querySelector('.progress-fill');
    progressFill.style.width = progress + '%';
    
    // 完成时移除进度条
    if (progress >= 100) {
        setTimeout(() => {
            if (progressBar.parentNode) {
                progressBar.parentNode.removeChild(progressBar);
            }
        }, 500);
    }
}

/**
 * 模拟上传进度（用于大文件）
 */
function simulateUploadProgress(callback) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        showUploadProgress(progress);
        callback(progress);
    }, 100);
}

// 页面加载完成后初始化上传功能
document.addEventListener('DOMContentLoaded', () => {
    // 检查浏览器支持
    if (checkBrowserSupport()) {
        initUpload();
    }
});

// 导出函数供其他模块使用
window.UploadConfig = UploadConfig;
window.compressImage = compressImage;
window.getImageInfo = getImageInfo;
window.createThumbnail = createThumbnail; 