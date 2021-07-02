const { app, BrowserWindow, ipcMain, Menu, MenuItem, nativeTheme, dialog, screen } = require('electron')
const fs = require('fs');
const { read_i18n } = require('./static/js/lan');
const { isNull } = require('util');
app.allowRendererProcessReuse = true;
// ****** 数据 ******
global.data = [] //存放所有窗口的图片数据，每个窗口相互分离
let support_file_types = ['jpg', 'jpeg', 'png', 'gif', 'ico', 'bmp'] //支持的图片格式
let properties = new Map(); //缓存多语言的键值对

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
                label: Text('open_file'),
                accelerator: "CmdOrCtrl+O",
                click: function() {
                    showOpenFileWin((ok, file) => {
                        if (ok) {
                            // input_file = file
                            // createWindow()
                            let win = BrowserWindow.getFocusedWindow()
                            setImg(file, win.id - 1)
                            win.webContents.send('openImg-cb', 'ok')
                        }
                    })
                }
            }, {
                label: Text('new_window'),
                accelerator: "CmdOrCtrl+N",
                click: function() {
                    newWindow()
                }
            }, ]
        },
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
        //设置dock
    const dockMenu = Menu.buildFromTemplate([{
        label: Text('new_window'), //新窗口
        click() {
            //初始化空窗口
            newWindow()
        }
    }])
    app.dock.setMenu(dockMenu)
}

function newWindow() {
    input_file = ''
    createWindow()
}

function createWindow() {
    // 设置语言
    read_i18n(properties, app.getLocale()).then(() => {
        createMenu() // 创建菜单
        createIndexWindow() // 创建窗口
    })
}

function winCount() {
    return global.data.length
}

function createIndexWindow() {
    let dW = screen.getPrimaryDisplay().workAreaSize.width
    let dH = screen.getPrimaryDisplay().workAreaSize.height
    let w = dW / 2
    let h = dH / 3 * 2
    let w_min = w / 2
    let h_min = h / 2
    let x = (dW - w) / 2
    let y = (dH - h) / 2

    // console.log(dW, dH, w, h, x, y, winCount, X, Y)
    // 创建浏览器窗口

    const win = new BrowserWindow({
        title: '',
        titleBarStyle: "hiddenInset",
        x: parseInt(x + 10 * winCount()),
        y: parseInt(y + 10 * winCount()), //设置偏移
        // transparent:true, //透明度
        // opacity:0.99,
        width: w,
        minWidth: w_min,
        height: h,
        minHeight: h_min,
        webPreferences: {
            nodeIntegration: true
        }
    })

    // 设置要打开的图像
    setImg(getInputFile())

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

    app.quit() // mac也直接退出
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
// 双击打开图片、将图片拖动到dock图标触发，直接创建新窗口
app.on("open-file", (event, file) => {
    if (!isImg(file)) {
        return
    }
    input_file = file //程序还未启动，双击图片打开前，保存输入文件。随后进入正常的启动流程
    if (app.isReady()) { //程序已经启动，新开一个窗口
        createWindow()
    }
    event.preventDefault();
});

let input_file = ''

function getInputFile() {
    if (process.argv.length >= 3 && process.argv[2] != '-t') { //从启动参数中获取
        setImg(process.argv[2])
        process.argv = [] //清除测试用数据
    }
    return input_file
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
    // let fileType = getFileType(file).toLowerCase()
    // return support_file_types.indexOf(fileType) >= 0
    return support_file_types.includes(getFileType(getFileName(file)))
}

function setImg(file, id = -1) {
    // console.log(file, id)
    if (id < 0) {
        global.data.push(getImgs(file))
    } else {
        global.data[id] = getImgs(file)
    }
}

function getImgs(imgFile) {
    let imgsData = {
        current: 0,
        imgs: [],
        isDark: nativeTheme.shouldUseDarkColors, //设置主题模式
    }
    if (imgFile == '') {
        return imgsData
    }
    filename = getFileName(imgFile);
    folderPath = getPath(imgFile);
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
    // console.log('call back from win:', id, file)
    if (file != 'none') {
        if (isImg(file)) {
            setImg(file, id)
            event.reply('openImg-cb', 'ok')
        } else {
            console.log('unsupported img type')
            event.reply('openImg-cb', 'failed')
        }
    } else {
        showOpenFileWin((ok, file) => {
            if (ok) {
                setImg(file, id)
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
            f(false, '')
            return false
        }
        console.log('open', result.filePaths[0])
        f(true, result.filePaths[0])
    }).catch(err => {
        console.log(err)
    })
}

//多语言
var Text = (key) => {
    return properties.get(key)
}

global.Text = Text