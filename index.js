// run electron app with:
// npm start
// build native executables with:
// npx electron-packager . --all

const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  //win.loadFile(path.join(__dirname, 'gui', 'index.html')) // Assuming the GUI files are in a folder called gui
  win.loadFile(path.join(__dirname, 'gui', 'index.html'))
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
}) 
