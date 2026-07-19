import type { Schema, Schema_Instance, Data_Type} from "@schematician/shared"


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
    input: HTMLInputElement | HTMLSelectElement
    parents: Schema[]
}



/**
 * Could do union type later for different schemas based on search filter
 * list instances of schema
 */




export interface Rendered_Node {
    schema: Schema

    element: HTMLParagraphElement

    path: number[]
}



export interface Search_Instance_Result {
    uid: string
    schema_uid: string
    objects: {
        field_schema_uid: string
        value: unknown
    }[]
}

export interface Search_Schema_Result {
    uid: string
    name: string
    data_type: Data_Type
}

export type Search_Result =
    | {
        search_target: 'instances'
        results: Search_Instance_Result[]
    }
    | {
        search_target: 'schemas'
        results: Search_Schema_Result[]
    }

    