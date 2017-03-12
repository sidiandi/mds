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

function getPath(req) {
    if (!req) {
        throw('req is not defined');
    }

    if (!(req.path)) { 
        throw('req.path is not defined');
    }

    let path;
    try
    {
        const m = /^#(\/[^#]*)/.exec(req.path);
        path = m[1];
        return path;
    }
    catch (e) {
        throw('not a valid path: ' + req.path)
    }
}

MdApi.prototype.onReply = function(result) {
}

MdApi.prototype.search = function(req) {
    const _this = this;
    const source = `# Search for  ${req.search}`;

    return _this.content.search(req.search)
        .then((result) => {
            return _this.render.parseAndRender(result, '/')
        });
}

MdApi.prototype.call = function(req) {
    try
    {
        if (req.search) {
            return this.search(req);
        }

        const api = this;

        const path = getPath(req);
        const articlePath = path.endsWith('/') ? path + '/Readme.md' : path;

        let res = {
            path: req.path,
            title: api.content.getTitleFromRelPath(path),
            commit: req.commit,
        };

        const promises = [];

        if (req.breadCrumbs) {
            promises.push(Promise.resolve({
                breadCrumbs: api.render.render(api.content.getBreadcrumbs(path), path)
            }));
        }

        let doCommit;
        if (req.commit) {
            doCommit = api.content.set(articlePath, req.source)
            .then((r) => { return { commit: true, status: `${articlePath} committed.` }; });
        } else {
            doCommit = Promise.resolve({ commit : false });
        }
        promises.push(doCommit);

        let getSource;
        if ('source' in req) {
            getSource = Promise.resolve(req.source);
        }
        else {
            getSource = api.content.get(articlePath, req.version);
        }
        getSource = getSource.then(function(s) { return { source: s }; });
        promises.push(getSource);

        if (req.navbar) {
            promises.push(api.nav.get(path)
                .then((source) => { return { navbar: api.render.render(source, path)} }));
        }
        
        if (req.html) {
            promises.push(getSource.then((r) => {
                return api.render.parseAndRender(r.source, articlePath);
            }));
        }

        if (req.history) {
            const getHistory = doCommit
            .then(() => api.content.getHistory(articlePath))
            .then((history) => { return { history: history }});
            promises.push(getHistory);
        }

        return Promise.all(promises).then(r => { 
            var x = Object.assign(res, ...r);
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
