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
    if (!navigator.clipboard) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
        return;
    }
    await navigator.clipboard.writeText(text);
}

/**
 * 특정 엘리먼트에 알림 클래스를 추가했다가 제거합니다.
 */
function onAlert(el, text) {
    return new Promise((resolve) => {
        const originalText = el.innerText;
        if (text) el.innerText = text;
        el.classList.add('alert');
        setTimeout(() => {
            el.classList.remove('alert');
            if (text) el.innerText = originalText;
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
