const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800,
    backgroundColor: '#111',
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  win.loadFile(path.join(__dirname, '../dist/index.html'));
  win.setMenuBarVisibility(false);
}
app.whenReady().then(createWindow);
