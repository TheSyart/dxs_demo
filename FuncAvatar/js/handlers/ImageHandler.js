// 图片处理模块
class ImageHandler {
    constructor(avatarMaker) {
        this.app = avatarMaker;
    }
    
    handleImageUpload(file) {
        if (file && file.type.startsWith('image/')) {
            this.loadImageForCrop(file);
        }
    }
    
    loadImageForCrop(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // 保存原图URL
            this.app.originalImageUrl = e.target.result;
            this.app.cropHandler.showCropModal(e.target.result);
        };
        reader.readAsDataURL(file);
    }
    
    showImagePreview() {
        if (!this.app.croppedImage) return;
        
        const canvas = this.app.previewCanvas;
        const ctx = canvas.getContext('2d');
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制裁剪后的图片
        this.drawImageInSquare(ctx, this.app.croppedImage, canvas.width, canvas.height);
        
        // 显示预览区域
        this.app.previewSection.style.display = 'block';
        this.app.uiController.showStylesSection();
    }
    
    drawImageInSquare(ctx, image, canvasWidth, canvasHeight) {
        const size = Math.min(canvasWidth, canvasHeight);
        const startX = (canvasWidth - size) / 2;
        const startY = (canvasHeight - size) / 2;
        
        // 保存当前状态
        ctx.save();
        
        // 创建圆形裁剪路径
        ctx.beginPath();
        ctx.arc(canvasWidth / 2, canvasHeight / 2, size / 2, 0, 2 * Math.PI);
        ctx.clip();
        
        // 绘制图片
        if (image.width > image.height) {
            const ratio = size / image.height;
            const newWidth = image.width * ratio;
            const offsetX = (size - newWidth) / 2;
            ctx.drawImage(image, startX + offsetX, startY, newWidth, size);
        } else {
            const ratio = size / image.width;
            const newHeight = image.height * ratio;
            const offsetY = (size - newHeight) / 2;
            ctx.drawImage(image, startX, startY + offsetY, size, newHeight);
        }
        
        // 恢复状态
        ctx.restore();
    }
    
    drawImageInSquareWithOffset(ctx, image, canvasWidth, canvasHeight, startX, startY) {
        const size = Math.min(canvasWidth, canvasHeight);
        
        // 绘制图片
        if (image.width > image.height) {
            const ratio = size / image.height;
            const newWidth = image.width * ratio;
            const offsetX = (size - newWidth) / 2;
            ctx.drawImage(image, startX + offsetX, startY, newWidth, size);
        } else {
            const ratio = size / image.width;
            const newHeight = image.height * ratio;
            const offsetY = (size - newHeight) / 2;
            ctx.drawImage(image, startX, startY + offsetY, size, newHeight);
        }
    }
    
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }
    
    checkImageExists(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = imagePath;
        });
    }
}

// 导出类
window.ImageHandler = ImageHandler;