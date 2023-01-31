const axios =require('axios');
const querystring = require('querystring');
const config =require('../config.js');
const crypto = require('crypto');
const ApiError = require('./lib/ApiError.js');

const LanguageTypeList={
    auto:'自动识别',
zh:'简体中文',
'zh-TW':'繁体中文',
en:'英语',
ja:'日语',
ko:'韩语',
fr:'法语',
es:'西班牙语',
it:'意大利语',
de:'德语',
tr:'土耳其语',
ru:'俄语',
pt:'葡萄牙语',
vi:'越南语',
id:'印尼语',
th:'泰语',
ms:'马来西亚语',
ar:'阿拉伯语',
hi:'印地语',
}

class TencentTranslate {
    static appid = config.TencentTranslate?.appid;
    static key = config.TencentTranslate?.key;
    static getLanguageType(name){
        const tryName = {
            '中文':'简体中文',
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
        sourceType = TencentTranslate.getLanguageType(sourceType);
        targetType = TencentTranslate.getLanguageType(targetType);
        this.appid = appid||TencentTranslate.appid||'';
        this.key = key||TencentTranslate.key||'';
        this.sourceType = sourceType||'auto';
        this.targetType = targetType||'zh';
    }
    async translate(str){
        const endpoint = "tmt.tencentcloudapi.com"
        const service = "tmt"
        const region = "ap-guangzhou"
        const action = "TextTranslateBatch"
        const version = "2018-03-21"
        
        const dateso = (new Date()).getTime().toString().slice(0, 10); //时间截
        const body = JSON.stringify({
            Source: this.sourceType || "en",
            Target: this.targetType || "zh",
            ProjectId: 0,
            SourceTextList: str.split('\n')
        });
        //计算签名
        const authorization = siha({
            appid:this.appid,
            key:this.key,
            endpoint,
            service,
            region,
            action,
            version,
            dateso:Number(dateso),
            body,
        });
        const headers = {
            'Content-Type': "application/json; charset=utf-8",
            "HOST": endpoint,
            "X-TC-Action": action,
            "X-TC-Version": version,
            "X-TC-Region": region,
            "X-TC-Timestamp": dateso,
            "Authorization": authorization
        }
        const {data} = await axios.post('https://'+endpoint, body,{
            headers,
        });
        const res = data.Response;
        //console.log(data)
        if (res.Error) {
            throw new ApiError(res.Error.Message,res.Error.Code);
        }
        return res.TargetTextList.join?.('\n');
    }
    setLanguageType(s,t){
        this.sourceType =TencentTranslate.getLanguageType(s)||this.sourceType;
        this.targetType = TencentTranslate.getLanguageType(t)||this.targetType;
    }
}




function sha256(message, secret = '', encoding) {
    const hmac = crypto.createHmac('sha256', secret)
    return hmac.update(message).digest(encoding)
}

function getHash(message, encoding = 'hex') {
    const hash = crypto.createHash('sha256')
    return hash.update(message).digest(encoding)
}

function getDate(timestamp) {
    const date = new Date(timestamp * 1000)
    const year = date.getUTCFullYear()
    const month = ('0' + (date.getUTCMonth() + 1)).slice(-2)
    const day = ('0' + date.getUTCDate()).slice(-2)
    return `${year}-${month}-${day}`
}

function siha({appid,key,endpoint,service,body,action,region,version,dateso}) {
    // 密钥参数
    const SECRET_ID = appid
    const SECRET_KEY = key

    //const timestamp = getTime()
    const timestamp = dateso;
    //时间处理, 获取世界时间日期
    const date = getDate(timestamp)

    // ************* 步骤 1：拼接规范请求串 *************
    const signedHeaders = "content-type;host"

    const payload = body;//"{\"Limit\": 1, \"Filters\": [{\"Values\": [\"\\u672a\\u547d\\u540d\"], \"Name\": \"instance-name\"}]}"

    const hashedRequestPayload = getHash(payload);
    const httpRequestMethod = "POST"
    const canonicalUri = "/"
    const canonicalQueryString = ""
    const canonicalHeaders = "content-type:application/json; charset=utf-8\n" + "host:" + endpoint + "\n"

    const canonicalRequest = httpRequestMethod + "\n" +
        canonicalUri + "\n" +
        canonicalQueryString + "\n" +
        canonicalHeaders + "\n" +
        signedHeaders + "\n" +
        hashedRequestPayload
    //console.log(canonicalRequest)

    // ************* 步骤 2：拼接待签名字符串 *************
    const algorithm = "TC3-HMAC-SHA256"
    const hashedCanonicalRequest = getHash(canonicalRequest);
    const credentialScope = date + "/" + service + "/" + "tc3_request"
    const stringToSign = algorithm + "\n" +
        timestamp + "\n" +
        credentialScope + "\n" +
        hashedCanonicalRequest
    //console.log(stringToSign);

    // ************* 步骤 3：计算签名 *************
    const kDate = sha256(date, 'TC3' + SECRET_KEY)
    const kService = sha256(service, kDate)
    const kSigning = sha256('tc3_request', kService)
    const signature = sha256(stringToSign, kSigning, 'hex')
    //console.log(signature)

    // ************* 步骤 4：拼接 Authorization *************
    const authorization = algorithm + " " +
        "Credential=" + SECRET_ID + "/" + credentialScope + ", " +
        "SignedHeaders=" + signedHeaders + ", " +
        "Signature=" + signature
    return authorization;
}

module.exports = TencentTranslate;