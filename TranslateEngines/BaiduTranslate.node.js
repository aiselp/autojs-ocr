const axios =require('axios');
const querystring = require('querystring');
const config =require('../config.js');
const crypto = require('crypto');
const ApiError = require('./lib/ApiError.js');

const LanguageTypeList ={
    auto:'自动检测',
zh:'中文',
en:'英语',
yue:'粤语',
wyw:'文言文',
jp:'日语',
kor:'韩语',
fra:'法语',
spa:'西班牙语',
th:'泰语',
ara:'阿拉伯语',
ru:'俄语',
pt:'葡萄牙语',
de:'德语',
it:'意大利语',
el:'希腊语',
nl:'荷兰语',
pl:'波兰语',
bul:'保加利亚语',
est:'爱沙尼亚语',
dan:'丹麦语',
fin:'芬兰语',
cs:'捷克语',
rom:'罗马尼亚语',
slo:'斯洛文尼亚语',
swe:'瑞典语',
hu:'匈牙利语',
cht:'繁体中文',
vie:'越南语',
}
class BaiduTranslate{
    static uri = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
    static appid = config.BaiduTranslate?.appid;
    static key = config.BaiduTranslate?.key;
    static getLanguageType(name){
        const tryName = {
            '中文':'中文',
            '英文':'英语',
            '日文':'日语',
        }
        name = tryName[name]||name;
        for (let [key,val] of Object.entries(LanguageTypeList)){
            if (val ==name||key==name){
                return key;
            }
        }
        return null;
    }
    static getLanguageTypeList(){
        return Object.values(LanguageTypeList)
    }
    constructor(config={}){
        let {appid,key,sourceType,targetType} =config;
        sourceType = BaiduTranslate.getLanguageType(sourceType);
        targetType = BaiduTranslate.getLanguageType(targetType);
        this.appid = appid||BaiduTranslate.appid||'';
        this.key = key||BaiduTranslate.key||'';
        this.sourceType = sourceType||'auto';
        this.targetType = targetType||'zh';
    }
    async translate(str){
        const appid = this.appid;
        const key = this.key;
        let salt = (new Date()).getTime();
        let sign = this.compute_md5(appid + str + salt + key);
        const {data} = await axios.post(BaiduTranslate.uri,querystring.stringify({
            q:str,appid,salt,sign,
            from:this.sourceType,
            to:this.targetType,
        }));
        if (data.error_code) {
            throw new ApiError(data.error_msg,data.error_code);
        }
        const All_dst = data.trans_result.map(v=>v.dst);
        return All_dst.join('\n');
    }
    setLanguageType(s,t){
        this.sourceType =BaiduTranslate.getLanguageType(s)||this.sourceType;
        this.targetType = BaiduTranslate.getLanguageType(t)||this.targetType;
    }
    compute_md5(str){
        const md5sum = crypto.createHash('md5');
        md5sum.update(str);
        return md5sum.digest('hex');
    }
    release(){
        
    }
}

module.exports= BaiduTranslate;