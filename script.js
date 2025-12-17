document.addEventListener('DOMContentLoaded', () => {
    // --- Define Default Code Templates ---
    const DEFAULT_HTML = `
<div class="content-box">
  <h1>Welcome to Christmas Log 1.0</h1>
  <p>Happy holiday!</p>
</div>
`.trim();

    const DEFAULT_CSS = `
body {
  background: #282a36;
  color: #f8f8f2;
  font-family: sans-serif;
}
.content-box {
  padding: 20px;
  background: #333;
  border-radius: 5px;
}
`.trim(); 

    const DEFAULT_JS = `
// Tip: To see the Christmas theme in action,
// go to Settings > Appearance and select it!
console.log("AX-Editor v2.0 Initialized.");
`.trim();
    
    
    // Select editor and preview elements
    const htmlEditor = document.getElementById('html-editor');
    const cssEditor = document.getElementById('css-editor');
    const jsEditor = document.getElementById('js-editor');
    const previewWindow = document.getElementById('live-preview');
    const workspaceGrid = document.querySelector('.workspace-grid'); 
    
    // Select buttons and editor groups
    const runButtons = document.querySelectorAll('.run-btn, .nav-item[data-action="run"]');
    const saveButtons = document.querySelectorAll('.save-btn');
    const resetButton = document.querySelector('.nav-item[data-action="reset"]');
    const editors = [htmlEditor, cssEditor, jsEditor];
    const codeInputs = document.querySelectorAll('.code-input');
    
    // --- SETTINGS ELEMENTS ---
    const settingsButton = document.querySelector('.settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalButton = document.querySelector('[data-action="close-settings"]');
    const applyButton = document.querySelector('[data-action="apply-settings"]');
    const themeSelect = document.getElementById('theme-select');
    const fontSizeSelect = document.getElementById('font-size-select');
    const projectNameInput = document.getElementById('project-name-input');
    const penTitleDisplay = document.querySelector('.pen-title');
    const layoutSelect = document.getElementById('layout-select'); 

    // --- FILE OPEN ELEMENTS ---
    const openFileButton = document.getElementById('open-file-btn');
    const fileInput = document.getElementById('file-input');
    
    // --- CORE DEBOUNCE FUNCTION ---
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // --- 1. EDITOR LIVE UPDATE LOGIC ---
    function updatePreview() {
        const html = htmlEditor.value;
        const css = cssEditor.value;
        const js = jsEditor.value;

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${css}</style>
            </head>
            <body>
                ${html}
                <script>${js}<\/script>
            </body>
            </html>
        `;

        try {
            previewWindow.contentDocument.open();
            previewWindow.contentDocument.write(content);
            previewWindow.contentDocument.close();
        } catch (error) {
            console.error('Error writing to preview iframe:', error);
        }
    }
    
    // Wire up editors for debounced live updates
    const debouncedUpdate = debounce(updatePreview, 300); 
    editors.forEach(editor => { editor.addEventListener('input', debouncedUpdate); });
    runButtons.forEach(button => button.addEventListener('click', updatePreview));
    
    // --- 2. RESET FUNCTIONALITY ---
    function resetCode() {
        htmlEditor.value = DEFAULT_HTML; 
        cssEditor.value = DEFAULT_CSS;
        jsEditor.value = DEFAULT_JS;
        updatePreview();
        console.log('Code editors reset to default template.');
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', (e) => {
            e.preventDefault();
            resetCode();
        });
    }

    // --- 3. DOWNLOAD/SAVE FUNCTIONALITY ---
    saveButtons.forEach(button => {
        button.addEventListener('click', () => {
            const htmlContent = htmlEditor.value;
            const cssContent = cssEditor.value;
            const jsContent = jsEditor.value;
            const penTitle = penTitleDisplay.textContent || 'untitled-pen';

            const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${penTitle}</title>
    <style>
${cssContent}
    </style>
</head>
<body>
${htmlContent}
    <script>
${jsContent}
    </script>
</body>
</html>
            `;
            
            const blob = new Blob([fullHtml], { type: 'text/html' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${penTitle.toLowerCase().replace(/\s/g, '-')}.html`; 
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            console.log(`Code saved and downloaded as ${a.download}`);
        });
    });

    // --- 4. FILE OPEN FUNCTIONALITY ---
    openFileButton.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        const fileName = file.name.toLowerCase();
        let targetEditor;

        if (fileName.endsWith('.html')) {
            targetEditor = htmlEditor;
        } else if (fileName.endsWith('.css')) {
            targetEditor = cssEditor;
        } else if (fileName.endsWith('.js')) {
            targetEditor = jsEditor;
        } else {
            alert('Unsupported file type. Please select .html, .css, or .js.');
            fileInput.value = ''; 
            return;
        }

        reader.onload = function(event) {
            targetEditor.value = event.target.result;
            updatePreview();
            fileInput.value = ''; 
        };

        reader.readAsText(file);
    });

    // --- 5. SETTINGS PERSISTENCE (LOAD) ---
    function loadSettings() {
        const savedTheme = localStorage.getItem('editorTheme');
        const savedFontSize = localStorage.getItem('editorFontSize');
        const savedProjectName = localStorage.getItem('projectName');
        const savedLayout = localStorage.getItem('editorLayout');

        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
        }

        if (savedFontSize) {
            codeInputs.forEach(input => {
                input.style.fontSize = savedFontSize;
            });
        }
        
        if (savedProjectName) {
            penTitleDisplay.textContent = savedProjectName;
        }

        if (savedLayout) {
            workspaceGrid.setAttribute('data-layout', savedLayout);
        }
    }
    
    // --- 6. SETTINGS PERSISTENCE (APPLY & SAVE) ---
    function applySettings() {
        const selectedTheme = themeSelect.value;
        const selectedFontSize = fontSizeSelect.value;
        const newProjectName = projectNameInput.value;
        const newLayout = layoutSelect.value;
        
        // Apply to DOM
        document.body.setAttribute('data-theme', selectedTheme);
        codeInputs.forEach(input => {
            input.style.fontSize = selectedFontSize;
        });
        penTitleDisplay.textContent = newProjectName; 
        workspaceGrid.setAttribute('data-layout', newLayout); 

        // Save to localStorage
        localStorage.setItem('editorTheme', selectedTheme);
        localStorage.setItem('editorFontSize', selectedFontSize);
        localStorage.setItem('projectName', newProjectName);
        localStorage.setItem('editorLayout', newLayout); 

        settingsModal.style.display = 'none';
    }

    // --- 7. SETTINGS MODAL HANDLERS ---
    settingsButton?.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
        
        // Populate inputs with current values
        projectNameInput.value = penTitleDisplay.textContent; 
        themeSelect.value = document.body.getAttribute('data-theme') || 'dark';
        const currentFontSize = codeInputs[0]?.style.fontSize || '14px';
        fontSizeSelect.value = currentFontSize;
        layoutSelect.value = workspaceGrid.getAttribute('data-layout') || 'grid';
    });

    closeModalButton?.addEventListener('click', () => { settingsModal.style.display = 'none'; });
    applyButton?.addEventListener('click', applySettings);

    // Close on overlay click
    settingsModal?.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
    
    // --- 8. INITIAL LOAD SEQUENCE ---
    loadSettings();
    updatePreview(); 
});