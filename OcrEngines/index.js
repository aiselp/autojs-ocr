let MLKitOCR = require('./MLKitOCR.js')
let TomatoOCR = require('./TomatoOCR.js');
let BaiduOCR = require('./BaiduOCR.js')

let Engines = [MLKitOCR, TomatoOCR,BaiduOCR];

function App() {
    this.engine = null;
}
App.getEngine = function() {
    for (let i = 0; i < Engines.length; i++) {
        const engine = Engines[i];
        if (engine.check && engine.check()) {
            return engine;
        }
    }
    return null;
}
App.getEngine_list = function() {
    return Engines.slice();
}
App.prototype.init = function(engine) {
    if (engine) return this.switch_engine(engine);
    const Engine = App.getEngine();
    if (Engine) {
        this.engine = new Engine();
    } else {
        this.engine = null;
    }
}
App.prototype.switch_engine = function(name) {
    if (typeof name == 'string') {
        const Engines = App.getEngine_list();
        for (let i = 0; i < Engines.length; i++) {
            let engine = Engines[i];
            if (engine.name == name) {
                this._switch(engine)
                return;
            }
        }
        toast('切换引擎失败!');
        console.error('没有该引擎:', name);
    } else if (typeof name == 'function') {
        this._switch(name);
    } else {
        throw new TypeError('参数错误!');
    }
}
App.prototype._switch = function(engine) {
    if (this.engine instanceof engine) return;
    let cEngine = this.engine;
    try {
        this.engine = new engine();
    } catch (e) {
        this.engine = null;
        toast('切换引擎失败!');
        console.error('切换引擎失败:', e)
    }
    cEngine && cEngine.release();
}
App.prototype.detect = function(img) {
    const engine = this.engine;
    if (!engine) throw new Error('未选择有效ocr引擎');
    return engine.detect(img);
}
App.prototype.release = function() {
    if (this.engine) {
        this.engine.release();
    }
}


module.exports = App;