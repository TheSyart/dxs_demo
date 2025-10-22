// 像素风处理模块
class PixelHandler {
    constructor(avatarMaker) {
        this.app = avatarMaker;
        this.initElements();
        this.bindEvents();
    }
    
    initElements() {
        this.pixelSizeSlider = document.getElementById('pixelSizeSlider');
        this.pixelSizeValue = document.getElementById('pixelSizeValue');
        this.pixelControls = document.getElementById('pixelControls');
        
        // 像素风模式相关元素
        this.pixelMode = document.getElementById('pixelMode');
        this.blockControls = document.getElementById('blockControls');
        this.dotControls = document.getElementById('dotControls');
        
        // 马赛克控制
        this.blockSize = document.getElementById('blockSize');
        this.blockSizeValue = document.getElementById('blockSizeValue');
        
        // 点阵像素控制
        this.dotSpacing = document.getElementById('dotSpacing');
        this.dotSpacingValue = document.getElementById('dotSpacingValue');
        this.dotRadius = document.getElementById('dotRadius');
        this.dotRadiusValue = document.getElementById('dotRadiusValue');
    }
    
    bindEvents() {
        // 像素风模式切换
        if (this.pixelMode) {
            this.pixelMode.addEventListener('change', (e) => {
                this.switchPixelMode(e.target.value);
            });
        }
        
        // 马赛克控制
        if (this.blockSize) {
            this.blockSize.addEventListener('input', (e) => {
                this.app.pixelSize = parseInt(e.target.value);
                this.blockSizeValue.textContent = this.app.pixelSize;
                if (this.app.currentTheme === 'pixel') {
                    this.app.updatePreview();
                }
            });
        }
        
        // 点阵像素控制
        if (this.dotSpacing) {
            this.dotSpacing.addEventListener('input', (e) => {
                this.app.dotSpacing = parseInt(e.target.value);
                this.dotSpacingValue.textContent = this.app.dotSpacing;
                if (this.app.currentTheme === 'pixel' && this.app.pixelMode === 'dot') {
                    this.app.updatePreview();
                }
            });
        }
        
        if (this.dotRadius) {
            this.dotRadius.addEventListener('input', (e) => {
                this.app.dotRadius = parseFloat(e.target.value);
                this.dotRadiusValue.textContent = this.app.dotRadius;
                if (this.app.currentTheme === 'pixel' && this.app.pixelMode === 'dot') {
                    this.app.updatePreview();
                }
            });
        }
        
        // 兼容旧的滑块（如果存在）
        if (this.pixelSizeSlider) {
            this.pixelSizeSlider.addEventListener('input', (e) => {
                this.app.pixelSize = parseInt(e.target.value);
                this.pixelSizeValue.textContent = this.app.pixelSize;
                this.app.updatePreview();
            });
        }
    }
    
    selectPixelStyle() {
        this.app.currentTheme = 'pixel';
        this.app.currentStyle = 'pixel';
        
        // 更新主题按钮状态
        document.querySelectorAll('.style-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const pixelTheme = document.querySelector('[data-theme="pixel"]');
        if (pixelTheme) {
            pixelTheme.classList.add('active');
        }
        
        // 显示像素风控制
        this.showPixelControls();
        
        // 隐藏其他控制
        this.app.uiController.hideSubStyles();
        this.app.uiController.hideOpacityControl();
        
        // 更新预览
        this.app.updatePreview();
        this.app.uiController.showPreviewSection();
        this.app.uiController.showDownloadSection();
    }

    switchPixelMode(mode) {
        this.app.pixelMode = mode;
        
        if (mode === 'block') {
            this.blockControls.style.display = 'block';
            this.dotControls.style.display = 'none';
        } else if (mode === 'dot') {
            this.blockControls.style.display = 'none';
            this.dotControls.style.display = 'block';
        }
        
        if (this.app.currentTheme === 'pixel') {
            this.app.updatePreview();
        }
    }
    
    showPixelControls() {
        if (this.pixelControls) {
            this.pixelControls.style.display = 'block';
        }
    }
    
    hidePixelControls() {
        if (this.pixelControls) {
            this.pixelControls.style.display = 'none';
        }
    }
    
    applyPixelEffect(canvas, ctx, image) {
        const pixelMode = this.app.pixelMode || 'block';
        
        if (pixelMode === 'dot') {
            this.applyDotPixelEffect(canvas, ctx, image);
        } else {
            this.applyBlockPixelEffect(canvas, ctx, image);
        }
    }

    applyBlockPixelEffect(canvas, ctx, image) {
        const pixelSize = this.app.pixelSize || 8;
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制原图
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        
        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 清空画布准备绘制像素化效果
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 像素化处理
        for (let y = 0; y < canvas.height; y += pixelSize) {
            for (let x = 0; x < canvas.width; x += pixelSize) {
                // 获取当前像素块的平均颜色
                let r = 0, g = 0, b = 0, a = 0;
                let count = 0;
                
                for (let dy = 0; dy < pixelSize && y + dy < canvas.height; dy++) {
                    for (let dx = 0; dx < pixelSize && x + dx < canvas.width; dx++) {
                        const index = ((y + dy) * canvas.width + (x + dx)) * 4;
                        r += data[index];
                        g += data[index + 1];
                        b += data[index + 2];
                        a += data[index + 3];
                        count++;
                    }
                }
                
                if (count > 0) {
                    r = Math.round(r / count);
                    g = Math.round(g / count);
                    b = Math.round(b / count);
                    a = Math.round(a / count);
                    
                    // 绘制像素块
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
                    ctx.fillRect(x, y, pixelSize, pixelSize);
                }
            }
        }
    }

    applyDotPixelEffect(canvas, ctx, image) {
        const dotSpacing = this.app.dotSpacing || 6;
        const dotRadius = this.app.dotRadius || 3;
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制原图到临时canvas获取颜色数据
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCtx.drawImage(image, 0, 0, canvas.width, canvas.height);
        
        const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 绘制点阵效果
        for (let y = dotRadius; y < canvas.height; y += dotSpacing) {
            for (let x = dotRadius; x < canvas.width; x += dotSpacing) {
                const index = (y * canvas.width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
                
                if (a > 0) {
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
                    ctx.beginPath();
                    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    pixelateImageData(imageData, pixelSize) {
        const { data, width, height } = imageData;
        const pixelatedData = new Uint8ClampedArray(data);
        
        for (let y = 0; y < height; y += pixelSize) {
            for (let x = 0; x < width; x += pixelSize) {
                // 获取像素块的平均颜色
                const avgColor = this.getAverageColor(data, x, y, pixelSize, width, height);
                
                // 将平均颜色应用到整个像素块
                this.fillPixelBlock(pixelatedData, x, y, pixelSize, width, height, avgColor);
            }
        }
        
        return new ImageData(pixelatedData, width, height);
    }
    
    getAverageColor(data, startX, startY, blockSize, width, height) {
        let r = 0, g = 0, b = 0, a = 0;
        let count = 0;
        
        for (let y = startY; y < Math.min(startY + blockSize, height); y++) {
            for (let x = startX; x < Math.min(startX + blockSize, width); x++) {
                const index = (y * width + x) * 4;
                r += data[index];
                g += data[index + 1];
                b += data[index + 2];
                a += data[index + 3];
                count++;
            }
        }
        
        return [
            Math.round(r / count),
            Math.round(g / count),
            Math.round(b / count),
            Math.round(a / count)
        ];
    }
    
    fillPixelBlock(data, startX, startY, blockSize, width, height, color) {
        for (let y = startY; y < Math.min(startY + blockSize, height); y++) {
            for (let x = startX; x < Math.min(startX + blockSize, width); x++) {
                const index = (y * width + x) * 4;
                data[index] = color[0];     // R
                data[index + 1] = color[1]; // G
                data[index + 2] = color[2]; // B
                data[index + 3] = color[3]; // A
            }
        }
    }

}

// 导出类
window.PixelHandler = PixelHandler;