"ui-thread";
import {
    Color
} from 'color';
import {
    inflateXml,
    defaultThemeContext
} from 'ui';
import {
    createWindow,
    canDrawOverlays,
    manageDrawOverlays,
    FLAG_LAYOUT_IN_SCREEN
} from 'floating_window';
import { device } from 'device';
import { registerBroadcastReceiver } from "app";
import EventEmitter from 'events';
const MotionEvent = $java.findClass('android.view.MotionEvent');


class MyFloaty extends EventEmitter {
    static ScreenSize = { };
    static setScreenSize(p){
        const {screenWidth,screenHeight} = device;
        if (p==1){
            MyFloaty.ScreenSize.w = screenWidth;
            MyFloaty.ScreenSize.h = screenHeight;
        }else {
            MyFloaty.ScreenSize.h = screenWidth;
            MyFloaty.ScreenSize.w = screenHeight;
        }
    }
    static get xml() {
        return `<com.google.android.material.card.MaterialCardView id="main">
        <column>
            <frame layout_gravity="center" h="100px" bg="#90000000" >
              <horizontal gravity="center" w="*" >
                <com.google.android.material.button.MaterialButton margin="0" padding="0" id="sdt" w="140px" h="100px" text="设置"/>
                <com.google.android.material.button.MaterialButton  margin="0" padding="0" id="dp" w="140px" h="100px" text="详细"/>
                <com.google.android.material.button.MaterialButton  margin="0" padding="0" id="exit" w="140px" h="100px" text="退出"/>
                <com.google.android.material.button.MaterialButton  margin="0" padding="0" id="db" w="140px" h="100px" text="对比"/>
              </horizontal>
            </frame>
        <frame id="vi" w="*" h="*" bg="#aa89abba">
            <View w="*" h="*" id="tp" />
            <img id="cant" w="70px" h="70px" layout_gravity="right|bottom" src="@drawable/ic_zoom_out_map_black_48dp" />
            <text id="rw" gravity="center" layout_gravity="center" padding="0" marginBottom="0px" textColor="#ffffff" text="这里是截图区域\n点击识别" textSize="15sp"/>
        </frame>
        </column>
        </com.google.android.material.card.MaterialCardView>`
    }
    constructor(context) {
        super();
        const window = this.window = createWindow();
        window.addFlags(FLAG_LAYOUT_IN_SCREEN);
        window.setView(inflateXml(context||defaultThemeContext(),MyFloaty.xml));
        const config = this.config = {
            x: 200,
            y: 200,
            w: 560,
            h: 280,
        };
        this.default_config = Object.assign({},config)
        this.views = {
            cant: window.view.findView('cant'),
            tp: window.view.findView('tp'),
            dp:window.view.findView('dp'),
            seting: window.view.findView('sdt'),
            exit: window.view.findView('exit'),
            text: window.view.findView('rw'),
            vi: window.view.findView('vi'),
        }
        window.view.findView('main').getBackground().setAlpha(0)
        bs(this.views.tp, () => config.x, () => config.y, (x, y) => {
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x+config.w>MyFloaty.ScreenSize.w) x=MyFloaty.ScreenSize.w-config.w;
            if (y+config.h>MyFloaty.ScreenSize.h) y=MyFloaty.ScreenSize.h-config.h;
            this.setPosition(x, y);
        });
        bs(this.views.cant, () => config.w, () => config.h, (w, h, time) => {
            if (w < 250) w = 250;
            if (h < 170) h = 170;
            if (w+config.x>MyFloaty.ScreenSize.w) w=MyFloaty.ScreenSize.w-config.x;
            if (h+config.y>MyFloaty.ScreenSize.h) h=MyFloaty.ScreenSize.h-config.y;
            this.setSize(w, h);
        });
        this.views.tp.on('up', () => {
            this.emit('save_position', this.getPosition());
        });
        this.views.cant.on('up', () => {
            this.emit('save_position', this.getPosition());
            //this.savePosition();
        })
        window.view.findView('db').setOnTouchListener((view, event) => {
            switch (event.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    this.setVisibility(false);
                    return true;
                case MotionEvent.ACTION_UP:
                    this.setVisibility(true);
                    return true;
            }
            return true;
        });
    }
    setPosition(x, y) {
        if (!this.isOpen) return;
        this.window.setPosition(x, y);
        this.config.x = x;
        this.config.y = y;
    }
    setSize(w, h) {
        if (!this.isOpen) return;
        let time = new Date().getTime();
        if (this.setSizeTime) {
            //设置调整悬浮大小的时间间隔，以免卡顿
            if (time - this.setSizeTime < 50) return false;
        }
        this.setSizeTime = time;
        this.window.setSize(w, h);
        this.config.w = w;
        this.config.h = h;
    }
    setContent(str) {
        this.views.text.setText(str);
        this.views.text.attr('textColor', '#ffffff')
    }
    setErrorContent(str) {
        this.views.text.setText(str);
        this.views.text.attr('textColor', '#d71345')
    }
    show() {
        if (this.isOpen) return;
        this.window.show();
        this.isOpen = true;
    }
    init(zb) {
        registerBroadcastReceiver("android.intent.action.CONFIGURATION_CHANGED").on("receive", intent => {
            this.setPosition(0,0);
        })
        const config = this.config;
        Object.assign(config, zb);
        this.window.setPosition(config.x, config.y);
        this.window.setSize(config.w, config.h);
        this.show();
    }
    close() {
        if (!this.isOpen) return;
        this.window.close();
        this.isOpen = false;
    }
    setVisibility(vp) {
        //控制悬浮窗可见性,vp为布尔值表示显示或影藏
        let kj = vp ? 'visible' : 'invisible';
        this.views.vi.attr("visibility", kj);
    }
    setDefaultPosition(){
        this.setPosition(this.default_config.x, this.default_config.y);
        this.setSize(this.default_config.w, this.default_config.h);
    }
    getPosition() {
        return Object.assign({}, this.config);
    }
    getAsbPosition() {
        const zb = this.getPosition();
        zb.y += 100;
        zb.h -=100;
        return zb;
    }
}
MyFloaty.setScreenSize(getOrientation());
registerBroadcastReceiver("android.intent.action.CONFIGURATION_CHANGED").on("receive", intent => {
    MyFloaty.setScreenSize(getOrientation());
})
//获取屏幕方向 1为竖屏，2为横屏
function getOrientation() {
    return $autojs.androidContext.getResources().getConfiguration().orientation;
}
function bs(view, getWX, getHY, callback) {
    let x, y, x2, y2, time;
    let longClick;
    const MotionEvent = $java.findClass('android.view.MotionEvent');

    //console.log(MotionEvent.ACTION_DOWN)
    view.setOnTouchListener(function(view, event) {
        //console.log(event.getClass())
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                x = event.getRawX();
                y = event.getRawY();
                x2 = getWX();
                y2 = getHY();
                time = new Date().getTime();
                longClick = false;
                return true;
            case MotionEvent.ACTION_MOVE:
                let time2 = new Date().getTime();
                if (!longClick && time2 > 1500) {
                    longClick = true;
                    view.emit('longClick');
                }
                let x1 = event.getRawX() + x2 - x;
                let y1 = event.getRawY() + y2 - y;
                callback(x1, y1, time2 - time);
                return true;
            case MotionEvent.ACTION_UP:
                view.emit('up');
                if (new Date().getTime() - time < 100) {
                    view.emit('click');
                }
                return true;
        }
        return true;
    });
}
/*
let t = new MyFloaty();
t.setPosition(0, 0);
//t.setSize(400,400)
t.show();
setTimeout(()=>{
   t.setErrorContent('123') 
},1000)
$autojs.keepRunning();
*/

export default MyFloaty;