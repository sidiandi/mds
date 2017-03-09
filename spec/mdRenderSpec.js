const marked = require('marked');
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

    it("lets customize the lexer", function() {
        let options = {};
        let lexer = new marked.Lexer(options);
        let source = `# PlantUML Examples

@startmath
f(t)=(a_0)/2 + sum_(n=1)^ooa_ncos((npit)/L)+sum_(n=1)^oo b_n\ sin((npit)/L)
@endmath

@startuml
robust "Web Browser" as WB
concise "Web User" as WU

WB is Initializing
WU is Absent

@WB
0 is idle
+200 is Processing
+100 is Waiting
WB@0 <-> @50 : {50 ms lag}

@WU
0 is Waiting
+500 is ok
@200 <-> @+150 : {150 ms}

@enduml

`;
        let tokens = lexer.lex(source);
        expect(tokens[1].type).toEqual('start');
        expect(tokens[1].lang).toEqual('math');
    });

    it("renders PlantUML", function() {
        let source = `

![uml](http://plantuml.com/diagram.png)

@startuml
robust "Web Browser" as WB
concise "Web User" as WU

WB is Initializing
WU is Absent

@WB
0 is idle
+200 is Processing
+100 is Waiting
WB@0 <-> @50 : {50 ms lag}

@WU
0 is Waiting
+500 is ok
@200 <-> @+150 : {150 ms}

@enduml
`;
        console.log(mdRender.render(source));
    });
});

