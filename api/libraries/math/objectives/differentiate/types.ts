import type { 
    GraphQL_Instance,
    Operation_Invocation,
    Base_Objective
 } from "@schematician/shared";


export type Differentiate_Objective = 
    Base_Objective<
    'Differentiate',
    Differentiate_Inputs
    >
export interface Differentiate_Inputs {
    func: Operation_Invocation,
    assignments: GraphQL_Instance[]
}
