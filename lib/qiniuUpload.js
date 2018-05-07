'use strict'

const configS = require("../config")
const accessKey = configS.qiniuConfig.accessKey;
const secretKey = configS.qiniuConfig.secretKey;
const urlPrefix = configS.qiniuConfig.urlPrefix;
const bucket = configS.qiniuConfig.bucket;

const QinuUpload = module.exports = {};
const qiniu = require("qiniu");

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

const options = {
    scope: bucket,
    returnBody:'{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","imgWidth":$(imageInfo.width),"imgHeight":$(imageInfo.height)}'
}
const putPolicy = new qiniu.rs.PutPolicy(options);

const uploadToken = putPolicy.uploadToken(mac);
const config = new qiniu.conf.Config();

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

QinuUpload.uploadFile = (filePath)=> {
    return new Promise((resovle, reject)=> {
        formUploader.putFile(uploadToken, null, filePath, putExtra,
            function (respErr,respBody, respInfo) {
                if (respErr) {
                    reject(respErr);
                    return;
                }

                if (respInfo.statusCode == 200) {
                    respBody.url = urlPrefix+respBody.key;
                    console.log(respBody);
                    resovle(respBody)
                } else {
                    reject(respInfo.statusCode)
                    console.log(respBody);
                }
            })
    })

}

