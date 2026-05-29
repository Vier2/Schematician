
type Data_Type =
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




export interface Schema<
    T extends Data_Type = Data_Type
> {
    /**
     * Semantic identifier
     */
    name: string

    /**
     * Determines runtime value typing
     */
    data_type: T

    /**
     * Structural decomposition
     */
    elements?: Schema[]

    /**
     * Property definitions
     */
    properties?: Schema_Association[]

    /**
     * Identifier definitions
     */
    identifiers?: Schema_Association[]

    /**
     * Limited allowed values
     */
    enumerations?: Data_Type_Map[T][]

    /**
     * Optional values not enforced
     */
    options?: Data_Type_Map[T][]

    /**
     * will probably make into relationship rather than property
     */
    instances?: Record<
        string,
        Data_Type_Map[T]
    >

    rules?: string

    logic?: string

    constraints?: Constraint_Map[T]
    relationships?: string
}

interface Number_Constraints {
    minimum_number?: number
    maximum_number?: number
}

interface String_Constraints {
    minimum_characters?: number
    maximum_characters?: number
    regex?: RegExp
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
