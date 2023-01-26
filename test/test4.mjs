import App from './OcrEngines/index.mjs'
import image from 'image';

async function main() {
    let s = new App();
    let list = App.getEngine_list();
    console.log(list[0].create)
    await s.switch_engine(list[1]);
    
    let img = await image.readImage('/sdcard/00selp个人文件/Screenshot_20230109201619.jpg');
    //识别图片
    process.on('exit', () => {
        s.release();
        img.recycle();
    });
    let res = await s.detect(img);
    console.log(res)
}
$autojs.keepRunning()

main().catch(console.error)