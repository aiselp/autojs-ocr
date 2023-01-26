import MyRect from './lib/MyRect.js';
import plugins from 'plugins';
import { createOCR } from 'ocr';


class PaddleOCR {
    static packageName = 'org.autojs.autojspro.ocr.v2';
    static async create() {
           const paddle =await createOCR({
                models: 'default'
            });
        return new PaddleOCR(paddle);
    }
    constructor(paddle) {
        if (!paddle) throw new Error('请使用静态方法async create()创建实例')
        this.ocr = paddle;
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
            const {left,top,right,bottom} = item.bounds;
            let bounds = new MyRect();
            bounds.set(left,top,right,bottom);
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

PaddleOCR.check = function() {
    /*
    const appName = app.getAppName(packageName);
    if (appName && app.versionCode >= 9131100) {
        return true;
    }
    */
    return false;
}

export default PaddleOCR;