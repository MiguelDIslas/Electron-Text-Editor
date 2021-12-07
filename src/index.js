const {
  app,
  BrowserWindow,
  ipcMain
} = require('electron');
const {
  dialog,
} = require('electron/main');
const path = require('path');

const fs = require('fs');

require('electron-reload')(__dirname)

const handleError = (error) => {
  dialog.showMessageBox({
    title: "An error occurred",
    message: `${error}`
  });
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow;
let openedFilePath;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'img/sloth.png'),
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, 'render.js'),
      nodeIntegration: true,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Remove menu.
  mainWindow.removeMenu();
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

// Create Document event
ipcMain.on("create-document-triggered", () => {
  dialog.showSaveDialog(mainWindow, {
    filters: [{
      name: "text files",
      extensions: ["txt"]
    }]
  }).then(({
    filePath
  }) => {

    fs.writeFile(filePath, "", (error) => {
      if (error) {
        handleError(error);
      } else {
        openedFilePath = filePath;
        mainWindow.webContents.send("document-created", filePath);
      }
    });
  })
});

// Open Document event
ipcMain.on("open-document-triggered", () => {
  dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{
      name: "text files",
      extensions: ["txt"]
    }]
  }).then(({
    filePaths
  }) => {
    const filePath = filePaths[0];

    fs.readFile(filePath, "utf8", (error, content) => {
      if (error) {
        handleError(error);
      } else {
        openedFilePath = filePath;
        mainWindow.webContents.send("document-opened", {
          filePath,
          content
        });
      }
    })
  })
});

// Save Document event
ipcMain.on("file-content-updated", (_, textareaContent) => {
  fs.writeFile(openedFilePath, textareaContent, (error) => {
    if (error) {
      handleError(error);
    }
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.