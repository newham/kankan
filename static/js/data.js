var remote = require('electron').remote;
var index = remote.getCurrentWindow().id - 1;
var data = { imgs: [], current: 0, isDark: false };
var Text

function setTheme(isDark) {
    theme = document.getElementById('theme-css')
    if (isDark) {
        theme.href = 'static/css/dark.css'
    } else {
        theme.href = 'static/css/light.css'
    }
}

function setGlobalData() {
    data = remote.getGlobal('data')[index];
    Text = remote.getGlobal('Text')
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
    initParams(1);
    if (id < 0 || id >= data.imgs.length) {
        id = 0
    }
    //获取指定id的img
    imgFile = data.imgs[id]
    setImgSrc(imgFile) // 重绘新img
    setTitle(`${getFileName(imgFile)}`) // set title

    //log
    console.log("set img:", imgFile)
}

// ******加载本js时执行******
//读取数据
setGlobalData()

//设置主题，为了防止“白”->“黑”的生硬
setTheme(data.isDark)