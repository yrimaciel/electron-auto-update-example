const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

let mainWindow;

autoUpdater.autoDownload = true

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile('index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

setInterval(() => {
  autoUpdater.checkForUpdates()
}, 10000);

app.on('ready', () => {
  createWindow();
  mainWindow.show()
  mainWindow.webContents.openDevTools()
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  log.info("update available")
  console.log('update available')
  window.alert("update available")
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  log.info("update downloaded")
  console.log('update downloaded')
  mainWindow.webContents.send('update_downloaded');
});

autoUpdater.on('download-progress', (obj) => {
  log.info(`Velocidade (mbps): ${obj.bytesPerSecond}`)
  log.info(`Downloaded: ${obj.percent}%`)
})

ipcMain.on("download_app", () => {
  log.info("download app")
  try {
    autoUpdater.downloadUpdate()
  } catch (error) {
    log.error(error)
  }
})

ipcMain.on('restart_app', () => {
  log.info("restart app")
  try {
    autoUpdater.quitAndInstall();
  } catch (error) {
    log.error(error)
  }
});
