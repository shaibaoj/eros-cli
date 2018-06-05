/**
 * @Author: songqi
 * @Date:   2017-01-10
 * @Last modified by:   songqi
 * @Last modified time: 2017-03-23
 */

var print = require('../../utils/print'),
    argv = require('yargs').argv,
    gulpServer = require('./server/gulpfile');

var config = {
    name: 'build',
    explain: 'build for eros project.',
    command: 'eros build',
    options: [{
        keys: ['-h', '--help'],
        describe: 'read help.'
    }, {
        keys: ['-s', '--send'],
        describe: 'pack production zip and send to server.'
    }, {
        keys: ['-d', '--diff'],
        describe: 'generate diff zip.'
    },{
        keys: ['-p', '--appid'],
        describe: 'generate diff zip.'
    },{
        keys: ['-a', '--android'],
        describe: 'generate diff zip.'
    },{
        keys: ['-i', '--io'],
        describe: 'generate diff zip.'
    },{
        keys: ['-c', '--config'],
        describe: 'config name.'
    },{
        keys: ['--dev'],
        describe: 'config name.'
    }]
}

function helpTitle() {
    print.title(config);
}

function helpCommand() {
    print.command(config);
}

function run() {
    if (argv.h || argv.help) {
        helpCommand();
    } else {
        gulpServer.start('weex');
    }
}

module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}