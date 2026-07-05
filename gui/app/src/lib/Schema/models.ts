import { Make_Schema_Input } from "$lib/utils"

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
interface Interaction {
    elements: Interaction_Element[]

}
export type Data_Type =
    | 'String'
    | 'Number'
    | 'Boolean'
    | 'Interface'
    | 'Associative_Array'

type Data_Type_Map = {
    String: string
    Number: number
    Boolean: boolean
    Interface: Schema_Instance
    Associative_Array: Record<string, unknown>
}


/**
 * I need a interface which will receive 
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
type Schema_Value<
    S extends Schema
> = Data_Type_Map[S['data_type']]

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
type BaseSchema<T extends Data_Type> = {
    uid?: string
    name: string
    data_type: T
    elements?: Schema[]
    properties?: Schema_Association[]
    identifiers?: Schema_Association[]
    /**
     * Graphic representing schema
     */
    image?: string
    rules?: string
    logic?: string
    constraints?: Constraint_Map[T]
    relationships?: string
}
type EnumPart<T extends Data_Type> = {
    enumerations: Data_Type_Map[T][]
    options?: never
}
export interface Input_View {
    input: HTMLSelectElement | HTMLInputElement
    container: HTMLDivElement
}
type OptionsPart<T extends Data_Type> = {
    options: Data_Type_Map[T][]
    enumerations?: never
}

type EmptyPart = {
    enumerations?: never
    options?: never
}
export type Schema<T extends Data_Type = Data_Type> =
BaseSchema<T> & (EnumPart<T> | OptionsPart<T> | EmptyPart)

interface Number_Constraints {
    minimum_number?: number
    maximum_number?: number
    can_be_positive?: boolean
    can_be_negative?: boolean
}

interface String_Constraints {
    minimum_characters?: number
    maximum_characters?: number
    regex?: RegExp
    lowercase?: boolean
    uppercase?: boolean
}

type Constraint_Map = {
    String: String_Constraints
    Number: Number_Constraints
    Boolean: Boolean_Constraints
    Interface: Interface_Constraints
    Associative_Array: Associative_Array_Constraints
}

type character_limit = number
type character_minimum = number
type max_number = number
type minimum_number = number
interface Boolean_Constraints {

}
interface Interface_Constraints {

}

interface Associative_Array_Constraints {

}
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
export interface Instance_Node {
    value?: unknown
    elements?: Instance_Node[]
}

export interface Schema_Instance {
    schema: Schema
    root: Instance_Node
}
export interface Schema_Instantiation_State {
    instances: Schema_Instance[]
}


export interface Rendered_Node {
    schema: Schema

    element: HTMLParagraphElement

    path: number[]
}

export interface GraphQL_Schema {
    name: string
    uid: string
    data_type: Data_Type
    image?: string
    rules?: string
    logic?: string
    relationships?: string
    elements?: GraphQL_Schema[]
    properties?: GraphQL_Schema_Association[]
    identifiers?: GraphQL_Schema_Association[]
    constraints?: GraphQL_Constraints
    enumerations?: unknown[]
    options?: unknown[]
}

export interface GraphQL_Schema_Association {
    schema: GraphQL_Schema
    value: unknown
}
export interface GraphQL_Constraints {
    minimum_number?: number
    maximum_number?: number
    can_be_positive?: boolean
    can_be_negative?: boolean
    minimum_characters?: number
    maximum_characters?: number
    regex?: string
    lowercase?: boolean
    uppercase?: boolean
}

export interface GraphQl_Instance {
    schema_uid: string
    objects: GraphQL_Instance_Value[]
    uid: string
}
export interface GraphQL_Instance_Value {
    field_schema_uid: string
    value: unknown
}

export interface GraphQL_Response<T> {
    data?: T
    errors?: { message: string }[]
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