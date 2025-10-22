// 主题处理模块
class ThemeHandler {
    constructor(avatarMaker) {
        this.app = avatarMaker;
        this.initElements();
        this.bindEvents();
    }
    
    initElements() {
        this.subStyles = document.getElementById('subStyles');
        this.subStylesGrid = document.getElementById('subStylesGrid');
        this.opacityControl = document.getElementById('opacityControl');
        this.opacitySlider = document.getElementById('opacitySlider');
        this.opacityValue = document.getElementById('opacityValue');
        this.gradientDirection = document.getElementById('gradientDirection');
        
        // 自定义主题相关元素
        this.customThemeInput = document.getElementById('customThemeInput');
        this.customThemeItem = document.getElementById('customThemeItem');
        this.customPreview = document.querySelector('.custom-preview');
    }
    
    bindEvents() {
        // 透明度滑块
        if (this.opacitySlider) {
            this.opacitySlider.addEventListener('input', (e) => {
                this.app.opacity = parseInt(e.target.value);
                this.opacityValue.textContent = this.app.opacity + '%';
                this.app.updatePreview();
            });
        }
        
        // 渐变方向
        if (this.gradientDirection) {
            this.gradientDirection.addEventListener('change', () => {
                this.app.updatePreview();
            });
        }
        
        // 自定义主题
        if (this.customThemeItem) {
            this.customThemeItem.addEventListener('click', () => this.triggerCustomThemeSelect());
        }
        
        if (this.customThemeInput) {
            this.customThemeInput.addEventListener('change', (e) => this.handleCustomThemeSelect(e));
        }
    }
    
    async detectThemeImages() {
        for (const [themeKey, themeData] of Object.entries(this.app.themes)) {
            const detectedCount = await this.countAvailableImages(themeKey);
            if (detectedCount > 0) {
                themeData.count = detectedCount;
                console.log(`检测到主题 ${themeKey}: ${detectedCount} 张图片`);
            } else {
                console.log(`主题 ${themeKey} 没有找到图片`);
                if (themeData.count > 0) {
                    themeData.count = 0;
                }
            }
        }
    }
    
    async countAvailableImages(theme) {
        let count = 0;
        for (let i = 1; i <= 10; i++) {
            const imagePath = `images/${theme}${i}.png`;
            const exists = await this.app.imageHandler.checkImageExists(imagePath);
            if (exists) {
                count++;
            }
        }
        return count;
    }
    
    selectTheme(theme) {
        this.app.currentTheme = theme;
        
        // 更新主题按钮状态
        document.querySelectorAll('.style-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedTheme = document.querySelector(`[data-theme="${theme}"]`);
        if (selectedTheme) {
            selectedTheme.classList.add('active');
        }
        
        // 隐藏其他风格的控制UI
        this.app.pixelHandler.hidePixelControls();
        this.app.flagHandler.hideFlagControls();
        
        // 显示子样式
        this.showSubStyles(theme);
        
        // 显示透明度控制
        this.app.uiController.showOpacityControl();
    }
    
    showSubStyles(theme) {
        if (!this.subStylesGrid) return;
        
        this.subStylesGrid.innerHTML = '';
        
        // 如果是自定义主题，直接隐藏子样式区域
        if (theme === 'custom') {
            this.subStyles.style.display = 'none';
            return;
        }
        
        const themeData = this.app.themes[theme];
        if (!themeData) {
            // 如果主题数据不存在，也隐藏子样式区域
            this.subStyles.style.display = 'none';
            return;
        }

        let firstStyleSelected = false;
        
        for (let i = 1; i <= themeData.count; i++) {
            const styleItem = document.createElement('div');
            styleItem.className = 'sub-style-item';
            styleItem.dataset.style = `${theme}${i}`;
            
            const img = document.createElement('img');
            img.src = `images/${theme}${i}.png`;
            img.alt = `${themeData.name}样式${i}`;
            img.onerror = () => {
                styleItem.style.display = 'none';
            };
            
            styleItem.appendChild(img);
            styleItem.addEventListener('click', () => this.selectStyle(`${theme}${i}`));
            
            this.subStylesGrid.appendChild(styleItem);
            
            // 默认选择第一个样式
            if (i === 1 && !firstStyleSelected) {
                firstStyleSelected = true;
                // 延迟执行以确保DOM已更新
                setTimeout(() => {
                    this.selectStyle(`${theme}${i}`);
                }, 0);
            }
        }
        
        this.subStyles.style.display = 'block';
    }
    
    selectStyle(style) {
        this.app.currentStyle = style;
        
        // 更新样式按钮状态
        document.querySelectorAll('.sub-style-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedStyle = document.querySelector(`[data-style="${style}"]`);
        if (selectedStyle) {
            selectedStyle.classList.add('active');
        }
        
        this.loadOverlayImage(style);
    }
    
    loadOverlayImage(style) {
        const img = new Image();
        img.onload = () => {
            this.app.overlayImage = img;
            this.app.updatePreview();
            this.app.uiController.showPreviewSection();
            this.app.uiController.showDownloadSection();
        };
        img.onerror = () => {
            console.error(`无法加载覆盖图片: images/${style}.png`);
        };
        img.src = `images/${style}.png`;
    }
    
    triggerCustomThemeSelect() {
        this.customThemeInput.click();
    }
    
    handleCustomThemeSelect(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.app.customOverlayImage = img;
                    this.app.overlayImage = img;
                    this.app.currentTheme = 'custom';
                    this.app.currentStyle = 'custom';
                    
                    // 更新自定义主题的激活状态
                    document.querySelectorAll('.style-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    this.customThemeItem.classList.add('active');
                    
                    // 隐藏子样式区域（自定义主题不需要子样式）
                    this.app.uiController.hideSubStyles();
                    
                    // 更新预览
                    this.updateCustomPreview(e.target.result);
                    this.app.updatePreview();
                    this.app.uiController.showPreviewSection();
                    this.app.uiController.showDownloadSection();
                    this.app.uiController.showOpacityControl();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
    
    updateCustomPreview(imageSrc) {
        if (this.customPreview) {
            // 清空原有内容
            this.customPreview.innerHTML = '';
            
            // 创建图片元素
            const img = document.createElement('img');
            img.src = imageSrc;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '4px';
            
            // 添加图片到预览容器
            this.customPreview.appendChild(img);
            this.customPreview.classList.add('has-image');
        }
    }
}

// 导出类
window.ThemeHandler = ThemeHandler;