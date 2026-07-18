import type { Schema, Schema_Instance, Data_Type} from "@schematician/shared"

interface Interaction_Element {
    element: Schema
    /**
     * Only the properties used in the interactions
     * not all of them
     */
    interaction_properties: Schema_Association[]
    /**
     * Need to add equations
     */

}

export type Data_Type_Map = {
    String: string
    Number: number
    Boolean: boolean
    Composite: Schema_Instance
}
interface Interaction {
    elements: Interaction_Element[]

}



/**
 * I need a composite which will receive 
 * any number of interaction properties
 * resolve the difference/output
 * and return the results to each element
 * 
 */







type Exclusive<
A,
B,
K extends keyof any = keyof (A & B)
> =
| (A & { [P in keyof B]?: never })
| (B & { [P in keyof A]?: never });


export type Selection = 'identifiers' | 'properties'
/**
 * Value resolved from schema data type
 */
export type Schema_Value<
    S extends Schema
> = Data_Type_Map[S['data_type']]


export interface Association {
    schema_association?: Schema_Association[]
    div: HTMLDivElement
    select: HTMLSelectElement
    selection: Selection
}
/**
 * Generic schema/value association
 *
 * Used for:
 * - properties
 * - identifiers
 * - instance values
 * - relationships
 */
export interface Schema_Association<
    S extends Schema = Schema
> {
    schema: S
    value: Schema_Value<S>
}

export interface Input_View {
    input: HTMLSelectElement | HTMLInputElement
    container: HTMLDivElement
}
export interface Input_Viewer {
    input: HTMLSelectElement | HTMLInputElement
    viewer: HTMLParagraphElement
}


type character_limit = number
type character_minimum = number
type max_number = number
type minimum_number = number



export interface Rendered_Search_Value {
    schema: Schema
    input: HTMLInputElement | HTMLSelectElement
    parents: Schema[]
}
export type Search_Target = 'schemas' | 'instances' 

export type Filter_Operator =
    | 'equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'has_field'
    | 'has_element'
    | 'has_property'


export type Field_Role =
    | 'any'
    | 'element'
    | 'property'
    | 'identifier'

export interface Search_Filter_Input {
    field_schema_uid: string
    field_role:Field_Role
    operator: Filter_Operator
    value?: unknown
    values?: {
        schema: Schema
        value: unknown
    }[]
}
/**
 * Could do union type later for different schemas based on search filter
 * list instances of schema
 */

export interface Search_Query_Input {
    search_target: Search_Target 
    filters?: Search_Filter_Input[]
    logic?: 'and' | 'or'
    sort?: {
        field: string
        direction: 'asc' | 'desc'
    }
}


/**
 * Runtime object instance
 */
interface Instance_Value<
    S extends Schema = Schema
> {
    schema: S

    value?: Schema_Value<S>
}


export interface Schema_Instantiation_State {
    instances: Schema_Instance[]
}


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

    