
export interface Schema_Element_Update {
    element_uid: string
    required: boolean
    cardinality: Cardinality
    index: number
}

type OptionsPart<T extends Data_Type> = {
    options: Data_Type_Map[T][]
    enumerations?: never
}

type EmptyPart = {
    enumerations?: never
    options?: never
}
interface Boolean_Constraints {

}

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
interface Array_Constraints {

}
interface Composite_Constraints {

}
type Constraint_Map = {
    String: String_Constraints
    Number: Number_Constraints
    Boolean: Boolean_Constraints
    Composite: Composite_Constraints
    Array: Array_Constraints
}



export type Data_Type =
    | 'String'
    | 'Number'
    | 'Boolean'
    | 'Composite'
    | 'Array'

export type Data_Type_Map = {
    String: string
    Number: number
    Boolean: boolean
    Composite: Schema_Instance
    Array: Schema[]
}
export type Cardinality = 'Single' | 'Array'
export interface Schema_Element {
    element: Schema
    required: boolean
    index: number
    cardinality: Cardinality
}
type BaseSchema<T extends Data_Type> = {
    uid?: string
    name: string
    data_type: T
    elements?: Schema_Element[]
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
export type Schema<T extends Data_Type = Data_Type> =
 BaseSchema<T> & (EnumPart<T> | OptionsPart<T> | EmptyPart)

export interface Schema_Instance {
    schema: Schema
    root: Instance_Node
}

export interface Instance_Node {
    value?: unknown
    elements?: Instance_Node[]
}
export interface Schema_Association_Update {
    schema_uid: string;
    index?: number | null;
    value?: unknown;
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
/**
 * Value resolved from schema data type
 */
export type Schema_Value<
    S extends Schema
> = Data_Type_Map[S['data_type']]

export type Selection = 'identifiers' | 'properties'

export interface Association {
    schema_association?: Schema_Association[]
    div: HTMLDivElement
    select: HTMLSelectElement
    selection: Selection
}
export interface Schema_Association_Update {
    schema_uid: string
    index?: number | null
    value?: unknown
}
export interface Delete_Schema_Result {
    success: boolean
    message: string
    deleted_uid?: string
}

export interface Update_Schema_Data {
    uid: string
    name: string
    data_type: Data_Type

    image?: string
    rules?: string
    logic?: string
    relationships?: string

    constraints?: unknown
    enumerations?: unknown[]
    options?: unknown[]

    elements?: Schema_Element_Update[]
    properties?: Schema_Association_Update[]
    identifiers?: Schema_Association_Update[]
}

export type Search_Target =
    | 'schemas'
    | 'instances'
    | 'activity'

export type Filter_Operator =
    | 'equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'has_field'
    | 'has_element'
    | 'has_property'
    | 'has_identifier'

export type Field_Role =
    | 'any'
    | 'element'
    | 'property'
    | 'identifier'

export interface Search_Filter {
    field_schema_uid: string
    field_role?: Field_Role
    operator: Filter_Operator
    value?: unknown
}

export interface Search_Query {
    target: Search_Target
    filters?: Search_Filter[]
    logic?: 'and' | 'or'
}
export interface Search_Filter_Input {
    field_schema_uid: string
    field_role: Field_Role
    operator: Filter_Operator
    value?: unknown
    values?: {
        schema: Schema
        value: unknown
    }[]
}

export interface Search_Query_Input {
    search_target: Search_Target
    filters?: Search_Filter_Input[]
    logic?: 'and' | 'or'
    sort?: {
        field: string
        direction: 'asc' | 'desc'
    }
}
