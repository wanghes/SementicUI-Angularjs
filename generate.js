var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var fs = require('fs');
var path = require('path');
var helps = require('./generaters/tools/helps.js');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/generaters/view'));

//创建页面，并创建相关的js控制器，并添加控制器引用到main.js入口文件
app.post('/createPage', function(req, res) {
    var body = req.body;
    var page = body.page;
    body.module = body.controller = body.page;

    async.waterfall([
        function(callback) {
            fs.readFile('./generaters/model/index.html', 'utf-8', function(err, data) {
                callback(null, data);
            });
        },
        function(data, callback) {
            var data = data,
                fixedData;
            fixedData = helps.replacePlaceholder(helps.pageRegExp, data, body);
            callback(null, fixedData);
        },
        function(data, callback) {
            fs.writeFile('./src/modules/' + page + '.html', data, {
                encoding: 'utf-8',
                mode: 438,
                flag: 'w'
            }, function(err) {
                if (err) {
                    return console.log(err);
                }
                callback(null, { status: true });
            });
        },
        function(data, callback) {
            if (data.status) {
                fs.readFile('./generaters/model/controller.js', 'utf-8', function(err, data) {
                    callback(null, data);
                });
            }
        },
        function(data, callback) {
            var data = data,
                fixedData;
            fixedData = helps.replacePlaceholder(helps.jsRegExp, data, { name: page });
            callback(null, fixedData);
        },
        function(data, callback) {
            var jsDirPath = __dirname + '\\src\\js\\pages';
            if (!fs.existsSync(jsDirPath)) {
                helps.mkdirsSync(jsDirPath, true);
                console.log('Common目录创建成功');
            }

            fs.writeFile(jsDirPath + '\\' + page + 'Ctrl.js', data, {
                encoding: 'utf-8',
                mode: 438,
                flag: 'w'
            }, function(err) {
                if (err) {
                    return console.log(err);
                }
                callback(null, { status: true });
            });
        },
        function(data, callback) {
            if (data.status) {
                fs.readFile('./src/js/main.js', 'utf-8', function(err, data) {
                    callback(null, data);
                });
            }
        },
        function(data, callback) {
            var data = data,
                fixedData;
            fixedData = helps.replacePlaceholder(helps.mainJsRegExp, data, {
                import: "import " + page + "Ctrl from './pages/" + page + "Ctrl';\n//#import",
                insert: page + "Ctrl();\n//#insert"
            });
            callback(null, fixedData);
        },
        function(data, callback) {
            fs.writeFile('./src/js/main.js', data, {
                encoding: 'utf-8',
                mode: 438,
                flag: 'w'
            }, function(err) {
                if (err) {
                    return console.log(err);
                }
                callback(null, { status: true , mes:"html和js文件创建成功"});
            });
        }
    ], function(err, result) {
        res.send(result);
    });

});




//显示menuJson.js文件内容到textara文本域
app.get('/menu', function(req, res) {
    async.waterfall([
        function(callback) {
            fs.readFile('./src/js/modules/frame/menuJson.js', 'utf-8', function(err, data) {
                callback(null, data);
            });
        }
    ], function(err, result) {
        res.send(result);
    });
});
//修该文本域的menuJson.js内容
app.post('/addMenu', function(req, res) {
    var json = req.body.json;
    async.waterfall([function(callback) {
        fs.writeFile('./src/js/modules/frame/menuJson.js', json, {
            encoding: 'utf-8',
            mode: 438,
            flag: 'w'
        }, function(err) {
            if (err) {
                return console.log(err);
            }
            callback(null, { status: true, mes: "menu变更成功" });
        });
    }], function(err, result) {
        res.send(result)
    });
});

//单独创建控制器
app.post('/createCtrl', function(req, res) {
    var body = req.body;

    async.waterfall([
        function(callback) {
            fs.readFile('./generaters/model/controller.js', 'utf-8', function(err, data) {
                callback(null, data);
            });
        },
        function(data, callback) {
            var data = data,
                fixedData;
            fixedData = helps.replacePlaceholder(helps.jsRegExp, data, body);
            callback(null, fixedData);
        },
        function(data, callback) {
            var jsDirPath = __dirname + '\\src\\js\\pages';

            if (!fs.existsSync(jsDirPath)) {
                helps.mkdirsSync(jsDirPath,true);
                console.log('Common目录创建成功');
            }
            fs.writeFile(jsDirPath +"\\"+ body.name + 'Ctrl.js', data, {
                encoding: 'utf-8',
                mode: 438,
                flag: 'w'
            }, function(err) {
                if (err) {
                    return console.log(err);
                }
                callback(null, { status: 1, mes: "js文件创建成功" });
            });
        }
    ], function(err, result) {
        res.send(result);
    });
});



app.listen(2468);
