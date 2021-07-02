var menuLock = false;

function initParams(zoomVal) {
    var img = document.getElementById("img")
    x = 0;
    y = 0;
    if (img) {
        x = (document.body.offsetWidth - img.offsetWidth) / 2
        y = (document.body.offsetHeight - img.offsetHeight) / 2
    }

    params = {
        rotateVal: 0, //旋转角度
        zoomVal: zoomVal, //放大倍数
        left: x,
        top: y,
        currentX: 0,
        currentY: 0,
        flag: false
    };

    if (img) {
        img.style.left = parseInt(params.left) + "px";
        img.style.top = parseInt(params.top) + "px";
        // img.style.transform = "scale(" + params.zoomVal + ")"; //old
        img.style.transform = `rotate(${params.rotateVal}deg)scale(${params.zoomVal})`;
    }

    setZoomPer()
}

function realSize() {
    var img = document.getElementById("img")
    initParams(img.naturalWidth / img.offsetWidth)
}

function resetSize() {
    if (params.zoomVal == 1) {
        realSize()
    } else {
        initParams(1)
    }
}

//图片缩放
function bbimg(o) {

    var o = o.getElementsByTagName("img")[0];

    params.zoomVal += event.wheelDelta / 1200;
    // alert(parseInt(event.clientX*params.zoomVal));

    // 设置放大的最大倍数
    var zoomMax = 20
    if (params.zoomVal >= zoomMax) {
        params.zoomVal = zoomMax
    }

    // console.log(params.left, ',', params.top, ',', event.pageX, ',', event.pageY,',',o.offsetHeight*params.zoomVal)

    // 设置放大的中心点
    //计算鼠标在图片中的位置比例
    // X = (event.pageX - params.left)/(o.offsetWidth) /params.zoomVal *100
    // console.log(X+'%' )
    // o.style.transformOrigin = X + "px " + Y + "px";
    // 放大

    // 旋转+缩放
    if (params.zoomVal < 0.2) { //最小不能小于0.2倍
        params.zoomVal = 0.2;
    }
    // 放大倍数上限是系统默认的
    o.style.transform = `rotate(${params.rotateVal}deg)scale(${params.zoomVal})`; //旋转+放大


    // 显示放大倍数
    setZoomPer();
    //移动
    // if (X != 0 || Y != 0) {
    //     params.left = params.left - (event.pageX - X)/params.zoomVal
    //     params.top = params.top - (event.pageY - Y)/params.zoomVal
    //     o.style.left = params.left + 'px'
    //     o.style.top = params.top + 'px'
    // }
    // X = event.pageX
    // Y = event.pageY
}

function getZoomRate() {
    img = document.getElementById('img')
    rate = img.offsetWidth / img.naturalWidth
    return rate
}

function setZoomPer() {
    rate = getZoomRate();
    // console.log(img.naturalWidth,img.naturalHeight)
    document.getElementById('zoom-per').innerHTML = Math.round(100 * params.zoomVal * rate) + '%';
    setRotate();
    setSize();
    setIndex();
}

function setSize() {
    img = document.getElementById('img')
    document.getElementById('zoom-per').innerHTML += ' ' + img.naturalWidth + "x" + img.naturalHeight
}

function setIndex() {
    index_info = ` ${data.current+1}/${data.imgs.length}`
    document.getElementById('zoom-per').innerHTML += index_info
}

function setRotate() {
    document.getElementById('zoom-per').innerHTML += ` ${params.rotateVal}°`
}

//获取相关CSS属性
var getCss = function(o, key) {
    return o.currentStyle ? o.currentStyle[key] : document.defaultView.getComputedStyle(o, false)[key];
};

function isDrag() {
    // console.log(params.currentX)
    // console.log(params.left,',',params.top)
    img = document.getElementById('img')
    h = img.offsetHeight * params.zoomVal
    w = img.offsetWidth * params.zoomVal
    if (params.currentX != 0 || params.currentY != 0) {
        return true
    } else if (params.zoomVal <= 1) {
        return false
    } else if (h < document.body.offsetHeight && w < document.body.offsetWidth) {
        return false
    }
    return true
}

//拖拽的实现
var startDrag = function(bar, target, callback) {
    console.log("start to on img drag")

    if (getCss(target, "left") !== "auto") {
        params.left = getCss(target, "left");
    }
    if (getCss(target, "top") !== "auto") {
        params.top = getCss(target, "top");
    }
    //o是移动对象
    bar.onmousedown = function(event) {
        if (!isDrag()) {
            return false
        }
        if (event.button == 2 || menuLock) {
            return false
        }
        params.flag = true;
        if (!event) {
            event = window.event;
            //防止IE文字选中
            bar.onselectstart = function() {
                return false;
            }
        }
        var e = event;
        params.currentX = e.clientX;
        params.currentY = e.clientY;
    };
    document.onmouseup = function() {
        if (!isDrag()) {
            return false
        }
        if (event.button == 2 || menuLock) {
            return false
        }
        params.flag = false;
        if (getCss(target, "left") !== "auto") {
            params.left = getCss(target, "left");
        }
        if (getCss(target, "top") !== "auto") {
            params.top = getCss(target, "top");
        }
    };
    document.onmousemove = function(event) {
        //原始大小禁止拖动
        if (!isDrag()) {
            return false
        }
        if (menuLock) {
            return false
        }
        var e = event ? event : window.event;
        if (params.flag) {
            var nowX = e.clientX,
                nowY = e.clientY;
            var disX = nowX - params.currentX,
                disY = nowY - params.currentY;
            target.style.left = parseInt(params.left) + disX + "px";
            target.style.top = parseInt(params.top) + disY + "px";
            if (typeof callback == "function") {
                callback((parseInt(params.left) || 0) + disX, (parseInt(params.top) || 0) + disY);
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
            return false;
        }
    }
};

//旋转
function rotate(d) {
    if (d != 0) {
        params.rotateVal = (params.rotateVal + d * 90) % 360;
    }

    img = document.getElementById('img')
    img.style.transform = `rotate(${params.rotateVal}deg)scale(${params.zoomVal})`; //旋转保持缩放比例
    setZoomPer(); //显示缩放比等信息
}