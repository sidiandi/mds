const mkdirp = require('mkdirp');
const fs = require('fs');
const touch = require("touch");
const path = require('path');

var mdContentDirectory = __dirname + "/test";

function getTitleFromRelPath(fn) {
    if (fn === '') {
        return "Home";
    };
    return decodeURIComponent(path.parse(fn).name);
}

function splitPath(relPath) {
    return relPath.split('/');
}

function getLineage(relPath) {
    var f = '';
    return splitPath(relPath).map((i) => {
        var r = f + i;
        f = r + '/';
        return r;
    });
}

function getMdLink(relPath) {
    return "[" + getTitleFromRelPath(relPath) + "](/content" + relPath + ')';
}

function getBreadcrumbs(relPath) {
    var parts = getLineage(relPath);
    return parts.reduce((s,i) => {
        return s + '' + getMdLink(i) + ' > ';
    }, '') + "\r\n";
}

function getDirectoryAsMarkdown(relPath, callback) {
    var fsPath = mdContentDirectory + relPath;
    fs.readdir(fsPath, (err, files) => {
        data = getBreadcrumbs(relPath) + files.reduce((s, i) => {
            return s + "* " + getMdLink(relPath + "/" + i) + "\r\n";
        }, "");
        callback(data);
      });
}

function createEmptyFile(fsPath, cb) {
    mkdirp(path.dirname(fsPath), (err) => {
        touch(fsPath, (err) => { cb() });
    });
}

function get(relPath, callback) {
    var fsPath = mdContentDirectory + relPath;
    fs.readFile(fsPath, "utf-8", (err, data) => { 
        if (err) {
            if (err.code == 'EISDIR') {
                getDirectoryAsMarkdown(relPath, callback);
                return;
            } else if (err.code == 'ENOENT') {
                createEmptyFile(fsPath, () => { get(relPath, callback); });
                return;
            }

            console.log(err);
            callback(null);
        }
        else {
            callback(getBreadcrumbs(relPath) + "\r\n\r\n" + data); 
        }
    });
};

module.exports = { get: get };

