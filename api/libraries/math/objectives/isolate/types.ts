import type { 
    GraphQL_Composite_Instance,
    Base_Objective, Objective_Result,
    Math_Equation_Node,
    Math_Symbol_Node
 } from "@schematician/shared"

export interface Isolate_Inputs {

    equation:
    GraphQL_Composite_Instance

    target:
    GraphQL_Composite_Instance
}

export interface Isolate_Output {

    result:
    GraphQL_Composite_Instance
}

export interface Isolate_Trace {

    engine:
    string

    operation:
    'Isolate'

    input:
    GraphQL_Composite_Instance

    target:
    GraphQL_Composite_Instance

    output:
    GraphQL_Composite_Instance
}


export type Isolate_Objective =
    Base_Objective<
        'Isolate',
        Isolate_Inputs
    >

export type Isolate_Result =
    Objective_Result<
        'Isolate',
        Isolate_Output,
        Isolate_Trace
        >

export interface Math_Isolate_Request {

    objective:
    'Isolate'

    equation:
    Math_Equation_Node

    target:
    Math_Symbol_Node
}

export interface Math_Isolate_Response {

    objective:
    'Isolate'

    equation:
    Math_Equation_Node
}

