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

        const path = /^\/\#(\/.*)/.exec(req.path)[1];
        if (!path) {
            throw(req.path);
        }

        let res = {
            path: req.path
        };

        let promises = [];

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
            getSource = api.content.get(path);
        }

        getSource = getSource.then(function(source) { return { source: source }; });

        promises.push(getSource);

        if (req.html) {
            promises.push(getSource.then((r) => {
                return { html: api.render.render(r.source, path) };
            }));
        }

        if (req.history) {
            const getHistory = api.content.getHistory(path)
            .then((history) => { return { history: history }});
            promises.push(getHistory);
        }

        return Promise.all(promises).then(r => { 
            // console.log(r);
            return Object.assign(...r);
        });
    } catch(ex) {
        return Promise.reject(ex);
    }
}

// export the class
module.exports = MdApi;
