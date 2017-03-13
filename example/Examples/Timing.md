# Timing Diagram

This is only a proposal and subject to change. You are very welcome to create a new discussion on this future syntax. Your feedbacks, ideas and suggestions help us to find the right solution.
Declaring participant
You declare participant using consise or robust keyword, depending on how you want them to be drawn.

@startuml
concise "NXVA11A" as VA11A

@VA11A
0 is Idle
+100 is M100
+200 is M120 
+300 is CPF
+400 is M300
@enduml

simple UML timing diagram
Adding message
You can add message using the following syntax.

@startuml
robust "Web Browser" as WB
concise "Web User" as WU

@0
WU is Idle
WB is Idle

@100
WU -> WB : URL
WU is Waiting
WB is Processing

@300
WB is Waiting

@enduml

simple UML timing diagram
Relative time
It is possible to use relative time with @.

@startuml
robust "DNS Resolver" as DNS
robust "Web Browser" as WB
concise "Web User" as WU

@0
WU is Idle
WB is Idle
DNS is Idle

@+100
WU -> WB : URL
WU is Waiting
WB is Processing

@+200
WB is Waiting
WB -> DNS@+50 : Resolve URL

@+100
DNS is Processing

@+300
DNS is Idle

@enduml

simple UML timing diagram
Participant oriented
Rather than declare the diagram in chronological order, you can define it by participant.

@startuml
robust "Web Browser" as WB
concise "Web User" as WU

@WB
0 is idle
+200 is Proc.
+100 is Waiting

@WU
0 is Waiting
+500 is ok
@enduml

alternate UML timing diagram
Initial state
You can also define an inital state.

@startuml
robust "Web Browser" as WB
concise "Web User" as WU

WB is Initializing
WU is Absent

@WB
0 is idle
+200 is Processing
+100 is Waiting

@WU
0 is Waiting
+500 is ok
@enduml

initial state
Adding constraint
It is possible to display time constraints on the diagrams.

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
