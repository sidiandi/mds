# Activity Diagram

Current syntax for activity diagram has several limitations and drawbacks (for example, it's difficult to maintain).

So a completely new syntax and implementation is proposed as beta version to users (starting with V7947), so that we could define a better format and syntax.
Another advantage of this new implementation is that it's done without the need of having Graphviz installed (as for sequence diagrams).

The new syntax will replace the old one. However, for compatibility reason, the old syntax will still be recognized, to ensure ascending compatibility.
Users are simply encouraged to migrate to the new syntax.

Simple Activity
Activities label starts with : and ends with ;.

Text formatting can be done using creole wiki syntax.

They are implicitly linked in their definition order.

@startuml
:Hello world;
:This is on defined on
several **lines**;
@enduml

basic diagram activity
Start/Stop
You can use start and stop keywords to denote the beginning and the end of a diagram.

@startuml
start
:Hello world;
:This is on defined on
several **lines**;
stop
@enduml

start and stop in diagram activity
You can also use the end keyword.

@startuml
start
:Hello world;
:This is on defined on
several **lines**;
end
@enduml

start and end in diagram activity
Conditional
You can use if, then and else keywords to put tests if your diagram. Labels can be provided using parentheses.

@startuml

start

if (Graphviz installed?) then (yes)
  :process all\ndiagrams;
else (no)
  :process only
  __sequence__ and __activity__ diagrams;
endif

stop

@enduml

if then else example
You can use the elseif keyword to have several tests :

@startuml
start
if (condition A) then (yes)
  :Text 1;
elseif (condition B) then (yes)
  :Text 2;
  stop
elseif (condition C) then (yes)
  :Text 3;
elseif (condition D) then (yes)
  :Text 4;
else (nothing)
  :Text else;
endif
stop
@enduml

several if test
Repeat loop
You can use repeat and repeatwhile keywords to have repeat loops.

@startuml

start

repeat
  :read data;
  :generate diagrams;
repeat while (more data?)

stop

@enduml

basic repeat while loop
While loop
You can use while and end while keywords to have repeat loops.

@startuml

start

while (data available?)
  :read data;
  :generate diagrams;
endwhile

stop

@enduml

another while loop
It is possible to provide a label after the endwhile keyword, or using the is keyword.

@startuml
while (check filesize ?) is (not empty)
  :read file;
endwhile (empty)
:close file;
@enduml

while loop with labels
Parallel processing
You can use fork, fork again and end fork keywords to denote parallel processing.

@startuml

start

if (multiprocessor?) then (yes)
  fork
    :Treatment 1;
  fork again
    :Treatment 2;
  end fork
else (monoproc)
  :Treatment 1;
  :Treatment 2;
endif

@enduml

activity diagram with parallel processing
Notes
Text formatting can be done using creole wiki syntax.

A note can be floating, using floating keyword.

@startuml

start
:foo1;
floating note left: This is a note
:foo2;
note right
  This note is on several
  //lines// and can
  contain <b>HTML</b>
  ====
  * Calling the method ""foo()"" is prohibited
end note
stop

@enduml

add notes on activity diagram
Colors
You can use specify a color for some activities.

@startuml

start
:starting progress;
#HotPink:reading configuration files
These files should edited at this point!;
#AAAAAA:ending of the process;

@enduml

changing colors
Arrows
Using the -> notation, you can add texts to arrow, and change their color.

It's also possible to have dotted, dashed, bold or hidden arrows.

@startuml
:foo1;
-> You can put text on arrows;
if (test) then
  -[#blue]->
  :foo2;
  -[#green,dashed]-> The text can
  also be on several lines
  and **very** long...;
  :foo3;
else
  -[#black,dotted]->
  :foo4;
endif
-[#gray,bold]->
:foo5;
@enduml

colored arrows
Grouping
You can group activity together by defining partition:

@startuml
start
partition Initialization {
    :read config file;
    :init internal variable;
}
partition Running {
    :wait for user interaction;
    :print information;
}

stop
@enduml

grouping and partitionning in activity diagram
Swimlanes
Using pipe |, you can define swimlanes.
It's also possible to change swimlanes color.

@startuml
|Swimlane1|
start
:foo1;
|#AntiqueWhite|Swimlane2|
:foo2;
:foo3;
|Swimlane1|
:foo4;
|Swimlane2|
:foo5;
stop
@enduml

swimlanes
Detach
It's possible to remove an arrow using the detach keyword.

@startuml
 :start;
 fork
   :foo1;
   :foo2;
 fork again
   :foo3;
   detach
 endfork
 if (foo4) then
   :foo5;
   detach
 endif
 :foo6;
 detach
 :foo7;
 stop
@enduml

# SDL
By changing the final ; separator, you can set different rendering for the activity:

    |
    <
    >
    /
    ]
    }

@startuml
:Ready;
:next(o)|
:Receiving;
split
 :nak(i)<
 :ack(o)>
split again
 :ack(i)<
 :next(o)
 on several line|
 :i := i + 1]
 :ack(o)>
split again
 :err(i)<
 :nak(o)>
split again
 :foo/
split again
 :i > 5}
stop
end split
:finish;
@enduml

## Full servlet example

@startuml

start
:ClickServlet.handleRequest();
:new page;
if (Page.onSecurityCheck) then (true)
  :Page.onInit();
  if (isForward?) then (no)
    :Process controls;
    if (continue processing?) then (no)
      stop
    endif
    
    if (isPost?) then (yes)
      :Page.onPost();
    else (no)
      :Page.onGet();
    endif
    :Page.onRender();
  endif
else (false)
endif

if (do redirect?) then (yes)
  :redirect process;
else
  if (do forward?) then (yes)
    :Forward request;
  else (no)
    :Render page template;
  endif
endif

stop

@enduml
