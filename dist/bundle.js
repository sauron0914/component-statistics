'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs$1 = require('fs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs$1);

var includeFile = ['.tsx', '.jsx', '.ts', '.js', '.html'];
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
var Grid = require("console-grid");
var cwd = process.cwd() + '/';
function cutPath(str) {
    return str.replace(cwd.substr(0, cwd.length - 1), '');
}
var findComponents = function (path, res) {
    var readFileSyncRes = fs.readFileSync(path, 'utf8');
    var matchRes = readFileSyncRes.match(/\<[A-Z]\w+/g);
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
var statistics = function () {
    var grid = new Grid();
    var res = {};
    traverseFile(cwd.substr(0, cwd.length - 1), function (path) { return findComponents(path, res); });
    var data = {
        option: {
            sortField: "count"
        },
        columns: [{
                id: "name",
                name: "ComponentName",
                type: "string",
                maxWidth: 38
            }, {
                id: "count",
                name: "Count",
                type: "string",
                maxWidth: 7
            }, {
                id: "paths",
                name: "Paths",
                type: "string",
                maxWidth: 200
            }],
        rows: Object.entries(res).reduce(function (pre, _a) {
            var el = _a[0], value = _a[1];
            pre.push({
                name: "\u001B[40m \u001B[31m " + el + " \u001B[0m",
                count: value.count,
                paths: value.elements.join('\n')
            });
            return pre;
        }, [])
    };
    grid.render(data);
};

exports.statistics = statistics;
