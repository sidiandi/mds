const os = require('os');
const MdContent = require('../app/mdContentGit');
const jasmine = require('jasmine');

describe("mdContentGit stores Markdown Content in a git repository", function() {

    let mdContent;

    beforeAll(function(done){
        mdContent = new MdContent(os.tmpdir() + "/mds-test-content", (err) => {
            done();
        });
    });

    it("gets content", function(done) {
        mdContent.get("/empty.md", function(data) {
            expect(data).toContain("This page is currently empty.");
            done();
        });
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
        mdContent.set("/test-set.md", testContent, function() {
            mdContent.get("/test-set.md", function(data) {
                expect(data).toEqual(testContent);
                done();
            });
        });
    });
});

