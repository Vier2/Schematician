import type { Schema, 
    Operation_Definition,
    Computation,
    Value_Source,
    Values,
    Operation_Invocation,
    Execution_Context,
     Rule, Atomic_Executor } from "@schematician/shared";



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

export const Expression_Schema: Schema<'Composite'> = {
    uid: 'math.expression',
    name: 'Expression',
    data_type: 'Composite'
}
export const Equation_Schema: Schema<'Composite'> = {
    uid: 'math.equation',
    name: 'Equation',
    data_type: 'Composite',

    elements: [
        {
            uid: 'left',
            cardinality: 'Single',
            index: 0,
            required: true,
            element: Expression_Schema
        },

        {
            uid: 'right',
            cardinality: 'Single',
            index: 1,
            required: true,
            element: Expression_Schema
        }
    ]
}
export const Variable_Schema: Schema<'Number'> = {
    uid: 'math.variable',
    name: 'Variable',
    data_type: 'Number',
    /**WIll have to change data type to include string or number */
    elements: [
        // symbol
        // value domain
    ]
}
export const Number_Schema: Schema<'Number'> = {
    uid: 'math.number',
    name: 'Number',
    data_type: 'Number'
}

export const Addend_Schema: Schema<'Number'> = {
    uid: 'math.addend',
    name: 'Addend',
    data_type: 'Number'
}

export const Sum_Schema: Schema<'Number'> = {
    uid: 'math.sum',
    name: 'Sum',
    data_type: 'Number'
}

export const Factor_Schema: Schema<'Number'> = {
    uid: 'math.factor',
    name: 'Factor',
    data_type: 'Number'
}

export const Product_Schema: Schema<'Number'> = {
    uid: 'math.product',
    name: 'Product',
    data_type: 'Number'
}

export const Dividend_Schema: Schema<'Number'> = {
    uid: 'math.dividend',
    name: 'Dividend',
    data_type: 'Number'
}

export const Divisor_Schema: Schema<'Number'> = {
    uid: 'math.divisor',
    name: 'Divisor',
    data_type: 'Number'
}

export const Quotient_Schema: Schema<'Number'> = {
    uid: 'math.quotient',
    name: 'Quotient',
    data_type: 'Number'
}


export const Boolean_Schema: Schema<'Boolean'> = {
    uid: 'math.boolean',
    name: 'Boolean',
    data_type: 'Boolean'
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



const Circle_Area_Rule: Rule = {
    uid: 'math.rule.circle_area',
    name: 'Circle Area Relationship',

    relation: {
        type: 'Equality',

        left: {
            type: 'Element',
            element_uid: 'area'
        },

        right: {
            type: 'Operation_Output',
            operation_uid: 'circle_area_computation',
            output_uid: 'result'
        }
    }
}

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
            schema: Mean_Input_Schema,
            cardinality: 'Multiple'
        }
    ],

    operations: [
        {
            uid: 'mean.add_values',

            operation: Addition_Operation,

            arguments: [
                {
                    input_uid: 'addends',

                    source: {
                        type: 'Computation_Input',
                        input_uid: 'values'
                    }
                }
            ]
        },

        {
            uid: 'mean.count_values',

            operation: Count_Operation,

            arguments: [
                {
                    input_uid: 'items',

                    source: {
                        type: 'Computation_Input',
                        input_uid: 'values'
                    }
                }
            ]
        },

        {
            uid: 'mean.divide',

            operation: Division_Operation,

            arguments: [
                {
                    input_uid: 'dividend',

                    source: {
                        type: 'Operation_Output',
                        operation_uid: 'mean.add_values',
                        output_uid: 'sum'
                    }
                },

                {
                    input_uid: 'divisor',

                    source: {
                        type: 'Operation_Output',
                        operation_uid: 'mean.count_values',
                        output_uid: 'count'
                    }
                }
            ]
        }
    ],

    outputs: [
        {
            uid: 'mean',

            schema: Mean_Result_Schema,

            source: {
                type: 'Operation_Output',
                operation_uid: 'mean.divide',
                output_uid: 'quotient'
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

console.log(result)
export function execute_operation(
    operation: Operation_Definition,
    inputs: Values
): Values {

    if (operation.implementation.type === 'Atomic') {

        const executor =
            Atomic_Executors[
            operation.implementation.executor_uid
            ]

        if (!executor) {
            throw new Error(
                `Executor not found: ${operation.implementation.executor_uid
                }`
            )
        }

        return executor(inputs)
    }

    return execute_computation(
        operation.implementation.computation,
        inputs
    )
}

function execute_operation_invocation(
    invocation: Operation_Invocation,
    context: Execution_Context
): Values {

    const inputs: Values = {}

    for (const argument of invocation.arguments) {
        inputs[argument.input_uid] =
            resolve_value_source(
                argument.source,
                context
            )
    }

    return execute_operation(
        invocation.operation,
        inputs
    )
}
export function execute_computation(
    computation: Computation,
    inputs: Values
): Values {

    const context: Execution_Context = {
        computation_inputs: inputs,
        operation_outputs: {}
    }

    for (const invocation of computation.operations) {

        context.operation_outputs[invocation.uid] =
            execute_operation_invocation(
                invocation,
                context
            )
    }

    const outputs: Values = {}

    for (const output of computation.outputs) {

        outputs[output.uid] =
            resolve_value_source(
                output.source,
                context
            )
    }

    return outputs
}

function resolve_value_source(
    source: Value_Source,
    context: Execution_Context
): unknown {

    switch (source.type) {

        case 'Literal':
            return source.value

        case 'Computation_Input':
            return context.computation_inputs[
                source.input_uid
            ]

        case 'Operation_Output':
            return context.operation_outputs[source.operation_uid][source.output_uid]
    }
}
const mean_result = execute_operation(
    Mean_Operation,
    {
        values: [3, 5, 7]
    }
)

console.log(mean_result)