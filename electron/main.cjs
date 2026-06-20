const { app, BrowserWindow, session } = require('electron');
const path = require('path');

// Garante que só exista uma instância do dB Studio rodando
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  function createWindow() {
    // Cria a janela principal (estilo DAW profissional)
    const mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 1024,
      minHeight: 600,
      backgroundColor: '#111111',
      title: 'dB Studio | Professional Audio Engine',
      autoHideMenuBar: true, // Esconde a barra de menu (estilo Reaper)
      webPreferences: {
        // Permite que o dB Studio acesse o hardware de áudio real
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false, // Necessário para carregar arquivos locais (file://)
        // IMPORTANTE: Permite acesso ao microfone e hardware de áudio
        enableBlinkFeatures: 'AudioCapture',
        // Permite WebGL (útil para visualizações)
        webgl: true
      }
    });

    // === MODO DESENVOLVIMENTO vs PRODUÇÃO ===
    const isDev = !app.isPackaged;
    
    if (isDev) {
      // Durante o desenvolvimento, carrega do Vite
      mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    } else {
      // Na versão .exe final, carrega do build do Vite
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // === PERMISSÕES DE HARDWARE (CRÍTICO PARA ÁUDIO) ===
    // Permite acesso ao microfone sem perguntar toda hora
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      const allowedPermissions = [
        'media',           // Acesso ao microfone
        'mediaKeySystem',  // Acesso a sistema de mídia
        'geolocation',     // Localização (se necessário)
        'notifications',   // Notificações
        'fullscreen'       // Tela cheia
      ];
      
      if (allowedPermissions.includes(permission)) {
        callback(true);
      } else {
        callback(false);
      }
    });

    // === JANELA EM TELA CHEIA ===
    mainWindow.on('enter-full-screen', () => {
      mainWindow.setMenuBarVisibility(false);
    });

    // === FECHAMENTO ===
    mainWindow.on('closed', () => {
      app.quit();
    });
  }

  // Inicia quando o Electron estiver pronto
  app.whenReady().then(createWindow);

  // macOS: Recria a janela quando clicar no ícone do dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Windows/Linux: Fecha quando todas as janelas forem fechadas
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
