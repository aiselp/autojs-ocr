"ui-thread";
import config from './config.js';
import MyFloaty from './MyFloaty.mjs';
import OcrManager from './OcrEngines/index.mjs';
import TranslateManager from './TranslateEngines/index.mjs'
import engines from 'engines';
import image from 'image';
import cv from "@autojs/opencv";
import {
    setClip
} from 'clip_manager';
import {
    inflateXml,
    defaultThemeContext
} from 'ui';
import {
    delay
} from 'lang';
import {
    showToast
} from 'toast';
import {
    createDatastore
} from 'datastore';
import {
    requestScreenCapture
} from "media_projection"
import {
    install
} from 'rhino';

install();

const javaString = java.lang.String;
const Base64 = android.util.Base64;
const WindowManager = android.view.WindowManager;
const MaterialAlertDialogBuilder = com.google.android.material.dialog.MaterialAlertDialogBuilder;
const R = $java.findClass('com.google.android.material.R');
//console.log(Object.keys(R.style).filter(v=>v.startsWith('Theme_')))
const ContextThemeWrapper = $java.findClass('androidx.appcompat.view.ContextThemeWrapper');
const context = new ContextThemeWrapper($autojs.androidContext, R.style.Theme_Material3_DayNight)

// 创建本地存储
const datastore = createDatastore(config.storage_name);

class MyApp {
    static LangTypeList = ['日文', '中文', '英文'];
    constructor() {
        let mw = this.mw = new MyFloaty(context);
        this.data = {};
        this.config = {};
        this.ocrManager = new OcrManager();
        this.translateManager = new TranslateManager();
        this.init();

        mw.on('save_position', (zb) => {
            datastore.set('zb', zb);
        });
        mw.views.exit.on("click", () => {
            process.exit()
        });
        mw.views.seting.on("click", () => {
            this.openSetting();
        });
        mw.views.tp.on('click', () => {
            this.start();
        })
        mw.views.dp.on('click', () => {
            this.openInfo();
        })
    }
    async init() {
        this.capturer = await requestScreenCapture();
        let zb = await datastore.get('zb');
        await this.mw.init(zb);
        this.config = {
            fy: false,
            sp1: 0,
            sp2: 0,
            ocrEngine: 0,
            translateEngine:0,
        }
        Object.assign(this.config, await datastore.get('config'))
        //切换引擎
        let engines_list = OcrManager.getEngine_list();
        await this.ocrManager.init(engines_list[this.config.ocrEngine]);
        await this.configUpdate();
    }
    async configUpdate() {
        const config = this.config;
        //切换引擎
        let engines_list = OcrManager.getEngine_list();
        const engine = engines_list[config.ocrEngine];
        try {
            await this.translateManager.switch_engine(config.translateEngine)
            await this.ocrManager.switch_engine(engine);
        } catch (e) {
            this.mw.setErrorContent('切换引擎失败:' + engine.name);
            console.error(e)
        }
        this.translateManager.setLanguageType(MyApp.LangTypeList[config.sp1],MyApp.LangTypeList[config.sp2])
        this.ocrManager.setLanguage_type(MyApp.LangTypeList[config.sp1]);
    }
    async start() {
        //console.log(this.translateManager)
        let data = {};
        let mw = this.mw;

        let zb = mw.getAsbPosition();
        let {
            x,
            y,
            w,
            h
        } = zb;
        mw.setVisibility(false);
        //sleep(100);
        await delay(200)
        mw.setContent("识别中........");
        try {
            data.img = await (await this.capturer.nextImage()).clip(new cv.Rect(x, y, w, h))
            mw.setVisibility(true);
            let result = await this.ocrManager.detect(data.img);
            data.ocrText = result.text;
            mw.setContent(data.ocrText);
            //进行翻译
            if (this.config.fy){
                await delay(300);
                mw.setContent("翻译中........");
                data.translateText = await this.translateManager.translate(data.ocrText);
                mw.setContent(data.translateText);
            }
            this.set_cache_data(data);
        } catch (e) {
            data.img.recycle();
            //mw.setVisibility(true);
            console.error(e)
            mw.setErrorContent("出错了\n" + e.toString());
        }
    }
    async openSetting() {
        const config = this.config;
        const mw = this.mw;
        const sp = MyApp.LangTypeList;
        const engines_list = OcrManager.getEngine_list();
        const translateEngine_list = TranslateManager.getEngine_list();
        const translateNames = translateEngine_list.map(item=>item.name)
        let names = engines_list.map(item => item.name);
        let fy = config.fy;

        let jsview = inflateXml(context, `
               <ScrollView>
                <column padding="6">
                <horizontal>
                    <column layout_weight="1" h="auto">
                        <text text="重置位置" textColor="#222222" textSize="16sp"/>
                        <text text="重置悬浮窗默认位置" textColor="#999999" textSize="14sp"/>
                    </column>
                    <com.google.android.material.button.MaterialButton id="re" text="重置"/>
                </horizontal>
                <horizontal>
                    <vertical layout_weight="1" h="auto">
                        <text text="打开翻译" textColor="#222222" textSize="16sp"/>
                        <text text="打开后识字完成会接着翻译内容" textColor="#999999" textSize="14sp"/>
                    </vertical>
                    <Switch w="60" id='s1' />
                </horizontal>
                <horizontal layout_gravity="center">
                    <text gravity="center_vertical" text="选择ocr引擎:" layout_weight="1" textColor="#222222" textSize="16sp"/>
                    <spinner id="ocr" entries="${names.join('|')}" />
                </horizontal>
                <horizontal layout_gravity="center">
                    <text gravity="center_vertical" text="选择翻译引擎:" layout_weight="1" textColor="#222222" textSize="16sp"/>
                    <spinner id="translate" entries="${translateNames.join('|')}" />
                </horizontal>
                <horizontal h="30">
                    <text text="识别语言:"/>
                    <spinner id="sp1" entries="${sp.join('|')}"/>
                </horizontal>
                <horizontal h="30">
                    <text text="翻译语言:"/>
                    <spinner id="sp2" entries="${sp.join('|')}"/>
                </horizontal>
            </column>
            </ScrollView>
        `);
        jsview.findView('re').on('click', async () => {
            await datastore.remove("zb");
            this.mw.show();
            this.mw.setDefaultPosition();
            dialog.dismiss();
        });
        jsview.findView('s1').setOnCheckedChangeListener(function(view, value) {
            fy = value;
        });
        jsview.findView('s1').setChecked(config.fy);
        jsview.findView('sp1').setSelection(config.sp1);
        jsview.findView('sp2').setSelection(config.sp2);
        jsview.findView('ocr').setSelection(config.ocrEngine);
        jsview.findView('translate').setSelection(config.translateEngine);

        const dialog = new MaterialAlertDialogBuilder(context)
            .setTitle('设置')
            .setView(jsview)
            .setPositiveButton("保存", async () => {
                config.fy = fy;
                config.sp1 = jsview.findView('sp1').getSelectedItemPosition();
                config.sp2 = jsview.findView('sp2').getSelectedItemPosition();
                config.ocrEngine = jsview.findView('ocr').getSelectedItemPosition();
                config.translateEngine = jsview.findView('translate').getSelectedItemPosition();
                await this.configUpdate();
                //console.warn('保存',this.config)
                await datastore.set('config', this.config);
                showToast("保存成功");
            }).setOnDismissListener(() => {
                mw.show();
            }).create();
        dialog.getWindow().setType(WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY);
        dialog.show();
        mw.close();
    }
    async openInfo() {
        const {
            img,
            translateText,
            ocrText
        } = this.data;
        if (!img) return showToast('没有数据');
        let imgb64 = "data:image/png;base64," + await image.encodeImage(img);
        let jsview = inflateXml(context, `
        <ScrollView>
        <vertical padding="6 0">
                <img src="${imgb64}" />
                <com.google.android.material.divider.MaterialDivider />
                <frame w="*">
                    <text textColor="#c429ea" text="识别内容:" />
                    <text id="copy1" layout_gravity="right" w="60" textColor="#c429ea" text="复制" />
                </frame>
                <text id="sb" />
                <com.google.android.material.divider.MaterialDivider />
                <frame w="*">
                    <text textColor="#c429ea" text="翻译内容:" />
                    <text id="copy2" layout_gravity="right" w="60" textColor="#c429ea" text="复制" />
                </frame>
                <text id="yw" />
            </vertical>
            </ScrollView>`);
        jsview.findView('sb').setText(ocrText || "");
        jsview.findView('yw').setText(translateText || "");
        jsview.findView('copy1').on('click', () => {
            setClip(ocrText);
            showToast("复制成功");
        });
        jsview.findView('copy2').on('click', () => {
            setClip(translateText);
            showToast("复制成功");
        });
        const dialog = new MaterialAlertDialogBuilder(context)
            .setTitle('截图预览')
            .setView(jsview)
            .setPositiveButton("确定", null)
            .setOnDismissListener(() => {
                this.mw.show();
            }).create();
        dialog.getWindow().setType(WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY);
        dialog.show();
        this.mw.close();
    }
    set_cache_data(data) {
        if (this.data.img) {
            this.data.img.recycle();
        }
        this.data = data;
    }
    destroy() {
        this.capturer.stop();
        if (this.data.img) {
            this.data.img.recycle();
        }
        this.translateManager.release();
        this.ocrManager.release();
    }
}

async function main() {
    const app = new MyApp();
    process.on('exit', () => {
        app.destroy();
        console.warn('程序退出')
    })
    $autojs.keepRunning();
}
main();