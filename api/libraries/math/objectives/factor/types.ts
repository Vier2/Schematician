import type
{ GraphQL_Instance,
    Base_Objective,
    Objective_Result,
    Math_Protocol_Node
 } from "@schematician/shared"


export interface Factor_Inputs {

    target:
    GraphQL_Instance

    domain?:
    Factor_Domain
}


export type Factor_Domain =
    | 'Rational'
    | 'Real'
    | 'Complex'


export interface Factor_Output {

    result:
    GraphQL_Instance
}


export interface Factor_Trace {

    engine:
    string

    operation:
    'Factor'

    input:
    GraphQL_Instance

    output:
    GraphQL_Instance

    domain?:
    Factor_Domain
}


export type Factor_Objective =
    Base_Objective<
        'Factor',
        Factor_Inputs
    >


export type Factor_Result =
    Objective_Result<
        'Factor',
        Factor_Output,
        Factor_Trace
    >

export interface Symbolic_Math_Engine {

    uid:
    string

    factor(
        expression:
            GraphQL_Instance,

        options?:
            Factor_Options

    ): Promise<GraphQL_Instance>
}

export interface Factor_Options {

    domain?:
    Factor_Domain
}


export interface Math_Factor_Request {
    objective: 'Factor'

    expression:
    Math_Protocol_Node

    options?: Factor_Options
}


export type Math_Request =
    Math_Factor_Request


export interface Math_Factor_Response {
    objective: 'Factor'

    expression:
    Math_Protocol_Node
}


export type Math_Response =
    Math_Factor_Response