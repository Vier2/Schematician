import type { Schema, Schema_Instance, Data_Type,Instance_Path, GraphQL_Instance} from "@schematician/shared"


export interface Input_View {
    input: HTMLSelectElement | HTMLInputElement
    container: HTMLDivElement
}
export interface Input_Viewer {
    input: HTMLSelectElement | HTMLInputElement
    viewer: HTMLParagraphElement
}


export interface Rendered_Search_Value {
    schema: Schema
    input:
    | HTMLInputElement
    | HTMLSelectElement
    parents: Schema[]
    path: Instance_Path
}


/**
 * Could do union type later for different schemas based on search filter
 * list instances of schema
 */




export interface Rendered_Node {
    schema: Schema

    element: HTMLParagraphElement

    path: Instance_Path
}





export interface Search_Schema_Result {
    uid: string
    name: string
    data_type: Data_Type
}

export type Search_Result =
    | {
        search_target: 'instances'
        results: GraphQL_Instance[]
    }
    | {
        search_target: 'schemas'
        results: Search_Schema_Result[]
    }

    