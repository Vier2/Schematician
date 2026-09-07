import type { 
    Schema,
    GraphQL_Atomic_Instance,
    GraphQL_Array_Instance,
    GraphQL_Instance,
    GraphQL_Composite_Instance,
    Operation_Definition,
    Computation
 } from "@schematician/shared"
import type { Substitute_Objective } from "../objectives/subsitition/types.js"
import { Expression_Schema, Equation_Schema } from "../object.js"
import { Number_Five_Instance, Count_Schema ,
    Countable_Item_Schema,
} from "../schema.js"
import { Number_Three_Instance, Mean_Result_Schema, Mean_Input_Schema} from "../schema.js"
import { substitute } from "../objectives/subsitition/utils.js"
import { Product_Schema, Factor_Schema, 
    Addend_Schema,
    Sum_Schema,
    Dividend_Schema,
    Divisor_Schema,
    Quotient_Schema} from "../object.js"
import { X_Variable_Instance,
    Number_Two_Instance, 
    Number_Eleven_Instance,
    Number_Four_Instance } from "../objectives/subsitition/test.js"
import { print_objective_result } from "../formatter/utils.js"

export const Operation_UID_Schema:
    Schema<'String'> = {

    uid: 'math.operation_application.operation_uid',

    name: 'Operation UID',

    data_type: 'String'
}
export const Operation_Argument_List_Schema:
    Schema<'Array'> = {

    uid: 'math.operation_application.arguments',

    name: 'Operation Arguments',

    data_type: 'Array'
}

export const Operation_Application_Schema:
    Schema<'Composite'> = {

    uid: 'math.operation_application',

    name: 'Operation Application',

    data_type: 'Composite',

    elements: [
        {
            uid: 'operation_uid',

            index: 0,

            cardinality: 'Single',

            required: true,

            element:
                Operation_UID_Schema
        },

        {
            uid: 'arguments',

            index: 1,

            cardinality: 'Single',

            required: true,

            element:
                Operation_Argument_List_Schema
        }
    ]
}

export const Operation_Input_UID_Schema:
    Schema<'String'> = {

    uid: 'math.operation_argument.input_uid',

    name: 'Operation Input UID',

    data_type: 'String'
}


export const Operation_Argument_Schema:
    Schema<'Composite'> = {

    uid: 'math.operation_argument',

    name: 'Operation Argument',

    data_type: 'Composite',

    elements: [
        {
            uid: 'input_uid',

            index: 0,

            cardinality: 'Single',

            required: true,

            element:
                Operation_Input_UID_Schema
        },

        {
            uid: 'value',

            index: 1,

            cardinality: 'Single',

            required: true,

            element:
                Expression_Schema
        }
    ]
}

function string_instance(
    uid: string,
    schema_uid: string,
    value: string
): GraphQL_Atomic_Instance {

    return {
        uid,
        schema_uid,
        data_type: 'String',
        value
    }
}
function array_instance(
    uid: string,
    schema_uid: string,
    items: GraphQL_Instance[]
): GraphQL_Array_Instance {

    return {
        uid,
        schema_uid,
        data_type: 'Array',
        items
    }
}

function create_operation_argument_instance(
    uid: string,

    input_uid: string,

    value: GraphQL_Instance
): GraphQL_Composite_Instance {

    const input_uid_instance =
        string_instance(
            `${uid}.input_uid`,
            Operation_Input_UID_Schema.uid!,
            input_uid
        )

    return {
        uid,

        schema_uid:
            Operation_Argument_Schema.uid!,

        data_type:
            'Composite',

        objects: [
            {
                element_relationship_uid:
                    'input_uid',

                instance:
                    input_uid_instance
            },

            {
                element_relationship_uid:
                    'value',

                instance:
                    value
            }
        ]
    }
}

function create_operation_application_instance(
    uid: string,
    operation: Operation_Definition,
    args:GraphQL_Composite_Instance[]
): GraphQL_Composite_Instance {

    const operation_uid_instance =
        string_instance(
            `${uid}.operation_uid`,

            Operation_UID_Schema.uid!,

            operation.uid
        )


    const arguments_instance =
        array_instance(
            `${uid}.arguments`,

            Operation_Argument_List_Schema.uid!,

            args
        )


    return {
        uid,

        schema_uid:
            Operation_Application_Schema.uid!,

        data_type:
            'Composite',

        objects: [
            {
                element_relationship_uid:
                    'operation_uid',

                instance:
                    operation_uid_instance
            },

            {
                element_relationship_uid:
                    'arguments',

                instance:
                    arguments_instance
            }
        ]
    }
}

export const Minuend_Schema:
    Schema<'Number'> = {

    uid: 'math.minuend',

    name: 'Minuend',

    data_type: 'Number'
}


export const Subtrahend_Schema:
    Schema<'Number'> = {

    uid: 'math.subtrahend',

    name: 'Subtrahend',

    data_type: 'Number'
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
export const Difference_Schema:
    Schema<'Number'> = {

    uid: 'math.difference',

    name: 'Difference',

    data_type: 'Number'
}


export const Subtraction_Operation:
    Operation_Definition = {

    uid:
        'math.operation.subtraction',

    name:
        'Subtraction',

    inputs: [
        {
            uid:
                'minuend',

            schema:
                Minuend_Schema,

            cardinality:
                'Single',

            required:
                true
        },

        {
            uid:
                'subtrahend',

            schema:
                Subtrahend_Schema,

            cardinality:
                'Single',

            required:
                true
        }
    ],

    outputs: [
        {
            uid:
                'difference',

            schema:
                Difference_Schema,

            cardinality:
                'Single'
        }
    ],

    implementation: {
        type:
            'Atomic',

        executor_uid:
            'builtin.number.subtract'
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

                    source: {
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

const Five_X_Factors =
    array_instance(
        'equation.5x.factors',

        'math.array',

        [
            Number_Five_Instance,
            X_Variable_Instance
        ]
    )

const Five_X_Factor_Argument =
    create_operation_argument_instance(
        'equation.5x.argument.factors',

        'factors',

        Five_X_Factors
    )
const Five_X =
    create_operation_application_instance(
        'equation.5x',

        Multiplication_Operation,

        [
            Five_X_Factor_Argument
        ]
    )
const Left_Minuend =
    create_operation_argument_instance(
        'equation.left.argument.minuend',

        'minuend',

        Five_X
    )


const Left_Subtrahend =
    create_operation_argument_instance(
        'equation.left.argument.subtrahend',

        'subtrahend',

        Number_Four_Instance
    )
const Left_Expression =
    create_operation_application_instance(
        'equation.left',

        Subtraction_Operation,

        [
            Left_Minuend,
            Left_Subtrahend
        ]
    )
const Two_X_Factors =
    array_instance(
        'equation.2x.factors',

        'math.array',

        [
            Number_Two_Instance,
            X_Variable_Instance
        ]
    )


const Two_X_Argument =
    create_operation_argument_instance(
        'equation.2x.argument.factors',

        'factors',

        Two_X_Factors
    )


const Two_X =
    create_operation_application_instance(
        'equation.2x',

        Multiplication_Operation,

        [
            Two_X_Argument
        ]
    )
const Right_Addends =
    array_instance(
        'equation.right.addends',

        'math.array',

        [
            Two_X,
            Number_Eleven_Instance
        ]
    )
const Right_Addends_Argument =
    create_operation_argument_instance(
        'equation.right.argument.addends',

        'addends',

        Right_Addends
    )
const Right_Expression =
    create_operation_application_instance(
        'equation.right',

        Addition_Operation,

        [
            Right_Addends_Argument
        ]
    )
export const Test_Equation:
    GraphQL_Composite_Instance = {

    uid:
        'math.instance.equation.test_1',

    schema_uid:
        Equation_Schema.uid!,

    data_type:
        'Composite',

    objects: [
        {
            element_relationship_uid:
                'left',

            instance:
                Left_Expression
        },

        {
            element_relationship_uid:
                'right',

            instance:
                Right_Expression
        }
    ]
}

const Equation_Substitution:
    Substitute_Objective = {

    type:
        'Substitute',

    inputs: {

        target:
            Test_Equation,

        substitutions: [
            {
                variable_uid:
                    X_Variable_Instance.uid,

                substitute:
                    Number_Three_Instance
            }
        ]
    }
}
const equation_result =
    substitute(
        Equation_Substitution
    )
console.log(
    `equation result ${JSON.stringify(equation_result.output.result)}`
)


print_objective_result(
    equation_result
)

