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
            expect(data).toContain("This page is currently empty.");
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

    it("gets the lineage of a relative path", function() {
        expect(mdContent.getLineage("/")).toEqual(['/']);
        expect(mdContent.getLineage("/Readme.md")).toEqual(['/', '/Readme.md']);
        expect(mdContent.getLineage("/a/b/c/")).toEqual(['/', '/a/', '/a/b/', '/a/b/c/']);
    })

    it("appends a trailing slash if necessary", function() {
        expect(mdContent.withTrailingSlash('/')).toEqual('/');
        expect(mdContent.withTrailingSlash('/a/b/c')).toEqual('/a/b/c/');
    })

    it("Generates a breadcrumbs string", function(){
        expect(mdContent.getBreadcrumbs("/a/b/c/d")).toEqual('[Home](/) - [a](/a/) - [b](/a/b/) - [c](/a/b/c/) - [d](/a/b/c/d)');
    })

    it("sets content", function(done) {
        let testContent = "test123";
        const relPath = "/test-set.md";
        mdContent.set(relPath, testContent)
        .then(() => { console.log("set complete"); })
        .then(() => { return mdContent.get(relPath); } )
        .then(function(data) {
                expect(data).toEqual(testContent);
        })
        .then(done);
    });
});

module.exports = {
 createTestContent: createTestContent   
}