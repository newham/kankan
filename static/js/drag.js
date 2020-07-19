//logo界面，拖拽显示提示框，**这段代码被废弃，以保持操作体验一致

// document.getElementById('open-file').ondragover = (event) => {
//     event.preventDefault()
//     document.getElementById('open-file').style.setProperty('border', 'var(--open-border) dashed var(--open-h2-color)')
// }

// document.getElementById('open-file').ondragleave = (event) => {
//     event.preventDefault()
//     document.getElementById('open-file').style.setProperty('border', 'var(--open-border) dashed var(--bg-color)')
// }

// document.getElementById('open-file').ondrop = (event) => {
//     document.getElementById('open-file').style.setProperty('border', 'var(--open-border) dashed var(--bg-color)')
//     drag_img(event)
// }

//已经打开图片，拖拽直接打开新图

document.getElementById('main').ondragover = (event) => {
    event.preventDefault()
}

document.getElementById('main').ondrop = (event) => {
    event.preventDefault()
    let img_file = event.dataTransfer.files[0];
    console.log('darg', img_file.name)
    openFileWin(img_file.path)
}