// UI控制器模块
class UIController {
    constructor(avatarMaker) {
        this.app = avatarMaker;
        this.initElements();
        this.bindEvents();
    }
    
    initElements() {
        // 标签页相关
        this.tabs = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // 各个区域
        this.uploadSection = document.getElementById('uploadSection');
        this.themeSection = document.getElementById('themeSection');
        this.previewSection = document.getElementById('previewSection');
        this.downloadSection = document.getElementById('downloadSection');
        this.stylesSection = document.getElementById('stylesSection');
        
        // 控制区域
        this.subStyles = document.getElementById('subStyles');
        this.opacityControl = document.getElementById('opacityControl');
        this.pixelControls = document.getElementById('pixelControls');
        this.flagControls = document.getElementById('flagControls');
        
        // 按钮
        this.downloadBtn = document.getElementById('downloadBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.cropBtn = document.getElementById('cropBtn');
    }
    
    bindEvents() {
        // 图片上传事件
        if (this.app.uploadArea) {
            this.app.uploadArea.addEventListener('click', () => {
                this.app.imageInput.click();
            });
        }
        
        if (this.app.imageInput) {
            this.app.imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.app.imageHandler.handleImageUpload(file);
                }
            });
        }
        
        // 标签页切换
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // 下载按钮
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.app.downloadImage());
        }
        
        // 重置按钮
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetAll());
        }
        
        // 裁剪按钮
        if (this.cropBtn) {
            this.cropBtn.addEventListener('click', () => this.app.cropHandler.showCropModal());
        }
    }
    
    switchTab(tabName) {
        // 更新标签页状态
        this.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // 更新内容区域
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabName + 'Tab');
        });
        
        // 根据标签页显示相应内容
        this.handleTabSwitch(tabName);
    }
    
    handleTabSwitch(tabName) {
        switch(tabName) {
            case 'upload':
                this.showUploadSection();
                break;
            case 'theme':
                this.showThemeSection();
                break;
            case 'preview':
                this.showPreviewSection();
                break;
            case 'flag':
                // 切换到国旗风时，激活国旗风格
                this.app.flagHandler.selectFlagStyle();
                break;
            case 'pixel':
                // 切换到像素风时，激活像素风格
                this.app.pixelHandler.selectPixelStyle();
                break;
        }
    }
    
    showUploadSection() {
        if (this.uploadSection) {
            this.uploadSection.style.display = 'block';
        }
    }
    
    showThemeSection() {
        if (this.themeSection) {
            this.themeSection.style.display = 'block';
        }
    }
    
    showPreviewSection() {
        if (this.previewSection) {
            this.previewSection.style.display = 'block';
        }
    }
    
    showDownloadSection() {
        if (this.downloadSection) {
            this.downloadSection.style.display = 'block';
        }
    }
    
    showStylesSection() {
        if (this.stylesSection) {
            this.stylesSection.style.display = 'block';
        }
    }

    hideUploadSection() {
        if (this.uploadSection) {
            this.uploadSection.style.display = 'none';
        }
    }
    
    hideThemeSection() {
        if (this.themeSection) {
            this.themeSection.style.display = 'none';
        }
    }
    
    hidePreviewSection() {
        if (this.previewSection) {
            this.previewSection.style.display = 'none';
        }
    }
    
    hideDownloadSection() {
        if (this.downloadSection) {
            this.downloadSection.style.display = 'none';
        }
    }
    
    hideStylesSection() {
        if (this.stylesSection) {
            this.stylesSection.style.display = 'none';
        }
    }
    
    showSubStyles() {
        if (this.subStyles) {
            this.subStyles.style.display = 'block';
        }
    }
    
    hideSubStyles() {
        if (this.subStyles) {
            this.subStyles.style.display = 'none';
        }
    }
    
    showOpacityControl() {
        if (this.opacityControl) {
            this.opacityControl.style.display = 'block';
        }
    }
    
    hideOpacityControl() {
        if (this.opacityControl) {
            this.opacityControl.style.display = 'none';
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
    
    showFlagControls() {
        if (this.flagControls) {
            this.flagControls.style.display = 'block';
        }
    }
    
    hideFlagControls() {
        if (this.flagControls) {
            this.flagControls.style.display = 'none';
        }
    }
    
    resetAll() {
        // 重置应用状态
        this.app.originalImage = null;
        this.app.overlayImage = null;
        this.app.customOverlayImage = null;
        this.app.currentTheme = '';
        this.app.currentStyle = '';
        this.app.opacity = 80;
        this.app.pixelSize = 8;
        this.app.pixelMode = 'block'; // 'block' 或 'dot'
        this.app.dotSpacing = 4;
        this.app.dotRadius = 2;
        this.app.flagOpacity = 50;
        
        // 重置UI状态
        this.hidePreviewSection();
        this.hideDownloadSection();
        this.hideSubStyles();
        this.hideOpacityControl();
        this.hidePixelControls();
        this.hideFlagControls();
        
        // 重置上传区域
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const previewCanvas = document.getElementById('previewCanvas');
        if (uploadPlaceholder && previewCanvas) {
            uploadPlaceholder.style.display = 'block';
            previewCanvas.style.display = 'none';
        }
        
        // 清除预览
        const previewCanvas2 = document.getElementById('previewCanvas');
        if (previewCanvas2) {
            const ctx = previewCanvas2.getContext('2d');
            ctx.clearRect(0, 0, previewCanvas2.width, previewCanvas2.height);
        }
        
        const resultCanvas = document.getElementById('resultCanvas');
        if (resultCanvas) {
            const ctx = resultCanvas.getContext('2d');
            ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
        }
        
        // 重置文件输入
        const imageInput = document.getElementById('imageInput');
        if (imageInput) {
            imageInput.value = '';
        }
        
        // 重置所有选中状态
        document.querySelectorAll('.style-item.active').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelectorAll('.sub-style-item.active').forEach(item => {
            item.classList.remove('active');
        });
        
        // 重置标签页到默认状态
        this.switchTab('overlay');
    }
    
    showLoading(message = '处理中...') {
        // 可以添加加载动画
        console.log(message);
    }
    
    hideLoading() {
        // 隐藏加载动画
        console.log('处理完成');
    }
    
    showError(message) {
        alert('错误: ' + message);
        console.error(message);
    }
    
    showSuccess(message) {
        console.log('成功: ' + message);
    }
}

// 导出类
window.UIController = UIController;