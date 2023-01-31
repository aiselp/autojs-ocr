let MyRect = require('./lib/MyRect.js')

let MLKit;

function MLKitOCR() {
    if (!MLKit) {
        MLKit = $plugins.load(MLKitOCR.packageName)
    }
    this.ocr = new MLKit();

}
MLKitOCR.packageName = 'org.autojs.autojspro.plugin.mlkit.ocr';
MLKitOCR.check = function() {
    const appName = app.getAppName(MLKitOCR.packageName);
    if (appName && app.versionCode >= 9121100) {
        return true
    }
    return false;
}

MLKitOCR.prototype.release = function() {
    this.ocr.release();
}
MLKitOCR.prototype.detect = function(aj_img, c) {
    const result = this.ocr.detect(aj_img);
    const data = {
        text: ''
    };

    data.result = result.filter(item => {
        let t = item.confidence > (c || 0.5);
        if (t) {
            data.text += item.text
        }
        return t
    }).map((item)=>{
        let bounds = new MyRect();
        bounds.set(item.bounds);
        return {
            text:item.text,
            confidence: item.confidence,
            bounds
        }
    })
    return data;
}

module.exports = MLKitOCR;