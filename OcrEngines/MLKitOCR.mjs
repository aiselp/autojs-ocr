import plugins from 'plugins';
import MyRect from './lib/MyRect.js';


let mlkit;
class MLKitOCR {
    static packageName = 'org.autojs.autojspro.plugin.mlkit.ocr'

    constructor() {
        this.ocr = new mlkit();
    }
    async detect(aj_img, c) {
        const result = await this.ocr.detect(aj_img);
        const data = {
            text: ''
        };

        data.result = result.filter(item => {
            let t = item.confidence > (c || 0.5);
            if (t) {
                data.text += item.text
            }
            return t
        }).map((item) => {
            let bounds = new MyRect();
            bounds.set(item.bounds);
            return {
                text: item.text,
                confidence: item.confidence,
                bounds
            }
        })
        return data;
    }
    release() {
        this.ocr.release();
    }
}
MLKitOCR.create = async function() {
    if (!mlkit) {
        mlkit = await plugins.load(MLKitOCR.packageName);
    }
    return new MLKitOCR();
}

export default MLKitOCR;