const config =require('../config.js');
const image =require('image');
const axios =require('axios');
const querystring = require('querystring');

class BaiduOCR {
    static language_type_list = {
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
    static check() {
        if (config.BaiduOCR.access_token) {
            return true;
        }
        return false;
    }
    static async create() {
        return new BaiduOCR()
    }
    constructor() {
        this.language_type = "CHN_ENG";
        this.access_token = config.BaiduOCR.access_token;
    }
    setAccess_token() {
        this.access_token = access_token;
    }
    async detect(aj_img, c) {
        let img = await image.encodeImage(aj_img);
        let uri = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=" + this.access_token;
        let res =await axios.post(uri, querystring.stringify({
            language_type: this.language_type,
            image: img,
            probability: "true",
        }));
        let result = res.data;
        if (result.error_code) {
            throw new ApiError(result.error_msg,result.error_code);
        }
        return result_format(result, c);
    }
    setLanguage_type(language_name){
        const tyname = {
            '中文':'中英文',
            '英文':'英文',
            '日文':'日语',
        }
        language_name = tyname[language_name]||language_name;
        
        for (let [key,val] of Object.entries(BaiduOCR.language_type_list)){
            if (val ==language_name){
                this.language_type = key;
                break;
            }
        }
    }
    release() {

    }
}
//结果处理
function result_format(result, c) {
    const data = {
        text: '',
        result: []
    };
    data.result = result.words_result.filter(item => item.probability.average > (c || 0.5)).map((item) => {
        data.text += item.words;
        return {
            text: item.words,
            confidence: item.probability.average,
        }
    })
    return data;
}

class ApiError extends Error {
    constructor(message,code) {
        super()
        this.message = message;
        this.code = code;
        this.name = 'ApiError';
    }
}

module.exports= BaiduOCR;