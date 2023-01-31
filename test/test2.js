importClass(android.view.WindowManager);
importClass(android.view.WindowManager.LayoutParams);
function getStatusBarHeight() {
    let resources = context.getResources();
    let resourceId = resources.getIdentifier("status_bar_height", "dimen", "android");
    let height = resources.getDimensionPixelSize(resourceId);
    //log("status bar>>>", "height:" + height);
    return height;
}

//toastLog(getStatusBarHeight())

let MyFloaty = require('./MyFloaty.js');
let f = new MyFloaty();
f.barWindow.exit.on("click", () => {
    exit();
});
log(function(){} instanceof Object)