/**
 * 공유 모달 유틸 — 네이티브 confirm()/prompt() 대체
 * confirmModal(message, opts) -> Promise<boolean>
 * promptModal(message, defaultValue, opts) -> Promise<string|null>  (취소 시 null)
 *
 * 의존성 없음. 다크모드는 body.dark 클래스를 따른다(CSS 변수 미사용, 자체 토큰).
 * 스타일/DOM은 최초 1회만 주입.
 */
(function () {
  if (window.confirmModal) {
    return;
  } // 중복 로드 방지

  let injected = false;
  function ensureStyle() {
    if (injected) {
      return;
    }
    injected = true;
    const style = document.createElement('style');
    style.textContent = `
.cm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:99999;opacity:0;transition:opacity .15s ease;}
.cm-overlay.cm-show{opacity:1;}
.cm-box{background:#ffffff;color:#111827;border-radius:.6rem;box-shadow:0 12px 40px rgba(0,0,0,.25);width:min(420px,92vw);padding:1.4rem 1.4rem 1.1rem;transform:translateY(8px) scale(.98);transition:transform .15s ease;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;}
.cm-overlay.cm-show .cm-box{transform:none;}
.cm-msg{font-size:.95rem;line-height:1.55;white-space:pre-wrap;word-break:break-word;margin-bottom:1rem;}
.cm-input{width:100%;box-sizing:border-box;padding:.6rem .7rem;border:1px solid #d1d5db;border-radius:.4rem;font-size:.9rem;margin-bottom:1rem;background:#fff;color:#111827;}
.cm-actions{display:flex;justify-content:flex-end;gap:.6rem;}
.cm-btn{padding:.55rem 1.1rem;border-radius:.4rem;border:1px solid transparent;font-weight:600;font-size:.88rem;cursor:pointer;transition:background-color .15s,border-color .15s;}
.cm-btn-cancel{background:#f3f4f6;color:#374151;border-color:#e5e7eb;}
.cm-btn-cancel:hover{background:#e5e7eb;}
.cm-btn-ok{background:#111827;color:#fff;}
.cm-btn-ok:hover{background:#374151;}
.cm-btn-danger{background:#dc2626;color:#fff;}
.cm-btn-danger:hover{background:#b91c1c;}
body.dark .cm-box{background:#161b22;color:#c9d1d9;box-shadow:0 12px 40px rgba(0,0,0,.6);}
body.dark .cm-input{background:#0d1117;color:#c9d1d9;border-color:#30363d;}
body.dark .cm-btn-cancel{background:#21262d;color:#c9d1d9;border-color:#30363d;}
body.dark .cm-btn-cancel:hover{background:#30363d;}
body.dark .cm-btn-ok{background:#238636;}
body.dark .cm-btn-ok:hover{background:#2ea043;}
`;
    document.head.appendChild(style);
  }

  function build({ message, isPrompt, defaultValue, okText, cancelText, danger }) {
    ensureStyle();
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'cm-overlay';

      const box = document.createElement('div');
      box.className = 'cm-box';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');

      const msg = document.createElement('div');
      msg.className = 'cm-msg';
      msg.textContent = message;
      box.appendChild(msg);

      let input = null;
      if (isPrompt) {
        input = document.createElement('input');
        input.className = 'cm-input';
        input.type = 'text';
        input.value = defaultValue != null ? String(defaultValue) : '';
        box.appendChild(input);
      }

      const actions = document.createElement('div');
      actions.className = 'cm-actions';
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'cm-btn cm-btn-cancel';
      cancelBtn.textContent = cancelText || '취소';
      const okBtn = document.createElement('button');
      okBtn.className = 'cm-btn ' + (danger ? 'cm-btn-danger' : 'cm-btn-ok');
      okBtn.textContent = okText || '확인';
      actions.appendChild(cancelBtn);
      actions.appendChild(okBtn);
      box.appendChild(actions);
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      const prevFocus = document.activeElement;
      let done = false;
      function close(result) {
        if (done) {
          return;
        }
        done = true;
        overlay.classList.remove('cm-show');
        document.removeEventListener('keydown', onKey, true);
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
          // 이 오버레이 제거 후에도 다른 모달이 떠 있으면(연속 confirm→prompt 등)
          // 그 모달의 포커스를 뺏지 않도록 이전-포커스 복원을 건너뛴다.
          if (document.querySelector('.cm-overlay')) {
            return;
          }
          if (prevFocus && prevFocus.focus) {
            try {
              prevFocus.focus();
            } catch (e) {}
          }
        }, 160);
        resolve(result);
      }
      function onOk() {
        close(isPrompt ? (input ? input.value : '') : true);
      }
      function onCancel() {
        close(isPrompt ? null : false);
      }
      function onKey(e) {
        // 한글 등 IME 조합 중의 Enter 는 조합 확정용 → 창을 조기 확정하지 않도록 무시
        if (e.isComposing || e.keyCode === 229) {
          return;
        }
        if (e.key === 'Escape') {
          // 모달이 소비 — 호스트 페이지의 전역 Esc 핸들러(드로어/검색패널/다른 모달)로 전파 금지
          e.preventDefault(); e.stopImmediatePropagation(); onCancel();
        } else if (e.key === 'Enter') {
          // 취소 버튼에 포커스가 있으면 Enter=취소, 아니면 확인 (키보드로 취소 가능하게)
          e.preventDefault(); e.stopImmediatePropagation();
          if (document.activeElement === cancelBtn) {
            onCancel();
          } else {
            onOk();
          }
        } else if (e.key === 'Tab') {
          // 포커스 트랩: 모달 내부(입력/취소/확인)에서만 순환, 뒤 페이지로 빠지지 않게
          const f = [input, cancelBtn, okBtn].filter(Boolean);
          if (!f.length) {
            return;
          }
          e.preventDefault(); e.stopImmediatePropagation();
          let idx = f.indexOf(document.activeElement);
          if (idx === -1) {
            f[e.shiftKey ? f.length - 1 : 0].focus();
            return;
          }
          let next = (idx + (e.shiftKey ? -1 : 1) + f.length) % f.length;
          f[next].focus();
        }
      }
      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      // 모달 안에서 일어난 포인터 이벤트가 document 까지 버블돼 도구의 '바깥 클릭 시 닫기'
      // 핸들러(드로어/패널)를 발동시키는 것을 막는다. (버튼 핸들러는 이미 처리 후이므로 정상 동작)
      overlay.addEventListener('click', e => {
        e.stopPropagation();
      });
      overlay.addEventListener('mouseup', e => {
        e.stopPropagation();
      });
      overlay.addEventListener('mousedown', e => {
        e.stopPropagation();
        if (e.target === overlay) {
          onCancel();
        }
      });
      document.addEventListener('keydown', onKey, true);

      requestAnimationFrame(() => {
        overlay.classList.add('cm-show');
        if (input) {
          input.focus();
          input.select();
        } else {
          okBtn.focus();
        }
      });
    });
  }

  window.confirmModal = function (message, opts) {
    opts = opts || {};
    return build({ message: String(message), isPrompt: false, okText: opts.okText, cancelText: opts.cancelText, danger: opts.danger });
  };
  window.promptModal = function (message, defaultValue, opts) {
    opts = opts || {};
    return build({ message: String(message), isPrompt: true, defaultValue: defaultValue, okText: opts.okText, cancelText: opts.cancelText });
  };
})();
