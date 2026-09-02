import type { 
    Evaluate_Objective,
    Evaluate_Result,
    GraphQL_Instance, JSON_Value,
    Execution_Context,
    Value_Source,
    Runtime_Value,
    Operation_Invocation,
    Operation_Trace,
    Runtime_Values,
    GraphQL_Atomic_Instance
 } from "@schematician/shared"

import { execute_operation } from "../schema.js"
import { Mean_Operation } from "../schema.js"

import { Mean_Input_Schema } from "../schema.js"



export function evaluate(
    objective: Evaluate_Objective
): Evaluate_Result {

    const {
        target,
        instances = []
    } = objective.inputs

    /*
     * Evaluate targets currently represent
     * one operation invocation.
     */

    const context =
        create_execution_context(
            {},
            instances
        )

    const execution =
        execute_operation_invocation(
            target,
            context
        )

    const primary_output_definition =
        target.operation.outputs[0]

    if (!primary_output_definition) {
        throw new Error(
            `Operation ${target.operation.name} has no output.`
        )
    }

    const result =
        execution.outputs[
        primary_output_definition.uid
        ]

    if (!result) {
        throw new Error(
            `Evaluation produced no output for ${primary_output_definition.uid
            }.`
        )
    }

    if (Array.isArray(result)) {
        throw new Error(
            'Evaluate currently expects a single result instance.'
        )
    }

    return {
        objective_type: 'Evaluate',

        output: {
            result
        },

        trace: {
            computation_uid:
                `objective.evaluate.${target.uid}`,

            computation_name:
                'Evaluate',

            inputs: {},

            operations: [
                execution.trace
            ],

            outputs: {
                result
            }
        }
    }
}



export function get_atomic_value(
    instance: GraphQL_Instance
): JSON_Value | null {

    if (
        instance.data_type === 'String' ||
        instance.data_type === 'Number' ||
        instance.data_type === 'Boolean'
    ) {
        return instance.value
    }

    throw new Error(
        `Instance ${instance.uid} is not atomic.`
    )
}
export function create_execution_context(
    inputs: Runtime_Values,
    available_instances:
        GraphQL_Instance[] = []
): Execution_Context {

    return {

        computation_inputs:
            inputs,

        available_instances:
            new Map(
                available_instances.map(
                    instance => [
                        instance.uid,
                        instance
                    ]
                )
            ),

        operation_outputs:
            {},

        operation_traces:
            [],

        branch_outputs:
            {}
    }
}

export function get_number_value(
    instance: GraphQL_Instance
): number {

    if (instance.data_type !== 'Number') {
        throw new Error(
            `Expected Number instance. Received ${instance.data_type}.`
        )
    }

    if (typeof instance.value !== 'number') {
        throw new Error(
            `Number instance ${instance.uid} has no numeric value.`
        )
    }

    return instance.value
}

export function get_boolean_value(
    instance: GraphQL_Instance
): boolean {

    if (instance.data_type !== 'Boolean') {
        throw new Error(
            `Expected Boolean instance.`
        )
    }

    if (typeof instance.value !== 'boolean') {
        throw new Error(
            `Boolean instance ${instance.uid} is uninitialized.`
        )
    }

    return instance.value
}
export function execute_operation_invocation(
    invocation: Operation_Invocation,
    context: Execution_Context
): {
    outputs: Runtime_Values
    trace: Operation_Trace
} {

    const resolved_inputs:
        Runtime_Values = {}

    for (
        const argument
        of invocation.arguments
    ) {

        resolved_inputs[
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
            resolved_inputs
        )

    context.operation_outputs[
        invocation.uid
    ] = execution.outputs

    context.operation_traces.push(
        execution.trace
    )

    return execution
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

            const invocation_outputs =
                context.operation_outputs[
                source.
                operation_uid
                ]

            if (!invocation_outputs) {
                throw new Error(
                    `Operation invocation output not found: ${source.operation_uid
                    }`
                )
            }

            const output =
                invocation_outputs[
                source.output_uid
                ]

            if (output === undefined) {
                throw new Error(
                    `Operation output not found: ${source.output_uid
                    }`
                )
            }

            return output
        }


        case 'Collection':

            return source.items.map(
                item => {

                    const resolved =
                        resolve_value_source(
                            item,
                            context
                        )

                    if (Array.isArray(resolved)) {
                        throw new Error(
                            'Nested collections are not supported yet.'
                        )
                    }

                    return resolved
                }
            )


        case 'Branch_Output': {

            const output =
                context.branch_outputs[
                source.branch_uid
                ]

            if (output === undefined) {
                throw new Error(
                    `Branch output not found: ${source.branch_uid
                    }`
                )
            }

            return output
        }
    }
}
const Three: GraphQL_Atomic_Instance = {
    uid: 'instance.number.3',
    schema_uid: Mean_Input_Schema.uid!,
    data_type: 'Number',
    value: 3
}

const Mean_Five: GraphQL_Atomic_Instance = {
    uid: 'instance.number.5',
    schema_uid: Mean_Input_Schema.uid!,
    data_type: 'Number',
    value: 5
}

const Seven: GraphQL_Atomic_Instance = {
    uid: 'instance.number.7',
    schema_uid: Mean_Input_Schema.uid!,
    data_type: 'Number',
    value: 7
}

const Mean_Evaluation:
    Evaluate_Objective = {

    type: 'Evaluate',

    inputs: {

        target: {
            uid: 'evaluation.mean',

            operation:
                Mean_Operation,

            arguments: [
                {
                    input_uid:
                        'values',

                    source: {
                        type:
                            'Collection',

                        items: [
                            {
                                type:
                                    'Instance',

                                instance:
                                    Three
                            },

                            {
                                type:
                                    'Instance',

                                instance:
                                    Mean_Five
                            },

                            {
                                type:
                                    'Instance',

                                instance:
                                    Seven
                            }
                        ]
                    }
                }
            ]
        }
    }
}

const mean_result =
    evaluate(
        Mean_Evaluation
    )

console.log(`mean result ${mean_result}`)