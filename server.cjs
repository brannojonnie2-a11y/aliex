const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

app.use(cors());
app.use(express.json());

// Initialize sessions file
if (!fs.existsSync(SESSIONS_FILE)) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}));
}

// Get all sessions
app.get('/api/sessions', (req, res) => {
  try {
    const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    const now = Date.now();
    
    // Filter out stale sessions (>30 seconds old)
    const activeSessions = {};
    Object.entries(sessions).forEach(([id, data]) => {
      if (now - data.lastSeen < 30000) {
        activeSessions[id] = data;
      }
    });
    
    // Update file with active sessions only
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(activeSessions, null, 2));
    
    res.json(activeSessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update session
app.post('/api/sessions/:id', (req, res) => {
  try {
    const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    sessions[req.params.id] = {
      ...req.body,
      lastSeen: Date.now()
    };
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete session
app.delete('/api/sessions/:id', (req, res) => {
  try {
    const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    delete sessions[req.params.id];
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get action for a session
app.get('/api/actions/:id', (req, res) => {
  try {
    const actionsFile = path.join(__dirname, 'actions.json');
    if (!fs.existsSync(actionsFile)) {
      fs.writeFileSync(actionsFile, JSON.stringify({}));
    }
    const actions = JSON.parse(fs.readFileSync(actionsFile, 'utf8'));
    res.json({ action: actions[req.params.id] || 'normal' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set action for a session
app.post('/api/actions/:id', (req, res) => {
  try {
    const actionsFile = path.join(__dirname, 'actions.json');
    if (!fs.existsSync(actionsFile)) {
      fs.writeFileSync(actionsFile, JSON.stringify({}));
    }
    const actions = JSON.parse(fs.readFileSync(actionsFile, 'utf8'));
    actions[req.params.id] = req.body.action;
    fs.writeFileSync(actionsFile, JSON.stringify(actions, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inputs for a session
app.get('/api/inputs/:id', (req, res) => {
  try {
    const inputsFile = path.join(__dirname, 'inputs.json');
    if (!fs.existsSync(inputsFile)) {
      fs.writeFileSync(inputsFile, JSON.stringify({}));
    }
    const inputs = JSON.parse(fs.readFileSync(inputsFile, 'utf8'));
    res.json(inputs[req.params.id] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set inputs for a session
app.post('/api/inputs/:id', (req, res) => {
  try {
    const inputsFile = path.join(__dirname, 'inputs.json');
    if (!fs.existsSync(inputsFile)) {
      fs.writeFileSync(inputsFile, JSON.stringify({}));
    }
    const inputs = JSON.parse(fs.readFileSync(inputsFile, 'utf8'));
    inputs[req.params.id] = req.body;
    fs.writeFileSync(inputsFile, JSON.stringify(inputs, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Session server running on port ${PORT}`);
});
