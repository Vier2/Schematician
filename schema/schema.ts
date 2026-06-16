
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
/**
 * I need a interface which will receive 
 * any number of interaction properties
 * resolve the difference/output
 * and return the results to each element
 * 
 */



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




type Exclusive<
    A,
    B,
    K extends keyof any = keyof (A & B)
> =
    | (A & { [P in keyof B]?: never })
    | (B & { [P in keyof A]?: never });


type EnumPart<T extends Data_Type> = {
    enumerations: Data_Type_Map[T][]
    options?: never
}

type OptionsPart<T extends Data_Type> = {
    options: Data_Type_Map[T][]
    enumerations?: never
}

type EmptyPart = {
    enumerations?: never
    options?: never
}
type BaseSchema<T extends Data_Type> = {
    name: string
    data_type: T
    elements?: Schema[]
    properties?: Schema_Association[]
    identifiers?: Schema_Association[]
    instances?: Record<string, Data_Type_Map[T]>
    rules?: string
    logic?: string
    constraints?: Constraint_Map[T]
    relationships?: string
}
export type Schema<T extends Data_Type = Data_Type> =
    BaseSchema<T> & (EnumPart<T> | OptionsPart<T> | EmptyPart)

interface Number_Constraints {
    minimum_number?: number
    maximum_number?: number
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

interface Boolean_Constraints {

}
interface Interface_Constraints {

}

interface Associative_Array_Constraints {

}

type character_limit = number
type character_minimum = number
type max_number = number
type minimum_number = number



/**
 * Runtime object instance
 */
export interface Schema_Instance {
    schema: Schema

    values?: Schema_Association[]
}

type Search_Target = 'schemas' | 'instances' | 'activity'

type Filter_Operator =
    | 'equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'has_field'
    | 'has_element'
    | 'has_property'

interface Search_Filter {
    field: string
    operator: Filter_Operator
    value?: unknown
}
/**
 * Could do union type later for different schemas based on search filter
 * list instances of schema
 */

interface Search_Query {
    target: Search_Target
    filters?: Search_Filter[]
    logic?: 'and' | 'or'
    sort?: {
        field: string
        direction: 'asc' | 'desc'
    }
}