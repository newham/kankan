var remote = require('electron').remote;
var index = remote.getCurrentWindow().id - 1;
var data = { imgs: [], current: 0, isDark: false };

function setTheme(isDark) {
    theme = document.getElementById('theme-css')
    if (isDark) {
        theme.href = 'static/css/dark.css'
    }
    else {
        theme.href = 'static/css/light.css'
    }
}

function setGlobalData() {
    data = remote.getGlobal('data')[index];
}

function setCurrentImg() {
    setImg(data.current)
}

function setImg(id) {
    //没有输入
    if (isImgNull()) {
        showOpenFile(true)
        return
    }
    //有输入
    initParams();
    if (id < 0 || id >= data.imgs.length) {
        id = 0
    }
    // // 删除之前的img
    // if (div.firstChild) {
    //     div.removeChild(div.firstChild)
    // }
    // 重绘新img
    setImgSrc(data.imgs[id])
    // set title
    setTitle(getFileName(data.imgs[id]))
    //log
    console.log("set img:", data.imgs[id])
}

// ******加载本js时执行******
//读取数据
setGlobalData()
//设置主题，为了防止“白”->“黑”的生硬
setTheme(data.isDark)
// ******加载本js时执行******