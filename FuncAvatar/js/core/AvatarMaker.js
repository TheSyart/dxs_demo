// 核心主类 - 负责整体协调和初始化
class AvatarMaker {
    constructor() {
        // 核心状态
        this.originalImage = null;
        this.overlayImage = null;
        this.customOverlayImage = null;
        this.croppedImage = null;
        this.currentTheme = null;
        this.currentStyle = null;
        this.opacity = 50;
        
        // 初始化各个模块
        this.initModules();
        
        // 初始化元素引用
        this.initElements();
        
        // 初始化主题数据
        this.initThemeData();
        
        // 绑定事件
        this.bindEvents();
    }
    
    initModules() {
        // 初始化各个功能模块
        this.imageHandler = new ImageHandler(this);
        this.cropHandler = new CropHandler(this);
        this.themeHandler = new ThemeHandler(this);
        this.pixelHandler = new PixelHandler(this);
        this.flagHandler = new FlagHandler(this);
        this.uiController = new UIController(this);
    }
    
    initElements() {
        // 基础元素
        this.uploadArea = document.getElementById('uploadArea');
        this.imageInput = document.getElementById('imageInput');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.resultCanvas = document.getElementById('resultCanvas');
        this.previewSection = document.getElementById('previewSection');
        this.stylesSection = document.getElementById('stylesSection');
        this.downloadSection = document.getElementById('downloadSection');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.uploadPlaceholder = document.getElementById('uploadPlaceholder');
        
        // Tab切换相关元素
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.overlayTab = document.getElementById('overlayTab');
        this.pixelTab = document.getElementById('pixelTab');
        this.flagTab = document.getElementById('flagTab');
    }
    
    initThemeData() {
        this.themes = {
            'chunjie': { name: '春节', count: 2 },
            'shengri': { name: '生日', count: 6 },
            'guoqing': { name: '国庆', count: 6 },
            'zhongqiu': { name: '中秋', count: 6 },
            'qixi': { name: '七夕', count: 6 },
            'chunyun': { name: '春运', count: 6 }
        };
    }
    
    bindEvents() {
        // 委托给UI控制器处理
        this.uiController.bindEvents();
    }
    
    // 公共方法
    updatePreview() {
        const canvas = document.getElementById('resultCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // 如果没有图片，直接返回
        if (!this.originalImage && !this.croppedImage) return;
        
        // 优先使用裁剪后的图片作为基础图片
        const baseImage = this.croppedImage || this.originalImage;
        
        // 根据图片原始比例设置canvas尺寸
        const maxSize = 300; // 最大尺寸
        const imageAspectRatio = baseImage.naturalWidth / baseImage.naturalHeight;
        
        let canvasWidth, canvasHeight;
        if (imageAspectRatio > 1) {
            // 横向图片
            canvasWidth = maxSize;
            canvasHeight = maxSize / imageAspectRatio;
        } else {
            // 纵向图片或正方形
            canvasHeight = maxSize;
            canvasWidth = maxSize * imageAspectRatio;
        }
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // 绘制基础图片，保持原始比例
        ctx.drawImage(baseImage, 0, 0, canvasWidth, canvasHeight);
        
        // 应用特殊效果
        if (this.currentTheme === 'pixel') {
            this.pixelHandler.applyPixelEffect(canvas, ctx, baseImage);
        } else if (this.currentTheme === 'flag') {
            this.flagHandler.applyFlagEffect(canvas, ctx);
        } else if (this.overlayImage) {
            // 应用覆盖风渐变效果
            this.applyOverlayWithGradient(ctx, Math.max(canvasWidth, canvasHeight));
        }
    }
    
    applyOverlayWithGradient(ctx, size) {
        if (!this.overlayImage) return;
        
        // 获取渐变方向和透明度
        const gradientDirection = document.getElementById('gradientDirection')?.value || 'left-to-right';
        const opacity = this.opacity / 100; // 透明度控制效果强烈程度
        
        // 创建临时画布用于绘制渐变效果
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 先在临时画布上绘制覆盖图片
        tempCtx.drawImage(this.overlayImage, 0, 0, size, size);
        
        // 创建透明度渐变
        let gradient;
        switch (gradientDirection) {
            case 'left-to-right':
                gradient = tempCtx.createLinearGradient(0, 0, size, 0);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);  // 左侧不透明
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);           // 右侧透明
                break;
            case 'right-to-left':
                gradient = tempCtx.createLinearGradient(size, 0, 0, 0);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);  // 右侧不透明
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);           // 左侧透明
                break;
            case 'top-to-bottom':
                gradient = tempCtx.createLinearGradient(0, 0, 0, size);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);  // 顶部不透明
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);           // 底部透明
                break;
            case 'bottom-to-top':
                gradient = tempCtx.createLinearGradient(0, size, 0, 0);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);  // 底部不透明
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);           // 顶部透明
                break;
            case 'center-to-edge':
                gradient = tempCtx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);  // 中心不透明
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);           // 边缘透明
                break;
            case 'edge-to-center':
                gradient = tempCtx.createRadialGradient(size/2, size/2, size/2, size/2, size/2, 0);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);  // 边缘不透明
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);           // 中心透明
                break;
            default:
                gradient = tempCtx.createLinearGradient(0, 0, size, 0);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        }
        
        // 应用渐变透明度遮罩
        tempCtx.globalCompositeOperation = 'destination-in';
        tempCtx.fillStyle = gradient;
        tempCtx.fillRect(0, 0, size, size);
        
        // 将处理后的图片绘制到主画布上
        ctx.drawImage(tempCanvas, 0, 0, size, size);
    }

    downloadImage() {
        const canvas = document.getElementById('resultCanvas');
        if (!canvas) return;
        
        const link = document.createElement('a');
        link.download = 'avatar.png';
        link.href = canvas.toDataURL();
        link.click();
    }
    
    drawImageInSquare(ctx, image, canvasWidth, canvasHeight) {
        const imageAspectRatio = image.naturalWidth / image.naturalHeight;
        const canvasAspectRatio = canvasWidth / canvasHeight;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imageAspectRatio > canvasAspectRatio) {
            // 图片更宽，以高度为准
            drawHeight = canvasHeight;
            drawWidth = drawHeight * imageAspectRatio;
            offsetX = (canvasWidth - drawWidth) / 2;
            offsetY = 0;
        } else {
            // 图片更高，以宽度为准
            drawWidth = canvasWidth;
            drawHeight = drawWidth / imageAspectRatio;
            offsetX = 0;
            offsetY = (canvasHeight - drawHeight) / 2;
        }
        
        ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    }
    
    switchTab(tabName) {
        this.uiController.switchTab(tabName);
    }
}

// 导出类
window.AvatarMaker = AvatarMaker;