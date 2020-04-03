const { Menu, MenuItem } = remote
const { clipboard } = require('electron') //剪切板
const nativeImage = require('electron').nativeImage
const exec = require('child_process').exec

function setWallpaper() {
    if (isImgNull()) {
        alert("没有打开任何图片")
        return false
    }
    document.getElementById('btn-wallpaper').disabled = true
    var imgPath = getCurrentImg()
    console.log('set wallpaper:', imgPath)
    workerProcess = exec("osascript -e 'tell application \"Finder\" to set desktop picture to POSIX file \"" + imgPath + "\"'")
    // 打印日志
    workerProcess.on('exit', (data) => {
        console.log('exit: ' + data);
        if (data == '0') {
            alert('设置壁纸成功!')
        } else {
            alert('设置壁纸失败!\n - 请检查图片路径或者访问权限')
        }
        document.getElementById('btn-wallpaper').disabled = false
    })
    // 打印错误的后台可执行程序输出
    workerProcess.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });
}

function copyFileName() {
    if (isImgNull) {
        alert("没有打开任何图片")
        return false
    }
    clipboard.writeText(getFileName(getCurrentImg()))
}

function copyFilePath() {
    if (isImgNull) {
        alert("没有打开任何图片")
        return false
    }
    clipboard.writeText(getCurrentImg())
}

function copyFile() {
    if (isImgNull) {
        alert("没有打开任何图片")
        return false
    }
    const image = nativeImage.createFromPath(getCurrentImg())
    clipboard.writeImage(image)
}

const menu = new Menu()
menu.append(new MenuItem({
    label: '复制文件名', click() {
        copyFilename()
    }
}))
menu.append(new MenuItem({
    label: '复制路径', click() {
        copyFilePath()
    }
}))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({
    label: '拷贝', click() {
        copyFile()
    }
}))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({
    label: '设为壁纸', click() {
        setWallpaper()
    }
}))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: '原始大小', click() { initParams() } }))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: '上一张', click() { previous() } }))
menu.append(new MenuItem({ label: '下一张', click() { next() } }))
// menu.append(new MenuItem({ type: 'separator' }))
// menu.append(new MenuItem({ label: '复制', type: 'checkbox', checked: true }))
menu.on('menu-will-close', (e) => {
    menuLock = false;
})

window.addEventListener('contextmenu', (e) => {
    showMenu()
    e.preventDefault()
}, false)

function showMenu() {
    menuLock = true;
    menu.popup({ window: remote.getCurrentWindow() })
}