// 应用初始化脚本
// 等待DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    window.avatarMaker = new AvatarMaker();
    
    // 绑定覆盖风主题项的点击事件
    document.querySelectorAll('.style-item[data-theme]').forEach(item => {
        item.addEventListener('click', function() {
            const theme = this.dataset.theme;
            if (theme && window.avatarMaker.themeHandler) {
                window.avatarMaker.themeHandler.selectTheme(theme);
            }
        });
    });
});