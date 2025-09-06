const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const locations = ['to-do', 'in-progress', 'done'];
const PORT = 5000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// HTML routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'redirect.html'));
});

app.get('/mobile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'mobile.html'));
});

app.get('/desktop', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'desktop.html'));
});

app.post('/delete-task', (req, res) => {
  const { id } = req.body;
  let deleted = false;

  for (const loc of locations) {
    const dirPath = path.join(__dirname, loc);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath);
    const targetFile = files.find(file => file.includes(id));
    if (targetFile) {
      const filePath = path.join(dirPath, targetFile);
      fs.unlinkSync(filePath);
      deleted = true;
      console.log(`🗑️ Deleted task ${id}`);
      break;
    }
  }

  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  if (deleted) {
    res.json({ status: 'deleted' });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// POST /json → Save new task
app.post('/json', (req, res) => {
  try {
    const task = req.body;
    const id = uuidv4();
    task.id = id;

    const dir = path.join(__dirname, task.location || 'to-do');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = `${id}.json`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, JSON.stringify(task, null, 2));

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.json({ status: 'success', id });
    console.log("✅ Task saved:", filename);
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.status(400).json({ error: 'Invalid JSON' });
  }
});

// GET /tasks → Load all tasks
app.get('/tasks', (req, res) => {
  const tasks = [];

  for (const loc of locations) {
    const dirPath = path.join(__dirname, loc);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      try {
        const task = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        task.location = loc;
        tasks.push(task);
      } catch (e) {
        console.error(`❌ Error parsing ${file}:`, e);
      }
    });
  }

  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.json(tasks);
  console.log(`📦 Sent ${tasks.length} tasks`);
});

// POST /update-location → Move task between folders
app.post('/update-location', (req, res) => {
  const { id, location } = req.body;
  let found = false;

  for (const loc of locations) {
    const dirPath = path.join(__dirname, loc);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath);
    const targetFile = files.find(file => file.includes(id));
    if (targetFile) {
      const oldPath = path.join(dirPath, targetFile);
      const task = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
      task.location = location;

      const newDir = path.join(__dirname, location);
      if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });

      const newPath = path.join(newDir, targetFile);
      fs.writeFileSync(newPath, JSON.stringify(task, null, 2));
      fs.unlinkSync(oldPath);

      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
      res.json({ status: 'updated' });
      console.log(`🔄 Moved task ${id} to ${location}`);
      found = true;
      break;
    }
  }

  if (!found) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.status(404).json({ error: 'Task not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Fullstack server running at http://localhost:${PORT}`);
});