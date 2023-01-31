let Floaty_util = require('./utils/Floaty_util.js')

//悬浮窗
function MyFloaty(zb) {
    events.__asEmitter__(this);
    let config = this.config = {
        x: 200,
        y: 200,
        w: 460,
        h: 180,
    };
    Object.assign(config, zb || {});
    this.barWindow = floaty.rawWindow(
        <vertical id="vi" h="100px" bg="#90000000">
            <horizontal >
                <button margin="0" padding="0" id="sdt" w="140px" h="100px" text="设置"/>
                <button  margin="0" padding="0" id="ok" h="100px" text="识别"/>
                <button  margin="0" padding="0" id="dp" w="140px" h="100px" text="详细"/>
                <button  margin="0" padding="0" id="exit" h="100px" text="退出"/>
                <button  margin="0" padding="0" id="db" w="140px" h="100px" text="对比"/>
            </horizontal>
        </vertical>

    );
    this.window = floaty.rawWindow(
        <frame id="vi" w="*" h="*" bg="#aa89abba">
            <View w="*" h="*" id="tp" />
            <img id="cant" w="70px" h="70px" layout_gravity="right|bottom" src="file://./img/Screenshot_20200120072559.png" />
            <text id="rw" gravity="center" layout_gravity="center" padding="0" marginBottom="0px" textColor="#ffffff" text="这里是截图区域" textSize="15sp"/>
        </frame>
    );
    Floaty_util.setFullScreen(this.window,true);
    Floaty_util.setFullScreen(this.barWindow,true);
    //Floaty_util.setBeyond(this.window,false)
    //Floaty_util.setBeyond(this.barWindow,false)
    
    this.setSize(config.w, config.h);
    this.setPosition(config.x, config.y);
    bs(this.window.tp, () => config.x, () => config.y, (x, y) => {
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        this.setPosition(x, y);
    });
    bs(this.window.cant, () => config.w, () => config.h, (w, h, time) => {
        if (w < 250) w = 250;
        if (h < 70) h = 70;
        this.setSize(w, h);
    });
    this.window.tp.on('up', () => {
        this.emit('save_position', this.getPosition());
    });
    this.window.cant.on('up', () => {
        this.emit('save_position', this.getPosition());
        //this.savePosition();
    })
}
MyFloaty.prototype.setPosition = function(x, y) {
    this.window.setPosition(x, y+100);
    this.barWindow.setPosition(x, y);
    this.config.x = x;
    this.config.y = y;
}
MyFloaty.prototype.setSize = function(w, h) {
    let time = new Date().getTime();
    if (this.setSizeTime) {
        //设置调整悬浮大小的时间间隔，以免卡顿
        if (time - this.setSizeTime < 50) return false;
    }
    this.setSizeTime = time;
    this.window.setSize(w, h);
    this.barWindow.setSize(w, 100);
    this.config.w = w;
    this.config.h = h;
}
MyFloaty.prototype.setContent = function(str) {
    ui.post(() => {
        this.window.rw.text(str);
        this.window.rw.setTextColor(colors.parseColor('#ffffff'))
    });
}
MyFloaty.prototype.setErrorContent = function(str){
    ui.post(() => {
        this.window.rw.text(str);
        this.window.rw.setTextColor(colors.parseColor('#d71345'))
    });
}
MyFloaty.prototype.setVisibility = function(vp, i) {
    ui.post(() => {
        //控制悬浮窗可见性,vp为布尔值表示显示或影藏
        let kj = vp ? 'visible' : 'invisible';
        if (i === 2) {
            this.window.vi.attr("visibility", kj);
        }
        if (i === 1) {
            this.window.vi.attr("visibility", kj);
            this.barWindow.vi.attr("visibility", kj);
            this.window.setTouchable(vp);
            this.barWindow.setTouchable(vp);
        }
    });
}
MyFloaty.prototype.getPosition = function() {
    return Object.assign({},this.config);
}

MyFloaty.prototype.getAsbPosition = function() {
    const zb = this.getPosition();
    zb.y+=100;
    return zb;
}


//获取屏幕方向 1为竖屏，2为横屏
function getOrientation() {
    return context.getResources().getConfiguration().orientation;
}
//获取状态栏高度
function getStatusBarHeight() {
    let resources = context.getResources();
    let resourceId = resources.getIdentifier("status_bar_height", "dimen", "android");
    let height = resources.getDimensionPixelSize(resourceId);
    //log("status bar>>>", "height:" + height);
    return height;
}

function bs(view, getWX, getHY, callback) {
    let x, y, x2, y2, time;
    let longClick;
    view.setOnTouchListener(function(view, event) {
        switch (event.getAction()) {
            case event.ACTION_DOWN:
                x = event.getRawX();
                y = event.getRawY();
                x2 = getWX();
                y2 = getHY();
                time = new Date().getTime();
                longClick = false;
                return true;
            case event.ACTION_MOVE:
                let time2 = new Date().getTime();
                if (!longClick && time2 > 1500) {
                    longClick = true;
                    view.emit('longClick');
                }
                let x1 = event.getRawX() + x2 - x;
                let y1 = event.getRawY() + y2 - y;
                callback(x1, y1, time2 - time);
                return true;
            case event.ACTION_UP:
                view.emit('up');
                if (new Date().getTime() - time < 100) {
                    view.emit('click');
                }
                return true;
        }
        return true;
    });
}
module.exports = MyFloaty;

setInterval(() => {}, 1000);