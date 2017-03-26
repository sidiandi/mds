const MdNav = require('../app/mdNav');
const jasmine = require('jasmine');
const testApi = require('./mdApiSpec');

describe("MdNav provide Navbar content", function() {

    let mdNav;

    beforeAll(function(done){
        testApi.createTestApi()
        .then((api) => {
            mdNav = new MdNav(api.content, api.render);
            done();
        })
        .catch((e) => {
            expect(e).toBeFalsy(); 
            done();
        });
    });

    it("constructs", function(done) {
        mdNav.get('/hello.md')
            .then(done);
    });
});
