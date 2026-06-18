const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#111',
    title: "dB Studio | Professional Audio",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Permite acesso real ao hardware de áudio
    }
  });

  win.loadFile(path.join(__dirname, '../dist/index.html'));
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
