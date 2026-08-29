import type { Schema, Operation_Definition, Rule, Atomic_Executor } from "@schematician/shared";

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

