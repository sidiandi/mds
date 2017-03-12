const promisify = require("es6-promisify");
var fs = require('fs');
const execFile = require('child_process').execFile;
const git = require('git');
const marked = require('marked');
const url = require('url');
const mkdirp = promisify(require('mkdirp'));
const touch = promisify(require("touch"));
const path = require('path');
const rmdir = require('rmdir');
const ls = require('ls');

const newLine = '\r\n';

function splitPath(relPath) {
    return relPath.split('/');
}

// Constructor
function MdContent(contentDirectory, callback) {
    this.contentDirectory = contentDirectory;
}

/*

new Promise((resolve, reject) => {
        rmdir(_this.contentDirectory, function(err, dirs, files) {
            if (err) {
                reject(err);
            }
            else { 
                resolve(err);
            }
        });
    })
    .then(() => { return 

*/

MdContent.prototype.init = function() {
    const _this = this;
    return mkdirp(_this.contentDirectory)
    .then(() => { return _this.git(['init']) })
    .then(() => { console.log(`MdContent.init successful at ${_this.contentDirectory}`); });
}

MdContent.prototype.git = function(args) {
    const _this = this;
    return new Promise(function(resolve, reject) {
        execFile('git', args, { cwd: _this.contentDirectory }, (error, stdout, stderr) => {
            if (error) {
                console.log({
                    stderr: stderr,
                    stdout: stdout,
                    args: args,
                    error: error
                });
                reject(error);
            }
            else {
                resolve(stdout);
            }
        });
    });
}

MdContent.prototype.createEmptyFileInGit = function(relPath) {
    let fsPath = this.getFsPath(relPath);
    return mkdirp(path.dirname(fsPath))
        .then(() => { return touch(fsPath) })
        .then(() => { return this.git(['add', '.' + relPath]) });
}

MdContent.prototype.getFsPath = function(relPath) {
    if (relPath.startsWith('/.git')) {
        throw Error('illegal path');
    }
    return this.contentDirectory + relPath;
}

// Promise
MdContent.prototype.getDirectoryAsMarkdown = function(path) {
    const _this = this;
    path = this.withTrailingSlash(path);
    const fsPath = this.getFsPath(path);
    const children = ls(fsPath  + '*');
    console.log(children);

    return Promise.resolve(children
        .filter((i) => { return !(i.name === '.git')})
        .reduce((s, i) => {
                const dirPostFix = (i.stat.isDirectory() ? '/' : '');
                c = path + i.file + dirPostFix
                return s + `* [${_this.getTitleFromRelPath(c)}](${c})${newLine}`;
        }, ''));
}

function matchAll(re, text) {
    let a = [];
    while ((m = re.exec(text)) !== null) {
        a.push(m);
    }
    return a;
}

function getToc(markDown) {
    const re = /^#+\s+(.*)$/mg;
    let m = matchAll(re, markDown).map((i) => { return i[0]; });
    console.log(m);
    return m.join('\n');
}

// Promise
MdContent.prototype.getNav = function(relPath, callback) {
    const _this = this;
    let parent = this.getParent(relPath);
    if (!parent) {
        parent = '/.sidebar.md';
    }
    return Promise.all([_this.get(parent), _this.get(relPath)])
        .then((a) => { return a[0] + "\n----\n" + getToc(a[1]); });
}

MdContent.prototype.getParent = function(relPath) {
    var lin = this.getLineage(relPath);
    return lin[lin.length-2];
}

MdContent.prototype.get = function(relPath, version) {
    if (version) {
        return this.getVersion(relPath, version);
    }
    console.log("get " + relPath);
    var fsPath = this.getFsPath(relPath);
    const _this = this;
    return new Promise((resolve, reject) => {
        fs.readFile(fsPath, "utf-8", (err, data) => { 
            if (err) {
                if (err.code == 'EISDIR') {
                    _this.getDirectoryAsMarkdown(relPath).then(resolve, reject);
                    return;
                } else if (err.code == 'ENOENT') {
                    if (relPath && relPath.endsWith('.sidebar.md')) {
                        _this.get(_this.getParent(relPath)).then(resolve, reject);
                        return;
                    } else {
                        resolve('# ' + this.getTitleFromRelPath(relPath) + '\r\n\r\nThis page is currently empty.');
                        return;
                    }
                return;
            }
            reject(err);
        }
        else {
            resolve(data); 
        }
    });
    });
}

/*Promise */ 
MdContent.prototype.getHistory = function(relPath) {
    let json;
    return this.git(['log', '-20', `--pretty=format:,{ "version": "%H", "relativeDate": "%ar", "date": "%ad", "message": "%s" }`, '.' + relPath])
    .then(rawLog => { 
        json = '[' + rawLog.substr(1) + ']';
        return JSON.parse(json);
    })
    .catch((e) => {
        console.log(json);
        console.log(e);
        return [];
    });
};

/*Promise */ 
MdContent.prototype.getVersion = function(relPath, versionId) {
    return this.git(['show', versionId + ':.' + relPath]);
}

/*Promise */ 
MdContent.prototype.set = function(relPath, data) {
    const _this = this;
    var fsPath = this.getFsPath(relPath);
    return new Promise((resolve, reject) => {
        fs.exists(fsPath, (fileExists) => {
            if (fileExists) {
                fs.writeFile(fsPath, data, (err) => {
                    _this.git(['commit', '--allow-empty-message', '-m', '', '.' + relPath])
                    .then(resolve, reject);
            });
        } else {
            _this.createEmptyFileInGit(relPath)
                .then(() => { return _this.set(relPath, data); })
                .then(resolve, reject);
        }
        });
    });
}

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
    let crumbs = relPath === '' ? ['/'] : this.getLineage(relPath);
    return crumbs.map((i) => {
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

MdContent.prototype.api = function(req, callback) {
    
}

// export the class
module.exports = MdContent;
