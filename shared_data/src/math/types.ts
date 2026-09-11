
export type Math_Protocol_Node =
    | Math_Number_Node
    | Math_Rational_Node
    | Math_Symbol_Node
    | Math_Operation_Node
    | Math_Equation_Node

export interface Math_Rational_Node {
    type: 'Rational'
    numerator: number
    denominator: number
}

export interface Math_Number_Node {

    type:
    'Number'

    value:
    number
}

export interface Math_Symbol_Node {
    type: 'Symbol'

    /**
     * Schematician instance UID.
     * Used as symbolic identity.
     */
    uid: string

    /**
     * Human mathematical notation.
     * Example: "x"
     */
    name: string
}



export interface Math_Operation_Node {

    type:
    'Operation'

    operation:
    Math_Protocol_Operation

    arguments:
    Math_Protocol_Node[]
}

export type Math_Protocol_Operation =

    | 'Add'
    | 'Subtract'
    | 'Multiply'
    | 'Divide'
    | 'Power'

export type Math_Domain =
    | 'Rational'
    | 'Real'
    | 'Complex'


export interface Math_Equation_Node {

    type:
    'Equation'

    left:
    Math_Protocol_Node

    right:
    Math_Protocol_Node
}