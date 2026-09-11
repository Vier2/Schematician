export interface Math_Tree_Node {

    label:
    string

    children:
    Math_Tree_Node[]
}


type operation_name = string
type operation_uid = string
export type OperationMap = Record<operation_uid, operation_name>