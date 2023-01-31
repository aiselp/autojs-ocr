import plugins from 'plugins';
import MyRect from './lib/MyRect.js';

let tomato;
class TomatoOCR {
    static packageName = 'com.tomato.ocr';
    static async create() {
        if (!tomato) {
            tomato = await plugins.load(TomatoOCR.packageName);
        }
        return new TomatoOCR();
    }
    constructor() {
        this.ocr = new tomato();
    }
    async detect(aj_img, c) {
        const result = await this.ocr.ocrBitmap(aj_img.toBitmap());
        return result_format(result, c);
    }
    release() {
        this.ocr.end();
    }
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
            let w = location[2][0] - x;
            let h = location[2][1] - y;
            return {
                text: item.words, //文本
                confidence: item.score, //可信度
                bounds: new MyRect(x, y, w, h)
            }
        })
    data.result.forEach((item) => {
        data.text += item.text
    })
    return data;
}

export default TomatoOCR;