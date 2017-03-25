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
const stringArgv = require('string-argv');
const readFile = require('fs-readfile-promise');
const isBinaryFile = promisify(require("isbinaryfile"), { });
const hexdump = require('hexdump-nodejs');

const newLine = '\r\n';
const mdExtension = '.md';

function splitPath(relPath) {
    return relPath.split('/');
}

// Constructor
function MdContent(contentDirectory, options) {
    this.contentDirectory = contentDirectory;
    this.homeTitle = 'Home';
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
    // console.log(args);
    return new Promise(function(resolve, reject) {
        execFile('git', args, { cwd: _this.contentDirectory }, (error, stdout, stderr) => {
            if (error) {
                /*
                console.log({
                    stderr: stderr,
                    stdout: stdout,
                    args: args,
                    error: error
                });
                */
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

    return Promise.resolve(children
        .filter((i) => {
            return !(i.name === '.git')})
        .sort((a,b) => {
            const da = a.stat.isDirectory();
            const db = b.stat.isDirectory();
            if (da == db) {
                return a.name.localeCompare(b.name);
            } else {
                if (da > db) {
                    return -1;
                } else {
                    return +1;
                }
            }
        })
        .reduce((s, i) => {
                const dirPostFix = (i.stat.isDirectory() ? '/' : '');
                c = path + i.file + dirPostFix;
                return s + `* [${_this.getTitleFromRelPath(c) + dirPostFix}](${c})${newLine}`;
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

// Promise
MdContent.prototype.getRaw = function(relPath, version) {
    if (version) {
        return this.getVersion(relPath, version);
    }
    var fsPath = this.getFsPath(relPath);
    const _this = this;
    return readFile(fsPath, { encoding: "utf-8" });
}

MdContent.prototype.getBinary = function(relPath, version) {
    if (version) {
        return this.getVersion(relPath, version);
    }
    var fsPath = this.getFsPath(relPath);
    const _this = this;
    return readFile(fsPath);
}

// Promise
MdContent.prototype.get = function(relPath, version) {
    const _this = this;

    // handle non-md files
    const extension = path.extname(relPath);

    if (extension.match(/^\.(jpeg|jpg|png|gif|bmp)$/i)) {
        return Promise.resolve(`![${relPath}](${relPath})`);
    }

    if (!(extension == mdExtension)) {

        return _this.getBinary(relPath, version)
            .then((data) => {
                return isBinaryFile(data, data.length)
                    .then((binary) => {
                        if (binary) {
                            data = hexdump(data.slice(0, 0x1000));
                        }
                        return `[Raw](/source${relPath})` + newLine + newLine + '```' + extension.substr(1) + newLine + data + newLine + '```';
                    })
            })
            .catch((err) => {
                if (err.code == 'EISDIR') {
                    return _this.getDirectoryAsMarkdown(relPath);
                }
                throw err;
            });
    }

    return _this.getRaw(relPath, version)
        .catch((err) => {
            if (err.code == 'EISDIR') {
                return _this.getDirectoryAsMarkdown(relPath);
            } else if (err.code == 'ENOENT') {
                if (relPath && path.basename(relPath) == '.sidebar.md') {
                    return _this.get(_this.getParent(relPath));
                } else {
                    return Promise.resolve('# ' + this.getTitleFromRelPath(relPath) + '\r\n\r\nThis page is currently empty.');
                }
            }
            return Promise.reject(err);
        });
}

// Promise
MdContent.prototype.getEditableSource = function(relPath, version) {
    const _this = this;

    // handle non-md files
    const extension = path.extname(relPath);
    if (!(extension == mdExtension)) {
        return Promise.resolve(undefined);
    }

    return _this.getRaw(relPath, version)
        .catch((err) => {
            if (err.code == 'EISDIR') {
                return Promise.resolve(undefined);
            } else if (err.code == 'ENOENT') {
                return Promise.resolve('# ' + this.getTitleFromRelPath(relPath) + '\r\n\r\nThis page is currently empty.');
            }
            return Promise.reject(err);
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

function fileExists(fsPath) {
    return new Promise((resolve, reject) => {
        fs.exists(fsPath, resolve);
    });
}

function writeFile(fsPath, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(fsPath, data, (err) => {
            if (err) {
                reject(err);
            } else { 
                resolve();
            }
        })
    })
}

/*Promise */ 
MdContent.prototype.set = function(relPath, data) {
    const _this = this;
    var fsPath = this.getFsPath(relPath);

    // as a precaution, only modify .md files
    const extension = path.extname(relPath);
    if (!(extension == mdExtension)) {
        return Promise.reject(`Cannot write files of type ${extension}.`);
    }

    return fileExists(fsPath)
        .then((exists) => {
            if (exists) {
                return writeFile(fsPath, data)
                    .then(() => {
                        return _this.git(['commit', '--allow-empty-message', '-m', '', '.' + relPath])
                        .catch((e) => {
                            if (e.code == 1) {
                                // CRLF warning
                            } else {
                                throw(e);
                            }
                        })
                    });
            } else {
                return _this.createEmptyFileInGit(relPath)
                    .then(() => _this.set(relPath, data));
            }
        });
}

MdContent.prototype.getTitleFromRelPath = function(fn) {
    if (fn === '/') {
        return this.homeTitle;
    };
    const p = path.parse(fn);
    if (p.ext === mdExtension) {
        return decodeURIComponent(p.name);
    } else {
        return p.base;
    }
}

MdContent.prototype.getMdLink = function(relPath) {
    return "[" + this.getTitleFromRelPath(relPath) + "](" + this.getLinkFromRelPath(relPath) + ')';
}

MdContent.prototype.getBreadcrumbs = function(relPath) {
    let crumbs = relPath === '' ? ['/'] : this.getLineage(relPath);
    return crumbs.map((i) => {
        return this.getMdLink(i);
    }).join(' / ');
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

 function getPatterns(pattern) {
     const p = stringArgv.parseArgsStringToArgv(pattern);
     return p.reduce((a,b) => { return a.concat(['-e', b])}, []);
 }

MdContent.prototype.search = function(pattern) {
    const _this = this;
    return ((pattern.length >= 3) ? (this.git(['grep', '--all-match', '-i'].concat(getPatterns(pattern)))
        .then(gitOutput => {
            gitOutput = gitOutput.match(/[^\r\n]+/g)
                .map((line) => {
                    const p = line.split(':');
                    const path = '/' + p[0];
                    const text = p[1];
                    return `${_this.getMdLink(path)}: ${text}`;
                })
                .join(newLine);
            return gitOutput;
        }))
        .catch((e) => {
            return 'Nothing found.';
        })
         : Promise.resolve('Search term must have 3 or more characters.'))
        .then(md => {
            return `# Search for ${pattern}\r\n${md}`;
        });
}

// export the class
module.exports = MdContent;
