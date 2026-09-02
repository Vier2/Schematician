import type { Schema, 
    Operation_Definition,
    Computation,
    Value_Source,
    Runtime_Value,
    Operation_Trace,
    Operation_Invocation,
    Execution_Context,
    Branch,
    Computation_Trace,
    GraphQL_Instance,
    Runtime_Values,
    GraphQL_Atomic_Instance,
    Atomic_Values,
    Operation_Execution_Result,
     Atomic_Executor } from "@schematician/shared";

import { 
    Addend_Schema,
    Sum_Schema,
    Factor_Schema,
    Product_Schema,
    Dividend_Schema,
    Divisor_Schema,
    Quotient_Schema,
    Number_Schema,
    Boolean_Schema } from "./object.js";

import { get_boolean_value,
    get_atomic_value,
    get_number_value,
    create_execution_context
 } from "./objectives/utils.js";
export const Count_Schema: Schema<'Number'> = {
    uid: 'math.count',
    name: 'Count',
    data_type: 'Number'
}

export const Countable_Item_Schema: Schema = {
    uid: 'math.countable_item',
    name: 'Countable Item',
    data_type: 'Composite'
}





export const Addition_Operation: Operation_Definition = {
    uid: 'math.operation.addition',
    name: 'Addition',

    inputs: [
        {
            uid: 'addends',
            schema: Addend_Schema,
            cardinality: 'Multiple',
            required: true
        }
    ],

    outputs: [
        {
            uid: 'sum',
            schema: Sum_Schema,
            cardinality: 'Single'
        }
    ],

    implementation: {
        type: 'Atomic',
        executor_uid: 'builtin.number.add'
    }
}

export const Multiplication_Operation:
    Operation_Definition = {

    uid: 'math.operation.multiplication',
    name: 'Multiplication',

    inputs: [
        {
            uid: 'factors',
            schema: Factor_Schema,
            cardinality: 'Multiple',
            required: true
        }
    ],

    outputs: [
        {
            uid: 'product',
            schema: Product_Schema,
            cardinality: 'Single'
        }
    ],

    implementation: {
        type: 'Atomic',
        executor_uid: 'builtin.number.multiply'
    }
}

export const Division_Operation:
    Operation_Definition = {

    uid: 'math.operation.division',
    name: 'Division',

    inputs: [
        {
            uid: 'dividend',
            schema: Dividend_Schema,
            cardinality: 'Single',
            required: true
        },

        {
            uid: 'divisor',
            schema: Divisor_Schema,
            cardinality: 'Single',
            required: true
        }
    ],

    outputs: [
        {
            uid: 'quotient',
            schema: Quotient_Schema,
            cardinality: 'Single'
        }
    ],

    implementation: {
        type: 'Atomic',
        executor_uid: 'builtin.number.divide'
    }
}



// const Circle_Area_Rule: Rule = {
//     uid: 'math.rule.circle_area',
//     name: 'Circle Area Relationship',

//     relation: {
//         type: 'Equality',

//         left: {
//             type: 'Element',
//             element_uid: 'area'
//         },

//         right: {
//             type: 'Operation_Output',
//             operation_uid: 'circle_area_computation',
//             output_uid: 'result'
//         }
//     }
// }

export const Atomic_Executors:
    Record<string, Atomic_Executor> = {

    'builtin.number.add': inputs => {
        const addends = inputs.addends as number[]

        return {
            sum: addends.reduce(
                (sum, addend) => sum + addend,
                0
            )
        }
    },

    'builtin.number.multiply': inputs => {
        const factors = inputs.factors as number[]

        return {
            product: factors.reduce(
                (product, factor) => product * factor,
                1
            )
        }
    },

    'builtin.number.divide': inputs => {
        const dividend = inputs.dividend as number
        const divisor = inputs.divisor as number

        if (divisor === 0) {
            throw new Error(
                'Divisor cannot equal zero.'
            )
        }

        return {
            quotient: dividend / divisor
        }
    },

    'builtin.number.greater_than': inputs => {
        const left = inputs.left as number
        const right = inputs.right as number

        return {
            result: left > right
        }
    },
    'builtin.collection.count':  inputs => {
        const items = inputs.items as unknown[]

        return {
            count: items.length
        }
    },
    'builtin.number.power': inputs => {
        const base = inputs.base as number
        const exponent = inputs.exponent as number

        return {
            power: base ** exponent
        }
    }
}


export const Comparison_Left_Schema:
    Schema<'Number'> = {

    uid: 'math.comparison.left',
    name: 'Left Operand',
    data_type: 'Number'
}

export const Comparison_Right_Schema:
    Schema<'Number'> = {

    uid: 'math.comparison.right',
    name: 'Right Operand',
    data_type: 'Number'
}


export const Greater_Than_Operation:
    Operation_Definition = {

    uid: 'math.operation.greater_than',
    name: 'Greater Than',

    inputs: [
        {
            uid: 'left',
            schema: Comparison_Left_Schema,
            cardinality: 'Single',
            required: true
        },

        {
            uid: 'right',
            schema: Comparison_Right_Schema,
            cardinality: 'Single',
            required: true
        }
    ],

    outputs: [
        {
            uid: 'result',
            schema: Boolean_Schema,
            cardinality: 'Single'
        }
    ],

    implementation: {
        type: 'Atomic',
        executor_uid: 'builtin.number.greater_than'
    }
}

export const Mean_Input_Schema: Schema<'Number'> = {
    uid: 'math.mean.input',
    name: 'Mean Input',
    data_type: 'Number'
}

export const Mean_Result_Schema: Schema<'Number'> = {
    uid: 'math.mean.result',
    name: 'Mean',
    data_type: 'Number'
}
export const Count_Operation: Operation_Definition = {
    uid: 'math.operation.count',
    name: 'Count',

    inputs: [
        {
            uid: 'items',
            schema: Countable_Item_Schema,
            cardinality: 'Multiple',
            required: true
        }
    ],

    outputs: [
        {
            uid: 'count',
            schema: Count_Schema,
            cardinality: 'Single'
        }
    ],

    implementation: {
        type: 'Atomic',
        executor_uid: 'builtin.collection.count'
    }
}
export const Mean_Computation: Computation = {
    uid: 'math.computation.mean',

    name: 'Arithmetic Mean Computation',

    inputs: [
        {
            uid: 'values',

            schema:
                Mean_Input_Schema,

            cardinality:
                'Array'
        }
    ],

    operations: [

        {
            uid: 'mean.add_values',

            operation:
                Addition_Operation,

            arguments: [
                {
                    input_uid:
                        'addends',

                    source: {
                        type:
                            'Computation_Input',

                        input_uid:
                            'values'
                    }
                }
            ]
        },


        {
            uid: 'mean.count_values',

            operation:
                Count_Operation,

            arguments: [
                {
                    input_uid:
                        'items',

                    source: {
                        type:
                            'Computation_Input',

                        input_uid:
                            'values'
                    }
                }
            ]
        },


        {
            uid: 'mean.divide',

            operation:
                Division_Operation,

            arguments: [

                {
                    input_uid:
                        'dividend',

                    source:  {
                        type:
                            'Operation_Output',

                        operation_uid:
                            'mean.add_values',

                        output_uid:
                            'sum'
                    

                    }
                },


                {
                    input_uid:
                        'divisor',

                    source: {
                        type:
                            'Operation_Output',

                        operation_uid:
                            'mean.count_values',

                        output_uid:
                            'count'
                    }
                }
            ]
        }
    ],

    outputs: [
        {
            uid: 'mean',

            schema:
                Mean_Result_Schema,

            source: {
                type:
                    'Operation_Output',

                operation_uid:
                    'mean.divide',

                output_uid:
                    'quotient'
            }
        }
    ]
}
export const Mean_Operation: Operation_Definition = {
    uid: 'math.operation.mean',
    name: 'Arithmetic Mean',

    inputs: [
        {
            uid: 'values',
            schema: Mean_Input_Schema,
            cardinality: 'Multiple',
            required: true
        }
    ],

    outputs: [
        {
            uid: 'mean',
            schema: Mean_Result_Schema,
            cardinality: 'Single'
        }
    ],

    implementation: {
        type: 'Composite',

        computation: Mean_Computation         // Addition invocation
            // Count inv ocation
            // Division invocation
        
    }
}





export function execute_atomic_operation(
    operation: Operation_Definition,
    inputs: Record<string, unknown>
): Record<string, unknown> {

    if (operation.implementation.type !== 'Atomic') {
        throw new Error(
            `${operation.name} is not atomic.`
        )
    }

    const executor =
        Atomic_Executors[
        operation.implementation.executor_uid
        ]

    if (!executor) {
        throw new Error(
            `Atomic executor not found: ` +
            operation.implementation.executor_uid
        )
    }

    return executor(inputs)
}

const result = execute_atomic_operation(
    Addition_Operation,
    {
        addends: [5, 10, 20]
    }
)

export function unwrap_runtime_value(
    value: Runtime_Value
): unknown {

    if (Array.isArray(value)) {

        return value.map(
            instance =>
                unwrap_instance_value(
                    instance
                )
        )
    }

    return unwrap_instance_value(
        value
    )
}
export function unwrap_instance_value(
    instance: GraphQL_Instance
): unknown {

    switch (instance.data_type) {

        case 'String':
        case 'Number':
        case 'Boolean':

            return instance.value


        case 'Array':

            return instance.items.map(
                item =>
                    unwrap_instance_value(
                        item
                    )
            )


        case 'Composite':

            /*
             * A Composite cannot automatically
             * become one primitive value.
             *
             * Handle this later when an atomic
             * operation actually requires one.
             */
            return instance
    }
}
export function unwrap_runtime_values(
    inputs: Runtime_Values
): Atomic_Values {

    const atomic_inputs:
        Atomic_Values = {}

    for (
        const [uid, value]
        of Object.entries(inputs)
    ) {

        atomic_inputs[uid] =
            unwrap_runtime_value(
                value
            )
    }

    return atomic_inputs
}

console.log(result)

export function wrap_atomic_outputs(
    invocation_uid: string,
    operation: Operation_Definition,
    atomic_outputs: Atomic_Values
): Runtime_Values {

    const outputs:
        Runtime_Values = {}

    for (
        const output_definition
        of operation.outputs
    ) {

        const raw_value =
            atomic_outputs[
            output_definition.uid
            ]

        if (raw_value === undefined) {
            throw new Error(
                `Atomic operation ${operation.name
                } did not return expected output "${output_definition.uid
                }".`
            )
        }

        if (
            output_definition.cardinality ===
            'Multiple'
        ) {

            if (!Array.isArray(raw_value)) {
                throw new Error(
                    `Output ${output_definition.uid
                    } must be an array.`
                )
            }

            outputs[
                output_definition.uid
            ] =
                raw_value.map(
                    (value, index) =>
                        create_instance_from_value(
                            output_definition.schema,
                            value,
                            `${invocation_uid}.${output_definition.uid}.${index}`
                        )
                )

            continue
        }

        outputs[
            output_definition.uid
        ] =
            create_instance_from_value(
                output_definition.schema,
                raw_value,
                `${invocation_uid}.${output_definition.uid}`
            )
    }

    return outputs
}
export function create_instance_from_value(
    schema: Schema,
    value: unknown,
    uid: string
): GraphQL_Instance {

    switch (schema.data_type) {

        case 'Number':

            return {
                uid,
                schema_uid: schema.uid!,
                data_type: 'Number',
                value: value as number

                // Add the other required
                // GraphQL_Instance_Base fields.
            }


        case 'String':

            return {
                uid,
                schema_uid: schema.uid!,
                data_type: 'String',
                value: value as string

                // other base fields
            }


        case 'Boolean':

            return {
                uid,
                schema_uid: schema.uid!,
                data_type: 'Boolean',
                value: value as boolean

                // other base fields
            }


        default:

            throw new Error(
                `Automatic output creation is not yet implemented for ${schema.data_type}.`
            )
    }
}
export function execute_operation(
    invocation_uid: string,
    operation: Operation_Definition,
    inputs: Runtime_Values
): {
    outputs: Runtime_Values
    trace: Operation_Trace
} {

    if (
        operation.implementation.type ===
        'Atomic'
    ) {

        const executor =
            Atomic_Executors[
            operation
                .implementation
                .executor_uid
            ]

        if (!executor) {

            throw new Error(
                `Atomic executor not found: ${operation
                    .implementation
                    .executor_uid
                }`
            )
        }

        /*
         * GraphQL instances
         * ↓
         * primitive JS values
         */
        const atomic_inputs =
            unwrap_runtime_values(
                inputs
            )

        /*
         * Actual primitive mathematical
         * operation occurs here.
         */
        const atomic_outputs =
            executor(
                atomic_inputs
            )

        /*
         * primitive JS values
         * ↓
         * GraphQL instances
         */
        const outputs =
            wrap_atomic_outputs(
                invocation_uid,
                operation,
                atomic_outputs
            )

        return {
            outputs,

            trace: {
                invocation_uid,

                operation_uid:
                    operation.uid,

                operation_name:
                    operation.name,

                inputs,

                outputs,

                children: []
            }
        }
    }


    /*
     * Composite operations recursively
     * execute their computation.
     */

    const composite_execution =
        execute_computation(
            operation
                .implementation
                .computation,

            inputs
        )

    return {
        outputs:
            composite_execution.outputs,

        trace: {
            invocation_uid,

            operation_uid:
                operation.uid,

            operation_name:
                operation.name,

            inputs,

            outputs:
                composite_execution.outputs,

            children:
                composite_execution
                    .trace
                    .operations
        }
    }
}

export function execute_operation_invocation(
    invocation: Operation_Invocation,
    context: Execution_Context
): Operation_Execution_Result {

    const inputs:
        Runtime_Values = {}

    for (const argument of invocation.arguments) {

        inputs[
            argument.input_uid
        ] =
            resolve_value_source(
                argument.source,
                context
            )
    }

    const execution =
        execute_operation(
            invocation.uid,
            invocation.operation,
            inputs
        )

    context.operation_outputs[
        invocation.uid
    ] =
        execution.outputs

    context.operation_traces.push(
        execution.trace
    )

    return execution
}
export function execute_computation(
    computation: Computation,
    inputs: Runtime_Values,
    available_instances:
        GraphQL_Instance[] = []
): {
    outputs: Runtime_Values
    trace: Computation_Trace
} {

    const context =
        create_execution_context(
            inputs,
            available_instances
        )

    for (
        const invocation
        of computation.operations
    ) {
        execute_operation_invocation(
            invocation,
            context
        )
    }

    for (
        const branch
        of computation.branches ?? []
    ) {

        context.branch_outputs[
            branch.uid
        ] =
            execute_branch(
                branch,
                context
            )
    }

    const outputs:
        Runtime_Values = {}

    for (
        const output
        of computation.outputs
    ) {

        outputs[
            output.uid
        ] =
            resolve_value_source(
                output.source,
                context
            )
    }

    return {
        outputs,

        trace: {
            computation_uid:
                computation.uid,

            computation_name:
                computation.name,

            inputs,

            operations:
                context.operation_traces,

            outputs
        }
    }
}

export function resolve_value_source(
    source: Value_Source,
    context: Execution_Context
): Runtime_Value {

    switch (source.type) {

        case 'Instance':
            return source.instance


        case 'Instance_Reference': {

            const instance =
                context.available_instances.get(
                    source.instance_uid
                )

            if (!instance) {
                throw new Error(
                    `Instance not found: ${source.instance_uid}`
                )
            }

            return instance
        }


        case 'Computation_Input': {

            const value =
                context.computation_inputs[
                source.input_uid
                ]

            if (value === undefined) {
                throw new Error(
                    `Computation input not found: ${source.input_uid}`
                )
            }

            return value
        }


        case 'Operation_Output': {

            const operation_outputs =
                context.operation_outputs[
                source.operation_uid
                ]

            if (!operation_outputs) {
                throw new Error(
                    `Operation outputs not found: ${source.operation_uid}`
                )
            }

            const output =
                operation_outputs[
                source.output_uid
                ]

            if (output === undefined) {
                throw new Error(
                    `Operation output not found: ${source.operation_uid}.${source.output_uid}`
                )
            }

            return output
        }


        case 'Collection': {

            const items:
                GraphQL_Instance[] = []

            for (const item_source of source.items) {

                const resolved =
                    resolve_value_source(
                        item_source,
                        context
                    )

                if (Array.isArray(resolved)) {
                    items.push(...resolved)
                }
                else {
                    items.push(resolved)
                }
            }

            return items
        }


        case 'Branch_Output': {

            const output =
                context.branch_outputs[
                source.branch_uid
                ]

            if (output === undefined) {
                throw new Error(
                    `Branch output not found: ${source.branch_uid}`
                )
            }

            return output
        }
    }
}


export const Base_Schema: Schema<'Number'> = {
    uid: 'math.power.base',
    name: 'Base',
    data_type: 'Number'
}

export const Exponent_Schema: Schema<'Number'> = {
    uid: 'math.power.exponent',
    name: 'Exponent',
    data_type: 'Number'
}

export const Power_Result_Schema: Schema<'Number'> = {
    uid: 'math.power.result',
    name: 'Power',
    data_type: 'Number'
}


export const Power_Operation: Operation_Definition = {
    uid: 'math.operation.power',
    name: 'Power',

    inputs: [
        {
            uid: 'base',
            schema: Base_Schema,
            cardinality: 'Single',
            required: true
        },

        {
            uid: 'exponent',
            schema: Exponent_Schema,
            cardinality: 'Single',
            required: true
        }
    ],

    outputs: [
        {
            uid: 'power',
            schema: Power_Result_Schema,
            cardinality: 'Single'
        }
    ],

    implementation: {
        type: 'Atomic',
        executor_uid: 'builtin.number.power'
    }
}

export const Piecewise_Input_Schema: Schema<'Number'> = {
    uid: 'math.piecewise.input',
    name: 'Piecewise Input',
    data_type: 'Number'
}

export const Piecewise_Output_Schema: Schema<'Number'> = {
    uid: 'math.piecewise.output',
    name: 'Piecewise Output',
    data_type: 'Number'
}








export function execute_branch(
    branch: Branch,
    context: Execution_Context
): Runtime_Value {

    const condition =
        resolve_value_source(
            branch.condition,
            context
        )


    /*
     * A branch condition must resolve
     * to one instance.
     */
    if (Array.isArray(condition)) {

        throw new Error(
            'Branch condition cannot be an array.'
        )
    }


    /*
     * Currently branch matching is based
     * upon the value of an atomic instance.
     */
    const condition_value =
        get_atomic_value(
            condition
        )


    const selected_case =
        branch.cases.find(
            branch_case =>
                branch_case.equals ===
                condition_value
        )


    if (!selected_case) {

        throw new Error(
            `No branch matched condition: ${String(
                condition_value
            )
            }`
        )
    }


    /*
     * Only execute operations belonging
     * to the selected branch.
     */
    for (
        const invocation
        of selected_case.operations
    ) {

        execute_operation_invocation(
            invocation,
            context
        )
    }


    /*
     * Resolve the branch's declared output.
     */
    return resolve_value_source(
        selected_case.output!,
        context
    )
}







export const Number_One_Instance:
    GraphQL_Atomic_Instance = {

    uid: 'math.instance.number.1',

    schema_uid:
        Number_Schema.uid!,

    data_type:
        'Number',

    value:
        1

    // other GraphQL_Instance_Base
    // fields required by your actual model
}


export const Number_Two_Instance:
    GraphQL_Atomic_Instance = {

    uid: 'math.instance.number.2',

    schema_uid:
        Number_Schema.uid!,

    data_type:
        'Number',

    value:
        2

    // required base fields
}


export const Number_Three_Instance:
    GraphQL_Atomic_Instance = {

    uid: 'math.instance.number.3',

    schema_uid:
        Number_Schema.uid!,

    data_type:
        'Number',

    value:
        3

    // required base fields
}

export const Number_Five_Instance:
    GraphQL_Atomic_Instance = {

    uid: 'math.instance.number.5',

    schema_uid:
        Number_Schema.uid!,

    data_type:
        'Number',

    value:
        5

    // required base fields
}

export const Piecewise_Branch:
    Branch = {

    uid:
        'piecewise.branch',

    condition: {
        type:
            'Operation_Output',

        operation_uid:
            'piecewise.x_greater_than_3',

        output_uid:
            'result'
    },

    cases: [

        /*
         * x > 3
         *
         * result = x²
         */
        {
            equals:
                true,

            operations: [
                {
                    uid:
                        'piecewise.square_x',

                    operation:
                        Power_Operation,

                    arguments: [

                        {
                            input_uid:
                                'base',

                            source: {
                                type:
                                    'Computation_Input',

                                input_uid:
                                    'x'
                            }
                        },


                        {
                            input_uid:
                                'exponent',

                            source: {
                                type:
                                    'Instance',

                                instance:
                                    Number_Two_Instance
                            }
                        }
                    ]
                }
            ],

            output: {
                type:
                    'Operation_Output',

                operation_uid:
                    'piecewise.square_x',

                output_uid:
                    'power'
            }
        },


        /*
         * x <= 3
         *
         * result = x + 1
         */
        {
            equals:
                false,

            operations: [
                {
                    uid:
                        'piecewise.add_one',

                    operation:
                        Addition_Operation,

                    arguments: [
                        {
                            input_uid:
                                'addends',

                            source: {
                                type:
                                    'Collection',

                                items: [

                                    {
                                        type:
                                            'Computation_Input',

                                        input_uid:
                                            'x'
                                    },


                                    {
                                        type:
                                            'Instance',

                                        instance:
                                            Number_One_Instance
                                    }
                                ]
                            }
                        }
                    ]
                }
            ],

            output: {
                type:
                    'Operation_Output',

                operation_uid:
                    'piecewise.add_one',

                output_uid:
                    'sum'
            }
        }
    ]
}
export const Compare_X_To_Three:
    Operation_Invocation = {

    uid:
        'piecewise.x_greater_than_3',

    operation:
        Greater_Than_Operation,

    arguments: [

        {
            input_uid:
                'left',

            source: {
                type:
                    'Computation_Input',

                input_uid:
                    'x'
            }
        },


        {
            input_uid:
                'right',

            source: {
                type:
                    'Instance',

                instance:
                    Number_Three_Instance
            }
        }
    ]
}
export const Piecewise_Computation: Computation = {
    uid: 'math.computation.test_piecewise',
    name: 'Test Piecewise Function',

    inputs: [
        {
            uid: 'x',
            schema: Piecewise_Input_Schema,
            cardinality: 'Single'
        }
    ],

    operations: [
        Compare_X_To_Three
    ],

    branches: [
        Piecewise_Branch
    ],

    outputs: [
        {
            uid: 'result',

            schema: Piecewise_Output_Schema,

            source: {
                type: 'Branch_Output',
                branch_uid: 'piecewise.branch'
            }
        }
    ]
}
export const Piecewise_Operation:
    Operation_Definition = {

    uid: 'math.operation.test_piecewise',
    name: 'Test Piecewise Function',

    inputs: [
        {
            uid: 'x',
            schema: Piecewise_Input_Schema,
            cardinality: 'Single',
            required: true
        }
    ],

    outputs: [
        {
            uid: 'result',
            schema: Piecewise_Output_Schema,
            cardinality: 'Single'
        }
    ],

    implementation: {
        type: 'Composite',
        computation: Piecewise_Computation
    }
}

const result_1 = execute_operation(
    '1', 
    Piecewise_Operation,
    {
        x: Number_Three_Instance
    }
)
const result_2 = execute_operation(
    '2',
    Piecewise_Operation,
    {
        x: Number_One_Instance
    }
)

const result_3 = execute_operation(
    '3',
    Piecewise_Operation,
    {
        x: Number_Five_Instance
    }
)
function format_runtime_value(
    value: Runtime_Value
): string {

    if (Array.isArray(value)) {
        return `[${value
                .map(format_instance)
                .join(', ')
            }]`
    }

    return format_instance(value)
}


function format_instance(
    instance: GraphQL_Instance
): string {

    switch (instance.data_type) {

        case 'String':
            return `"${instance.value}"`

        case 'Number':
        case 'Boolean':
            return String(instance.value)

        case 'Array':
            return `[${instance.items
                    .map(format_instance)
                    .join(', ')
                }]`

        case 'Composite':
            return `{${instance.uid}}`
    }
}


function format_values(
    values: Runtime_Values
): string {

    return Object.entries(values)
        .map(
            ([name, value]) =>
                `${name} = ${format_runtime_value(value)}`
        )
        .join(', ')
}


function format_operation_trace(
    trace: Operation_Trace,
    prefix = '',
    is_last = true
): string[] {

    const connector =
        is_last
            ? '└── '
            : '├── '

    const child_prefix =
        prefix +
        (
            is_last
                ? '    '
                : '│   '
        )

    const lines: string[] = []

    lines.push(
        `${prefix}${connector}${trace.operation_name}`
    )

    lines.push(
        `${child_prefix}├─ Inputs:  ${format_values(trace.inputs)
        }`
    )

    lines.push(
        `${child_prefix}└─ Outputs: ${format_values(trace.outputs)
        }`
    )


    trace.children.forEach(
        (child, index) => {

            const child_is_last =
                index ===
                trace.children.length - 1

            lines.push(
                ...format_operation_trace(
                    child,
                    child_prefix,
                    child_is_last
                )
            )
        }
    )

    return lines
}


export function print_execution_result(
    result: {
        outputs: Runtime_Values
        trace: Operation_Trace
    }
): void {

    const trace = result.trace

    console.log('')
    console.log(
        `${trace.operation_name}`
    )

    console.log(
        `├─ Inputs:  ${format_values(trace.inputs)
        }`
    )

    console.log('│')

    if (trace.children.length > 0) {

        trace.children.forEach(
            (child, index) => {

                const is_last =
                    index ===
                    trace.children.length - 1

                for (
                    const line
                    of format_operation_trace(
                        child,
                        '├─ ',
                        is_last
                    )
                ) {
                    console.log(line)
                }
            }
        )

        console.log('│')
    }

    console.log(
        `└─ Result:  ${format_values(result.outputs)
        }`
    )

    console.log('')
}


print_execution_result(result_1)
print_execution_result(result_2)
print_execution_result(result_3)
