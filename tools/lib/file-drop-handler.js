/**
 * Generic File Drag & Drop Handler for Tools
 * Handles images (base64) and text files automatically.
 */
const fileDropHandler = {
  /**
   * Initialize drop zone on an element
   * @param {HTMLElement} target - The element to attach listeners to (e.g., a textarea)
   * @param {Object} options - Configuration and callbacks
   * @param {Function} options.onImage - Called when an image is dropped. Receives (base64, file)
   * @param {Function} options.onText - Called when a text/md file is dropped. Receives (content, file)
   * @param {Function} options.onOther - Called for other file types. Receives (file)
   * @param {string} options.hoverClass - CSS class to toggle on dragover (optional)
   */
  init(target, options = {}) {
    if (!target) {
      return;
    }

    const { onImage, onText, onOther, hoverClass = 'drag-hover' } = options;

    // Prevent default browser behavior (opening the file)
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      target.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    // Visual feedback
    ['dragenter', 'dragover'].forEach(eventName => {
      target.addEventListener(eventName, () => {
        target.classList.add(hoverClass);
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      target.addEventListener(eventName, () => {
        target.classList.remove(hoverClass);
      }, false);
    });

    // Handle the dropped files
    target.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;

      if (files && files.length > 0) {
        Array.from(files).forEach(file => this.handleFile(file, options));
      }
    }, false);
  },

  handleFile(file, options) {
    const { onImage, onText, onOther } = options;

    // 1. Handle Images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (onImage) {
          onImage(e.target.result, file);
        }
      };
      reader.readAsDataURL(file);
    }
    // 2. Handle Text/Markdown
    else if (file.type === 'text/markdown' || file.type === 'text/plain' || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (onText) {
          onText(e.target.result, file);
        }
      };
      reader.readAsText(file);
    }
    // 3. Others
    else {
      if (onOther) {
        onOther(file);
      } else {
        console.log('Dropped file:', file.name, file.type);
      }
    }
  },

  /**
   * Utility to insert text at textarea cursor position
   * @param {HTMLTextAreaElement} textarea 
   * @param {string} text 
   */
  insertAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    
    textarea.value = val.substring(0, start) + text + val.substring(end);
    
    // Set cursor position after inserted text
    const newPos = start + text.length;
    textarea.selectionStart = textarea.selectionEnd = newPos;
    textarea.focus();
    
    // Trigger 'input' event for auto-save/preview
    textarea.dispatchEvent(new Event('input'));
  }
};
