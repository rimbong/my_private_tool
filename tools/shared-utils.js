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
        '&#x27;': "'",
        '&#x2F;': '/',
        '&#x60;': '`'
    };

    return html.replace(/&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;|&#x60;/g, function(match) {
        return HTML_ENTITIES[match];
    });
}

function removeCRLFStr(str) {  
    return str.replace(/\\n/g, '').replace(/\\t/g, '').replace(/\\r/g, '')
}

async function copyText(text) {
    if (!navigator.clipboard) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; 
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('Async: Could not copy text: ', err);
    }
}

async function onAlert(spanEl, message = '복사 되었습니다.') {
    if (spanEl) {
        const originalText = spanEl.innerHTML;
        const originalCss = spanEl.style.cssText;
        spanEl.innerHTML = message;
        spanEl.style.cssText = `    
                font-size: 16px;
                color: red;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 10px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);`;
        setTimeout(() => {
            spanEl.innerHTML = originalText;
            spanEl.style.cssText = originalCss;
        }, 2000);
    }
}

async function copyAndAlert(text, spanEl) {
    try {
        await copyText(text);
        await onAlert(spanEl);
    } catch (e) {
        if(spanEl) {
            await onAlert(spanEl, '복사 실패');
        } else {
            alert('복사 실패');
        }
    }
}

function download(filename, text) {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

const modifyDelimiter = (param) => {
    return param.replace(/\\/gi, "/");
};