// popup.js - 视频转GIF工具的核心逻辑（使用gif.js）

// 获取DOM元素
const videoFileInput = document.getElementById('videoFile');
const fpsInput = document.getElementById('fps');
const qualityInput = document.getElementById('quality');
const widthInput = document.getElementById('width');
const durationInput = document.getElementById('duration');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const errorMsg = document.getElementById('errorMsg');
const loading = document.getElementById('loading');
const preview = document.getElementById('preview');
const previewImage = document.getElementById('previewImage');

let gifUrl = null;
let video = null;
let canvas = null;
let ctx = null;

// 监听文件上传
videoFileInput.addEventListener('change', () => {
    if (videoFileInput.files.length > 0) {
        generateBtn.disabled = false;
        hideError();
    } else {
        generateBtn.disabled = true;
    }
    // 重置下载按钮和预览
    downloadBtn.disabled = true;
    preview.style.display = 'none';
    gifUrl = null;
});

// 生成GIF按钮点击事件
generateBtn.addEventListener('click', async () => {
    if (!videoFileInput.files.length) {
        showError('请先选择视频文件');
        return;
    }
    
    try {
        showLoading();
        hideError();
        
        // 初始化视频和Canvas
        if (!video || !canvas) {
            await initVideoAndCanvas();
        }
        
        // 获取用户设置
        const fps = parseInt(fpsInput.value);
        const quality = parseInt(qualityInput.value);
        const width = parseInt(widthInput.value);
        const duration = parseInt(durationInput.value);
        
        // 生成GIF
        gifUrl = await convertVideoToGif(videoFileInput.files[0], {
            fps,
            quality,
            width,
            duration
        });
        
        // 显示预览和启用下载按钮
        showPreview(gifUrl);
        downloadBtn.disabled = false;
        
    } catch (error) {
        showError('生成GIF失败: ' + error.message);
    } finally {
        hideLoading();
    }
});

// 下载按钮点击事件
downloadBtn.addEventListener('click', () => {
    if (gifUrl) {
        const a = document.createElement('a');
        a.href = gifUrl;
        a.download = 'output.gif';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});

// 初始化视频和Canvas
async function initVideoAndCanvas() {
    // 创建视频元素（不添加到DOM）
    video = document.createElement('video');
    video.autoplay = false;
    video.muted = true;
    video.loop = false;
    
    // 创建Canvas元素（不添加到DOM）
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
}

// 视频转GIF的核心功能（使用gif.js）
async function convertVideoToGif(videoFile, options) {
    const { fps, quality, width, duration } = options;
    
    // 创建GIF编码器
    const gif = new GIF({
        workers: 2,
        quality: quality, // 1-10，10质量最高
        width: width,
        height: Math.round(width * 9 / 16), // 假设16:9的宽高比
        workerScript: 'lib/gif.worker.js'
    });
    
    return new Promise((resolve, reject) => {
        // 设置GIF完成回调
        gif.on('finished', (blob) => {
            resolve(URL.createObjectURL(blob));
        });
        
        // 设置错误回调
        gif.on('abort', () => {
            reject(new Error('GIF生成被中止'));
        });
        
        // 加载视频文件
        video.src = URL.createObjectURL(videoFile);
        
        video.addEventListener('loadedmetadata', () => {
            try {
                // 计算视频的实际高宽比
                const videoWidth = video.videoWidth;
                const videoHeight = video.videoHeight;
                const aspectRatio = videoHeight / videoWidth;
                
                // 设置Canvas大小
                canvas.width = width;
                canvas.height = Math.round(width * aspectRatio);
                
                // 更新GIF的高度
                gif.options.height = canvas.height;
                
                // 计算每一帧的间隔时间
                const frameInterval = 1000 / fps; // 毫秒
                const totalFrames = Math.min(fps * duration, Math.floor(video.duration * fps));
                
                let currentFrame = 0;
                
                // 提取帧并添加到GIF
                function addFrame() {
                    if (currentFrame >= totalFrames || video.currentTime >= duration) {
                        // 所有帧已添加，开始渲染GIF
                        gif.render();
                        return;
                    }
                    
                    try {
                        // 跳到视频的特定时间点
                        video.currentTime = currentFrame / fps;
                        
                        // 等待视频帧准备好
                        setTimeout(() => {
                            // 绘制当前视频帧到Canvas
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            
                            // 添加Canvas帧到GIF
                            gif.addFrame(canvas, { copy: true, delay: frameInterval });
                            
                            currentFrame++;
                            addFrame();
                        }, 50); // 小延迟确保帧已更新
                    } catch (error) {
                        reject(error);
                    }
                }
                
                // 开始播放视频（但保持隐藏）
                video.play().then(() => {
                    addFrame();
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
        
        // 视频加载错误处理
        video.addEventListener('error', () => {
            reject(new Error('视频加载失败'));
        });
    });
}

// 显示预览
function showPreview(url) {
    previewImage.src = url;
    preview.style.display = 'block';
}

// 显示加载状态
function showLoading() {
    loading.style.display = 'block';
    generateBtn.disabled = true;
}

// 隐藏加载状态
function hideLoading() {
    loading.style.display = 'none';
    generateBtn.disabled = false;
}

// 显示错误信息
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
}

// 隐藏错误信息
function hideError() {
    errorMsg.style.display = 'none';
}