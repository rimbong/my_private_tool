/**
 * Portal Theme Module
 * 포털 전역 라이트/다크 모드를 관리합니다.
 * - localStorage('portal-theme')로 상태를 영구 저장 (동일 출처 공유)
 * - 부모(tool.html) <-> iframe(개별 도구) 간 postMessage로 실시간 동기화
 * - body 에 'dark' 클래스를 토글하므로, 각 도구는 CSS 변수 오버라이드(body.dark { ... })만 정의하면 됩니다.
 */
(function () {
  const KEY = 'portal-theme';

  function getStored() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function store(mode) {
    try {
      localStorage.setItem(KEY, mode);
    } catch (e) { /* ignore */ }
  }

  function apply(mode) {
    const isDark = mode === 'dark';
    const run = () => document.body && document.body.classList.toggle('dark', isDark);
    if (document.body) {
      run();
    } else {
      document.addEventListener('DOMContentLoaded', run);
    }
  }

  function resolveInitial() {
    const saved = getStored();
    if (saved) {
      return saved;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  const portalTheme = {
    get() {
      return getStored() || resolveInitial();
    },
    set(mode, { broadcast = true } = {}) {
      store(mode);
      apply(mode);
      if (broadcast) {
        this.broadcast(mode);
      }
      if (typeof this.onChange === 'function') {
        this.onChange(mode);
      }
    },
    toggle() {
      this.set(this.get() === 'dark' ? 'light' : 'dark');
    },
    apply,
    onChange: null,
    /**
     * 다른 컨텍스트(부모/자식 프레임)로 테마 변경을 알립니다.
     */
    broadcast(mode) {
      const msg = { type: 'portal-theme', mode };
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(msg, '*');
        }
      } catch (e) { /* ignore */ }
      try {
        const frame = document.getElementById('tool-frame');
        if (frame && frame.contentWindow) {
          frame.contentWindow.postMessage(msg, '*');
        }
      } catch (e) { /* ignore */ }
    }
  };

  // 외부에서 들어오는 테마 변경 메시지 수신 (부모->자식, 자식->부모)
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'portal-theme' && e.data.mode) {
      store(e.data.mode);
      apply(e.data.mode);
      if (typeof portalTheme.onChange === 'function') {
        portalTheme.onChange(e.data.mode);
      }
    }
  });

  // 초기 적용
  apply(resolveInitial());

  window.portalTheme = portalTheme;
})();
