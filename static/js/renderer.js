const { ipcRenderer } = require('electron')

function openFileWin() {
    ipcRenderer.send('openImg', '')
}

ipcRenderer.on('openImg-cb', (event, msg) => {
    console.log("open", msg)
    if (msg == 'ok') {
        setGlobalData()
        setCurrentImg()
        showTitleBar(true)
        showOpenFile(false)
    }
})

ipcRenderer.on('themeChanged', (event, msg) => {
    console.log("themeChanged: isDark", msg)
    setTheme(msg)
})