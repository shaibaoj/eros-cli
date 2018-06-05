/**
 * @Author: songqi
 * @Date:   2016-07-15
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2017-02-15
 */

var fs = require('fs'),
    _ = require('lodash'),
    argv = require('yargs').argv,
    path = require('path');

var CONFIG = null;

function readAllConfig() {
    var config_name = 'eros.native.js';
    var config_name_dev = 'eros.dev.js';

    if (argv.config) {
        config_name = 'app/'+argv.config+'.native.js';
    }
    if (argv.dev) {
        config_name_dev = argv.dev+'.dev.js';
    }

    var configPath = path.join(process.cwd(), './config.js'),
        erosDevPath = path.join(process.cwd(), './config/'+config_name_dev),
        erosConfigPath = path.resolve(process.cwd(), './config/'+config_name);

    // 兼容weex-eros 
    if (fs.existsSync(erosConfigPath) && fs.existsSync(erosDevPath)) {
        var erosDev = require(erosDevPath),
            erosConfig = require(erosConfigPath);

        CONFIG = _.assign({
            weex: true,
            appName: erosConfig.appName,
            hotRefresh: erosConfig.hotRefresh,
            appBoard: erosConfig.appBoard,
            localZipFolder: erosConfig.zipFolder,
            version: erosConfig.version,
            framework: '// { "framework": "Vue" }\n',
            erosNativeJs: erosConfig
        }, erosDev)
        return;
    }
    // 否则只读取项目中的js文件
    if (fs.existsSync(configPath)) {
        CONFIG = require(configPath);
    }

}

function readNativeConfig() {
    var config_name = 'eros.native.js';
    var config_name_dev = 'eros.dev.js';

    if (argv.config) {
        config_name = 'app/'+argv.config+'.native.js';
    }
    if (argv.dev) {
        config_name_dev = argv.dev+'.dev.js';
    }

    return require(path.resolve(process.cwd(), './config/'+config_name))
}

function get(key) {
    if (CONFIG && CONFIG[key]) {
        return _.cloneDeep(CONFIG[key]);
    } else {
        return false;
    }
}

function getAllConfig() {
    return CONFIG || false
}
readAllConfig();

module.exports = {
    get: get,
    readNativeConfig:readNativeConfig,
    getAllConfig: getAllConfig
}