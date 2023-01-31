import plugins from 'plugins';
import image from 'image';

async function main() {
    //导入插件
    let ocr = await plugins.load("com.hraps.ocr")
    //导入需识别的图片，请自行输入图片路径
    let img = await image.readImage('/sdcard/00selp个人文件/Screenshot_20230109201619.jpg');
    //识别图片
    let results =await ocr.detect(img.toBitmap(), 1);
    img.recycle();
    console.info("过滤前结果数：" + results.size())
    //识别结果过滤
    results = ocr.filterScore(results, 0.5, 0.5, 0.5)
    //输出最终结果
    for (var i = 0; i < results.size(); i++) {
        var re = results.get(i)
        log("结果:" + i + "  文字:" + re.text + "  位置:" + re.frame + "  角度类型:" + re.angleType)
        log("区域置信度:" + re.dbScore + "  角度置信度:" + re.angleScore + "  文字置信度:" + re.crnnScore + "\n")
    }
    
}
main()
//console.info(process.env.AUTOJS_NATIVE_LIBRARY_PATH)
//java.lang.System.exit(0)