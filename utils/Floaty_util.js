importClass(android.view.WindowManager);

/*
   作者:selp
   qq:201228773
*/
//设置全屏
function setFullScreen(floaty, b) {
    if (b) {
        addFlags(floaty, WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN);
    } else {
        removeFlags(floaty, WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN);
    }

}
//设置是否能够超出屏幕
function setBeyond(floaty, b) {
    if (b) {
        addFlags(floaty, WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
    } else {
        removeFlags(floaty, WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
    }
}

function hide(floaty) {
    let mWindow = getAjWindow(floaty);
    ui.run(() => {
        mWindow.windowManager.removeView(mWindow.windowView)
    })
}

function show(floaty) {
    let mWindow = getAjWindow(floaty);
    ui.run(() => {
        mWindow.windowManager.addView(mWindow.windowView, mWindow.windowLayoutParams)
    })
}

function getAjWindow(floaty) {
    //反射测试
    let field = floaty.class.getDeclaredField('mWindow');
    field.setAccessible(true);
    return field.get(floaty);
    //log(mWindow.windowManager);
}

function addFlags(floaty, flags) {
    let mWindow = getAjWindow(floaty);
    let layoutParams = mWindow.getWindowLayoutParams();
    layoutParams.flags |= flags;
    ui.run(() => {
        mWindow.updateWindowLayoutParams(layoutParams);
    })
}

function removeFlags(floaty, flags) {
    let mWindow = getAjWindow(floaty);
    let layoutParams = mWindow.getWindowLayoutParams();
    layoutParams.flags &= ~flags;
    ui.run(() => {
        mWindow.updateWindowLayoutParams(layoutParams);
    })
}

exports.setFullScreen = setFullScreen;
exports.setBeyond = setBeyond;
exports.hide = hide;
exports.show = show;
exports.removeFlags = removeFlags;
exports.addFlags = addFlags;