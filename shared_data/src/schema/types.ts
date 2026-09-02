import { GraphQL_Instance, JSON_Value } from "../graphql/types"

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
    uid?: string
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
    image_url?: string | null
    rules?: string
    constraints?: Constraint_Map[T]
    relationships?: string
}
interface Computational_Schema<
    T extends Data_Type
> extends BaseSchema<T> {

    computations: Computation[]
}
type EnumPart<T extends Data_Type> = {
    enumerations: Data_Type_Map[T][]
    options?: never
}
export type Schema<T extends Data_Type = Data_Type> =
 BaseSchema<T> & (EnumPart<T> | OptionsPart<T> | EmptyPart)

export interface Schema_Instance {
    schema: Schema
    root: GraphQL_Instance
}


export type Instance_Path =
    Instance_Path_Segment[]

export type Instance_Path_Segment =
    | {
        type: 'Object'
        element_relationship_uid: string
    }
    | {
        type: 'Array_Item'
        index: number
    }
export interface Instance_Node {
    value?: unknown
    elements?: Instance_Node[]
}

export interface Rendered_Node {
    schema: Schema
    element: HTMLElement
    path: Instance_Path
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

    image_url?: string | null
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

type execution = 'Sequential' | 'Concurrent'


export type Evaluable_Object =
    | Operation_Invocation

export interface Computation {
    uid: string
    name: string

    inputs: Computation_Input[]
    outputs: Computation_Output[]

    operations: Operation_Invocation[]

    branches?: Branch[]
}
export interface Computation_Input {
    uid: string
    schema: Schema
    cardinality: Cardinality
}

export interface Computation_Output {
    uid: string
    schema: Schema
    source: Value_Source
}
export type Runtime_Value =
    | GraphQL_Instance
    | GraphQL_Instance[]
export interface Execution_Context {

    computation_inputs: Runtime_Values

    available_instances:
    Map<string, GraphQL_Instance>

    operation_outputs:
    Record<string, Runtime_Values>

    operation_traces:
    Operation_Trace[]

    branch_outputs:
    Record<string, Runtime_Value>
}
export type Value_Source =

    | Instance_Source

    | Instance_Reference_Source

    | Computation_Input_Source

    | Operation_Output_Source

    | Collection_Source

    | Branch_Output_Source


export interface Instance_Source {
    type: 'Instance'

    instance: GraphQL_Instance
}

export interface Instance_Reference_Source {
    type: 'Instance_Reference'

    instance_uid: string
}

export interface Computation_Input_Source {
    type: 'Computation_Input'

    input_uid: string
}

export interface Operation_Output_Source {
    type: 'Operation_Output'

    operation_uid: string

    output_uid: string
}

export interface Collection_Source {
    type: 'Collection'

    items: Value_Source[]
}

export interface Branch_Output_Source {
    type: 'Branch_Output'

    branch_uid: string
}

export interface Literal_Source {
    type: 'Literal'
    value: unknown
}

export interface Input_Source {
    type: 'Input'
    input_uid: string
}

export interface Element_Source {
    type: 'Element'
    element_uid: string
}

export interface Operation_Output_Source {
    type: 'Operation_Output'
    operation_uid: string
    output_uid: string
}

export interface Operation_Definition {
    uid: string
    name: string

    inputs: Operation_Input[]
    outputs: Operation_Output[]

    implementation: Operation_Implementation
}

export interface Operation_Input {
    uid: string
    schema: Schema
    cardinality: 'Single' | 'Multiple'
    required: boolean
}

export interface Operation_Output {
    uid: string
    schema: Schema
    cardinality: 'Single' | 'Multiple'
}
export interface Operation_Invocation {
    uid: string

    arguments: Operation_Argument[]
}
export interface Operation_Argument {
    input_uid: string
    source: Value_Source
}

export interface Branch {
    uid: string

    condition: Value_Source

    cases: Branch_Case[]
}

export interface Branch_Case {
    equals: unknown

    operations: Operation_Invocation[]

    output?: Value_Source
}

// export interface Rule {
//     uid: string
//     name: string

//     relation: Relation_Instance

//     enforcement?: Rule_Enforcement
//     resolvers?: Rule_Resolver[]

// }
/**
 * Example: 
 * Known B, C → derive A
 * Known A, C → derive B
 * Known A, B → derive C
 */
export interface Rule_Resolver {
    knowns: string[]
    target: string

    computation_uid: string
}
export interface Equality_Relation {
    type: 'Equality'

    left: Value_Source
    right: Value_Source
}
export type Match_Condition =
    | {
        type: 'Equals'
        value: unknown
    }
    | {
        type: 'Predicate'
        operation_uid: string
    }

/**make discriminated union according to data type of operand */
type operator = '>'|  '<'|  '=' | 'contains'



export interface Operation_Invocation {
    uid: string

    operation: Operation_Definition

    arguments: Operation_Argument[]
}




/**Test one before making all of them */

type Objective_type = 
    'Solve' |
    'Evaluate' |
    'Substitute' |
    'Transform' |
    'Describe' |
    'Factor' |
    'Differentiate' |
    'Integrate' |
    'Expand' |
    'Graph' |
    'Isolate' 


export type Runtime_Values =
    Record<string, Runtime_Value>
export interface Evaluate_Inputs {

    /**
     * Mathematical operation/expression to evaluate.
     */
    target: Operation_Invocation

    /**
     * Existing Schematician instances available
     * while resolving the target.
     */
    instances?: GraphQL_Instance[]
}

export interface Evaluate_Output {

    /**
     * Final result represented using the official
     * Schematician instance model.
     */
    result: GraphQL_Instance
}

export type Evaluate_Objective =
    Base_Objective<
        'Evaluate',
        Evaluate_Inputs
    >


export type Evaluate_Result =
    Objective_Result<
        'Evaluate',
        Evaluate_Output
    >








export interface Describe_Input {
    y_function: string
    function: string
}

export interface Base_Objective<
    T extends Objective_type,
    I
> {
    type: T
    inputs: I
}

export interface Atomic_Execution_Context {
    invocation_uid: string

    operation: Operation_Definition

    inputs: Runtime_Values
}


export interface Objective_Result<
    T extends Objective_type,
    O
> {
    objective_type: T

    output: O

    trace: Computation_Trace
}

export interface Operation_Trace {
    invocation_uid: string

    operation_uid: string

    operation_name: string

    inputs: Runtime_Values

    outputs: Runtime_Values

    children: Operation_Trace[]
}

export interface Computation_Trace {
    computation_uid: string

    computation_name: string

    inputs: Runtime_Values

    operations: Operation_Trace[]

    outputs: Runtime_Values
}
export interface Operation_Execution_Result {
    outputs: Record<string, unknown>

    trace: Operation_Trace
}





export interface Atomic_Operation_Implementation {
    type: 'Atomic'
    executor_uid: string
}

export interface Composite_Operation_Implementation {
    type: 'Composite'
    computation: Computation
}

export type Operation_Implementation =
    | Atomic_Operation_Implementation
    | Composite_Operation_Implementation


export type Atomic_Value = unknown

export type Atomic_Values =
    Record<string, Atomic_Value>

export type Atomic_Executor = (
    inputs: Atomic_Values
) => Atomic_Values