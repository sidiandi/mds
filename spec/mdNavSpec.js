const MdNav = require('../app/mdNav');
const jasmine = require('jasmine');
const testApi = require('./mdApiSpec');

describe("MdNav provide Navbar content", function() {

    let mdNav;

    beforeAll(function(done){
        testApi.createTestApi()
        .then((a) => { mdNav = new MdNav(a.content, a.render); })
        .then(done);
    });

    it("constructs", function(done) {
        mdNav.get('/hello.md')
            .then(done);
    });
});
