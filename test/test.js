document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       1. 自訂極簡滑鼠游標邏輯 (Custom Cursor)
       ========================================================================== */
    const cursor = document.getElementById('cursor');
    
    if (cursor) {
        // 追蹤滑鼠位置
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });

        // 點擊滑鼠時的彈性液化動畫
        document.addEventListener('mousedown', () => {
            cursor.classList.add('click-effect');
        });

        document.addEventListener('mouseup', () => {
            cursor.classList.remove('click-effect');
        });
    }

    /* ==========================================================================
       2. 視窗滾動時：動態渐变色彩背景 shift 效果
       ========================================================================== */
    const mainCanvas = document.getElementById('main-canvas');
    
    if (mainCanvas) {
        window.addEventListener('scroll', () => {
            // 計算當前滾動百分比 (0 到 1 之間)
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
            
            // 隨滾動流暢地進行色彩補間插值
            if (scrollPercent < 0.5) {
                const currentPercent = scrollPercent * 200; // 映射成百分比
                mainCanvas.style.background = `linear-gradient(135deg, #fce4ec 0%, #f4e6f6 ${currentPercent}%, #fff0f4 100%)`;
            } else {
                const currentPercent = (scrollPercent - 0.5) * 200;
                mainCanvas.style.background = `linear-gradient(135deg, #f4e6f6 0%, #fff0f4 ${currentPercent}%, #fce4ec 100%)`;
            }
        });
    }

    /* ==========================================================================
       3. 現代網頁標準：交叉觀測器 (Intersection Observer) 滾動漸顯動畫
       ========================================================================== */
    const observerOptions = {
        root: null,         // 使用瀏覽器視窗作為基礎
        threshold: 0.15,    // 當元件露出 15% 時觸發
        rootMargin: "0px 0px -50px 0px" // 稍微提早或延遲觸發，創造更舒服的體感
    };

    const scrollRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 當元素進入畫面，加上可見的樣式類別
                entry.target.classList.add('is-visible');
                // 觸發後即取消觀測，避免重複消耗效能
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 抓取所有標記為需要滾動漸顯的卡片與元件
    const elementsToReveal = document.querySelectorAll('.reveal-on-scroll');
    elementsToReveal.forEach(element => {
        scrollRevealObserver.observe(element);
    });
});