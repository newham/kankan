const { app, BrowserWindow, ipcMain, Menu, MenuItem, nativeTheme, dialog, screen } = require('electron')
const fs = require('fs');
const { read_i18n } = require('./static/js/lan');
const { isNull } = require('util');
// ****** 数据 ******
global.data = [] //存放所有窗口数据
let inputFile = "" //保存打开文件
let winCount = 0 //窗口计数,用于多窗口偏移
let support_file_types = ['jpg', 'jpeg', 'png', 'gif', 'ico', 'bmp'] //支持的图片格式
let properties = new Map(); //多语言

function createMenu() {
    var template = [{
            label: "KanKan",
            submenu: [
                { label: Text('exit'), accelerator: "Esc", click: function() { app.quit() } },
                { type: 'separator' },
                {
                    label: Text('about'),
                    click: function() {
                        app.showAboutPanel()
                    }
                },
            ]
        },
        {
            label: Text('file'),
            submenu: [{
                label: Text('open'),
                accelerator: "CmdOrCtrl+N",
                click: function() {
                    showOpenFileWin((ok) => {
                        if (ok) {
                            createWindow()
                        }
                    })
                }
            }, ]
        },
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
        //设置dock
    const dockMenu = Menu.buildFromTemplate([{
        label: Text('new_window'),
        click() {
            //初始化空窗口
            inputFile = ""
            createWindow()
        }
    }])
    app.dock.setMenu(dockMenu)
}

function createWindow() {
    // 设置语言
    read_i18n(properties, app.getLocale()).then(() => {
        createMenu() // 创建菜单
        createIndexWindow() // 创建窗口
    })

}

function createIndexWindow() {
    dW = screen.getPrimaryDisplay().workAreaSize.width
    dH = screen.getPrimaryDisplay().workAreaSize.height
    w = 1150
    h = 790
    x = (dW - w) / 2
    y = (dH - h) / 2
        // console.log(dW, dH, w, h, x, y, winCount, X, Y)
        // 创建浏览器窗口
    const win = new BrowserWindow({
        title: getFileName(getInputFile()),
        titleBarStyle: "hiddenInset",
        x: parseInt(x + 10 * winCount),
        y: parseInt(y + 10 * winCount), //设置偏移
        // transparent:true, //透明度
        // opacity:0.99,
        width: w,
        minWidth: 650,
        height: h,
        minHeight: 450,
        webPreferences: {
            nodeIntegration: true
        }
    })
    winCount += 1

    // 设置dock展示的文件名

    // 绑定数据
    setGlobalData()

    // 加载index.html
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
        inputFile = process.argv[2] //供测试用
        process.argv = [] //清除测试用数据
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
    return file.substr(obj + 1); //文件名
}

function getFileType(file) {
    if (file == "") {
        return ""
    }
    var obj = file.lastIndexOf(".");
    return file.substr(obj + 1).toLowerCase(); //后缀名
}

function isImg(file) {
    let fileType = getFileType(file).toLowerCase()
    return support_file_types.indexOf(fileType) >= 0
}

function setGlobalData() {
    global.data.push(getImgs(getInputFile()))
}

function resetGlobalData(id, file) {
    if (!isNull(file)) {
        inputFile = file
    }
    global.data[id] = getImgs(getInputFile())
}

function getImgs(imgFile) {
    filename = getFileName(imgFile)
    folderPath = getPath(imgFile)
    var imgsData = {
        current: 0,
        imgs: [],
        isDark: nativeTheme.shouldUseDarkColors, //设置主题模式
    }
    console.log("isDark:", imgsData.isDark)
    if (folderPath == "") {
        console.log('empty img');
        return imgsData
    }
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.log('open file:' + folderPath + ' failed');
            return imgsData
        }
        i = 0;
        files.forEach((file) => {
            if (isImg(file)) {
                fileFull = `${folderPath}/${file}`;
                // console.log(fileFull);
                imgsData.imgs.push(fileFull);
                if (filename == file) {
                    imgsData.current = i
                        // console.log('current',i);
                }
                i++;
            }
        });
    });
    return imgsData
}

//打开图片后操作
ipcMain.on('openImg', (event, id, file) => {
    console.log('call back from win:', id, file)
    if (file != 'none') {
        if (support_file_types.includes(getFileType(getFileName(file)))) {
            resetGlobalData(id, file)
            event.reply('openImg-cb', 'ok')
        } else {
            console.log('unsupported img type')
        }
    } else {
        showOpenFileWin((ok) => {
            if (ok) {
                resetGlobalData(id)
                event.reply('openImg-cb', 'ok')
            } else {
                event.reply('openImg-cb', 'failed')
            }
        })
    }

})

//切换暗-亮模式触发
nativeTheme.on('updated', () => {
    isDark = nativeTheme.shouldUseDarkColors
    BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send('themeChanged', isDark)
    })
})

function showOpenFileWin(f) {
    dialog.showOpenDialog({
        title: Text('open_file'),
        defaultPath: "",
        properties: ['openFile'],
        filters: [
            { name: 'Img', extensions: support_file_types },
        ]
    }).then(result => {
        if (result.filePaths.length < 1) {
            console.log('open win closed')
            f(false)
            return false
        }
        console.log('open', result.filePaths[0])
            // ipcRenderer.send('openImg', result.filePaths[0])
        inputFile = result.filePaths[0]
            // 调用f
        f(true)
    }).catch(err => {
        alert(err)
    })
}

//多语言
var Text = (key) => {
    return properties.get(key)
}

global.Text = Text