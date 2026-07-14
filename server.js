require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware to parse JSON
app.use(express.json());

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Self-host TinyMCE by serving it directly from node_modules
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

// API endpoint to get list of document templates
app.get('/api/templates', (req, res) => {
  const templatesPath = path.join(__dirname, 'public', 'templates', 'templates.json');
  
  fs.readFile(templatesPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading templates file:', err);
      // Fallback templates in case the file doesn't exist yet or fails to load
      return res.json([
        {
          title: '預設空白範本 (Default Blank)',
          description: '乾淨的空白文件，適用於自由撰寫。',
          content: '<p>請在此處輸入內容...</p>'
        }
      ]);
    }
    try {
      const templates = JSON.parse(data);
      res.json(templates);
    } catch (parseErr) {
      console.error('Error parsing templates JSON:', parseErr);
      res.status(500).json({ error: 'Failed to parse templates data.' });
    }
  });
});

// Route for saving document (to simulate editing & saving process)
app.post('/api/save', (req, res) => {
  const { title, content } = req.body;
  
  if (!content) {
    return res.status(400).json({ success: false, message: 'Content is required.' });
  }

  console.log(`[Document Save Request] Title: "${title || 'Untitled'}", Content length: ${content.length} chars`);
  
  // Here you would typically save to a database or filesystem.
  // We'll write to a temp directory or just simulate success.
  const saveDir = path.join(__dirname, 'saved_documents');
  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir);
  }
  
  const filename = `${Date.now()}_${(title || 'untitled').replace(/[^a-zA-Z0-9步-龥]/g, '_')}.html`;
  fs.writeFile(path.join(saveDir, filename), content, 'utf8', (err) => {
    if (err) {
      console.error('Failed to save file:', err);
      return res.status(500).json({ success: false, message: 'Server failed to save document.' });
    }
    
    res.json({
      success: true,
      message: '文件已成功儲存到伺服器！',
      filename: filename
    });
  });
});

// Fallback to index.html for SPA routes (if any) or standard viewing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  Word Document Editor Server is running!`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Environment: ${NODE_ENV}`);
  console.log(`  Self-hosted TinyMCE served at: http://localhost:${PORT}/tinymce`);
  console.log(`==================================================`);
});
