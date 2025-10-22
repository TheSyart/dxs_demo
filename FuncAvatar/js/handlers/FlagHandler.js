// 国旗风处理模块
class FlagHandler {
    constructor(avatarMaker) {
        this.app = avatarMaker;
        this.selectedFlag = null;
        this.selectedFlagStyle = 'original'; // 默认原样
        this.selectedPosition = 'top-left'; // 默认左上角
        this.selectedCropMode = 'center'; // 默认居中截取
        this.flagImage = null;
        this.flagFlyImage = null;
        this.initElements();
        this.bindEvents();
        this.initFlagList();
    }
    
    initElements() {
        this.flagControls = document.getElementById('flagControls');
        this.flagGrid = document.getElementById('flagGrid');
        this.flagStyleSelection = document.getElementById('flagStyleSelection');
        this.flagPositionSelection = document.getElementById('flagPositionSelection');
    }
    
    bindEvents() {
        // 绑定国旗选择事件
        document.addEventListener('click', (e) => {
            const flagItem = e.target.closest('.flag-item');
            if (flagItem) {
                // 移除其他选中状态
                document.querySelectorAll('.flag-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // 添加选中状态
                flagItem.classList.add('active');
                
                // 保存选中的国旗
                this.selectedFlag = flagItem.dataset.flag;
                
                // 显示样式和位置选择
                this.showFlagOptions();
                
                // 加载国旗图片
                this.loadFlagImages();
                
                // 更新预览
                this.app.updatePreview();
            }
            
            // 绑定国旗样式选择事件
            const flagStyleItem = e.target.closest('.flag-style-item');
            if (flagStyleItem) {
                // 移除其他选中状态
                document.querySelectorAll('.flag-style-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // 添加选中状态
                flagStyleItem.classList.add('active');
                
                // 保存选中的样式
                this.selectedFlagStyle = flagStyleItem.dataset.flagStyle;
                
                // 更新预览
                this.app.updatePreview();
            }
            
            // 绑定国旗位置选择事件
            const flagPositionItem = e.target.closest('.flag-position-item');
            if (flagPositionItem) {
                // 移除其他选中状态
                document.querySelectorAll('.flag-position-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // 添加选中状态
                flagPositionItem.classList.add('active');
                
                // 保存选中的位置
                this.selectedPosition = flagPositionItem.dataset.flagPosition;
                
                // 更新预览
                this.app.updatePreview();
            }
        });
        

    }
    
    // 初始化国旗列表
    initFlagList() {
        if (!this.flagGrid) return;
        
        const flags = this.getFlagList();
        let flagHTML = '';
        
        flags.forEach(flag => {
            flagHTML += `
                <div class="flag-item" data-flag="${flag.code}" data-crop-mode="${flag.cropMode}">
                    <div class="flag-preview">
                        <img src="flag/${flag.code}.png" alt="${flag.name}" onerror="this.style.display='none'">
                    </div>
                    <span class="flag-name">${flag.name}</span>
                </div>
            `;
        });
        
        this.flagGrid.innerHTML = flagHTML;
        
        // 绑定国旗选择事件
        this.flagGrid.addEventListener('click', (e) => {
            const flagItem = e.target.closest('.flag-item');
            if (flagItem) {
                // 移除其他选中状态
                this.flagGrid.querySelectorAll('.flag-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // 添加选中状态
                flagItem.classList.add('selected');
                
                // 保存选中的国旗
                this.selectedFlag = flagItem.dataset.flag;
                
                // 保存选中国旗的截取模式
                this.selectedCropMode = flagItem.dataset.cropMode;
                
                // 显示样式和位置选择
                this.showFlagOptions();
                
                // 更新预览
                this.app.updatePreview();
            }
        });
    }
    
    // 获取国旗列表
    getFlagList() {
        return [
            // 亚洲国家
            { code: 'cn', name: '中国', cropMode: 'center' },
            { code: 'jp', name: '日本', cropMode: 'center' },
            { code: 'kr', name: '韩国', cropMode: 'center' },
            { code: 'kp', name: '朝鲜', cropMode: 'center' },
            { code: 'in', name: '印度', cropMode: 'left' },
            { code: 'th', name: '泰国', cropMode: 'left' },
            { code: 'vn', name: '越南', cropMode: 'center' },
            { code: 'sg', name: '新加坡', cropMode: 'left' },
            { code: 'my', name: '马来西亚', cropMode: 'left' },
            { code: 'id', name: '印度尼西亚', cropMode: 'left' },
            { code: 'ph', name: '菲律宾', cropMode: 'left' },
            { code: 'mm', name: '缅甸', cropMode: 'left' },
            { code: 'kh', name: '柬埔寨', cropMode: 'left' },
            { code: 'la', name: '老挝', cropMode: 'left' },
            { code: 'bn', name: '文莱', cropMode: 'left' },
            { code: 'tw', name: '中国台湾', cropMode: 'center' },
            { code: 'hk', name: '中国香港', cropMode: 'center' },
            { code: 'mo', name: '中国澳门', cropMode: 'center' },
            { code: 'mn', name: '蒙古', cropMode: 'left' },
            { code: 'af', name: '阿富汗', cropMode: 'left' },
            { code: 'pk', name: '巴基斯坦', cropMode: 'left' },
            { code: 'bd', name: '孟加拉国', cropMode: 'left' },
            { code: 'lk', name: '斯里兰卡', cropMode: 'left' },
            { code: 'np', name: '尼泊尔', cropMode: 'center' },
            { code: 'bt', name: '不丹', cropMode: 'left' },
            { code: 'mv', name: '马尔代夫', cropMode: 'left' },
            { code: 'ir', name: '伊朗', cropMode: 'left' },
            { code: 'iq', name: '伊拉克', cropMode: 'left' },
            { code: 'sy', name: '叙利亚', cropMode: 'left' },
            { code: 'lb', name: '黎巴嫩', cropMode: 'left' },
            { code: 'jo', name: '约旦', cropMode: 'left' },
            { code: 'il', name: '以色列', cropMode: 'left' },
            { code: 'ps', name: '巴勒斯坦', cropMode: 'left' },
            { code: 'sa', name: '沙特阿拉伯', cropMode: 'left' },
            { code: 'ae', name: '阿联酋', cropMode: 'left' },
            { code: 'qa', name: '卡塔尔', cropMode: 'left' },
            { code: 'kw', name: '科威特', cropMode: 'left' },
            { code: 'bh', name: '巴林', cropMode: 'left' },
            { code: 'om', name: '阿曼', cropMode: 'left' },
            { code: 'ye', name: '也门', cropMode: 'left' },
            { code: 'tr', name: '土耳其', cropMode: 'center' },
            { code: 'cy', name: '塞浦路斯', cropMode: 'left' },
            { code: 'ge', name: '格鲁吉亚', cropMode: 'left' },
            { code: 'am', name: '亚美尼亚', cropMode: 'left' },
            { code: 'az', name: '阿塞拜疆', cropMode: 'left' },
            { code: 'kz', name: '哈萨克斯坦', cropMode: 'left' },
            { code: 'kg', name: '吉尔吉斯斯坦', cropMode: 'center' },
            { code: 'tj', name: '塔吉克斯坦', cropMode: 'left' },
            { code: 'tm', name: '土库曼斯坦', cropMode: 'left' },
            { code: 'uz', name: '乌兹别克斯坦', cropMode: 'left' },

            // 欧洲国家
            { code: 'gb', name: '英国', cropMode: 'center' },
            { code: 'fr', name: '法国', cropMode: 'left' },
            { code: 'de', name: '德国', cropMode: 'center' },
            { code: 'it', name: '意大利', cropMode: 'left' },
            { code: 'es', name: '西班牙', cropMode: 'center' },
            { code: 'pt', name: '葡萄牙', cropMode: 'center' },
            { code: 'nl', name: '荷兰', cropMode: 'left' },
            { code: 'be', name: '比利时', cropMode: 'left' },
            { code: 'ch', name: '瑞士', cropMode: 'center' },
            { code: 'at', name: '奥地利', cropMode: 'left' },
            { code: 'se', name: '瑞典', cropMode: 'left' },
            { code: 'no', name: '挪威', cropMode: 'left' },
            { code: 'dk', name: '丹麦', cropMode: 'left' },
            { code: 'fi', name: '芬兰', cropMode: 'center' },
            { code: 'is', name: '冰岛', cropMode: 'left' },
            { code: 'ie', name: '爱尔兰', cropMode: 'left' },
            { code: 'lu', name: '卢森堡', cropMode: 'left' },
            { code: 'mc', name: '摩纳哥', cropMode: 'left' },
            { code: 'ad', name: '安道尔', cropMode: 'left' },
            { code: 'sm', name: '圣马力诺', cropMode: 'left' },
            { code: 'va', name: '梵蒂冈', cropMode: 'left' },
            { code: 'mt', name: '马耳他', cropMode: 'left' },
            { code: 'li', name: '列支敦士登', cropMode: 'left' },
            { code: 'ru', name: '俄罗斯', cropMode: 'left' },
            { code: 'ua', name: '乌克兰', cropMode: 'left' },
            { code: 'by', name: '白俄罗斯', cropMode: 'left' },
            { code: 'md', name: '摩尔多瓦', cropMode: 'left' },
            { code: 'ro', name: '罗马尼亚', cropMode: 'left' },
            { code: 'bg', name: '保加利亚', cropMode: 'left' },
            { code: 'gr', name: '希腊', cropMode: 'left' },
            { code: 'mk', name: '北马其顿', cropMode: 'left' },
            { code: 'al', name: '阿尔巴尼亚', cropMode: 'center' },
            { code: 'me', name: '黑山', cropMode: 'left' },
            { code: 'rs', name: '塞尔维亚', cropMode: 'left' },
            { code: 'ba', name: '波黑', cropMode: 'left' },
            { code: 'hr', name: '克罗地亚', cropMode: 'left' },
            { code: 'si', name: '斯洛文尼亚', cropMode: 'left' },
            { code: 'hu', name: '匈牙利', cropMode: 'left' },
            { code: 'sk', name: '斯洛伐克', cropMode: 'left' },
            { code: 'cz', name: '捷克', cropMode: 'left' },
            { code: 'pl', name: '波兰', cropMode: 'left' },
            { code: 'lt', name: '立陶宛', cropMode: 'left' },
            { code: 'lv', name: '拉脱维亚', cropMode: 'left' },
            { code: 'ee', name: '爱沙尼亚', cropMode: 'left' },

            // 北美洲国家
            { code: 'us', name: '美国', cropMode: 'center' },
            { code: 'ca', name: '加拿大', cropMode: 'center' },
            { code: 'mx', name: '墨西哥', cropMode: 'center' },
            { code: 'gt', name: '危地马拉', cropMode: 'left' },
            { code: 'bz', name: '伯利兹', cropMode: 'left' },
            { code: 'sv', name: '萨尔瓦多', cropMode: 'left' },
            { code: 'hn', name: '洪都拉斯', cropMode: 'left' },
            { code: 'ni', name: '尼加拉瓜', cropMode: 'left' },
            { code: 'cr', name: '哥斯达黎加', cropMode: 'left' },
            { code: 'pa', name: '巴拿马', cropMode: 'left' },
            { code: 'cu', name: '古巴', cropMode: 'left' },
            { code: 'jm', name: '牙买加', cropMode: 'left' },
            { code: 'ht', name: '海地', cropMode: 'left' },
            { code: 'do', name: '多米尼加', cropMode: 'left' },
            { code: 'bb', name: '巴巴多斯', cropMode: 'left' },
            { code: 'tt', name: '特立尼达和多巴哥', cropMode: 'center' },
            { code: 'gd', name: '格林纳达', cropMode: 'left' },
            { code: 'vc', name: '圣文森特和格林纳丁斯', cropMode: 'left' },
            { code: 'lc', name: '圣卢西亚', cropMode: 'left' },
            { code: 'dm', name: '多米尼克', cropMode: 'left' },
            { code: 'ag', name: '安提瓜和巴布达', cropMode: 'left' },
            { code: 'kn', name: '圣基茨和尼维斯', cropMode: 'left' },
            { code: 'bs', name: '巴哈马', cropMode: 'left' },

            // 南美洲国家
            { code: 'br', name: '巴西', cropMode: 'center' },
            { code: 'ar', name: '阿根廷', cropMode: 'left' },
            { code: 'cl', name: '智利', cropMode: 'left' },
            { code: 'pe', name: '秘鲁', cropMode: 'left' },
            { code: 'co', name: '哥伦比亚', cropMode: 'left' },
            { code: 've', name: '委内瑞拉', cropMode: 'left' },
            { code: 'ec', name: '厄瓜多尔', cropMode: 'left' },
            { code: 'bo', name: '玻利维亚', cropMode: 'left' },
            { code: 'py', name: '巴拉圭', cropMode: 'left' },
            { code: 'uy', name: '乌拉圭', cropMode: 'left' },
            { code: 'gy', name: '圭亚那', cropMode: 'left' },
            { code: 'sr', name: '苏里南', cropMode: 'left' },

            // 非洲国家
            { code: 'eg', name: '埃及', cropMode: 'left' },
            { code: 'ly', name: '利比亚', cropMode: 'left' },
            { code: 'tn', name: '突尼斯', cropMode: 'center' },
            { code: 'dz', name: '阿尔及利亚', cropMode: 'left' },
            { code: 'ma', name: '摩洛哥', cropMode: 'center' },
            { code: 'sd', name: '苏丹', cropMode: 'left' },
            { code: 'ss', name: '南苏丹', cropMode: 'left' },
            { code: 'et', name: '埃塞俄比亚', cropMode: 'left' },
            { code: 'er', name: '厄立特里亚', cropMode: 'left' },
            { code: 'dj', name: '吉布提', cropMode: 'left' },
            { code: 'so', name: '索马里', cropMode: 'left' },
            { code: 'ke', name: '肯尼亚', cropMode: 'left' },
            { code: 'ug', name: '乌干达', cropMode: 'left' },
            { code: 'tz', name: '坦桑尼亚', cropMode: 'left' },
            { code: 'rw', name: '卢旺达', cropMode: 'left' },
            { code: 'bi', name: '布隆迪', cropMode: 'center' },
            { code: 'mw', name: '马拉维', cropMode: 'left' },
            { code: 'zm', name: '赞比亚', cropMode: 'left' },
            { code: 'zw', name: '津巴布韦', cropMode: 'left' },
            { code: 'bw', name: '博茨瓦纳', cropMode: 'left' },
            { code: 'na', name: '纳米比亚', cropMode: 'left' },
            { code: 'za', name: '南非', cropMode: 'left' },
            { code: 'ls', name: '莱索托', cropMode: 'left' },
            { code: 'sz', name: '斯威士兰', cropMode: 'left' },
            { code: 'mz', name: '莫桑比克', cropMode: 'left' },
            { code: 'mg', name: '马达加斯加', cropMode: 'left' },
            { code: 'mu', name: '毛里求斯', cropMode: 'left' },
            { code: 'sc', name: '塞舌尔', cropMode: 'left' },
            { code: 'km', name: '科摩罗', cropMode: 'left' },
            { code: 'ao', name: '安哥拉', cropMode: 'left' },
            { code: 'cd', name: '刚果(金)', cropMode: 'left' },
            { code: 'cg', name: '刚果(布)', cropMode: 'left' },
            { code: 'cf', name: '中非', cropMode: 'left' },
            { code: 'td', name: '乍得', cropMode: 'left' },
            { code: 'cm', name: '喀麦隆', cropMode: 'left' },
            { code: 'gq', name: '赤道几内亚', cropMode: 'left' },
            { code: 'ga', name: '加蓬', cropMode: 'left' },
            { code: 'st', name: '圣多美和普林西比', cropMode: 'left' },
            { code: 'cv', name: '佛得角', cropMode: 'left' },
            { code: 'gw', name: '几内亚比绍', cropMode: 'left' },
            { code: 'gn', name: '几内亚', cropMode: 'left' },
            { code: 'sl', name: '塞拉利昂', cropMode: 'left' },
            { code: 'lr', name: '利比里亚', cropMode: 'left' },
            { code: 'ci', name: '科特迪瓦', cropMode: 'left' },
            { code: 'gh', name: '加纳', cropMode: 'left' },
            { code: 'tg', name: '多哥', cropMode: 'left' },
            { code: 'bj', name: '贝宁', cropMode: 'left' },
            { code: 'ng', name: '尼日利亚', cropMode: 'left' },
            { code: 'ne', name: '尼日尔', cropMode: 'left' },
            { code: 'bf', name: '布基纳法索', cropMode: 'left' },
            { code: 'ml', name: '马里', cropMode: 'left' },
            { code: 'sn', name: '塞内加尔', cropMode: 'left' },
            { code: 'gm', name: '冈比亚', cropMode: 'left' },
            { code: 'mr', name: '毛里塔尼亚', cropMode: 'left' },

            // 大洋洲国家
            { code: 'au', name: '澳大利亚', cropMode: 'left' },
            { code: 'nz', name: '新西兰', cropMode: 'left' },
            { code: 'fj', name: '斐济', cropMode: 'left' },
            { code: 'pg', name: '巴布亚新几内亚', cropMode: 'left' },
            { code: 'sb', name: '所罗门群岛', cropMode: 'left' },
            { code: 'vu', name: '瓦努阿图', cropMode: 'left' },
            { code: 'nc', name: '新喀里多尼亚', cropMode: 'left' },
            { code: 'pf', name: '法属波利尼西亚', cropMode: 'left' },
            { code: 'ws', name: '萨摩亚', cropMode: 'left' },
            { code: 'to', name: '汤加', cropMode: 'left' },
            { code: 'ki', name: '基里巴斯', cropMode: 'left' },
            { code: 'tv', name: '图瓦卢', cropMode: 'left' },
            { code: 'nr', name: '瑙鲁', cropMode: 'center' },
            { code: 'pw', name: '帕劳', cropMode: 'left' },
            { code: 'fm', name: '密克罗尼西亚', cropMode: 'left' },
            { code: 'mh', name: '马绍尔群岛', cropMode: 'left' },

            // 其他地区和特殊行政区
            { code: 'gb-eng', name: '英格兰', cropMode: 'center' },
            { code: 'gb-sct', name: '苏格兰', cropMode: 'center' },
            { code: 'gb-wls', name: '威尔士', cropMode: 'center' },
            { code: 'gb-nir', name: '北爱尔兰', cropMode: 'center' },
            { code: 'xk', name: '科索沃', cropMode: 'left' },
            { code: 'eh', name: '西撒哈拉', cropMode: 'left' },
            { code: 'tl', name: '东帝汶', cropMode: 'left' }
        ];
    }
    
    // 显示国旗选项
    showFlagOptions() {
        if (this.flagStyleSelection) {
            this.flagStyleSelection.style.display = 'block';
            
            // 保持当前选中的样式状态
            this.updateStyleSelection();
        }
        
        if (this.flagPositionSelection) {
            this.flagPositionSelection.style.display = 'block';
            
            // 保持当前选中的位置状态
            this.updatePositionSelection();
        }
    }
    
    // 更新样式选择状态
    updateStyleSelection() {
        if (!this.flagStyleSelection) return;
        
        // 移除所有选中状态
        this.flagStyleSelection.querySelectorAll('.flag-style-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 根据当前选中的样式添加active类
        const currentStyleItem = this.flagStyleSelection.querySelector(`[data-flag-style="${this.selectedFlagStyle}"]`);
        if (currentStyleItem) {
            currentStyleItem.classList.add('active');
        }
    }
    
    // 更新位置选择状态
    updatePositionSelection() {
        if (!this.flagPositionSelection) return;
        
        // 移除所有选中状态
        this.flagPositionSelection.querySelectorAll('.flag-position-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 根据当前选中的位置添加active类
        const currentPositionItem = this.flagPositionSelection.querySelector(`[data-flag-position="${this.selectedPosition}"]`);
        if (currentPositionItem) {
            currentPositionItem.classList.add('active');
        }
    }
    
    // 加载国旗图片
    loadFlagImages() {
        if (!this.selectedFlag) return;
        
        // 加载原始国旗图片
        this.flagImage = new Image();
        this.flagImage.crossOrigin = 'anonymous';
        this.flagImage.onload = () => {
            this.app.updatePreview();
        };
        this.flagImage.src = `flag/${this.selectedFlag}.png`;
        
        // 加载飘动国旗图片
        this.flagFlyImage = new Image();
        this.flagFlyImage.crossOrigin = 'anonymous';
        this.flagFlyImage.onload = () => {
            this.app.updatePreview();
        };
        this.flagFlyImage.src = `flag-fly/${this.selectedFlag}.png`;
    }
    
    selectFlagStyle() {
        this.app.currentTheme = 'flag';
        this.app.currentStyle = 'flag';
        
        // 更新主题按钮状态
        document.querySelectorAll('.style-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const flagTheme = document.querySelector('[data-theme="flag"]');
        if (flagTheme) {
            flagTheme.classList.add('active');
        }
        
        // 显示国旗风控制
        this.showFlagControls();
        
        // 隐藏其他控制
        this.app.uiController.hideSubStyles();
        this.app.uiController.hideOpacityControl();
        this.app.pixelHandler.hidePixelControls();
        
        // 更新预览
        this.app.updatePreview();
        this.app.uiController.showPreviewSection();
        this.app.uiController.showDownloadSection();
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
    
    applyFlagEffect(canvas, ctx) {
        if (this.app.currentTheme !== 'flag' || !this.selectedFlag) return;
        
        const image = this.selectedFlagStyle === 'flying' ? this.flagFlyImage : this.flagImage;
        if (!image || !image.complete) return;
        
        switch (this.selectedFlagStyle) {
            case 'original':
                this.applyOriginalStyle(canvas, ctx, image);
                break;
            case 'flying':
                this.applyFlyingStyle(canvas, ctx, image);
                break;
            case 'circle':
                this.applyCircleStyle(canvas, ctx, image);
                break;
        }
    }
    
    // 计算国旗位置的统一方法
    calculateFlagPosition(canvas, flagWidth, flagHeight, margin = 15) {
        let x, y;
        
        switch (this.selectedPosition) {
            case 'top-left':
                x = margin;
                y = margin;
                break;
            case 'top-right':
                x = canvas.width - flagWidth - margin;
                y = margin;
                break;
            case 'bottom-left':
                x = margin;
                y = canvas.height - flagHeight - margin;
                break;
            case 'bottom-right':
                x = canvas.width - flagWidth - margin;
                y = canvas.height - flagHeight - margin;
                break;
            default:
                x = margin;
                y = margin;
        }
        
        return { x, y };
    }
    
    applyOriginalStyle(canvas, ctx, flagImage) {
        // 原样：将flag内图片在头像图片上展示，根据选择位置变化
        const flagSize = Math.min(canvas.width, canvas.height) * 0.3; // 国旗大小为画布的30%
        const flagHeight = flagSize * (flagImage.height / flagImage.width); // 实际国旗高度
        const margin = 15; // 统一边距
        const position = this.calculateFlagPosition(canvas, flagSize, flagHeight, margin);
        
        ctx.drawImage(flagImage, position.x, position.y, flagSize, flagHeight);
    }
    
    applyFlyingStyle(canvas, ctx, flagImage) {
        // 飘动：加载flag-fly下选择国旗的同名图片按位置展示
        const flagSize = Math.min(canvas.width, canvas.height) * 0.3; // 与原样保持一致的大小
        const flagHeight = flagSize * (flagImage.height / flagImage.width); // 实际国旗高度
        const margin = 15; // 统一边距
        const position = this.calculateFlagPosition(canvas, flagSize, flagHeight, margin);
        
        ctx.drawImage(flagImage, position.x, position.y, flagSize, flagHeight);
    }
    
    applyCircleStyle(canvas, ctx, flagImage) {
        // 圆形：根据位置选择在对应角落按圆形截取国旗展示，周围十像素为白色，原头像等比例缩小8%
        const cornerRadius = 40; // 圆形半径（从30增加到40）
        const whiteMargin = 10; // 白色边距
        const totalRadius = cornerRadius + whiteMargin;
        
        // 先缩小原头像8%
        const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // 清空画布并填充白色背景
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 创建临时画布来处理缩小的图像
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(originalImageData, 0, 0);
        
        // 绘制缩小8%的原图像
        const scaledSize = 0.90; // 缩小8%
        const offset = (1 - scaledSize) / 2;
        const scaledWidth = canvas.width * scaledSize;
        const scaledHeight = canvas.height * scaledSize;
        const offsetX = canvas.width * offset;
        const offsetY = canvas.height * offset;
        
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height, 
                     offsetX, offsetY, scaledWidth, scaledHeight);
        
        // 根据选择的位置确定圆形国旗的位置
        let circlePosition;
        switch (this.selectedPosition) {
            case 'top-left':
                circlePosition = { x: totalRadius, y: totalRadius };
                break;
            case 'top-right':
                circlePosition = { x: canvas.width - totalRadius, y: totalRadius };
                break;
            case 'bottom-left':
                circlePosition = { x: totalRadius, y: canvas.height - totalRadius };
                break;
            case 'bottom-right':
                circlePosition = { x: canvas.width - totalRadius, y: canvas.height - totalRadius };
                break;
            default:
                circlePosition = { x: totalRadius, y: totalRadius }; // 默认左上角
        }
        
        // 绘制白色圆形背景
        ctx.save();
        ctx.beginPath();
        ctx.arc(circlePosition.x, circlePosition.y, totalRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // 绘制国旗圆形
        ctx.beginPath();
        ctx.arc(circlePosition.x, circlePosition.y, cornerRadius, 0, 2 * Math.PI);
        ctx.clip();
        
        // 计算国旗图片的截取位置（不拉伸，原样截取）
        const flagSize = cornerRadius * 2;
        const flagAspectRatio = flagImage.width / flagImage.height;
        
        let sourceX, sourceY, sourceWidth, sourceHeight;
        
        if (flagAspectRatio > 1) {
            // 国旗宽度大于高度，以高度为准
            sourceHeight = flagImage.height;
            sourceWidth = sourceHeight; // 截取正方形区域
            
            // 根据截取模式确定水平位置
            switch (this.selectedCropMode) {
                case 'left':
                    sourceX = 0;
                    break;
                case 'right':
                    sourceX = flagImage.width - sourceWidth;
                    break;
                case 'center':
                default:
                    sourceX = (flagImage.width - sourceWidth) / 2;
                    break;
            }
            sourceY = 0;
        } else {
            // 国旗高度大于等于宽度，以宽度为准
            sourceWidth = flagImage.width;
            sourceHeight = sourceWidth; // 截取正方形区域
            sourceX = 0;
            
            // 根据截取模式确定垂直位置
            switch (this.selectedCropMode) {
                case 'left': // 对于垂直方向，left表示顶部
                    sourceY = 0;
                    break;
                case 'right': // 对于垂直方向，right表示底部
                    sourceY = flagImage.height - sourceHeight;
                    break;
                case 'center':
                default:
                    sourceY = (flagImage.height - sourceHeight) / 2;
                    break;
            }
        }
        
        // 绘制国旗图片（原样截取，不拉伸）
        const flagX = circlePosition.x - cornerRadius;
        const flagY = circlePosition.y - cornerRadius;
        
        ctx.drawImage(flagImage, 
                     sourceX, sourceY, sourceWidth, sourceHeight,
                     flagX, flagY, flagSize, flagSize);
        
        ctx.restore();
    }
    
    createFlagGradient(ctx, width, height) {
        // 创建中国国旗色彩渐变
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#ff0000');    // 红色
        gradient.addColorStop(0.3, '#ff4444');  // 浅红色
        gradient.addColorStop(0.7, '#cc0000');  // 深红色
        gradient.addColorStop(1, '#990000');    // 更深红色
        
        return gradient;
    }
    
    createCustomFlagGradient(ctx, width, height, colors) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        
        if (colors && colors.length > 0) {
            const step = 1 / (colors.length - 1);
            colors.forEach((color, index) => {
                gradient.addColorStop(index * step, color);
            });
        } else {
            // 默认渐变
            gradient.addColorStop(0, '#ff0000');
            gradient.addColorStop(1, '#990000');
        }
        
        return gradient;
    }
    
    // 预设的国旗色彩方案
    getFlagColorSchemes() {
        return {
            china: ['#ff0000', '#cc0000'],
            usa: ['#ff0000', '#ffffff', '#0000ff'],
            france: ['#0055a4', '#ffffff', '#ef4135'],
            germany: ['#000000', '#ff0000', '#ffcc00'],
            japan: ['#ffffff', '#bc002d'],
            uk: ['#012169', '#ffffff', '#c8102e'],
            rainbow: ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0080ff', '#8000ff']
        };
    }
    
    applyFlagColorScheme(scheme) {
        const schemes = this.getFlagColorSchemes();
        if (schemes[scheme]) {
            this.currentFlagColors = schemes[scheme];
            this.app.updatePreview();
        }
    }
}

// 导出类
window.FlagHandler = FlagHandler;