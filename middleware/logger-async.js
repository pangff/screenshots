"use strict";

module.exports = function () {
  return async function ( ctx, next ) {
    console.log( ctx.method, ctx.header.host + ctx.url )
    await next()
  }
}