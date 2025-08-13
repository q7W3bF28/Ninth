let pdfDoc = null;

// 显示PDF文件
async function displayPDF(pdfUrl) {
    try {
        // 配置PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        // 加载PDF文档
        const loadingTask = pdfjsLib.getDocument({
            url: pdfUrl,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
            cMapPacked: true
        });
        pdfDoc = await loadingTask.promise;
        
        // 获取总页数
        totalPages = pdfDoc.numPages;
        // 显示第一页
        await displayPage(1);
    } catch (error) {
        console.error('加载PDF错误:', error);
        alert('无法加载PDF文件。这可能是因为文件链接已失效或网络问题。');
    }
}

// 显示当前PDF页面（当缩放或旋转时调用）
async function displayCurrentPDFPage() {
    if (pdfDoc) {
        await displayPage(currentPage);
    }
}

// 渲染指定页码
async function displayPage(pageNumber) {
    if (!pdfDoc || pageNumber < 1 || pageNumber > pdfDoc.numPages) return;
    try {
        // 获取页面
        const page = await pdfDoc.getPage(pageNumber);
        // 设置视口和缩放
        const viewport = page.getViewport({ scale: 1.5 }); // 使用固定比例获取，之后用CSS transform缩放
        // 获取canvas
        const canvas = document.getElementById('pdf-canvas');
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        // 设置canvas尺寸
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        // 渲染页面
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        await page.render(renderContext).promise;
    } catch (error) {
        console.error(`渲染PDF第 ${pageNumber} 页错误:`, error);
    }
}