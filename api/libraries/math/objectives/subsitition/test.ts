import type { GraphQL_Atomic_Instance, 
    GraphQL_Composite_Instance,
Schema } from "@schematician/shared"
import { substitute } from "./utils.js"
import type { Substitute_Objective } from "./types.js"
import { Number_Three_Instance
 } from "../../schema.js"
 
import { Variable_Schema, Number_Schema } from "../../object.js"
const X_Name_Instance: GraphQL_Atomic_Instance = {
    uid: 'math.instance.variable.x.name',
    schema_uid: 'math.variable.name',
    data_type: 'String',
    value: 'x'
}

export const X_Variable_Instance: GraphQL_Composite_Instance = {
    uid: 'math.instance.variable.x',
    schema_uid: 'math.variable',
    data_type: 'Composite',

    objects: [
        {
            element_relationship_uid: 'name',
            instance: X_Name_Instance
        }
    ]
}



export const Number_Two_Instance: GraphQL_Atomic_Instance = {
    uid: 'math.instance.number.2',
    schema_uid: 'math.number',
    data_type: 'Number',
    value: 2
}

export const Number_Four_Instance: GraphQL_Atomic_Instance = {
    uid: 'math.instance.number.4',
    schema_uid: 'math.number',
    data_type: 'Number',
    value: 4
}

export const Number_Five_Instance: GraphQL_Atomic_Instance = {
    uid: 'math.instance.number.5',
    schema_uid: 'math.number',
    data_type: 'Number',
    value: 5
}

export const Number_Eleven_Instance: GraphQL_Atomic_Instance = {
    uid: 'math.instance.number.11',
    schema_uid: 'math.number',
    data_type: 'Number',
    value: 11
}

const Simple_Substitution: Substitute_Objective = {
    type: 'Substitute',

    inputs: {
        target: X_Variable_Instance,

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

const simple_result =
    substitute(Simple_Substitution)

// console.log(
//     JSON.stringify(
//         simple_result,
//         null,
//         2
//     )
// )

export const Test_Multiplication_Schema: Schema<'Composite'> = {
    uid: 'math.test.multiplication_expression',
    name: 'Multiplication Expression',
    data_type: 'Composite',

    elements: [
        {
            uid: 'left',
            index: 0,
            cardinality: 'Single',
            required: true,
            element: Number_Schema
        },
        {
            uid: 'right',
            index: 1,
            cardinality: 'Single',
            required: true,
            element: Variable_Schema
        }
    ]
}
const Five_X_Instance: GraphQL_Composite_Instance = {
    uid: 'math.instance.expression.5x',
    schema_uid:
        Test_Multiplication_Schema.uid!,

    data_type: 'Composite',

    objects: [
        {
            element_relationship_uid: 'left',
            instance:
                Number_Five_Instance
        },
        {
            element_relationship_uid: 'right',
            instance:
                X_Variable_Instance
        }
    ]
}

const Recursive_Substitution:
    Substitute_Objective = {

    type: 'Substitute',

    inputs: {
        target:
            Five_X_Instance,

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

const recursive_result =
    substitute(
        Recursive_Substitution
    )

// console.log(
//     JSON.stringify(
//         recursive_result.output.result,
//         null,
//         2
//     )
// )

export const Test_Addition_Schema: Schema<'Composite'> = {
    uid: 'math.test.addition_expression',
    name: 'Addition Expression',
    data_type: 'Composite',

    elements: [
        {
            uid: 'left',
            index: 0,
            cardinality: 'Single',
            required: true,
            element: Variable_Schema
        },
        {
            uid: 'right',
            index: 1,
            cardinality: 'Single',
            required: true,
            element: Variable_Schema
        }
    ]
}

const X_Plus_X_Instance:
    GraphQL_Composite_Instance = {

    uid: 'math.instance.expression.x_plus_x',

    schema_uid:
        Test_Addition_Schema.uid!,

    data_type: 'Composite',

    objects: [
        {
            element_relationship_uid: 'left',
            instance:
                X_Variable_Instance
        },
        {
            element_relationship_uid: 'right',
            instance:
                X_Variable_Instance
        }
    ]
}

const Multiple_Occurrence_Test:
    Substitute_Objective = {

    type: 'Substitute',

    inputs: {
        target:
            X_Plus_X_Instance,

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

const multiple_result =
    substitute(
        Multiple_Occurrence_Test
    )

const Y_Name_Instance: GraphQL_Atomic_Instance = {
    uid: 'math.instance.variable.y.name',
    schema_uid: 'math.variable.name',
    data_type: 'String',
    value: 'y'
}

export const Y_Variable_Instance: GraphQL_Composite_Instance = {
    uid: 'math.instance.variable.y',
    schema_uid: 'math.variable',
    data_type: 'Composite',

    objects: [
        {
            element_relationship_uid: 'name',
            instance:
                Y_Name_Instance
        }
    ]
}
const X_Plus_Y_Instance:
    GraphQL_Composite_Instance = {

    uid: 'math.instance.expression.x_plus_y',

    schema_uid:
        Test_Addition_Schema.uid!,

    data_type: 'Composite',

    objects: [
        {
            element_relationship_uid: 'left',
            instance:
                X_Variable_Instance
        },
        {
            element_relationship_uid: 'right',
            instance:
                Y_Variable_Instance
        }
    ]
}
const Multiple_Substitution_Test:
    Substitute_Objective = {

    type: 'Substitute',

    inputs: {
        target:
            X_Plus_Y_Instance,

        substitutions: [
            {
                variable_uid:
                    X_Variable_Instance.uid,

                substitute:
                    Number_Three_Instance
            },
            {
                variable_uid:
                    Y_Variable_Instance.uid,

                substitute:
                    Number_Five_Instance
            }
        ]
    }
}

const multiple_substitution_result =
    substitute(
        Multiple_Substitution_Test
    )
// console.log(`multiple sub ${JSON.stringify(multiple_substitution_result.output.result)}`)