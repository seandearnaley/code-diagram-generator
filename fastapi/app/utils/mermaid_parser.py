from lark import Lark, Transformer, UnexpectedInput, v_args

MERMAID_GRAMMER = r"""
start: command

command: "graph" direction newline node_list
       | "flowchart" direction newline node_list
       | "sequenceDiagram" newline participant_list
       | "gantt" newline gantt_list
       | "classDiagram" newline class_list
       | "stateDiagram" newline state_list

direction: "TB" | "BT" | "RL" | "LR"

node_list: node newline node_list
         | node

node: CNAME arrow CNAME

arrow: "-->" | "-.->" | "==>" | "===" | "---"

participant_list: participant newline participant_list
                | participant

participant: "participant" CNAME

gantt_list: gantt newline gantt_list
          | gantt

gantt: "title" CNAME
     | "section" CNAME
     | CNAME "starts" CNAME
     | CNAME "ends" CNAME

class_list: class_def newline class_list
          | class_def

class_def: "class" CNAME "{" newline class_content_list "}"
         | "note" STRING
         | CNAME "<|--" CNAME
         | CNAME ":" ( "+" | "-" ) CNAME
         | CNAME ":" ( "+" | "-" ) STRING

class_content_list: class_content newline class_content_list
                  | class_content

class_content: ( "+" | "-" ) CNAME
             | ( "+" | "-" ) STRING

state_list: state newline state_list
          | state

state: "state" CNAME

newline: /(\r?\n)+/

STRING: /"(?:[^"\\]|\\.)*"/

%import common.CNAME
%import common.WS
%import common.STRING
%ignore WS
"""


class MermaidTransformer(Transformer):
    @v_args(inline=True)
    def command(self, items):
        return "\n".join(items)

    def direction(self, items):
        return " ".join(items)

    def node_list(self, items):
        return "\n".join(items)

    def node(self, items):
        return " ".join(items)

    def arrow(self, items):
        return " ".join(items)

    def participant_list(self, items):
        return "\n".join(items)

    def participant(self, items):
        return f"participant {items[0]}"

    def gantt_list(self, items):
        return "\n".join(items)

    def gantt(self, items):
        return " ".join(items)

    def class_list(self, items):
        return "\n".join(items)

    def class_def(self, items):
        return " ".join(items)

    def class_content_list(self, items):
        return "\n".join(items)

    def class_content(self, items):
        return " ".join(items)

    def state_list(self, items):
        return "\n".join(items)

    def state(self, items):
        return f"state {items[0]}"

    def newline(self):
        return "\n"


def parse_mermaid(input_code):
    parser = Lark(MERMAID_GRAMMER, parser="lalr", transformer=MermaidTransformer())
    try:
        tree = parser.parse(input_code)
        return tree.pretty()
    except UnexpectedInput as exc:
        context = exc.get_context(input_code, span=10)
        return f"Syntax error at position {exc.pos_in_stream}: {context}"


INPUT_CODE_EXAMPLE = """
classDiagram
    note "From Duck till Zebra"
    Animal <|-- Duck
    note for Duck "can fly\ncan swim\ncan dive\ncan help in debugging"
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }
    class Zebra{
        +bool is_wild
        +run()
    }
"""

output_code_example = parse_mermaid(INPUT_CODE_EXAMPLE)
print(output_code_example)
