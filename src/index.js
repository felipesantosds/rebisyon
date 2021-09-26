const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const path = require('path');
var sqlite3 = require('sqlite3').verbose();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const dbPath = path.resolve(__dirname, 'db/rebisyon.db')
var db = new sqlite3.Database(dbPath);
const tools = require('./js/db.js');

ipcMain.on("requestGetDecks", (event) => {
  tools.getDecks(db, function (err, rows)  {
    mainWindow.webContents.send("receiveGetDecks", rows);
  });
});

ipcMain.on("requestGetCardsNumber", (event, state) => {
  tools.getCardsCount(db, state, function (err, row) {
    mainWindow.webContents.send("receiveGetCardsNumber", state, row);
  });
});

ipcMain.on("requestAddDeck", (event, name) => {
  tools.addDeck(db, name, function () {
    tools.getLastDeckId(db, function (err, rows) {
      mainWindow.send("receiveAddDeck", rows);
    });
  });
});

ipcMain.on("requestRmDeck", (event, id) => {
  tools.rmDeck(db, id, function (err) {
    mainWindow.webContents.send("receiveRmDeck", id);
  });
})
