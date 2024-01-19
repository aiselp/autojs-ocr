
if (typeof id ==='undefined'){
    require('rhino').install();
}
let Rect = android.graphics.Rect;

function MyRect(x,y,w,h){
   let obj=Object.create(new Rect(),{
       x:{
           get(){
               return this.left
           },
           set(v){
              this.left = v;
           },
           enumerable:true
       },
       y:{
           get(){
               return this.top
           },
           set(v){
              this.top = v;
           },
           enumerable:true
       },
       w:{
           get(){
              return this.right -this.left
           },
           set(v){
              this.right = this.left+v; 
           },
           enumerable:true
       },
       h:{
           get(){
               return this.bottom-this.top;
           },
           set(v){
               this.bottom = this.top+v
           },
           enumerable:true
       }
   });
   obj.x = x||0;
   obj.y = y||0;
   obj.w = w||0;
   obj.h = h||0;
   Object.assign(obj,MyRect.prototype);
   return obj;
}

module.exports = MyRect;