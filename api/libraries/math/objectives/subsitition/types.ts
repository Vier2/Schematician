import type { 
    GraphQL_Instance, 
    Substitution_Trace_Step,
    Base_Objective, Objective_Result } from "@schematician/shared"

export interface Substitute_Inputs {
    target: GraphQL_Instance

    substitutions: Substitution_Binding[]
}
interface Substitution_Binding {
    variable_uid: string
    substitute: GraphQL_Instance
}
export interface Substitute_Output {
    result: GraphQL_Instance
}

export type Substitute_Objective =
    Base_Objective<
        'Substitute',
        Substitute_Inputs
    >

export type Substitute_Result =
    Objective_Result<
        'Substitute',
        Substitute_Output,
        Substitution_Trace_Step[]
    >

