// DocsFlow Application JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // App State
    let templatesData = [];
    let activeTemplateIndex = null;
    
    // UI Elements
    const docTitleInput = document.getElementById('doc-title');
    const saveStatusDot = document.getElementById('save-status');
    const saveStatusText = saveStatusDot.querySelector('.status-text');
    const btnSave = document.getElementById('btn-save');
    const btnDropdownToggle = document.getElementById('btn-dropdown-toggle');
    const saveDropdownMenu = document.getElementById('save-dropdown-menu');
    const exportHtml = document.getElementById('export-html');
    const exportWord = document.getElementById('export-word');
    const exportPdf = document.getElementById('export-pdf');
    const exportTxt = document.getElementById('export-txt');
    const btnLayoutPage = document.getElementById('btn-layout-page');
    const btnLayoutFluid = document.getElementById('btn-layout-fluid');
    const editorWrapper = document.getElementById('editor-wrapper');
    const editorWorkspace = document.getElementById('editor-workspace-container');
    const templatesListContainer = document.getElementById('templates-list');
    const templateCountBadge = document.getElementById('template-count');

    // Initialize TinyMCE Editor
    tinymce.init({
        selector: '#tinymce-editor',
        license_key: 'gpl', // Required for TinyMCE 7 community edition
        height: '100%',
        menubar: 'file edit view insert format table tools help',
        plugins: 'accordion advlist anchor autolink charmap code codesample directionality emoticons help image importcss insertdatetime link lists media nonbreaking pagebreak preview searchreplace table visualblocks visualchars wordcount template',
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor removeformat | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table template | preview code fullscreen',
        
        // Editor appearance customizations
        branding: false,      // Hide "Powered by TinyMCE"
        promotion: false,     // Hide upgrade promotion button
        elementpath: true,    // Show HTML tags path at the bottom
        statusbar: true,      // Show status bar
        
        // Configure default template settings
        templates: 'templates/templates.json', // Load static templates list directly (works on both local server and GitHub Pages)
        
        // Configure Traditional & Simplified Chinese commonly used fonts
        font_family_formats: 
            '系統預設=System-UI, -apple-system, sans-serif; ' +
            '微軟正黑體="Microsoft JhengHei", "Noto Sans TC", sans-serif; ' +
            '微軟雅黑="Microsoft YaHei", "Noto Sans SC", sans-serif; ' +
            '蘋方-繁="PingFang TC", sans-serif; ' +
            '蘋方-簡="PingFang SC", sans-serif; ' +
            '新細明體="PMingLiU", "MingLiU", serif; ' +
            '標楷體="DFKai-SB", "BiauKai", serif; ' +
            '思源黑體 (繁)="Noto Sans TC", sans-serif; ' +
            '思源宋體 (繁)="Noto Serif TC", serif; ' +
            '思源黑體 (簡)="Noto Sans SC", sans-serif; ' +
            '宋體/新宋體="SimSun", "NSimSun", serif; ' +
            '楷體="KaiTi", serif; ' +
            '仿宋體="FangSong", serif; ' +
            '黑體="SimHei", sans-serif; ' +
            'Arial=arial,helvetica,sans-serif; ' +
            'Times New Roman=times new roman,times,serif; ' +
            'Courier New=courier new,courier,monospace',

        // Content styles inside the editor iframe to make it look like a Word document
        content_style: `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Noto+Serif+TC:wght@400;700&display=swap');
            
            body {
                font-family: 'Inter', 'Noto Sans TC', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 16px;
                line-height: 1.6;
                padding: 40px;
                color: #1e293b;
                max-width: 100%;
                margin: 0 auto;
            }
            h1, h2, h3, h4, h5, h6 {
                color: #0f172a;
                font-weight: 700;
                margin-top: 1.5em;
                margin-bottom: 0.5em;
            }
            p {
                margin-bottom: 1em;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 1.5em;
            }
            table th, table td {
                border: 1px solid #e2e8f0;
                padding: 10px;
            }
            table th {
                background-color: #f8fafc;
                font-weight: 600;
            }
            ul, ol {
                margin-bottom: 1.5em;
                padding-left: 20px;
            }
            blockquote {
                border-left: 4px solid #e2e8f0;
                padding-left: 15px;
                color: #64748b;
                font-style: italic;
                margin: 1.5em 0;
            }
        `,
        setup: (editor) => {
            // Monitor changes to update save status
            editor.on('change keyup', () => {
                updateSaveStatus('unsaved', '尚未儲存');
            });
        }
    });

    // Load templates from API
    fetchTemplates();

    // Event Handlers
    btnSave.addEventListener('click', saveDocument);
    btnLayoutPage.addEventListener('click', () => setEditorLayout('page'));
    btnLayoutFluid.addEventListener('click', () => setEditorLayout('fluid'));

    // Dropdown menu toggle
    btnDropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        saveDropdownMenu.classList.toggle('show');
    });

    // Close dropdown menu when clicking elsewhere
    document.addEventListener('click', () => {
        saveDropdownMenu.classList.remove('show');
    });

    // Format selection action hooks
    exportHtml.addEventListener('click', () => {
        saveDropdownMenu.classList.remove('show');
        saveDocument();
    });

    exportWord.addEventListener('click', () => {
        saveDropdownMenu.classList.remove('show');
        exportDocumentAsWord();
    });

    exportPdf.addEventListener('click', () => {
        saveDropdownMenu.classList.remove('show');
        exportDocumentAsPdf();
    });

    exportTxt.addEventListener('click', () => {
        saveDropdownMenu.classList.remove('show');
        exportDocumentAsTxt();
    });

    // Fetch available templates
    async function fetchTemplates() {
        try {
            // Fetch from static JSON file so it works statically on GitHub Pages as well as locally
            const response = await fetch('templates/templates.json');
            if (!response.ok) throw new Error('無法取得範本列表');
            
            templatesData = await response.json();
            renderTemplatesList(templatesData);
        } catch (error) {
            console.error('Error fetching templates:', error);
            templatesListContainer.innerHTML = `
                <div class="template-error">
                    <p>無法載入範本列表</p>
                    <button onclick="window.location.reload()" class="btn btn-sm">重試</button>
                </div>
            `;
            showToast('錯誤', '載入範本庫失敗，請確認伺服器連線。', 'error');
        }
    }

    // Render template cards in the sidebar
    function renderTemplatesList(templates) {
        templatesListContainer.innerHTML = '';
        templateCountBadge.textContent = templates.length;

        if (templates.length === 0) {
            templatesListContainer.innerHTML = '<p class="text-muted text-center">無可用範本</p>';
            return;
        }

        templates.forEach((tpl, idx) => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.innerHTML = `
                <h4>${tpl.title}</h4>
                <p>${tpl.description || '無詳細描述'}</p>
            `;
            
            card.addEventListener('click', () => {
                loadTemplateIntoEditor(tpl, idx);
            });

            templatesListContainer.appendChild(card);
        });
    }

    // Load selected template content into TinyMCE
    async function loadTemplateIntoEditor(template, index) {
        if (!tinymce.activeEditor) {
            showToast('錯誤', '編輯器尚未初始化完成', 'error');
            return;
        }

        // Highlight selected template card
        const cards = templatesListContainer.querySelectorAll('.template-card');
        cards.forEach((card, idx) => {
            if (idx === index) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        updateSaveStatus('saving', '載入範本中...');

        try {
            let htmlContent = '';
            
            // If template specifies a URL, fetch it. Otherwise load content directly.
            if (template.url) {
                const response = await fetch(template.url);
                if (!response.ok) throw new Error('無法載入範本檔案');
                htmlContent = await response.text();
            } else {
                htmlContent = template.content || '';
            }

            // Set content to TinyMCE
            tinymce.activeEditor.setContent(htmlContent);
            
            // Update document title input
            // Remove "(Weekly Project Report)" tags from the card title for clean editing title
            const cleanTitle = template.title.split(' (')[0];
            docTitleInput.value = `${cleanTitle}_新建`;
            
            activeTemplateIndex = index;
            updateSaveStatus('saved', '範本已套用');
            showToast('範本已套用', `成功載入「${template.title}」`, 'success');
        } catch (error) {
            console.error('Error loading template content:', error);
            updateSaveStatus('unsaved', '範本載入失敗');
            showToast('載入失敗', '載入範本內容時發生錯誤。', 'error');
        }
    }

    // Save document to backend, fallback to download on static environments (like GitHub Pages)
    async function saveDocument() {
        if (!tinymce.activeEditor) return;

        const title = docTitleInput.value.trim() || '未命名';
        const content = tinymce.activeEditor.getContent();

        updateSaveStatus('saving', '儲存中...');
        btnSave.disabled = true;

        // Check if running on GitHub Pages (static environment) or direct file system
        const isStaticHost = window.location.hostname.endsWith('github.io') || 
                             window.location.protocol === 'file:' ||
                             window.location.hostname === '';

        if (isStaticHost) {
            // Trigger direct download
            setTimeout(() => {
                triggerLocalDownload(title, content);
                updateSaveStatus('saved', '已下載存檔');
                btnSave.disabled = false;
            }, 500);
            return;
        }

        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content })
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                updateSaveStatus('saved', '已儲存');
                showToast('儲存成功', `文件已儲存至伺服器: ${result.filename}`, 'success');
            } else {
                throw new Error(result.message || '伺服器儲存失敗');
            }
        } catch (error) {
            console.warn('API Save failed, falling back to local download:', error);
            // Fallback to local download on server error or if API is unavailable
            triggerLocalDownload(title, content);
            updateSaveStatus('saved', '已下載存檔 (API 唯讀)');
        } finally {
            btnSave.disabled = false;
        }
    }

    // Helper to trigger browser download of the document
    function triggerLocalDownload(title, content) {
        try {
            const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, '_')}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('已下載備份', '當前環境不支援伺服器存檔，已自動將文件下載至您的電腦！', 'info');
        } catch (downloadErr) {
            console.error('Download trigger failed:', downloadErr);
            showToast('錯誤', '無法產生下載檔案。', 'error');
        }
    }

    // Export document as Word (.doc) compatible file
    function exportDocumentAsWord() {
        if (!tinymce.activeEditor) return;
        const title = docTitleInput.value.trim() || '未命名';
        const htmlContent = tinymce.activeEditor.getContent();
        
        updateSaveStatus('saving', '匯出 Word 中...');

        try {
            // Word MHTML envelope headers to force Word view to Print Layout and set UTF-8 charset
            const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
                "xmlns:w='urn:schemas-microsoft-com:office:word' " +
                "xmlns='http://www.w3.org/TR/REC-html40'>" +
                "<head><title>" + title + "</title>" +
                "<meta charset='utf-8'>" +
                "<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->" +
                "<style>" +
                "body { font-family: 'Noto Sans TC', sans-serif; }" +
                "</style>" +
                "</head><body>";
            const footer = "</body></html>";
            const sourceHTML = header + htmlContent + footer;
            
            const blob = new Blob(['\ufeff' + sourceHTML], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, '_')}.doc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            updateSaveStatus('saved', '已匯出 Word');
            showToast('匯出成功', `已匯出 Word 文件: ${title}.doc`, 'success');
        } catch (error) {
            console.error('Word export failed:', error);
            updateSaveStatus('unsaved', '匯出失敗');
            showToast('錯誤', '無法產生 Word 檔案。', 'error');
        }
    }

    // Export document as PDF using browser printing layout
    function exportDocumentAsPdf() {
        if (!tinymce.activeEditor) return;
        const title = docTitleInput.value.trim() || '未命名';
        
        updateSaveStatus('saving', '準備列印...');
        
        try {
            // Call TinyMCE printing command (prints iframe content only)
            tinymce.activeEditor.execCommand('mcePrint');
            
            updateSaveStatus('saved', '已叫用列印');
            showToast('列印提示', '請在系統列印對話框中將印表機選為「另存為 PDF」或「Save as PDF」存檔。', 'info');
        } catch (error) {
            console.error('PDF printing failed:', error);
            updateSaveStatus('unsaved', '列印失敗');
            showToast('錯誤', '無法喚起列印對話框。', 'error');
        }
    }

    // Export document as Plain Text (.txt) file
    function exportDocumentAsTxt() {
        if (!tinymce.activeEditor) return;
        const title = docTitleInput.value.trim() || '未命名';
        
        updateSaveStatus('saving', '匯出純文字中...');
        
        try {
            const textContent = tinymce.activeEditor.getContent({ format: 'text' });
            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, '_')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            updateSaveStatus('saved', '已匯出 TXT');
            showToast('匯出成功', `已匯出純文字檔: ${title}.txt`, 'success');
        } catch (error) {
            console.error('TXT export failed:', error);
            updateSaveStatus('unsaved', '匯出失敗');
            showToast('錯誤', '無法產生純文字檔案。', 'error');
        }
    }

    // Update Save Status badge in Header
    function updateSaveStatus(state, text) {
        saveStatusDot.className = 'status-badge';
        saveStatusText.textContent = text;

        if (state === 'saving') {
            saveStatusDot.classList.add('saving');
        } else if (state === 'saved') {
            saveStatusDot.classList.add('saved');
        } else if (state === 'unsaved') {
            saveStatusDot.classList.add('unsaved');
        }
    }

    // Switch Editor Layout Mode
    function setEditorLayout(mode) {
        if (mode === 'page') {
            btnLayoutPage.classList.add('active');
            btnLayoutFluid.classList.remove('active');
            editorWrapper.className = 'editor-wrapper layout-page-view';
            editorWorkspace.classList.remove('fluid');
            showToast('版面切換', '已切換為 A4 模擬頁面模式。', 'info');
        } else if (mode === 'fluid') {
            btnLayoutPage.classList.remove('active');
            btnLayoutFluid.classList.add('active');
            editorWrapper.className = 'editor-wrapper layout-fluid-view';
            editorWorkspace.classList.add('fluid');
            showToast('版面切換', '已切換為全寬度流動編輯模式。', 'info');
        }
    }

    // Toast Notification System (Disabled by user request)
    function showToast(title, message, type = 'info') {
        // Early return to disable all toast notifications
        return;
        
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Pick border accent based on type
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-msg">${message}</div>
            </div>
            <button class="toast-close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        `;

        // Event for closing toast manually
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.style.animation = 'toast-out 0.2s ease forwards';
            setTimeout(() => toast.remove(), 200);
        });

        toastContainer.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'toast-out 0.2s ease forwards';
                setTimeout(() => toast.remove(), 200);
            }
        }, 4000);
    }
});
