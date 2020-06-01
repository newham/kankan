const { Menu, MenuItem } = remote
const { clipboard } = require('electron') //剪切板
const nativeImage = require('electron').nativeImage
const exec = require('child_process').exec

function setWallpaper() {
    if (isImgNull()) {
        alert(Text('img_is_empty'))
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
            console.log('set wallpapger:', imgPath)
            alert(Text('set_wallpaper_success'))
        } else {
            console.log('set wallpapger failed')
            alert(Text('set_wallpaper_failed'))
        }
        document.getElementById('btn-wallpaper').disabled = false
    })
    // 打印错误的后台可执行程序输出
    workerProcess.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });
}

function copyFileName() {
    if (isImgNull()) {
        alert(Text('img_is_empty'))
        return false
    }
    clipboard.writeText(getFileName(getCurrentImg()))
    console.log('copy file name:', getFileName(getCurrentImg()))
}

function copyFilePath() {
    if (isImgNull()) {
        alert(Text('img_is_empty'))
        return false
    }
    clipboard.writeText(getCurrentImg())
    console.log('copy file path:', getCurrentImg())
}

function copyFile() {
    if (isImgNull()) {
        alert(Text('img_is_empty'))
        return false
    }
    const image = nativeImage.createFromPath(getCurrentImg())
    clipboard.writeImage(image)
    console.log('copy file:', getCurrentImg())
    alert(Text('copied_to_clipboard'))
}

const menu = new Menu()
menu.append(new MenuItem({
    label: Text('copy_file_name'), click() {
        copyFileName()
    }
}))
menu.append(new MenuItem({
    label: Text('copy_file_path'), click() {
        copyFilePath()
    }
}))
menu.append(new MenuItem({
    label: `✂ ${Text('copy')}`, click() {
        copyFile()
    }
}))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: `↗ ${Text('original_size')}`, click() { realSize() } }))
menu.append(new MenuItem({ label: `↙ ${Text('fit_to_window_size')}`, click() { initParams(1) } }))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({
    label: `♡ ${Text('set_as_wallpaper')}`, click() {
        setWallpaper()
    }
}))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: `◀ ${Text('previous')}`, click() { previous() } }))
menu.append(new MenuItem({ label: `▶ ${Text('next')}`, click() { next() } }))
// menu.append(new MenuItem({ type: 'separator' }))
// menu.append(new MenuItem({ label: '复制', type: 'checkbox', checked: true }))
menu.on('menu-will-close', (e) => {
    menuLock = false;
})

window.addEventListener('contextmenu', (e) => {
    if (!isImgNull()) {
        showMenu()
    }
    e.preventDefault()
}, false)

function showMenu() {
    menuLock = true;
    menu.popup({ window: remote.getCurrentWindow() })
}