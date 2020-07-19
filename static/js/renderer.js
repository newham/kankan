const { ipcRenderer } = require('electron')

function openFileWin(file = 'none') {
    ipcRenderer.send('openImg', index, file)
}

ipcRenderer.on('openImg-cb', (event, msg) => {
    console.log("open", msg)
    if (msg == 'ok') {
        //set open file null
        showTitleBar(true)
        showOpenFile(false)
            //set img
        setGlobalData()
        setCurrentImg()
            // 监听拖拽、放大
        startDrag(document.getElementById("img"), document.getElementById("img"))
    }
})

ipcRenderer.on('themeChanged', (event, msg) => {
    console.log("themeChanged: isDark", msg)
    setTheme(msg)
})