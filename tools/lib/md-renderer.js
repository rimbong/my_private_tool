/**
 * Integrated Markdown Renderer & Theme Component
 * Handles: Markdown rendering (marked.js + highlight.js), 
 * Dynamic CSS injection, and Theme management.
 */
const mdRenderer = {
  theme: 'light',
  config: {
    storageKey: 'portal-theme',   // 포털 테마와 단일 키 사용(이중화 제거)
    onThemeChange: null // (mode) => {}
  },

  /**
   * Initialize styles and theme
   * @param {Object} customConfig 
   */
  init(customConfig = {}) {
    this.config = { ...this.config, ...customConfig };

    // 1. Setup marked.js (if available)
    if (typeof marked !== 'undefined') {
      this._setupMarked();
    }

    // 2. Inject CSS Links dynamically
    this._ensureStyles();

    // 3. Load and Apply initial theme
    const savedTheme = localStorage.getItem(this.config.storageKey);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    this.applyTheme(initialTheme);
  },

  _setupMarked() {
    const renderer = {
      code(token) {
        const code = token.text || '';
        const lang = token.lang || '';
        if (typeof hljs !== 'undefined') {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          const highlighted = hljs.highlight(code, { language }).value;
          return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
        }
        return `<pre><code>${code}</code></pre>`;
      }
    };
    marked.use({ renderer });
    marked.setOptions({ breaks: true, gfm: true });   // headerIds/mangle 은 marked v5+에서 제거됨
  },

  /**
   * Dynamically inject required CSS files if not present
   */
  _ensureStyles() {
    this._createLink('md-renderer-style', ''); // Will be updated by applyTheme
    this._createLink('md-renderer-highlight', '');
  },

  _createLink(id, href) {
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      if (href) link.href = href;
      document.head.appendChild(link);
    }
  },

  /**
   * Apply Light/Dark theme
   * @param {string} mode - 'light' | 'dark'
   */
  applyTheme(mode) {
    this.theme = mode;
    const isDark = mode === 'dark';

    // 1. Update CSS Hrefs
    const mdStyle = document.getElementById('md-renderer-style');
    const hljsStyle = document.getElementById('md-renderer-highlight');

    if (mdStyle) {
      mdStyle.href = isDark ? 'lib/github-markdown-dark.min.css' : 'lib/github-markdown-light.min.css';
    }
    if (hljsStyle) {
      hljsStyle.href = isDark ? 'lib/github-highlight-dark.min.css' : 'lib/github-highlight.min.css';
    }

    // 2. Update data-color-mode for markdown-body elements
    document.querySelectorAll('.markdown-body').forEach(el => {
      el.setAttribute('data-color-mode', mode);
    });

    // 3. Save & Notify
    localStorage.setItem(this.config.storageKey, mode);
    if (this.config.onThemeChange) {
      this.config.onThemeChange(mode);
    }
  },

  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  },

  render(text) {
    if (typeof marked === 'undefined') return text;
    const html = marked.parse(text);
    // 신뢰할 수 없는 .md(열기/드롭) 안의 raw HTML(XSS, 예: <img onerror>, <svg onload>) 차단
    if (typeof DOMPurify !== 'undefined' && DOMPurify.sanitize) {
      return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    }
    console.warn('DOMPurify 미로딩 — 마크다운 HTML이 정화되지 않았습니다.');
    return html;
  }
};

// Initialize if marked is loaded
if (typeof marked !== 'undefined') {
  mdRenderer.init();
}
