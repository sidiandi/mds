const mkdirp = require('mkdirp');
const fs = require('fs');
const touch = require("touch");
const path = require('path');

var mdContentDirectory = "C:\\work\\vsc\\myExpressApp\\test";

function getTitleFromFileName(fn) {
    return decodeURIComponent(path.parse(fn).name);
}

function getDirectoryAsMarkdown(relPath, callback) {
    var fsPath = mdContentDirectory + relPath;
    fs.readdir(fsPath, (err, files) => {
        data = files.reduce((s, i) => {
            return s + "* [" + getTitleFromFileName(i) + "](/content" + (relPath + "/" + i) + ")\r\n";
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
            callback(data); 
        }
    });
};

module.exports = { get: get };

