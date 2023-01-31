let hsp = require("./hsp.js");
let config = require('./config.js');
let MyFloaty = require('./MyFloaty.js');
let Ocr = require('./OcrEngines/index.js')
let ThreadPool = require('./utils/ThreadPool.js')

requestScreenCapture();

function MyApp() {
    this.ocr = new Ocr();
    //this.ocr.switch_engine('TomatoOCR')
    this.storage = storages.create(config.storage_name);
    this.data = {};
    this.config = {};
    let zb = this.storage.get('zb');
    let mw = this.mw = new MyFloaty(zb);
    this.init();
    
    mw.on('save_position', (zb) => {
        this.storage.put('zb', zb);
    })
    mw.barWindow.exit.on("click", () => {
        exit();
    });
    //-----------
    mw.barWindow.sdt.on("click", () => {
        this.openSetting();
    });
    mw.barWindow.ok.on("click", () => {
        this.start();
    });
    mw.barWindow.dp.on("click", () => {
        this.openInfo();
    });
    mw.barWindow.db.setOnTouchListener(function(view, event) {
        switch (event.getAction()) {
            case event.ACTION_DOWN:
                mw.setVisibility(false, 2);
                return true;
            case event.ACTION_UP:
                mw.setVisibility(true, 1);
                return true;
        }
        return true;
    });
}
MyApp.prototype.start = function() {
    let data = {};
    let mw = this.mw;
    ThreadPool.run(() => {
        let zb = mw.getAsbPosition();
        let {
            x,
            y,
            w,
            h
        } = zb;
        mw.setVisibility(false, 2);
        sleep(100);
        mw.setContent("识别中........");
        data.img = images.clip(captureScreen(), x, y, w, h);
        mw.setVisibility(true, 2);
        let result = this.ocr.detect(data.img);
        data.ocrText = result.text;
        mw.setContent(data.ocrText);
        this.set_cache_data(data);
    }, true).catch((e) => {
        data.img.recycle();
        mw.setVisibility(true, 2);
        mw.setErrorContent("出错了\n" + e.toString());
    })
}
MyApp.prototype.openInfo = function() {
    if (!this.data.img) return toast('没有数据');
    const {
        img,
        translateText,
        ocrText
    } = this.data;
    let imgb64 = "data:image/png;base64," + images.toBase64(img);
    let view = ui.inflate(
        <vertical padding="6 0">
                <img src={imgb64} />
                <frame w="*">
                    <text textColor="#c429ea" text="识别内容:" />
                    <text id="copy1" layout_gravity="right" w="60" textColor="#c429ea" text="复制" />
                </frame>
                <text id="sb" />
                <text text="————————————————" />
                <frame w="*">
                    <text textColor="#c429ea" text="翻译内容:" />
                    <text id="copy2" layout_gravity="right" w="60" textColor="#c429ea" text="复制" />
                </frame>
                <text id="yw" />
                <text text="————————————————" />
            </vertical>, null, false
    );
    view.sb.text(ocrText || "");
    view.yw.text(translateText || "");
    view.copy1.click(function() {
        setClip(ocrText);
        toast("复制成功");
    });
    view.copy2.click(function() {
        setClip(translateText);
        toast("复制成功");
    });
    // 显示对话框
    dialogs.build({
        customView: view,
        title: "截图预览",
        positive: "确定",
        wrapInScrollView: true,
        autoDismiss: true
    }).on("show", () => {
        this.mw.setVisibility(false, 1);
    }).on("dismiss", () => {
        this.mw.setVisibility(true, 1);
    }).show();

}
MyApp.prototype.openSetting = function() {
    let config = this.config;
    let mw = this.mw;
    let sp = ['日文', '中文', '英文'];
    let engines_list = Ocr.getEngine_list();
    let names = engines_list.map(item => item.name);
    let fy = config.fy;

    let view = ui.inflate(
        <vertical padding="6 0">
                <horizontal>
                    <vertical layout_weight="1" h="auto">
                        <text text="重置位置与屏幕方向" textColor="#222222" textSize="16sp"/>
                        <text text="启动后不能改变屏幕方向，否则将无法正常截取屏幕" textColor="#999999" textSize="14sp"/>
                    </vertical>
                    <button id="re" text="重置"/>
                </horizontal>
                <horizontal>
                    <vertical layout_weight="1" h="auto">
                        <text text="打开翻译" textColor="#222222" textSize="16sp"/>
                        <text text="打开后识字完成会接着翻译内容" textColor="#999999" textSize="14sp"/>
                    </vertical>
                    <Switch w='60' id='s1' />
                </horizontal>
                <horizontal layout_gravity="center">
                    <text gravity="center_vertical" text="选择ocr引擎:" layout_weight="1" textColor="#222222" textSize="16sp"/>
                    <spinner id="ocr" entries={names.join('|')} />
                </horizontal>
                
                <horizontal h="30">
                    <text text="识别语言:"/>
                    <spinner id="sp1" entries={sp.join('|')}/>
                </horizontal>
                <horizontal h="30">
                    <text text="翻译语言:"/>
                    <spinner id="sp2" entries={sp.join('|')}/>
                </horizontal>
            </vertical>, null, false);
    view.re.click(() => {
        this.storage.remove("zb");
        engines.execScriptFile("./main.js");
        dialog.dismiss();
        exit();
    });
    view.s1.setOnCheckedChangeListener(function(view, value) {
        fy = value;
    });

    view.s1.setChecked(config.fy);
    view.sp1.setSelection(config.sp1);
    view.sp2.setSelection(config.sp2);
    view.ocr.setSelection(config.ocrEngine);

    // 显示对话框
    var dialog = dialogs.build({
        customView: view,
        title: "设置",
        positive: "保存",
        wrapInScrollView: true,
        autoDismiss: true
    }).on("show", () => {
        mw.setVisibility(false, 1);
    }).on("dismiss", () => {
        mw.setVisibility(true, 1);
        
    }).on("positive", ()=> {
        config.fy = fy;
        config.sp1 = view.sp1.getSelectedItemPosition();
        config.sp2 = view.sp2.getSelectedItemPosition();
        config.ocrEngine = view.ocr.getSelectedItemPosition();
        //切换引擎
        this.ocr.switch_engine(engines_list[config.ocrEngine]);
        this.storage.put('config', this.config);
        toast("保存成功");
    }).show();
}
MyApp.prototype.init = function() {
    this.config = {
        fy: false,
        sp1: 0,
        sp2: 0,
        ocrEngine: 0,
    }
    Object.assign(this.config, this.storage.get('config'))
    //切换引擎
    let engines_list = Ocr.getEngine_list();
    this.ocr.init(engines_list[this.config.ocrEngine]);
}
MyApp.prototype.set_cache_data = function(data) {
    if (this.data.img) {
        this.data.img.recycle();
    }
    this.data = data;
}
MyApp.prototype.destroy = function() {
    if (this.data.img) {
        this.data.img.recycle();
    }
    this.ocr.release();
}


let app = new MyApp();
events.on('exit', () => {
    app.destroy();
})