
var max = false;

function maxWindow() {
    if (!max) {
        remote.getCurrentWindow().maximize();
    } else {
        remote.getCurrentWindow().unmaximize();
    }
    max = !max;
    initParams()
}

function setImgSrc(src) {
    img = document.getElementById('img')
    img.style.visibility = 'hidden'
    img.src = src
}

function setTitle(title) {
    document.getElementById("title").innerText = title
    document.getElementById("head-title").innerText = title
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
document.onkeydown = (event) => {
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

function setThemeBtn(isDark) {
    btnTheme = document.getElementById('btn-theme')
    if (isDark) {
        btnTheme.innerText = '☀'
    } else {
        btnTheme.innerText = '◐'
    }
}

function changeTheme() {
    data.isDark = !data.isDark
    console.log('changeTheme', data.isDark)
    setTheme(data.isDark)
    setThemeBtn(data.isDark)
}

function resize() {
    var img = document.getElementById('img');
    initParams()
    img.style.visibility = "visible"
}

//on window resize
window.onresize = () => {
    initParams()
}

function isImgNull() {
    return data.imgs.length < 1
}

function showItem(item, isShow) {
    console.log('show', item, isShow)
    itemObj = document.getElementById(item)
    if (isShow) {
        itemObj.style.display = 'inherit'
    } else {
        itemObj.style.display = 'none'
    }
}

function showTitleBar(isShow) {
    showItem('title-bar', isShow)
    showItem('btn-to-r',isShow)
    showItem('btn-to-l',isShow)
}

function showOpenFile(isShow) {
    showItem('open-file', isShow)
}

window.onload = () => {
    //设置theme btn
    setThemeBtn(data.isDark)
    //判断数据是否为空
    if (isImgNull()) {
        showTitleBar(false)
        showOpenFile(true)
        return false
    } else {
        showTitleBar(true)
    }
    // 绘制图片
    setImg(data.current);
    // 监听拖拽、放大
    startDrag(document.getElementById("img"), document.getElementById("img"))
}