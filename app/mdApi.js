const execFile = require('child_process').execFile;
const git = require('git');
const marked = require('marked');
const url = require('url');
const mkdirp = require('mkdirp');
const fs = require('fs');
const touch = require("touch");
const nodemailer = require("nodemailer");
const ls = require('ls');

// Constructor
function MdApi(content, render, nav) {
    if (!content) {
        throw 'no content';
    }
    this.content = content;
    this.render = render;
    this.nav = nav;
}

const commandSearch = '#search/';

function parseHash(hash) {
    if (hash === null || hash === undefined) {
        return { path: null, anchor: null };
    }
    for (command of [commandSearch]) {
        if (hash.startsWith(command)) {
            return {
                command: command, 
                args: decodeURI(hash.substr(command.length))
            }
        }
    }
    if (hash) {
        var re = /^#([^#]+)(#([^#]+))?/;
        var m = re.exec(hash);
        return { 
            path: m[1],
            anchor: m[3],
        }
    } else {
        return { path: '/', anchor: undefined }
    }
}

MdApi.prototype.onReply = function(result) {
}

MdApi.prototype.search = function(req) {
    const _this = this;
    const parsedHash = parseHash(req.hash);
    const pattern = parsedHash.args;
    const source = `# Search for  ${pattern}`;

    return _this.content.search(pattern)
        .then((result) => {
            res = _this.render.parseAndRender(result, '/')
            res.title = `Search for ${pattern}`;
            res.hash = req.hash;
            res.breadCrumbs = _this.render.render(this.content.getBreadcrumbs('/'));
            return res;
        });
}

MdApi.prototype.call = function(req) {
    try
    {
        const parsedHash = parseHash(req.hash);

        if (parsedHash.command === commandSearch) {
            return this.search(req);
        }

        const api = this;

        const path = parsedHash.path;
        const isDirectory = path.endsWith('/');
        const articlePath = isDirectory ? path + 'Readme.md' : path;

        const promises = [];

        promises.push(Promise.resolve({
            hash: req.hash,
            title: api.content.getTitleFromRelPath(path)
        }));

        if (req.breadCrumbs) {
            promises.push(Promise.resolve({
                breadCrumbs: api.render.render(api.content.getBreadcrumbs(path), path)
            }));
        }

        let doCommit;
        if (req.commit) {
            doCommit = api.content.set(articlePath, req.newSource)
            .then((r) => { return { commit: true, status: `${articlePath} committed.` }; });
        } else {
            doCommit = Promise.resolve({ commit : false });
        }
        promises.push(doCommit);

        let getSource;
        if ('newSource' in req) {
            getSource = Promise.resolve(req.newSource);
        }
        else {
            getSource = api.content.get(articlePath, req.version);
        }
        getSource = getSource.then(function(s) { return { source: s }; });
        if (req.source) {
            promises.push(getSource);
        }

        if (req.navbar) {
            promises.push(api.nav.get(path)
                .then((source) => { return { navbar: api.render.render(source, path)} }));
        }
        
        if (req.html) {
            promises.push(getSource
                .then((r) => {
                    return api.render.parseAndRender(r.source, articlePath)
                }));
        }

        if (req.history) {
            const getHistory = doCommit
            .then(() => api.content.getHistory(articlePath))
            .then((history) => { return { history: history }});
            promises.push(getHistory);
        }

        return Promise.all(promises).then(r => { 
            var x = Object.assign(...r);
            this.onReply(x);
            return x;
        });
    } catch(ex) {
        console.log(ex);
        return Promise.reject(ex);
    }
}

// export the class
module.exports = MdApi;
