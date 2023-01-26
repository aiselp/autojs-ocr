import MLKitOCR from './MLKitOCR.mjs';
import TomatoOCR from './TomatoOCR.mjs';
import BaiduOCR from './BaiduOCR.node.js'
import PaddleOCR from './PaddleOCR.mjs'
import { showToast } from 'toast';

const Engines = [MLKitOCR,TomatoOCR,BaiduOCR,PaddleOCR];

class OcrManager {
    static getEngine_list() {
        return Engines.slice();
    }
    static getEngine() {
        for (let i = 0; i < Engines.length; i++) {
            const engine = Engines[i];
            if (engine.check && engine.check()) {
                return engine;
            }
        }
        return null;
    }
    constructor() {
        this.engine = null;
    }
    init(engine) {
        const Engine =engine|| OcrManager.getEngine();
        if (Engine) {
            this._switch(Engine).catch((e)=>{
                console.error('初始化OCR失败:',Engine.name)
            })
        }
    }
    async switch_engine(name) {
        if (typeof name == 'string') {
            const Engines = OcrManager.getEngine_list();
            for (let i = 0; i < Engines.length; i++) {
                let engine = Engines[i];
                if (engine.name == name) {
                    return this._switch(engine)
                }
            }
            console.error('没有该引擎:', name);
        } else if (typeof name == 'function') {
            return this._switch(name);
        } else {
            throw new TypeError('参数错误!');
        }
    }
    async _switch(engine) {
        if (this.engine instanceof engine) return;
        let cEngine = this.engine;
        try {
            this.engine = await engine.create();
        } catch (e) {
            this.engine = null;
            console.error('切换引擎失败:', engine.name);
            throw e;
        }
        cEngine && cEngine.release();
    }
    async detect(img,c) {
        const engine = this.engine;
        if (!engine) throw new Error('未选择有效ocr引擎');
        return engine.detect(img,c);
    }
    setLanguage_type(language_name){
        this.engine?.setLanguage_type?.(language_name);
    }
    release() {
        if (this.engine) {
            this.engine.release();
        }
    }
}


export default OcrManager;