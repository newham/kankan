const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const fs = require('fs');
global.data = []
let inputFile = ""

function createMenu() {
    const template = [
        {
            label: "KanKan",
            submenu: [
                { label: "Quit", accelerator: "CmdOrCtrl+Q", click: function () { app.quit(); } },
                { type: 'separator' },
                { label: "About", click: function () { } },
            ]
        },
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function createWindow() {
    // 创建菜单
    createMenu()
    // 创建窗口
    if (getInputFile() == "") {
        createOpenWindow()
    } else {
        createIndexWindow()
    }
}

function createOpenWindow() {
    // 创建浏览器窗口
    const win = new BrowserWindow({
        title: "kankan-openwin-" + new Date().getTime(),
        titleBarStyle: "hidden",
        resizable: false,
        width: 600,
        // minWidth: 400,
        height: 300,
        // minHeight: 300,
        webPreferences: {
            nodeIntegration: true
        }
    })

    // 绑定数据
    setGlobalData()

    win.loadFile('open.html')

    // 打开开发者工具
    if (process.argv.includes('-t')) {
        win.webContents.openDevTools()
    }
}
function createIndexWindow() {
    // 创建浏览器窗口
    const win = new BrowserWindow({
        title: "kankan-win-" + new Date().getTime(),
        titleBarStyle: "hidden",
        width: 1150,
        minWidth: 400,
        height: 790,
        minHeight: 300,
        webPreferences: {
            nodeIntegration: true
        }
    })

    // 绑定数据
    setGlobalData()

    // 并且为你的应用加载index.html
    win.loadFile('index.html')

    // 打开开发者工具
    if (process.argv.includes('-t')) {
        win.webContents.openDevTools()
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    // if (process.platform !== 'darwin') {
    //     app.quit()
    // }
    // mac也直接退出
    app.quit()
})

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// Attempt to bind file opening #2
app.on('will-finish-launching', () => {

});

// Event fired When someone drags files onto the icon while your app is running
app.on("open-file", (event, file) => {
    inputFile = file
    if (app.isReady()) {
        createWindow()
    }
    event.preventDefault();
});

function getInputFile() {
    if (process.argv.length >= 3 && inputFile == "" && process.argv[2] != '-t') {
        inputFile = process.argv[2]//供测试用
    }
    return inputFile
}

function getPath(file) {
    if (file == "") {
        return ""
    }
    var obj = file.lastIndexOf("/");
    // return file.substr(obj+1);//文件名
    return file.substr(0, obj) //路径
}

function getFileName(file) {
    if (file == "") {
        return ""
    }
    var obj = file.lastIndexOf("/");
    return file.substr(obj + 1);//文件名
}

function getFileType(file) {
    if (file == "") {
        return ""
    }
    var obj = file.lastIndexOf(".");
    return file.substr(obj + 1).toLowerCase();//后缀名
}

function isImg(file) {
    fileType = getFileType(file).toLowerCase()
    switch (fileType) {
        case 'jpg':
        case 'jpeg':
        case 'png':
            return true
        default:
            return false
    }
}

function setGlobalData() {
    global.data.push(getImgs(getFileName(inputFile), getPath(inputFile)))
}

function getImgs(inputFile, folderPath) {
    var imgsData = {
        current: 0,
        imgs: [],
    }
    if (folderPath == "") {
        console.log('输入文件为空');
        return imgsData
    }
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.log('打开文件:' + folderPath + ' 失败');
            return imgsData
        }
        i = 0;
        files.forEach((file) => {
            if (isImg(file)) {
                fileFull = `${folderPath}/${file}`;
                // console.log(fileFull);
                imgsData.imgs.push(fileFull);
                if (inputFile == file) {
                    imgsData.current = i
                    // console.log('current',i);
                }
                i++;
            }
        });
    });
    return imgsData
}

app.openFile = (file) => {

}

ipcMain.on('openImg', (event, file) => {
    fs.open(file, (err) => {
        if (err) {
            console.log('open', file, 'failed')
            event.reply('openImg-cb', 'ERROR\n open ' + file + ' failed')
        } else {
            inputFile = file
            createIndexWindow()
            BrowserWindow.fromId(1).close()
        }
    })
})