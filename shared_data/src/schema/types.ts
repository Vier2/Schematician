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
    rules?: Rule[]
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




export interface Computation {
    uid: string
    name: string

    inputs: Computation_Input[]
    outputs: Computation_Output[]

    operations: Operation_Invocation[]

    control_flow?: Control_Flow[]

    execution_mode?: Execution_Mode
}
export interface Computation_Input {
    uid: string
    name: string

    schema_uid: string

    constraints?: Constraint[]
}

export interface Computation_Output {
    uid: string
    name: string

    schema_uid: string

    source: Value_Source
}

export type Value_Source =
    | Literal_Source
    | Input_Source
    | Element_Source
    | Operation_Output_Source

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

    operation_uid: string

    arguments: Operation_Argument[]
}
export interface Operation_Argument {
    parameter_uid: string
    source: Value_Source
}

export interface Branch {
    type: 'Branch'

    condition: Value_Source

    cases: Branch_Case[]
}

export interface Branch_Case {
    match: Match_Condition

    operations: Operation_Invocation[]
}

export interface Rule {
    uid: string
    name: string

    relation: Relation_Instance

    enforcement?: Rule_Enforcement
    resolvers?: Rule_Resolver[]

}
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


export interface Range {
    value_map: Value_Map[]


}

export interface Value_Map {
    value: string
    operations: Operation[]

}



interface Operation_Invocation {
    operation: Operation

    arguments: Argument_Binding[]
}

interface Argument_Binding {
    parameter_uid: string

    source:
    | Literal
    | Variable_Reference
    | Object_Reference
    | Operation_Output_Reference
}

type Mathematical_Expression =
    | Literal
    | Variable_Reference
    | Operation_Invocation
    | Function_Invocation
    | Vector
    | Matrix
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
interface Solve_Inputs {
    statements: Mathematical_Statement[]
    targets: Mathematical_Object[]
    knowns?: Value_Binding[]
    domain?: Mathematical_Domain
    assumptions?: Mathematical_Statement[]
}
interface Solve_Output {
    solutions: Solution_Set
}

interface Evaluate_Inputs {
    object: Mathematical_Object
    bindings?: Value_Binding[]
    assumptions?: Mathematical_Statement[]
    precision?: number
}

interface Evaluate_Output {
    result: Mathematical_Value
    trace?: Evaluation_Step[]
}

interface Substitution {
    target: Mathematical_Object
    replacement: Mathematical_Object
}

interface Transform_Inputs {
    object: Mathematical_Object
    target_form?: Mathematical_Form
    rules?: Transformation_Rule[]
}

interface Transform_Inputs {
    object: Mathematical_Object
    target_form?: Mathematical_Form
    rules?: Transformation_Rule[]
}
type Transform_Type =
    | 'Simplify'
    | 'Expand'
    | 'Factor'
    | 'Substitute'
    | 'Rewrite'
    | 'Rearrange'

interface Simplify_Inputs {
    object: Mathematical_Object
    assumptions?: Mathematical_Statement[]
    criterion?: Simplification_Criterion
}

interface Simplification_Criterion  {
    metric: 'term_count' | 'operation_count' | 'depth' | 'custom'
}

interface Factor_Inputs {
    expression: Mathematical_Expression
    domain?: Mathematical_Domain
}
interface Factor_Output {
    factored_expression: Mathematical_Expression
}


interface Expand_Inputs {
    expression: Mathematical_Expression
    scope?: Expansion_Scope
}

interface Expand_Output {
    expanded_expression: Mathematical_Expression
}

interface Differentiate_Inputs {
    expression: Mathematical_Object
    with_respect_to: Variable
    order?: number
    point?: Mathematical_Value
}

interface Differentiate_Output {
    derivative: Mathematical_Object
}
interface Differentiate_Output {
    derivative: Mathematical_Object
}

interface Integrate_Output {
    result: Mathematical_Object
}

interface Graph_Inputs {
    object: Mathematical_Object

    variables?: Variable[]

    domain?: Domain_Restriction[]

    viewport?: {
        x_min?: number
        x_max?: number
        y_min?: number
        y_max?: number
    }
}

interface Graph_Output {
    representation: Graph_Representation
}
export interface Describe_Input {
    y_function: string
    function: string
}
export type Objective_Input_Map = {
    Solve: Solve_Inputs
    Describe: Describe_Input


}
interface Base_Objective<T extends string, I, O> {
    type: T
    inputs: I
    output?: O
}


type Solve_Objective =
    Base_Objective<
        'Solve',
        Solve_Inputs,
        Solve_Output
    >

type Evaluate_Objective =
    Base_Objective<
        'Evaluate',
        Evaluate_Inputs,
        Evaluate_Output
    >

type Factor_Objective =
    Base_Objective<
        'Factor',
        Factor_Inputs,
        Factor_Output
    >

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


export type Atomic_Executor = (
    inputs: Record<string, unknown>
) => Record<string, unknown>