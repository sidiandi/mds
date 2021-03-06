const url = require('url');
const mkdirp = require('mkdirp');
const fs = require('fs');
const touch = require("touch");
const path = require('path');

const newLine = '\r\n';

function splitPath(relPath) {
    return relPath.split('/');
}

function createEmptyFile(fsPath, cb) {
    mkdirp(path.dirname(fsPath), (err) => {
        touch(fsPath, (err) => { cb() });
    });
}

// Constructor
function MdContent(contentDirectory) {
  // always initialize all instance properties
  this.contentDirectory = contentDirectory;
}

MdContent.prototype.getFsPath = function(relPath) {
    return this.contentDirectory + relPath;
}

MdContent.prototype.getDirectoryAsMarkdown = function(relPath, callback) {
    relPath = this.withTrailingSlash(relPath);
    var fsPath = this.getFsPath(relPath);
    fs.readdir(fsPath, (err, files) => {
        data = files.reduce((s, i) => {
            return s + "* " + this.getMdLink(relPath + i) + newLine;
        }, '');
        callback(data);
      });
}

MdContent.prototype.get = function(relPath, callback) {
    var fsPath = this.getFsPath(relPath);
    console.log(fsPath);
    fs.readFile(fsPath, "utf-8", (err, data) => { 
        if (err) {
            if (err.code == 'EISDIR') {
                this.getDirectoryAsMarkdown(relPath, callback);
                return;
            } else if (err.code == 'ENOENT') {
                createEmptyFile(fsPath, () => { this.get(relPath, callback); });
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

MdContent.prototype.set = function(relPath, data, callback) {
    var fsPath = this.getFsPath(relPath);
    console.log(fsPath);
    fs.writeFile(fsPath, data, (err) => { 
        if (err) {
            if (err.code == 'EISDIR') {
                callback();
            } else if (err.code == 'ENOENT') {
                createEmptyFile(fsPath, () => { this.set(relPath, data, callback); });
                return;
            }
            console.log(err);
            callback();
        }
        else {
            callback(); 
        }
    });
};

MdContent.prototype.getTitleFromRelPath = function(fn) {
    if (fn === '/') {
        return "Home";
    };
    return decodeURIComponent(path.parse(fn).name);
}

MdContent.prototype.getMdLink = function(relPath) {
    return "[" + this.getTitleFromRelPath(relPath) + "](" + this.getLinkFromRelPath(relPath) + ')';
}

MdContent.prototype.getBreadcrumbs = function(relPath) {
    return this.getLineage(relPath).map((i) => {
        return this.getMdLink(i);
    }).join(' - ');
}

MdContent.prototype.getLinkFromRelPath = function (fn) {
    if (fn === '') {
        return fn = '/';
    };
    return '' + fn;
}

MdContent.prototype.getLineage = function(relPath) {
    let lineage = [];
    let i = -1;
    for (;;)
    {
        i = relPath.indexOf('/', i+1);
        if (i<0)
        {
            lineage.push(relPath);
            break;
        }
        lineage.push(relPath.substr(0, i+1));
        if (i+1 >= relPath.length) {
            break;
        }
    }
    return lineage;
}

MdContent.prototype.withTrailingSlash = function(relPath) {
    if (relPath.endsWith('/')) {
    }
    else {
        relPath = relPath + '/';
    }
    return relPath;
}

// export the class
module.exports = MdContent;
