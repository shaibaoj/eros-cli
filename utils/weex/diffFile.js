/**
 * @Author: songqi
 * @Date:   2017-03-09
 * @Last modified by:   songqi
 * @Last modified time: 2017-03-09
 */
var fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    print = require('../print'),
    __request = require('request'),
    argv = require('yargs').argv,
    logger = require('../logger'),
    Process = require('child_process'),
    readConfig = require('../readConfig');

var appName = readConfig.get('appName'),
    diffpwd = readConfig.get('diff')['pwd'];

    var co = require('co');
    var OSS = require('ali-oss');
    var fs = require('fs');    
    
    var jsPath = readConfig.get('diff')['proxy'];
if(argv.p){
    appName = argv.p;
}    

function makeDiff(jsVersion, newZipFolder) {

    logger.success(`-------------makeDiff----jsVersion----${jsVersion} `)

    var files = fs.readdirSync(newZipFolder),
        newZip = path.resolve(process.cwd(), 'dist/js/' + jsVersion + '.zip'),
        promiseAll = files.map(function(item) {
            logger.success(`-------------makeDiff----jsVersion--3--${jsVersion} `)

            if (item.indexOf('.zip') !== -1 && item !== jsVersion + '.zip') {
                var md5 = item.slice(0, -4),
                    oldZip = path.resolve(newZipFolder, md5 + '.zip'),
                    diffZipMd5 = crypto.createHash('md5').update(md5 + jsVersion, 'utf8').digest('hex'),
                    diffZip = path.resolve(process.cwd(), 'dist/js/' + diffZipMd5 + '.zip');

                // 如果diff md5的值一样 证明2个包没有变化 这时候bsdiff出来的差分包就会有问题 直接return
                var noNeedPatch = (+md5 === +diffZipMd5);
                if (noNeedPatch) return;

                logger.success(`-------------makeDiff----jsVersion--2--${jsVersion} `)


                return new Promise(function(resolve, reject) {
                    Process.exec('bsdiff ' + oldZip + ' ' + newZip + ' ' + diffZip, function(error, stdout, stderr) {
                        if (error !== null) {
                            print.info('exec error: ' + error);
                            return;
                        }

                        var times = new Date().getTime();
                        var url_sign = crypto.createHash('md5').update(""+times, 'utf8').digest('hex');
                        // var requestUrl = argv.s || argv.send;

                        logger.success(`-------------makeDiff----jsVersion--1--${jsVersion} `)


                        var requestUrl_diff ='http://ok.haopintui.net/app/publish/diff';

                        if (requestUrl_diff) {
                            __request.post(requestUrl_diff, {
                                form: {
                                    times:times,
                                    url_sign:url_sign,
                                    appName:appName,
                                    js_version1:jsVersion,
                                    js_version2:md5,
                                    jsVersion:diffZipMd5,
                                    jsPath:jsPath,
                                }
                            }, function(error1, response, body) {
                                logger.success(`-------------makeDiff----jsVersion--4--${jsVersion} `)

                                if (!error1 && response.statusCode == 200) {
                                    // logger.log('resp1111onse---: %s', ""+JSON.stringify(response));
                                } else {
                                    // logger.log('response---: %s', ""+JSON.stringify(response));
                                    logger.log('eros publish fail: %s', error1);
                                }
                            });

                            var client = new OSS({
                                region: 'oss-cn-hangzhou',
                                accessKeyId: 'PrIUOjuApfQbBs2b',
                                accessKeySecret: '4TwjLaHtCxuWm3VRAOpltao5V88cI4',
                                bucket: 'app-youdanhui'
                            });
                            co(function* () {
                                // // use 'chunked encoding'
                                console.log('targetPath-:'+diffZip);
                                console.log('diffZipMd5-:'+'dist/js/' + diffZipMd5 + '.zip');
                                var size = fs.statSync(diffZip).size;
                                console.log('size-:'+size);

                                try {
                                    // var stream = fs.createReadStream(diffZip);
                                    // console.log('size-1:'+size);
                                    // var result = yield client.putStream('dist/js/' + diffZipMd5 + '.zip', stream);
                                    var result = yield client.put('dist/js/' + diffZipMd5 + '.zip', diffZip);
                                    console.log('size-2:'+size);
                                    console.log(result);
                                    console.log('targetPath-:end');
                                } catch (error222) {
                                    console.log(error222);
                                }
                                // don't use 'chunked encoding'
                                // var stream = fs.createReadStream(diffZip);
                                // var size = fs.statSync(diffZip).size;
                                // var result = yield client.putStream('dist/js/' + diffZipMd5 + '.zip', stream, {contentLength: size});
                                // console.log(result);
                            }).catch(function (err) {
                                console.log(err);
                            });

                        }

                        resolve();
                    })
                });
            }
        });

    Promise.all(promiseAll).then(function() {
        process.send({
            type: 'done'
        });
    })
}

process.on('message', function(message) {
    var diffpwd = message.diffpwd;
    var appName = message.appName
    
    logger.success(`-------------diffpwd--------${diffpwd} `)
    logger.success(`-------------appName--------${appName} `)
    logger.success(`-------------message.jsVersion--------${message.jsVersion} `)

    var jsVersion = message.jsVersion,
        filePath = path.resolve(diffpwd, appName);
    fs.stat(filePath, function(err, data) {
        if (err) {
            fs.mkdirSync(filePath);
            makeDiff(jsVersion, filePath)
        } else {
            makeDiff(jsVersion, filePath);
        }
    });
});