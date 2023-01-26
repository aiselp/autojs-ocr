let MyRect = require('./lib/MyRect.js')
let OCR;



function TomatoOCR() {
    if (!OCR) {
        OCR = $plugins.load(TomatoOCR.packageName)
    }
    this.ocr = new OCR();

}
TomatoOCR.packageName = 'com.tomato.ocr';
TomatoOCR.check = function() {
    const appName = app.getAppName(TomatoOCR.packageName);
    if (appName && app.versionCode >= 9000000) {
        return true
    }
    return false;
}

TomatoOCR.prototype.release = function() {
    this.ocr.end();
}
TomatoOCR.prototype.detect = function(aj_img, c) {
    const result = this.ocr.ocrBitmap(aj_img.bitmap);

    return result_format(result, c);
}

//结果处理
function result_format(result, c) {
    result = JSON.parse(result)
    const data = {
        text: '',
        result: []
    };
    data.result = result.filter(item => item.score > (c || 0.5))
        .reverse().map((item) => {
            let location = item.location;
            let x = location[0][0];
            let y = location[0][1];
            let w = location[2][0]-x;
            let h = location[2][1]-y;
            return {
                text: item.words, //文本
                confidence: item.score, //可信度
                bounds: new MyRect(x,y,w,h)
            }
        })
    data.result.forEach((item) => {
        data.text += item.text
    })
    return data;
}

module.exports = TomatoOCR;