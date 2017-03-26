const MdPath = require('../app/mdPath');
const jasmine = require('jasmine');

describe("MdPath offers MarkDown path handline functions", function() {

    it("splits a path", function() {
        expect(MdPath.split('/a/b/c')).toEqual(['', 'a', 'b', 'c'])
    });

    it("joins a path", function() {
        expect(MdPath.join(['', 'a', 'b', 'c'])).toEqual('/a/b/c')
    });

    it("makes a a path canonic", function() {
        expect(MdPath.canonic('/a/b/c/')).toEqual('/a/b/c/');
        expect(MdPath.canonic('/a/../b/c/')).toEqual('/b/c/');
        expect(MdPath.canonic('/a/./b/c/')).toEqual('/a/b/c/');
        expect(MdPath.canonic('/a//b/c/')).toEqual('/a/b/c/');
        expect(MdPath.canonic('/a//b/c')).toEqual('/a/b/c');
        expect(MdPath.canonic('/a/b/c/../..')).toEqual('/a');
    });

    it("ensures a trailing slash", function() {
        expect(MdPath.ensureTrailingSlash('/a/b/c')).toEqual('/a/b/c/');
    });

    it("gets the lineage of a path", function() {
        expect(MdPath.getLineage("/")).toEqual(['/']);
        expect(MdPath.getLineage("/Readme.md")).toEqual(['/', '/Readme.md']);
        expect(MdPath.getLineage("/a/b/c/")).toEqual(['/', '/a/', '/a/b/', '/a/b/c/']);
    })

    it("gets the parent of a path", function() {
        expect(MdPath.getParent("/a/b/c")).toEqual('/a/b/');
        expect(MdPath.getParent("/a/b/c/")).toEqual('/a/b/');
    })

});
