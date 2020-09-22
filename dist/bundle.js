'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs$1 = require('fs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs$1);

var includeFile = ['.tsx', '.jsx', '.ts', '.js', '.vue', '.html'];
var matchSuffix = function (str) {
    var res = str.match(/\.\w+/g);
    return res ? res[res.length - 1] : '';
};
var traverseFile = function (src, callback) {
    var paths = fs__default['default'].readdirSync(src).filter(function (item) { return item !== 'node_modules'; });
    paths.forEach(function (path) {
        var _src = src + '/' + path;
        var statSyncRes = fs__default['default'].statSync(_src);
        if (statSyncRes.isFile() && includeFile.includes(matchSuffix(path))) { //如果是个文件则拷贝
            callback(_src);
        }
        else if (statSyncRes.isDirectory()) { //是目录则 递归 
            traverseFile(_src, callback);
        }
    });
};

var fs = require('fs');
var exec = require('child_process').exec;
var Grid = require("console-grid");
var cwd = process.cwd() + '/';
function cutPath(str) {
    return str.replace(cwd.substr(0, cwd.length - 1), '');
}
var findComponents = function (path, res) {
    var readFileSyncRes = fs.readFileSync(path, 'utf8');
    var matchRes = readFileSyncRes.match(/(\<[A-Z]\w+)|(\<[a-z]\w+-\w+)/g);
    if (!matchRes)
        return;
    matchRes.forEach(function (item) {
        var el = item.substr(1);
        if (Object.keys(res).includes(el)) {
            res[el].count++;
            res[el].elements.push(cutPath(path));
        }
        else {
            res[el] = {
                count: 1,
                elements: [cutPath(path)]
            };
        }
    });
};
var createGird = function (val) {
    var grid = new Grid();
    grid.render({
        option: {
            sortField: "count"
        },
        columns: [{
                id: "componentName",
                name: "componentName",
                type: "string",
                maxWidth: 38
            }, {
                id: "count",
                name: "Value",
                type: "string",
                maxWidth: 7
            }],
        rows: Object.entries(val).reduce(function (pre, _a) {
            var key = _a[0], value = _a[1];
            pre.push({
                componentName: "\u001B[31m " + key + " \u001B[39m",
                count: value.count
            });
            return pre;
        }, [])
    });
};
var statistics = function () {
    var res = {};
    traverseFile(cwd.substr(0, cwd.length - 1), function (path) { return findComponents(path, res); });
    var data = Object.entries(res).reduce(function (pre, _a) {
        var key = _a[0], value = _a[1];
        pre.push({
            componentName: key,
            count: value.count,
            paths: value.elements
        });
        return pre;
    }, []).sort(function (a, b) { return b.count - a.count; }).reduce(function (pre, item) {
        pre[item.componentName] = {
            count: item.count,
            paths: item.paths
        };
        return pre;
    }, {});
    fs.writeFile(cwd + 'components-statistics.json', JSON.stringify(data, null, '\t'), {}, function (err) {
        if (err)
            console.log(err);
        console.log('文件创建成功，地址：' + cwd + 'components-statistics.json');
        console.log('!!!注意：默认会在当前目录下生成一个components-statistics.json文件');
        createGird(data);
        exec('open ' + cwd + 'components-statistics.json');
    });
};

exports.statistics = statistics;
