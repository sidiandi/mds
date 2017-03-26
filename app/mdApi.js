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
        return { path: '/', anchor: null };
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
            anchor: m[3] ? m[3] : null,
        }
    } else {
        return { path: '/', anchor: null }
    }
}

MdApi.prototype.parseHash = parseHash;

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
        if (!req) {
            throw new Error("req is undefined");
        }

        const parsedHash = parseHash(req.hash);

        if (parsedHash.command === commandSearch) {
            return this.search(req);
        }

        const api = this;
        const path = parsedHash.path;
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
            doCommit = api.content.set(path, req.newSource)
            .then((r) => { return { commit: true, status: `${path} committed.` }; });
        } else {
            doCommit = Promise.resolve({ commit : false });
        }
        promises.push(doCommit);

        let getSource;
        if ('newSource' in req) {
            getSource = api.content.preview(path, req.newSource);
        }
        else {
            getSource = api.content.get(path, req.version);
        }
        if (req.source) {
            promises.push(getSource);
        }

        if (req.navbar) {
            promises.push(api.nav.get(path, path)
                .then((source) => { return { navbar: api.render.render(source, path)} }));
        }
        
        if (req.html) {
            promises.push(getSource
                .then((r) => {
                    return api.render.parseAndRender(r.markdown, path)
                }));
        }

        if (req.history) {
            const getHistory = doCommit
            .then(() => api.content.getHistory(path))
            .then((history) => { return { history: history }});
            promises.push(getHistory);
        }

        return Promise.all(promises).then(r => { 
            var x = Object.assign(...r);
            this.onReply(x);
            return x;
        })
        .catch((err) => {
            console.log(err);
            return { status: err };
        });

    } catch(ex) {
        return Promise.reject({ status: ex });
    }
}

// export the class
module.exports = MdApi;
