const execFile = require('child_process').execFile;
const git = require('git');
const marked = require('marked');
const url = require('url');
const mkdirp = require('mkdirp');
const fs = require('fs');
const touch = require("touch");
const path = require('path');

const newLine = '\r\n';

function splitPath(relPath) {
    return relPath.split('/');
}

// Constructor
function MdContent(contentDirectory, callback) {
    this.contentDirectory = contentDirectory;
    mkdirp(this.contentDirectory, (err) => {
        this.git(['init'], (err) => {
            callback(err);
        });
    });
}

MdContent.prototype.git = function(args, cb) {
    console.log("git " + args.join(" "));
    execFile('git', args, { cwd: this.contentDirectory }, (error, stdout, stderr) => {
        console.log(error);
        console.log(stdout);
        console.log(stderr);
        cb(error);
    });
}

MdContent.prototype.createEmptyFileInGit = function(relPath, cb) {
    let fsPath = this.getFsPath(relPath);
    mkdirp(path.dirname(fsPath), (err) => {
        touch(fsPath, (err) => {
            this.git(['add', '.' + relPath], (err) => { cb() });
        });
    });
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
                callback('# ' + this.getTitleFromRelPath(relPath) + '\r\n\r\nThis page is currently empty.');
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
    fs.exists(fsPath, (fileExists) => {
        if (fileExists) {
            fs.writeFile(fsPath, data, (err) => {
                this.git(['commit', '-m', 'wiki', '.' + relPath], (err) => { callback(); });
            });
        } else {
            console.log('empty');
            this.createEmptyFileInGit(relPath, () => { this.set(relPath, data, callback); });
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

function canonic(x) {
    let y = [];
    x.forEach((i) => {
        if (i === '.') {

        } else if (i == '..') {
            y.pop();
        } else {
            y.push(i);
        }
    })
    return y;
}

MdContent.prototype.getHashedHref = function (href, contentPath) {
    let u = url.parse(href);
    if (u.host) {
        return href;
    }
    if (href.startsWith('/')) {
        return '/#' + href;
    }
    
    let p = contentPath.split('/');
    p.pop();
    p = p.concat(u.path.split('/'));
    p = canonic(p);
    return '/#' + p.join('/');
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

MdContent.prototype.render = function(relPath, markDown) {
}

// export the class
module.exports = MdContent;
