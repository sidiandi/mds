const promisify = require("es6-promisify");
const os = require('os');
const fs = require('fs');
const rmdir = promisify(require('rmdir'));
const MdContent = require('../app/mdContentGit');
const jasmine = require('jasmine');

function ensureNotExists(dir) {
    return new Promise((resolve, reject) => {
            fs.exists(dir, (r) => resolve(r));
    })
    .then((dirExists) => {
        if (dirExists) {
            return rmdir(dir);
        } else {
            return Promise.resolve(true);
        }
    });
}

function createTestContent() {
    let mdContent;
    const dir = os.tmpdir() + "/mds-test-content";
    return ensureNotExists(dir)
        .then(() => {
            mdContent = new MdContent(dir);
            return mdContent.init(); 
        })
        .then(() => { return mdContent.set('/hello.md', '# Hello, world!') })
        .then(() => { return mdContent.set('/a/b/c/d.md', '# d') })
        .then(() => { return mdContent; })
        .catch((e) => {
            console.log(e);
        });
}

describe("mdContentGit stores Markdown Content in a git repository", function() {

    let mdContent;

    beforeAll(function(done){
        createTestContent()
            .then((c) => { mdContent = c; })
            .then(done);
    });

    it("gets content", function(done) {
        mdContent.get("/empty.md").then((data) => {
            expect(data.markdown).toContain("currently empty");
        })
        .then(done);
    });

    it("calculates a link title from a relative path", function() {
        expect(mdContent.getTitleFromRelPath("/")).toBe("Home");
        expect(mdContent.getTitleFromRelPath("/Readme.md")).toBe("Readme");
        expect(mdContent.getTitleFromRelPath("/a/b/c/d.md")).toBe("d");
    })

    it("calculates an href from a relative path", function() {
        expect(mdContent.getLinkFromRelPath("/")).toBe("/");
        expect(mdContent.getLinkFromRelPath("/Readme.md")).toBe("/Readme.md");
        expect(mdContent.getLinkFromRelPath("/a/b/c/d.md")).toBe("/a/b/c/d.md");
    })

    it("Generates a breadcrumbs string", function(){
        expect(mdContent.getBreadcrumbs("/a/b/c/d")).toEqual('[Home](/) / [a](/a/) / [b](/a/b/) / [c](/a/b/c/) / [d](/a/b/c/d)');
        expect(mdContent.getBreadcrumbs("")).toEqual('[Home](/)');
        expect(mdContent.getBreadcrumbs("/")).toEqual('[Home](/)');
    })

    it("returns a directory listing", function(done) {
        mdContent.get("/a/b/c/")
            .then(c => {
                expect(c.markdown).toEqual('* [d](/a/b/c/d.md)\r\n')
                expect(c.source).toEqual('0: /a/b/c/d.md\r\n')
                done();
            })
            .catch(e => { expect(e).toBeFalsy(); done(); });
    });
    
    it("modifies a directory listing", function(done) {
        mdContent.set("/a/b/c/", '/a/b/c/e.md : /a/b/c/e.md\r\n')
            .then(() => {
            mdContent.get("/a/b/c/")
                .then(c => {
                    expect(c.source).toEqual('/a/b/c/e.md\r\n')
                    done();
                })
            })
            .catch(e => { expect(e).toBeFalsy(); done(); });
    });
    
    it("returns a directory listing", function(done) {
        mdContent.get("/")
            .then(c => {
                expect(c.markdown).toEqual('* [a/](/a/)\r\n* [hello](/hello.md)\r\n');
                expect(c.source).toEqual('0: /a/\r\n1: /hello.md\r\n')
                done();
            })
            .catch(e => { expect(e).toBeFalsy(); done(); });
    });

    it("sets content", function(done) {
        let testContent = "test123";
        const relPath = "/test-set.md";
        mdContent.set(relPath, testContent)
        .then(() => { console.log("set complete"); })
        .then(() => { return mdContent.get(relPath); } )
        .then(function(data) {
            expect(data.source).toEqual(testContent);
            expect(data.markdown).toEqual(testContent);
        })
        .then(done);
    });

    it("parses directory text format", function() {
        var text = `/a/b/c/d.md : /a/b/c/d.md
/a/b/c/e.md : /a/b/c/e.md`;
        var files = mdContent.parseDirectoryText(text);
        expect(files[0]).toEqual("/a/b/c/d.md");
        console.log(files);
    });
});

module.exports = {
 createTestContent: createTestContent   
}