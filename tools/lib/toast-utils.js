/**
 * Toast Utility Module
 * 세련된 비차단형 알림 메시지를 제공합니다.
 * (DOM 로딩 시점 문제를 해결한 개선 버전)
 */
(function() {
    // 1. CSS 스타일 동적 주입 (head는 보통 즉시 사용 가능)
    const css = `
        .toast-container {
            position: fixed;
            top: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column-reverse;
            gap: 10px;
            z-index: 10000;
            pointer-events: none;
        }
        .toast-item {
            padding: 12px 20px;
            border-radius: 12px;
            background: #1e293b;
            color: #fff;
            font-size: 0.9rem;
            font-weight: 600;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            animation: toast-in 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
            pointer-events: auto;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 250px;
            max-width: 90vw;
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s;
        }
        .toast-item.success { background: #10b981; border-color: #059669; }
        .toast-item.error { background: #f43f5e; border-color: #e11d48; }
        .toast-item.warning { background: #f59e0b; border-color: #d97706; }
        .toast-item.info { background: #3b82f6; border-color: #2563eb; }
        
        .toast-item.fade-out {
            animation: toast-out 0.3s forwards;
        }
        @keyframes toast-in {
            from { opacity: 0; transform: translateY(-20px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toast-out {
            from { opacity: 1; transform: translateY(0) scale(1); }
            to { opacity: 0; transform: translateY(-10px) scale(0.9); }
        }
    `;
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    /**
     * 토스트 메시지를 화면에 표시합니다.
     * @param {string} message 표시할 메시지
     * @param {string} type 'success', 'error', 'info', 'warning' (기본값: 'info')
     * @param {number} duration 표시 시간 (ms, 기본값: 3000)
     */
    window.showToast = (message, type = 'info', duration = 3000) => {
        // 컨테이너가 없으면 생성 (이 시점에는 반드시 document.body가 존재함)
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast-item ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
        container.appendChild(toast);

        // 자동 제거
        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, duration);
    };
})();
