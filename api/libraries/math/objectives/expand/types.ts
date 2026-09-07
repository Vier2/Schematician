import type  { 
    GraphQL_Instance,
    Objective_Result,
    Base_Objective
 } from "@schematician/shared"

export interface Expand_Inputs {
    target: GraphQL_Instance
}

export interface Expand_Output {
    result: GraphQL_Instance
}

export interface Expansion_Trace_Step {
    rule: string

    original: GraphQL_Instance

    result: GraphQL_Instance

    path: string[]
}

export type Expand_Result =
    Objective_Result<
        'Expand',
        Expand_Output,
        Expansion_Trace_Step[]
    >

export type Expand_Objective =
    Base_Objective<
        'Expand',
        Expand_Inputs
    >