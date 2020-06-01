var fs = require('fs');
var readline = require('readline');
let support_lans = ['zh-CN', 'en', 'en-US'] //支持的语言

function isLanSupport(lan) {
    return support_lans.indexOf(lan) >= 0
}

function getAttrs(line) {
    let attrs = []
    let index = line.indexOf('=')
    if (index >= 0) {
        attrs.push(line.substr(0, index).trim())
        attrs.push(line.substr(index + 1, line.length - 1).trim().replace(/\'/g, '').replace(/\"/g, ''))
    }
    return attrs
}

function read_i18n(properties, lan) {
    if (!isLanSupport(lan)) {
        lan = 'en' //设置默认语言为英语
    }
    // console.log(__dirname)
    let fRead = fs.createReadStream(`${__dirname}/../i18n/${lan}.properties`);
    let objReadline = readline.createInterface({
        input: fRead
    });
    var promise = new Promise(function (resolve, reject) {
        objReadline.on('line', function (line) {
            attrs = getAttrs(line)
            if (attrs.length == 2) {
                properties.set(attrs[0], attrs[1])
            }
        })

        objReadline.on('close', function () {
            console.log('ok')
            resolve();
        })

        objReadline.on('error', function (err) {
            console.log(err);
            reject(err);
        })

    })
    return promise;
}

module.exports = {
    read_i18n
}