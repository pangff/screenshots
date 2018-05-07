"use strict";

const Koa = require('koa')
const app = new Koa()
const loggerAsync  = require('./middleware/logger-async')

app.use(loggerAsync())

app.use( async ( ctx ) => {
  ctx.body = 'hello screenshots'
})

app.listen(3000)
console.log('start screenshots at 3000')