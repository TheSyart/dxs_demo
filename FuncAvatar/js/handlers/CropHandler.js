// 图片裁剪处理模块
class CropHandler {
    constructor(avatarMaker) {
        this.app = avatarMaker;
        
        // 裁剪相关属性
        this.cropModal = null;
        this.cropImage = null;
        this.cropBox = null;
        this.isDragging = false;
        this.isResizing = false;
        this.dragStart = { x: 0, y: 0 };
        this.resizeHandle = null;
        this.cropData = { x: 0, y: 0, width: 0, height: 0 };
        
        this.initElements();
        this.bindEvents();
    }
    
    initElements() {
        // 裁剪弹窗相关元素
        this.cropModal = document.getElementById('cropModal');
        this.cropImage = document.getElementById('cropImage');
        this.cropBox = document.getElementById('cropBox');
        this.closeCropModal = document.getElementById('closeCropModal');
        this.cancelCrop = document.getElementById('cancelCrop');
        this.confirmCrop = document.getElementById('confirmCrop');
        this.cropHandles = document.querySelectorAll('.crop-handle');
    }
    
    bindEvents() {
        // 关闭裁剪弹窗
        if (this.closeCropModal) {
            this.closeCropModal.addEventListener('click', () => this.closeCropModalWindow());
        }
        
        if (this.cancelCrop) {
            this.cancelCrop.addEventListener('click', () => this.closeCropModalWindow());
        }
        
        if (this.confirmCrop) {
            this.confirmCrop.addEventListener('click', () => this.confirmCropSelection());
        }
        
        // 裁剪框拖拽和调整大小
        if (this.cropBox) {
            this.cropBox.addEventListener('mousedown', (e) => this.startDrag(e));
        }
        
        this.cropHandles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => this.startResize(e));
        });
        
        // 全局鼠标事件
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
    }
    
    showCropModal(imageSrc) {
        this.cropImage.src = imageSrc;
        this.cropModal.classList.add('show');
        
        this.cropImage.onload = () => {
            this.initCropBox();
        };
    }
    
    initCropBox() {
        // 等待图片完全加载后再计算位置
        setTimeout(() => {
            const imageContainer = this.cropImage.parentElement;
            const imageRect = this.cropImage.getBoundingClientRect();
            const containerRect = imageContainer.getBoundingClientRect();
            
            // 计算裁剪框的初始位置和大小
            const size = Math.min(imageRect.width, imageRect.height) * 0.8;
            // 修正：计算相对于容器的位置
            const left = (imageRect.left - containerRect.left) + (imageRect.width - size) / 2;
            const top = (imageRect.top - containerRect.top) + (imageRect.height - size) / 2;
            
            this.cropBox.style.left = left + 'px';
            this.cropBox.style.top = top + 'px';
            this.cropBox.style.width = size + 'px';
            this.cropBox.style.height = size + 'px';
            this.cropBox.style.display = 'block';
            
            this.updateCropData();
        }, 100);
    }
    
    updateCropData() {
        const imageRect = this.cropImage.getBoundingClientRect();
        const modalRect = this.cropModal.getBoundingClientRect();
        const boxRect = this.cropBox.getBoundingClientRect();
        
        // 计算相对于图片的裁剪区域
        this.cropData = {
            x: (boxRect.left - imageRect.left) / imageRect.width,
            y: (boxRect.top - imageRect.top) / imageRect.height,
            width: boxRect.width / imageRect.width,
            height: boxRect.height / imageRect.height
        };
    }
    
    startDrag(event) {
        if (event.target.classList.contains('crop-handle')) return;
        
        this.isDragging = true;
        const containerRect = this.cropImage.parentElement.getBoundingClientRect();
        this.dragStart = {
            x: event.clientX - containerRect.left - this.cropBox.offsetLeft,
            y: event.clientY - containerRect.top - this.cropBox.offsetTop
        };
        event.preventDefault();
        event.stopPropagation();
    }
    
    startResize(event) {
        this.isResizing = true;
        this.resizeHandle = event.target.dataset.handle;
        event.stopPropagation();
        event.preventDefault();
    }
    
    handleMouseMove(event) {
        if (this.isDragging) {
            this.dragCropBox(event);
        } else if (this.isResizing) {
            this.resizeCropBox(event);
        }
    }
    
    handleMouseUp() {
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }
    
    dragCropBox(event) {
        const imageContainer = this.cropImage.parentElement;
        const imageRect = this.cropImage.getBoundingClientRect();
        const containerRect = imageContainer.getBoundingClientRect();
        
        let newLeft = event.clientX - containerRect.left - this.dragStart.x;
        let newTop = event.clientY - containerRect.top - this.dragStart.y;
        
        // 限制在图片范围内
        const minLeft = imageRect.left - containerRect.left;
        const minTop = imageRect.top - containerRect.top;
        const maxLeft = imageRect.right - containerRect.left - this.cropBox.offsetWidth;
        const maxTop = imageRect.bottom - containerRect.top - this.cropBox.offsetHeight;
        
        newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
        newTop = Math.max(minTop, Math.min(maxTop, newTop));
        
        this.cropBox.style.left = newLeft + 'px';
        this.cropBox.style.top = newTop + 'px';
        
        this.updateCropData();
    }
    
    resizeCropBox(event) {
        const imageContainer = this.cropImage.parentElement;
        const imageRect = this.cropImage.getBoundingClientRect();
        const containerRect = imageContainer.getBoundingClientRect();
        const boxRect = this.cropBox.getBoundingClientRect();
        
        let newWidth = boxRect.width;
        let newHeight = boxRect.height;
        let newLeft = this.cropBox.offsetLeft;
        let newTop = this.cropBox.offsetTop;
        
        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;
        
        switch (this.resizeHandle) {
            case 'nw':
                newWidth = (this.cropBox.offsetLeft + this.cropBox.offsetWidth) - mouseX;
                newHeight = (this.cropBox.offsetTop + this.cropBox.offsetHeight) - mouseY;
                newLeft = mouseX;
                newTop = mouseY;
                break;
            case 'ne':
                newWidth = mouseX - this.cropBox.offsetLeft;
                newHeight = (this.cropBox.offsetTop + this.cropBox.offsetHeight) - mouseY;
                newTop = mouseY;
                break;
            case 'sw':
                newWidth = (this.cropBox.offsetLeft + this.cropBox.offsetWidth) - mouseX;
                newHeight = mouseY - this.cropBox.offsetTop;
                newLeft = mouseX;
                break;
            case 'se':
                newWidth = mouseX - this.cropBox.offsetLeft;
                newHeight = mouseY - this.cropBox.offsetTop;
                break;
        }
        
        // 保持正方形
        const size = Math.min(newWidth, newHeight);
        newWidth = newHeight = Math.max(50, size); // 最小尺寸50px
        
        // 限制在图片范围内
        const minLeft = imageRect.left - containerRect.left;
        const minTop = imageRect.top - containerRect.top;
        const maxLeft = imageRect.right - containerRect.left - newWidth;
        const maxTop = imageRect.bottom - containerRect.top - newHeight;
        
        // 调整位置以保持在边界内
        if (this.resizeHandle && this.resizeHandle.includes('w')) {
            newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
        }
        if (this.resizeHandle && this.resizeHandle.includes('n')) {
            newTop = Math.max(minTop, Math.min(maxTop, newTop));
        }
        
        // 确保右下角不超出边界
        if (newLeft + newWidth > imageRect.right - containerRect.left) {
            newWidth = imageRect.right - containerRect.left - newLeft;
            newHeight = newWidth; // 保持正方形
        }
        if (newTop + newHeight > imageRect.bottom - containerRect.top) {
            newHeight = imageRect.bottom - containerRect.top - newTop;
            newWidth = newHeight; // 保持正方形
        }
        
        this.cropBox.style.left = newLeft + 'px';
        this.cropBox.style.top = newTop + 'px';
        this.cropBox.style.width = newWidth + 'px';
        this.cropBox.style.height = newHeight + 'px';
        
        this.updateCropData();
    }
    
    closeCropModalWindow() {
        this.cropModal.classList.remove('show');
    }
    
    confirmCropSelection() {
        this.createCroppedImage();
        this.closeCropModalWindow();
    }
    
    createCroppedImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置画布尺寸为正方形
        const size = 400;
        canvas.width = size;
        canvas.height = size;
        
        // 计算裁剪区域在原图中的实际像素位置
        const img = this.cropImage;
        const cropX = this.cropData.x * img.naturalWidth;
        const cropY = this.cropData.y * img.naturalHeight;
        const cropWidth = this.cropData.width * img.naturalWidth;
        const cropHeight = this.cropData.height * img.naturalHeight;
        
        // 绘制裁剪后的图片
        ctx.drawImage(
            img,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, size, size
        );
        
        // 将画布转换为图片对象
        const croppedImageUrl = canvas.toDataURL();
        const croppedImage = new Image();
        croppedImage.onload = () => {
            // 保存裁剪后的图片
            this.app.croppedImage = croppedImage;
            this.app.croppedImageUrl = croppedImageUrl;
            
            // 保存原图对象，从originalImageUrl创建
            if (this.app.originalImageUrl && !this.app.originalImage) {
                const originalImg = new Image();
                originalImg.onload = () => {
                    this.app.originalImage = originalImg;
                    // 更新预览，使用裁剪后的图片
                    this.app.updatePreview();
                };
                originalImg.src = this.app.originalImageUrl;
            } else {
                // 如果原图已存在，直接更新预览
                this.app.updatePreview();
            }
            
            // 在上传区域显示裁剪后的图片预览
            this.showUploadPreview(croppedImageUrl);
            
            // 显示预览区域和样式选择
            this.app.uiController.showPreviewSection();
            this.app.uiController.showStylesSection();
        };
        croppedImage.src = croppedImageUrl;
    }

    showUploadPreview(imageUrl) {
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const previewCanvas = document.getElementById('previewCanvas');
        
        if (uploadPlaceholder && previewCanvas) {
            // 隐藏上传占位符
            uploadPlaceholder.style.display = 'none';
            
            // 显示预览canvas
            previewCanvas.style.display = 'block';
            
            // 绘制原图而不是裁剪后的图片
            const ctx = previewCanvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                // 根据图片原始比例设置canvas尺寸
                const maxSize = 150; // 最大尺寸
                const imageAspectRatio = img.naturalWidth / img.naturalHeight;
                
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
                
                previewCanvas.width = canvasWidth;
                previewCanvas.height = canvasHeight;
                
                // 绘制基础图片，保持原始比例
                ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            };
            // 使用原图URL而不是裁剪后的图片URL
            img.src = this.app.originalImageUrl || imageUrl;
        }
    }
}

// 导出类
window.CropHandler = CropHandler;