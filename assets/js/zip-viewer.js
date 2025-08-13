let currentImageUrl = null;

// 显示ZIP文件中的图像
async function displayZIP(zipUrl) {
    try {
        // 获取ZIP文件
        const response = await fetch(zipUrl);
        if (!response.ok) {
            throw new Error(`下载ZIP文件失败，状态码: ${response.status}`);
        }
        const blob = await response.blob();
        
        // 解压ZIP文件
        const zip = await JSZip.loadAsync(blob);
        // 获取所有图像文件
        const imageFiles = [];
        zip.forEach((relativePath, file) => {
            if (!file.dir && (/\.(jpg|jpeg|png|webp)$/i).test(file.name)) {
                imageFiles.push(file);
            }
        });
        
        // 按文件名进行自然排序 (e.g., page_2.jpg before page_10.jpg)
        imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        // 存储页面数据
        currentComic.pages = imageFiles;
        // 设置总页数
        totalPages = imageFiles.length;
        // 显示第一张图像
        if (totalPages > 0) {
            currentPage = 1;
            await displayImage(imageFiles[0]);
        } else {
            alert('ZIP文件中没有找到支持的图像格式 (jpg, jpeg, png, webp)');
        }
    } catch (error) {
        console.error('处理ZIP文件错误:', error);
        alert('无法处理ZIP文件。这可能是因为文件链接已失效或文件已损坏。');
    }
}

// 显示图像
async function displayImage(imageFile) {
    if (!imageFile) return;
    try {
        // 释放之前的URL以节省内存
        if (currentImageUrl) {
            URL.revokeObjectURL(currentImageUrl);
        }
        
        // 获取图像数据
        const imageData = await imageFile.async('blob');
        const imageUrl = URL.createObjectURL(imageData);
        currentImageUrl = imageUrl;
        
        // 设置图像源
        const image = document.getElementById('comic-image');
        if (!image) return;
        
        image.src = imageUrl;
        image.style.transform = `scale(1) rotate(0deg)`; // 重置变换，交由 updateComicDisplay 处理

        // 预加载下一张图片
        preloadNextImage();
    } catch (error) {
        console.error('显示图像错误:', error);
    }
}

// 预加载下一张图片
function preloadNextImage() {
    if (!currentComic || !currentComic.pages || currentPage >= totalPages) return;
    
    const nextImageFile = currentComic.pages[currentPage]; // currentPage 是下一页的索引（从1开始）
    if (!nextImageFile) return;
    
    // 异步预加载
    nextImageFile.async('blob').then(blob => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.src = url;
        // 浏览器加载后会自动缓存，稍后可以安全释放
        img.onload = () => URL.revokeObjectURL(url);
        img.onerror = () => URL.revokeObjectURL(url);
    }).catch(err => console.error("预加载失败:", err));
}