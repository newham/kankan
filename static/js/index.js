var remote = require('electron').remote;
var index = remote.getCurrentWindow().id - 1;
var data = { imgs: [], current: 0 };
var max = false;

function setGlobalData() {
    data = remote.getGlobal('data')[index];
}

function maxWindow() {
    if (!max) {
        remote.getCurrentWindow().maximize();
    } else {
        remote.getCurrentWindow().unmaximize();
    }
    max = !max;
    initParams()
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

function setImgSrc(src) {
    img = document.getElementById('img')
    img.style.visibility = 'hidden'
    img.src = src
}

// function getImgHtml(src) {
//     return '<img class="img" id="img" ondblclick="initParams()" onload="resize()" src="' + src + '" style="visibility:hidden"/>'
// }

function setTitle(title) {
    document.getElementById("title").innerText = title
}

function next() {
    if (isImgNull()) {
        return false
    }
    data.current += 1
    if (data.current == data.imgs.length) {
        data.current = 0;
    }
    setImg(data.current)
}

function previous() {
    if (isImgNull()) {
        return false
    }
    data.current -= 1
    if (data.current < 0) {
        data.current = data.imgs.length - 1;
    }
    setImg(data.current)
}

function getCurrentImg() {
    if (isImgNull()) {
        return ""
    }
    return data.imgs[data.current]
}

function getFileName(file) {
    if (file == "") {
        return ""
    }
    var obj = file.lastIndexOf("/");
    return file.substr(obj + 1);//文件名
}

var params = {
    zoomVal: 1,
    left: 0,
    top: 0,
    currentX: 0,
    currentY: 0,
    flag: false
};

function esc() {
    remote.getCurrentWindow().close()
}

// 监听键盘事件
document.onkeydown = function (event) {
    event = event || window.event;/*||为或语句，当IE不能识别event时候，就执行window.event 赋值*/
    // console.log(event.keyCode);
    switch (event.keyCode) {/*keyCode:字母和数字键的键码值*/
        case 27:
            //esc
            esc()
            break;
        /*37、38、39、40分别对应左上右下*/
        case 37:
        case 38:
            previous()
            break;
        case 39:
        case 40:
            next()
            break;
    }
}

const themeDark = false
const lightDark = true
var defaultTheme = themeDark

function changeDefaultTheme() {
    changeTheme(!defaultTheme)
    defaultTheme = !defaultTheme
}

function changeTheme(isDark) {
    theme = document.getElementById('theme-css')
    btnTheme = document.getElementById('btn-theme')
    if (isDark) {
        theme.href = 'static/css/dark.css'
        btnTheme.innerText = '亮'
    }
    else {
        theme.href = 'static/css/light.css'
        btnTheme.innerText = '暗'
    }
}

function resize() {
    var img = document.getElementById('img');
    initParams()
    // var size =remote.getCurrentWindow().getSize()
    // if(img.offsetHeight<size[1]){
    //     remote.getCurrentWindow().setSize(size[0],img.offsetHeight)
    // }
    // if(img.offsetHeight<size[0]){
    //     remote.getCurrentWindow().setSize(img.offsetWidth,size[1])
    // }
    img.style.visibility = "visible"
}
//on window resize
window.onresize = function () {
    initParams()
};

function isImgNull() {
    return data.imgs.length < 1
}

function showOpenFile(isShow) {
    console.log('show open file:', isShow)
    openFile = document.getElementById('open-file')
    if (isShow) {
        openFile.style.display = 'inherit'
    } else {
        openFile.style.display = 'none'
    }
}

window.onload = () => {
    //读取数据
    setGlobalData()
    //判断数据是否为空
    if (isImgNull()) {
        showOpenFile(true)
        return false
    }
    // 绘制图片
    setImg(data.current);
    // 监听拖拽、放大
    startDrag(document.getElementById("img"), document.getElementById("img"))
}