var path = require('path');
var fs = require('fs');
exports.replacePlaceholder = function(reg, data, opts) {
    var i;
    if (data && opts && reg) {
        for (i in reg) {
            data = data.replace(reg[i], opts[i]);
        }
    }
    return data;
}


exports.pageRegExp = {
    module: /(\[\$)(module)(\$\])/ig,
    controller: /(\[\$)(controller)(\$\])/ig,
    page: /(\[\$)(page)(\$\])/ig,
    title: /(\[\$)(title)(\$\])/ig,
}

exports.jsRegExp = {
    name: /(\[\$)(name)(\$\])/ig
}

exports.mainJsRegExp = {
    import: /(\/\/#)import/gi,
    insert: /(\/\/#)insert/gi,
}

exports.mkdirsSync = function(dirpath, mode) {
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split(path.sep).forEach(function(dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            }
            else {
                pathtmp = dirname;
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp, mode)) {
                    return false;
                }
            }
        });
    }
    return true;
}