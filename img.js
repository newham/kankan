var menuLock = false;

function initParams() {
    var img = document.getElementById("img")
    x = (document.body.offsetWidth - img.offsetWidth) / 2
    y = (document.body.offsetHeight - img.offsetHeight) / 2
    params = {
        zoomVal: 1,
        left: x,
        top: y,
        currentX: 0,
        currentY: 0,
        flag: false
    };
    img.style.left = parseInt(params.left) + "px";
    img.style.top = parseInt(params.top) + "px";
    img.style.transform = "scale(" + params.zoomVal + ")";
}
//图片缩放
function bbimg(o) {
    var o = o.getElementsByTagName("img")[0];
    params.zoomVal += event.wheelDelta / 1200;
    // alert(parseInt(event.clientX*params.zoomVal));
    // 设置放大的中心点
    // o.style.transformOrigin = event.clientX * params.zoomVal + "px " + event.clientY * params.zoomVal + "px";
    if (params.zoomVal >= 0.2) {
        o.style.transform = "scale(" + params.zoomVal + ")";
    } else {
        params.zoomVal = 0.2;
        o.style.transform = "scale(" + params.zoomVal + ")";
        return false;
    }
}
//获取相关CSS属性
var getCss = function (o, key) {
    return o.currentStyle ? o.currentStyle[key] : document.defaultView.getComputedStyle(o, false)[key];
};
//拖拽的实现
var startDrag = function (bar, target, callback) {
   
    if (getCss(target, "left") !== "auto") {
        params.left = getCss(target, "left");
    }
    if (getCss(target, "top") !== "auto") {
        params.top = getCss(target, "top");
    }
    //o是移动对象
    bar.onmousedown = function (event) {
        if (event.button == 2||menuLock){
            return false
        }
        params.flag = true;
        if (!event) {
            event = window.event;
            //防止IE文字选中
            bar.onselectstart = function () {
                return false;
            }
        }
        var e = event;
        params.currentX = e.clientX;
        params.currentY = e.clientY;
    };
    document.onmouseup = function () {
        if (event.button == 2||menuLock) {
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
    document.onmousemove = function (event) {
        if (menuLock) {
            return false
        }
        var e = event ? event : window.event;
        if (params.flag) {
            var nowX = e.clientX, nowY = e.clientY;
            var disX = nowX - params.currentX, disY = nowY - params.currentY;
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
