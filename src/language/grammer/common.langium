terminal INDENT: 'synthetic:indent';
terminal DEDENT: 'synthetic:dedent';
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

// hidden terminal WS: /\s+/; // Handles all whitespace characters
    // This is a more general approach to whitespace handling. Matches all types of whitespace characters, including:
    // Spaces ( )
    // Tabs (\t)
    // Newlines (\n, \r\n)
    // Form feeds (\f)
    // Vertical tabs (\v)

hidden terminal WS: /[\t ]+/; // Matches only spaces and tabs. It does not match newlines or other whitespace characters.

hidden terminal NL: /[\r\n]+/;

terminal ID: /[_a-zA-Z][\w_]*/;
terminal HEX returns string: /0[xX][0-9a-fA-F]+/; // INT should come next
terminal COLOR returns string: /#[0-9a-fA-F]+/;   // INT should come next
terminal INT returns number: /(-)?[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
