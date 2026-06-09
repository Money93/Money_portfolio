document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       1. 太極游標追蹤 (優化：加入防錯機制，避免分頁找不到元件而當掉)
       ========================================================================== */
    const cursor = document.getElementById('cursor');
    if (cursor) {
        // 設定初始隱藏，避免刷新時元件閃爍
        cursor.style.opacity = "1";

        document.addEventListener('mousemove', (e) => {
            // 使用 transform 配合 requestAnimationFrame 或精準座標，防止下游標延遲
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });
        
        document.addEventListener('mousedown', () => cursor.classList.add('click-effect'));
        document.addEventListener('mouseup', () => cursor.classList.remove('click-effect'));
    }

    /* ==========================================================================
       2. 生成式數位編織線條 Canvas 背景 (修正：防範 RWD 高度計算跑版 bug)
       ========================================================================== */
    const canvas = document.getElementById('fluid-bg');
    const mainCanvasContainer = document.getElementById('main-canvas');
    
    if (canvas && mainCanvasContainer) {
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            // 修正點：使用 Math.max 確保在有滾動條與沒有滾動條的分頁，都能抓到最精確的滿版高度
            canvas.height = Math.max(
                mainCanvasContainer.scrollHeight, 
                document.documentElement.clientHeight,
                document.body.scrollHeight
            );
        }
        
        // 初始化畫布尺寸
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // 修正點：防範圖片載入過慢導致 scrollHeight 高度抓錯的 bug
        window.addEventListener('load', resizeCanvas);

        let increment = 0;
        const waveCount = 4; 

        function getGradientStyle(ctx, x1, y1, x2, y2) {
            const grad = ctx.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(0, 'rgba(255, 153, 200, 0.35)');  
            grad.addColorStop(0.5, 'rgba(214, 164, 255, 0.4)'); 
            grad.addColorStop(1, 'rgba(255, 250, 253, 0.05)');
            return grad;
        }

        function animate() {
            // 明亮粉白底色殘影刷洗
            ctx.fillStyle = 'rgba(255, 250, 253, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            increment += 0.0025; 

            for (let i = 0; i < waveCount; i++) {
                ctx.beginPath();
                ctx.lineWidth = 1.0;
                ctx.strokeStyle = getGradientStyle(ctx, 0, canvas.height / 4, canvas.width, (canvas.height / 4) * 3);

                for (let x = 0; x < canvas.width; x += 20) {
                    const wave1 = Math.sin(x * 0.0015 + increment + i * 1.8) * 140;
                    const wave2 = Math.cos(x * 0.0008 - increment * 0.4 + i) * 70;
                    
                    // 修正點：將畫布中心高度動態與當前畫布總高度綁定，避免在極長或極短的頁面中緞帶飛出畫面
                    const centerY = (canvas.height * 0.4) + (i * 60);
                    const y = centerY + wave1 + wave2;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }
            animationFrameId = requestAnimationFrame(animate);
        }
        animate();
    }

    /* ==========================================================================
       3. 滾動偵測漸顯動畫 (優化：自動檢查已在畫面中的元素)
       ========================================================================== */
    const observerOptions = {
        root: null,
        threshold: 0.05, // 調低觸發閾值，讓手機版窄螢幕滑動時更快顯現
        rootMargin: "0px 0px -20px 0px"
    };

    const scrollRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        scrollRevealObserver.observe(el);
        
        // 修正點：如果重新整理網頁時，卡片本來就已經在視窗上半部，直接賦予顯示，防止卡片變透明不見
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
            el.classList.add('is-visible');
        }
    });
/* ==========================================================================
       4. 作品放大燈箱與詳細內文控制核心 (Lightbox Modal)
       ========================================================================== */
    // 建立作品完整內文資料庫
    const projectData = {
        'no-套-no-good': {
            tag: '性健康議題宣導',
            title: '《NO 套 NO GOOD》 & 《要愛要套》',
            images: ['../images/No套No Good.jpg', '../images/要愛要套.jpg'],
            desc: `<p><strong>設計理念：</strong><br>本系列海報旨在打破傳統對於性健康議題的羞恥感與嚴肅教條。透過「大象」與「烏龜」趣味幽默的動物具象化圖面設計，搭配高飽和度的鮮明色塊對比，吸引新世代年輕族群的目光。</p>
                   <p style="margin-top:1rem;"><strong>視覺亮點：</strong><br>圖像中巧妙融合了安全防護的視覺暗示，強調「安全做愛」是對自己與伴侶最基本的體貼與尊重。傳達保險套不單只是避孕與防病的工具，更是健康戀愛關係中，承擔責任與展現愛意的起點。</p>`
        },
        'romanticism': {
            tag: '實體雜誌拼貼剪輯',
            title: '《浪漫消費主義》',
            images: ['../images/浪漫消費主義.jpg'],
            desc: `<p><strong>設計理念：</strong><br>這是一幅帶有批判色彩的實體視覺拼貼作品。設計靈感源自於對當代「節日經濟」與「精緻包裝」的觀察，探討浪漫是如何一步步被商業機制重新標價、定義並商品化的社會現象。</p>
                   <p style="margin-top:1rem;"><strong>創作技法：</strong><br>刻意搜集多本時尚與消費實體雜誌，將其充滿物慾暗示的糖衣廣告符號剪碎，重新拆解並拼湊組合。透過帶有衝突感的構圖，批判大眾逐漸誤以為可以用「物質交換」來等值替代真摯純粹情感的痛點，引發觀者深思價值與價格的本質差異。</p>`
        },
        'health-mascot': {
            tag: '組織美宣實踐周邊',
            title: '衛保吉祥物與文宣周邊設計',
            images: ['./images/poster-health.jpg'],
            desc: `<p><strong>設計理念：</strong><br>為了活化校園衛生保健單位的親民形象，全面操刀設計了全新一代的「衛保義工專屬吉祥物」。使其擺脫以往死板的政令宣導視覺，轉化為具親和力與活力的 IP 符號。</p>
                   <p style="margin-top:1rem;"><strong>周邊實踐與培力：</strong><br>設計成果進一步延伸落實於實體周邊，包含推出「無菸生活，無愛滋偏見」環保帆布提袋，讓核心觀念融入學生的日常穿搭。此外，亦同步籌辦多場美宣社課，親自教授排版與色彩學，全面提升團隊內部義工的視覺報告與美學實踐能力。</p>`
        }
    };

    // 將開啟與關閉函式綁定至全域 window 物件，確保 HTML 中的 onclick 可以順利觸發
    window.openLightbox = function(projectId) {
        const data = projectData[projectId];
        const lightbox = document.getElementById('portfolioLightbox');
        
        // 防錯機制：確保資料與燈箱元件皆存在
        if (!data || !lightbox) return;

        // 填充文字內容
        document.getElementById('lightboxTag').innerText = data.tag;
        document.getElementById('lightboxTitle').innerText = data.title;
        document.getElementById('lightboxDesc').innerHTML = data.desc;

        // 動態生成大圖（自動判斷單張或多張海報並排）
        const mediaContainer = document.getElementById('lightboxMedia');
        if (mediaContainer) {
            mediaContainer.innerHTML = '';
            data.images.forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = data.title;
                img.className = 'lightbox-img';
                mediaContainer.appendChild(img);
            });
        }

        // 啟動燈箱並鎖定底層滾動軸
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeLightbox = function(event) {
        const lightbox = document.getElementById('portfolioLightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // 恢復底層滾動
        }
    };
});