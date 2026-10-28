import type {
    Operation_Invocation,
    GraphQL_Instance
} from "@schematician/shared"

export interface Construct_Objective {
    type: 'Construct'
    inputs: Construct_Inputs
}

export interface Construct_Inputs {
    func: Operation_Invocation
    assignments: GraphQL_Instance[]
}