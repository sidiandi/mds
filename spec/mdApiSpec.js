const promisify = require("es6-promisify");
const os = require('os');
const MdContent = require('../app/mdContentGit');
const MdRender = require('../app/mdRender');
const MdApi = require('../app/mdApi');
const jasmine = require('jasmine');
const mdContentGitSpec = require('./mdContentGitSpec');

function createTestApi() {
    return mdContentGitSpec.createTestContent()
        .then((content) => { return new MdApi(content, new MdRender(content)); });
}

describe("mdApi, a json API for MDS, ", function() {

    let mdApi;
    let mdContent;

    beforeAll(function(done){
        createTestApi()
        .then((a) => { mdApi = a})
        .then(done);
    });

    it("returns error when called with null", function(done) {
        mdApi.call(null).catch((e) => {
            expect(e).toBeTruthy();
            done();
        });
    });

    it("returns error when called with invalid path", function(done) {
        mdApi.call({ hash: '/Readme.md' })
            .catch((e) => {
                expect(e).toBeTruthy();
                done();
        })
    });

    it("returns source, html ", function(done) {
        mdApi.call({
            hash: '#/hello.md',
            source: true, 
            html: true, 
            history: true })
        .then((r) => {
            console.log(r);
            expect(r.source).toEqual('# Hello, world!');
            expect(r.history).toBeDefined();
            done();
        })
        .catch((e) => { expect(e).toBeFalsy(); done(); });
    });

    it("returns html for posted source", function(done) {
        mdApi.call({
            hash: '#/hello.md',
            newSource: '# Mars',
            source: true,
            html: true, 
            history: true })
        .then((r) => {
            expect(r.source).toEqual('# Mars');
            expect(r.html).toEqual('<h1 id="mars">Mars</h1>\n');
            done();
        })
        .catch((e) => { expect(e).toBeFalsy(); done(); });
    });

    it("commits source", function(done) {
        mdApi.call({
            hash: '#/test-set.md',
            newSource: '# Mars',
            source: true,
            html: true, 
            history: true,
            commit: true })
        .then((r) => {
            expect(r.commit).toEqual(true);
            expect(r.source).toEqual('# Mars');
            expect(r.html).toEqual('<h1 id="mars">Mars</h1>\n');
            done();
        })
        .catch((e) => { expect(e).toBeFalsy(); done(); });
    });

    it("parses hash correctly", function() {
        var p = mdApi.parseHash('#/Readme.md#section1');
        expect(p.path).toEqual('/Readme.md');
        expect(p.anchor).toEqual('section1');
    })

    it("parses hash correctly", function() {
        var p = mdApi.parseHash('#/Readme.md');
        expect(p.path).toEqual('/Readme.md');
        expect(p.anchor).toBeNull();
    })

    it("parses hash correctly", function() {
        var p = mdApi.parseHash('');
        expect(p.path).toEqual('/');
        expect(p.anchor).toBeNull();
    })

    it("parses hash correctly", function() {
        var p = mdApi.parseHash(null);
        expect(p.path).toEqual('/');
        expect(p.anchor).toBeNull();
    })

    it("parses hash correctly", function() {
        var p = mdApi.parseHash(undefined);
        expect(p.path).toEqual('/');
        expect(p.anchor).toBeNull();
    })
});

module.exports = { createTestApi: createTestApi };
