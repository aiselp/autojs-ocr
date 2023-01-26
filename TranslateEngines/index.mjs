import BaiduTranslate from './BaiduTranslate.node.js'

const Engines = [BaiduTranslate];

class TranslateManager {
    static getEngine_list() {
        return Engines.slice();
    }

    constructor() {
        this.engine = null;
    }
    async translate(str) {
        const engine = this.engine;
        if (!engine) throw new Error('未选择有效引擎');
        return engine.translate(str);
    }
    async init(name) {
        await this.switch_engine(name);
    }
    async switch_engine(name) {
        const Engines = TranslateManager.getEngine_list();
        if (typeof name == 'string') {
            for (let i = 0; i < Engines.length; i++) {
                let engine = Engines[i];
                if (engine.name == name) {
                    return this._switch(engine)
                }
            }
            console.error('没有该引擎:', name);
        } else if (typeof name == 'function') {
            return this._switch(name);
        }else if (typeof name == 'number'){
            return this._switch(Engines[name])
        } else {
            throw new TypeError('参数错误!');
        }
    }
    async _switch(engine) {
        if (this.engine instanceof engine) return;
        let cEngine = this.engine;
        this.engine = new engine()
        cEngine && cEngine.release();
    }
    setLanguageType(s,t){
        this.engine?.setLanguageType?.(s,t);
    }
    release() {
        this.engine ?.release ?.();
    }
}

export default TranslateManager;