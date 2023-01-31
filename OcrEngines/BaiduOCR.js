let config = require('../config.js')

function BaiduOCR() {
    this.language_type = "CHN_ENG";
    this.access_token = config.BaiduOCR.access_token;
}
BaiduOCR.language_type_list = {
    CHN_ENG: '中英文',
    ENG: '英文',
    JAP: '日语',
    KOR: '韩语',
    FRE: '法语',
    SPA: '西班牙语',
    POR: '葡萄牙语',
    GER: '德语',
    ITA: '意大利语',
    RUS: '俄语',
}
BaiduOCR.check = function(){
    if (config.BaiduOCR.access_token){
        return true;
    }
    return false;
}
BaiduOCR.prototype.release = function() {

}
BaiduOCR.prototype.detect = function(aj_img, c) {
    let img = images.toBase64(aj_img);
    let uri = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=" + this.access_token;
    let res = http.post(uri, {
        language_type: this.language_type,
        image: img,
        probability:"true",
    });
    let result = res.body.json();
    if (result.error_code){
        throw new ApiError(result.error_code,result.error_msg);
    }
    
    return result_format(result,c);
}
BaiduOCR.prototype.setLanguage_type=function(language_name){
    let keys = Object.keys(BaiduOCR.language_type_list);
    let values = keys.map(key=>BaiduOCR.language_type_list[key]);
    
}
BaiduOCR.prototype.setAccess_token= function(access_token){
    this.access_token = access_token;
}


//结果处理
function result_format(result, c) {
    const data = {
        text: '',
        result: []
    };
    data.result = result.words_result.filter(item => item.probability.average > (c || 0.5)).map((item)=>{
        data.text+=item.words;
        return {
            text:item.words,
            confidence:item.probability.average,
        }
    })
    return data;
}
function ApiError(code,message){
    this.message = message;
    this.code = code;
    this.name = 'ApiError';
}
$util.extend(ApiError,Error)

module.exports = BaiduOCR;