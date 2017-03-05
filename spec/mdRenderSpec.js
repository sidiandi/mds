const MdRender = require('../app/mdRender');
const jasmine = require('jasmine');

describe("mdRender Markdown Renderer", function() {

    let mdRender;

    beforeAll(function(){
        mdRender = new MdRender();
    });

    it("renders markdown", function() {
        expect(mdRender.render('[Home](/)', '/Readme.md')).toEqual('<p><a href="/#/">Home</a></p>\n');
        expect(mdRender.render('[[Other Page]]', '/Readme.md')).toEqual('<p><a href="/#/Other%20Page.md">Other Page</a></p>\n');
    });
});

