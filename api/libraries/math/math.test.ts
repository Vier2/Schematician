import { Mean_Operation,
    execute_operation,
    Piecewise_Input_Schema,
    Piecewise_Output_Schema,
    Greater_Than_Operation,
    Addition_Operation,
    Power_Operation,
 } from "./schema.js"

import type { Operation_Definition,
    Operation_Invocation,
    Computation,
    Branch
} from "@schematician/shared"

const mean_result = execute_operation(
    Mean_Operation,
    {
        values: [3, 5, 7]
    }
)

console.log(mean_result)
export const Piecewise_Branch: Branch = {
    uid: 'piecewise.branch',

    condition: {
        type: 'Operation_Output',
        operation_uid:
            'piecewise.x_greater_than_3',
        output_uid: 'result'
    },

    cases: [
        {
            equals: true,

            operations: [
                {
                    uid: 'piecewise.square_x',

                    operation: Power_Operation,

                    arguments: [
                        {
                            input_uid: 'base',

                            source: {
                                type: 'Computation_Input',
                                input_uid: 'x'
                            }
                        },

                        {
                            input_uid: 'exponent',

                            source: {
                                type: 'Literal',
                                value: 2
                            }
                        }
                    ]
                }
            ],

            output: {
                type: 'Operation_Output',
                operation_uid:
                    'piecewise.square_x',
                output_uid: 'power'
            }
        },

        {
            equals: false,

            operations: [
                {
                    uid: 'piecewise.add_one',

                    operation: Addition_Operation,

                    arguments: [
                        {
                            input_uid: 'addends',

                            source: {
                                type: 'Collection',

                                items: [
                                    {
                                        type: 'Computation_Input',
                                        input_uid: 'x'
                                    },

                                    {
                                        type: 'Literal',
                                        value: 1
                                    }
                                ]
                            }
                        }
                    ]
                }
            ],

            output: {
                type: 'Operation_Output',
                operation_uid:
                    'piecewise.add_one',
                output_uid: 'sum'
            }
        }
    ]
}
const Compare_X_To_Three: Operation_Invocation = {
    uid: 'piecewise.x_greater_than_3',

    operation: Greater_Than_Operation,

    arguments: [
        {
            input_uid: 'left',

            source: {
                type: 'Computation_Input',
                input_uid: 'x'
            }
        },

        {
            input_uid: 'right',

            source: {
                type: 'Literal',
                value: 3
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
    Piecewise_Operation,
    {
        x: 5
    }
)

const result_2 = execute_operation(
    Piecewise_Operation,
    {
        x: 2
    }
)

console.log(`result 1 ${result_1}`)
console.log(`result 2 ${result_2}`)
