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

interface Composite_Constraints {

}
type Constraint_Map = {
    String: String_Constraints
    Number: Number_Constraints
    Boolean: Boolean_Constraints
    Composite: Composite_Constraints
}



export type Data_Type =
    | 'String'
    | 'Number'
    | 'Boolean'
    | 'Composite'

type Data_Type_Map = {
    String: string
    Number: number
    Boolean: boolean
    Composite: Schema_Instance
    Associative_Array: Record<string, unknown>
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
type Schema_Value<
    S extends Schema
> = Data_Type_Map[S['data_type']]
