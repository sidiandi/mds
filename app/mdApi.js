const execFile = require('child_process').execFile;
const git = require('git');
const marked = require('marked');
const url = require('url');
const mkdirp = require('mkdirp');
const fs = require('fs');
const touch = require("touch");

// Constructor
function MdApi(content, render) {
    this.content = content;
    this.render = render;
}

MdApi.prototype.call = function(req) {
    try
    {
        const api = this;
        console.log(req);

        if (!req) {
            throw('!req');
        }

        const m = /^#(\/.*)/.exec(req.path);
        console.log(m);
        const path = m[1];
        if (!path) {
            throw(req.path);
        }

        let res = {
            path: req.path,
        };

        const promises = [];

        if (req.breadCrumbs) {
            promises.push(Promise.resolve({
                breadCrumbs: api.render.render(api.content.getBreadcrumbs(path), path)
            }));
        }

        let doCommit;
        if (req.commit) {
            doCommit = api.content.set(path, req.source)
            .then((r) => { return { commit: true }; });
        } else {
            doCommit = Promise.resolve({ commit : false });
        }
        promises.push(doCommit);

        let getSource;
        if ('source' in req) {
            getSource = Promise.resolve(req.source);
        }
        else {
            getSource = api.content.get(path, req.version);
        }
        getSource = getSource.then(function(s) { return { source: s }; });
        promises.push(getSource);

        if (req.navbar) {
            promises.push(api.content.getNav(path)
                .then((source) => { return { navbar: api.render.render(source, path)} }));
        }
        
        if (req.html) {
            promises.push(getSource.then((r) => {
                console.log(r);
                return { html: api.render.render(r.source, path) };
            }));
        }

        if (req.history) {
            const getHistory = doCommit
            .then(() => api.content.getHistory(path))
            .then((history) => { return { history: history }});
            promises.push(getHistory);
        }

        return Promise.all(promises).then(r => { 
            // console.log(r);
            var x = Object.assign(...r);
            console.log(x);
            return x;
        });
    } catch(ex) {
        console.log(ex);
        return Promise.reject(ex);
    }
}

// export the class
module.exports = MdApi;
