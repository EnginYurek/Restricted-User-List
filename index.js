const {app, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path')

let win = null;

function boot(){
  console.log(process.type);
  win = new BrowserWindow({width:1000, height:500});
  win.loadURL(url.format({
    pathname:path.join(__dirname,'index.html'),
    protocol:'file:',
    slashes:true
  }));

//win.webContents.openDevTools();

win.on('closed', () => {
      win = null;
  })
}

//Main and renderer
app.on('ready', boot);

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
