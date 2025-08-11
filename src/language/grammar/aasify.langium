grammar AaSify

terminal INDENT: 'synthetic:indent';
terminal DEDENT: 'synthetic:dedent';
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

hidden terminal WS: /[\t ]+/; // Matches only spaces and tabs
hidden terminal NL: /[\r\n]+/;

terminal ID: /[_a-zA-Z][\w_]*/;
terminal QUALIFIED_ID: /[_a-zA-Z][\w_]*(\.[_a-zA-Z][\w_]*)*/;
terminal HEX returns string: /0[xX][0-9a-fA-F]+/;
terminal COLOR returns string: /#[0-9a-fA-F]+/; 
terminal INT returns number: /(-)?[0-9]+/;
terminal FLOAT returns number: /(-)?[0-9]*\.[0-9]+([eE][+-]?[0-9]+)?/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
terminal URI: /https?:\/\/[^\s]+/;
terminal IRI: /<[^>]+>/;

// Main entry point - AAS Environment containing multiple AAS instances
entry AasModel:
    aas_elements += (
                        AasDefinition               |  
                        SubmodelRulesDefinition     |
                        SubmodelDefinitions
                    )*
;

AasDefinition:
    "aas" name=ID
    INDENT
        "description" ":" description   =   STRING
        "version"     ":" version       =   STRING
        "submodels"   ":" "{" 
            (submodels += [SubmodelDefinitions] (",")? )*
        "}"
    DEDENT
;

SubmodelRulesDefinition:
    "rules" name=ID
    INDENT
        "description" ":" description   =   STRING
        variable_rules += DataTypeRuleElement*
    DEDENT
;

DataTypeRuleElement:
    "param" variable_name=ID ":" variable_type=VariableTypes ( "[" 
        (
            property += ("MULTIPLE_ENTRY" | "SINGLE_ENTRY" | "MUST" | "OPTIONAL") (",")?
        )*
    "]" )?
    ";"
;

VariableTypes:
    variable_type=(
        "string"            | 
        "boolean"           | 
        "date_time"         | 
        "date_yyyy-MM-dd"   | 
        "date_dd-MM-yyyy"   |
        "time_12_00_M"      | 
        "time_24_00"        |
        "base64"            |
        "uri"               |
        "u8"  | "u16" | "u32" | "u24" | "u64" |
        "i8"  | "i16" | "i32" | "i24" | "i64" |
        "f32" | "f64"
    )
;

DataTypeValueElement:
    variable_name=ID ":" variable_value=(ID | STRING | HEX | FLOAT | URI | INT) ";"
;

SubmodelDefinitions:
    "submodel" name=ID ("rule" rule=[SubmodelRulesDefinition])?
    INDENT
        "description" ":" description   =   STRING
        value_list    +=  DataTypeValueElement*
    DEDENT
;


