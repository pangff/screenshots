"use strict";

const Koa = require('koa')
const app = new Koa()
const loggerAsync  = require('./middleware/logger-async')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const Pageres = require('pageres');
const path = require('path');
const Redis = require('ioredis');
const config = require('./config');
const redis = new Redis(config.Redis);
const uuid = require('uuid');
const qiniuUpload = require('./lib/qiniuUpload');
const md5 = require('md5');
const fs = require('fs');

app.use(loggerAsync())

app.use(bodyParser())


let main = new Router()

main.post("/",async ( ctx )=>{
  let postData = ctx.request.body;

  let url = postData.url;
  let width = postData.width;
  let height = postData.height;
  let selector = postData.selector;
  let fileId = md5(uuid.v4());
  let md5Url = md5(url);
  let imgUrl = await redis.get(md5Url);
  if(imgUrl){
    ctx.body = {code:0,imageUrl:imgUrl};
    return;
  }


  let screenshotsConfig = {
    selector:selector,
    transparent:true,
    filename:fileId
  };

 let result = await new Pageres({delay: 2})
      .src(url, [width+'x'+height],screenshotsConfig)
      .dest(path.join(__dirname,"./temp"))
      .run();

 if(result){
   let uploadResult = await qiniuUpload.uploadFile(path.join(__dirname,"./temp/"+fileId+".png"))
   await redis.set(md5Url,uploadResult.url,"EX",12*60*60*1000)
   fs.unlinkSync(path.join(__dirname,"./temp/"+fileId+".png"));
   ctx.body = {code:0,imageUrl:uploadResult.url};
 }else{
   ctx.body = {code:1,message:"error"};
 }
})



let router = new Router()
router.use('/', main.routes(), main.allowedMethods())

// 加载路由中间件
app.use(router.routes()).use(router.allowedMethods())


app.listen(3000)
console.log('start screenshots at 3000')