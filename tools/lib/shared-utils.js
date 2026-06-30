/**
 * 공통 유틸리티 함수 모음
 */

/**
 * HTML 특수 문자를 언이스케이프합니다.
 */
function unescapeHTML(html) {
    if (html == null) {
        html = "";
    }

    if (typeof (html) != "string") {
        return html;
    }

    var HTML_ENTITIES = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&#x2F;': '/',
        '&#x60;': '`',
        '&#x3D;': '='
    };

    return html.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;|&#x60;|&#x3D;/g, function (match) {
        return HTML_ENTITIES[match];
    });
}

/**
 * 텍스트를 클립보드에 복사합니다.
 */
async function copyText(text) {
    // 보안 컨텍스트에서만 Clipboard API 사용. file://·권한 거부 시 reject되므로 try 후 execCommand로 폴백.
    if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(text); return; }
        catch (err) { /* execCommand 폴백으로 진행 */ }
    }
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(textArea);
    if (!ok) {
      throw new Error('클립보드 복사에 실패했습니다.');
    }   // 호출부 catch에서 에러 토스트 표시
}

/**
 * 특정 엘리먼트에 알림 클래스를 추가했다가 제거합니다.
 */
function onAlert(el, text) {
    return new Promise((resolve) => {
        const originalText = el.innerText;
        if (text) {
          el.innerText = text;
        }
        el.classList.add('alert');
        setTimeout(() => {
            el.classList.remove('alert');
            if (text) {
              el.innerText = originalText;
            }
            resolve();
        }, 1000);
    });
}

/**
 * 복사 후 토스트 메시지와 엘리먼트 애니메이션을 함께 보여줍니다.
 */
async function copyAndAlert(text, spanEl) {
    try {
        await copyText(text);
        if (typeof showToast === 'function') {
            showToast('클립보드에 복사되었습니다.', 'success');
        }
        if (spanEl) {
            await onAlert(spanEl);
        }
    } catch (err) {
        if (typeof showToast === 'function') {
            showToast('복사에 실패했습니다.', 'error');
        } else if (spanEl) {
            await onAlert(spanEl, '복사 실패');
        } else {
            alert('복사 실패');
        }
    }
}

/**
 * 텍스트 파일로 다운로드합니다.
 */
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

const modifyDelimiter = (param) => {
    return param.replace(/\\/gi, "/");
};
