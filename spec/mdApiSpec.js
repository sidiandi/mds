const os = require('os');
const MdContent = require('../app/mdContentGit');
const MdRender = require('../app/mdRender');
const MdApi = require('../app/mdApi');
const jasmine = require('jasmine');

describe("mdApi, a json API for MDS, ", function() {

    let mdApi;

    beforeAll(function(done){
        let mdContent = new MdContent(os.tmpdir() + "/mds-test-content");
        mdContent.init()
        .then(() => { return mdContent.set('/hello.md', '# Hello, world!') })
        .then(() => { mdApi = new MdApi(mdContent, new MdRender(mdContent)); })
        .then(() => { console.log('beforeAll(function(done){'); })
        .then(done);
    });

    it("returns error when called with null", function(done) {
        mdApi.call(null).catch((e) => {
            expect(e).toBeTruthy();
            done();
        });
    });

    it("returns error when called with invalid path", function(done) {
        mdApi.call({ path: '/Readme.md' }).then(null, (e) => {
            expect(e).toBeTruthy();
            done();
        })
    });

    it("returns source, html ", function(done) {
        mdApi.call({
            path: '#/hello.md', 
            html: true, 
            history: true })
        .then((r) => {
            expect(r.source).toEqual('# Hello, world!');
            expect(r.history).toBeDefined();
            done();
        })
    });

    it("returns directory as markdown", function(done) {
        mdApi.call({
            path: '#/', 
            })
        .then((r) => {
            expect(r.source).toEqual('* [.git](/.git)\r\n* [hello](/hello.md)\r\n');
            done();
        })
    });

    it("returns html for posted source", function(done) {
        mdApi.call({
            path: '#/hello.md',
            source: '# Mars',
            html: true, 
            history: true })
        .then((r) => {
            expect(r.source).toEqual('# Mars');
            expect(r.html).toEqual('<h1 id="undefinedmars">Mars</h1>\n');
            done();
        })
    });

    it("commits source", function(done) {
        mdApi.call({
            path: '#/test-set.md',
            source: '# Mars',
            html: true, 
            history: true,
            commit: true })
        .then((r) => {
            expect(r.commit).toEqual(true);
            expect(r.source).toEqual('# Mars');
            expect(r.html).toEqual('<h1 id="undefinedmars">Mars</h1>\n');
            done();
        })
    });
});

