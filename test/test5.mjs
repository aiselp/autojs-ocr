import BaiduTranslate from './TranslateEngines/BaiduTranslate.node.js';

let s = new BaiduTranslate({
    
});

s.setLanguageType(null,'日语')
s.translate('key').then(console.log)
console.log(typeof 9); 