import type {
    GraphQL_Instance,
    GraphQL_Composite_Instance,
    Operation_Definition
 } from "@schematician/shared"
import { 
    Addition_Operation, 
    Multiplication_Operation, 
    Operation_Application_Schema,
array_instance } from "../../operation/utils.js"

import { 
    create_operation_application_instance,
    create_operation_argument_instance

 } from "../../operation/utils.js"
import { clone_instance } from "../subsitition/utils.js"
import type { Expansion_Trace_Step,
    Expand_Objective,
    Expand_Result
 } from "./types.js"
import { X_Variable_Instance,
    Y_Variable_Instance,
    Number_Four_Instance
 } from "../subsitition/test.js"

 import { Number_Three_Instance,
    Number_Two_Instance
  } from "../../schema.js"
import { print_objective_result } from "../../formatter/utils.js"
export function get_operation_uid(
    instance: GraphQL_Instance
): string | null {

    if (
        instance.data_type !== 'Composite' ||
        instance.schema_uid !== 'math.operation_application'
    ) {
        return null
    }

    const operation_uid_instance =
        instance.objects.find(
            object =>
                object.element_relationship_uid ===
                'operation_uid'
        )?.instance

    if (
        !operation_uid_instance ||
        operation_uid_instance.data_type !== 'String'
    ) {
        return null
    }

    return String(
        operation_uid_instance.value
    )
}


function get_operation_argument_value(
    operation_application:
        GraphQL_Composite_Instance,

    input_uid: string
): GraphQL_Instance | undefined {

    const arguments_instance =
        operation_application.objects.find(
            object =>
                object.element_relationship_uid ===
                'arguments'
        )?.instance

    if (
        !arguments_instance ||
        arguments_instance.data_type !== 'Array'
    ) {
        return undefined
    }

    for (
        const argument
        of arguments_instance.items
    ) {

        if (
            argument.data_type !== 'Composite'
        ) {
            continue
        }

        const argument_input_uid =
            argument.objects.find(
                object =>
                    object.element_relationship_uid ===
                    'input_uid'
            )?.instance

        const argument_value =
            argument.objects.find(
                object =>
                    object.element_relationship_uid ===
                    'value'
            )?.instance

        if (
            argument_input_uid?.data_type === 'String' &&
            argument_input_uid.value === input_uid
        ) {
            return argument_value
        }
    }

    return undefined
}

function is_operation_application(
    instance: GraphQL_Instance,
    operation_uid: string,
    operation_application_schema = Operation_Application_Schema
): instance is GraphQL_Composite_Instance {

    return (
        instance.data_type === 'Composite' &&
        instance.schema_uid ===
        operation_application_schema.uid &&
        get_operation_uid(instance) ===
        operation_uid
    )
}

function is_addition(
    instance: GraphQL_Instance,
    addition_operation = Addition_Operation
): instance is GraphQL_Composite_Instance {

    return is_operation_application(
        instance,
        Addition_Operation.uid
    )
}


function is_multiplication(
    instance: GraphQL_Instance,
    multiplication_operation = Multiplication_Operation
): instance is GraphQL_Composite_Instance {

    return is_operation_application(
        instance,
        Multiplication_Operation.uid
    )
}

function get_array_argument_items(
    operation: GraphQL_Composite_Instance,
    input_uid: string
): GraphQL_Instance[] {

    const value =
        get_operation_argument_value(
            operation,
            input_uid
        )

    if (
        !value ||
        value.data_type !== 'Array'
    ) {
        throw new Error(
            `Expected Array argument "${input_uid}".`
        )
    }

    return value.items
}

function get_addends(
    operation: GraphQL_Composite_Instance
): GraphQL_Instance[] {

    return get_array_argument_items(
        operation,
        'addends'
    )
}


function get_factors(
    operation: GraphQL_Composite_Instance
): GraphQL_Instance[] {

    return get_array_argument_items(
        operation,
        'factors'
    )
}
function create_nary_operation_application(
    uid: string,

    operation: Operation_Definition,

    input_uid: string,

    values: GraphQL_Instance[]
): GraphQL_Composite_Instance {

    const values_instance =
        array_instance(
            `${uid}.${input_uid}`,
            'math.array',
            values
        )

    const argument =
        create_operation_argument_instance(
            `${uid}.argument.${input_uid}`,
            input_uid,
            values_instance
        )

    return create_operation_application_instance(
        uid,
        operation,
        [argument]
    )
}

export function create_addition(
    uid: string,
    addends: GraphQL_Instance[]
): GraphQL_Composite_Instance {

    return create_nary_operation_application(
        uid,
        Addition_Operation,
        'addends',
        addends
    )
}


export function create_multiplication(
    uid: string,
    factors: GraphQL_Instance[]
): GraphQL_Composite_Instance {

    return create_nary_operation_application(
        uid,
        Multiplication_Operation,
        'factors',
        factors
    )
}

function distribute_multiplication(
    multiplication:
        GraphQL_Composite_Instance,

    uid_prefix: string
): GraphQL_Instance {

    const factors =
        get_factors(
            multiplication
        )

    /*
     * Convert each factor into a set of choices.
     *
     * Normal factor:
     *   3 → [3]
     *
     * Addition:
     *   (x + 2) → [x, 2]
     */
    const factor_choices:
        GraphQL_Instance[][] =
        factors.map(
            factor => {

                if (is_addition(factor)) {
                    return get_addends(
                        factor
                    )
                }

                return [
                    factor
                ]
            }
        )


    /*
     * Cartesian product.
     */
    let combinations:
        GraphQL_Instance[][] = [
            []
        ]


    for (
        const choices
        of factor_choices
    ) {

        const next:
            GraphQL_Instance[][] = []

        for (
            const combination
            of combinations
        ) {

            for (
                const choice
                of choices
            ) {

                next.push([
                    ...combination,
                    clone_instance(
                        choice
                    )
                ])
            }
        }

        combinations =
            next
    }


    /*
     * No additive factor existed.
     */
    if (
        combinations.length === 1 &&
        factor_choices.every(
            choices =>
                choices.length === 1
        )
    ) {
        return multiplication
    }


    /*
     * Build one product for each
     * Cartesian combination.
     */
    const expanded_terms =
        combinations.map(
            (combination, index) =>
                create_multiplication(
                    `${uid_prefix}.term.${index}`,
                    combination
                )
        )


    return create_addition(
        `${uid_prefix}.sum`,
        expanded_terms
    )
}

function expand_instance_with_trace(
    target: GraphQL_Instance,

    trace: Expansion_Trace_Step[],

    path: string[] = []
): GraphQL_Instance {

    switch (target.data_type) {

        case 'String':
        case 'Number':
        case 'Boolean':

            return clone_instance(
                target
            )


        case 'Array':

            return {
                ...target,

                items:
                    target.items.map(
                        (item, index) =>
                            expand_instance_with_trace(
                                item,
                                trace,
                                [
                                    ...path,
                                    `items.${index}`
                                ]
                            )
                    )
            }


        case 'Composite': {

            /*
             * First recursively expand
             * everything inside the object.
             */
            const recursively_expanded:
                GraphQL_Composite_Instance = {

                ...target,

                objects:
                    target.objects.map(
                        (object, index) => ({
                            ...object,

                            instance:
                                expand_instance_with_trace(
                                    object.instance,
                                    trace,
                                    [
                                        ...path,
                                        `objects.${index}`
                                    ]
                                )
                        })
                    )
            }


            /*
             * Then apply distributive expansion
             * if this node is multiplication.
             */
            if (
                is_multiplication(
                    recursively_expanded
                )
            ) {

                const distributed =
                    distribute_multiplication(
                        recursively_expanded,
                        `${target.uid}.expanded`
                    )


                /*
                 * If structure changed,
                 * record the transformation.
                 */
                if (
                    distributed !==
                    recursively_expanded
                ) {

                    trace.push({
                        rule:
                            'Distributive Property',

                        original:
                            clone_instance(
                                recursively_expanded
                            ),

                        result:
                            clone_instance(
                                distributed
                            ),

                        path: [
                            ...path
                        ]
                    })


                    /*
                     * Important:
                     * recursively expand the
                     * newly generated tree too.
                     */
                    return expand_instance_with_trace(
                        distributed,
                        trace,
                        path
                    )
                }
            }


            return recursively_expanded
        }
    }
}

export function expand(
    objective: Expand_Objective
): Expand_Result {

    const trace:
        Expansion_Trace_Step[] = []

    const result =
        expand_instance_with_trace(
            objective.inputs.target,
            trace
        )

    return {
        objective_type:
            'Expand',

        output: {
            result
        },

        trace
    }
}

const X_Plus_Three =
    create_addition(
        'expand.deep.x_plus_3',
        [
            X_Variable_Instance,
            Number_Three_Instance
        ]
    )


const Y_Plus_Four =
    create_addition(
        'expand.deep.y_plus_4',
        [
            Y_Variable_Instance,
            Number_Four_Instance
        ]
    )


const Deep_Expansion_Target =
    create_multiplication(
        'expand.deep.expression',
        [
            Number_Two_Instance,
            X_Plus_Three,
            Y_Plus_Four
        ]
    )

const Deep_Expand_Objective:
    Expand_Objective = {

    type: 'Expand',

    inputs: {
        target:
            Deep_Expansion_Target
    }
}


const deep_expand_result =
    expand(
        Deep_Expand_Objective
    )


print_objective_result(
    deep_expand_result
)