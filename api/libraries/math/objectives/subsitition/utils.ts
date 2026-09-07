import type { GraphQL_Instance, 
        Schema, Substitution_Trace_Step,
    GraphQL_Composite_Instance } from "@schematician/shared"
import type { Substitute_Objective, Substitute_Result
 } from "./types.js"
import { Variable_Schema, Equation_Schema } from "../../object.js"

export function is_variable_instance(
    instance: GraphQL_Instance,
    variable: Schema = Variable_Schema
): instance is GraphQL_Composite_Instance {

    return (
        instance.data_type === 'Composite' &&
        instance.schema_uid === variable.uid
    )
}

export function is_equation_instance(
    instance: GraphQL_Instance,
    equation: Schema = Equation_Schema

): instance is GraphQL_Composite_Instance {

    return (
        instance.data_type === 'Composite' &&
        instance.schema_uid === Equation_Schema.uid
    )
}
export function clone_instance(
    instance: GraphQL_Instance
): GraphQL_Instance {

    switch (instance.data_type) {

        case 'String':
        case 'Number':
        case 'Boolean':

            return {
                ...instance
            }


        case 'Array':

            return {
                ...instance,

                items:
                    instance.items.map(
                        item =>
                            clone_instance(item)
                    )
            }


        case 'Composite':

            return {
                ...instance,

                objects:
                    instance.objects.map(
                        object => ({
                            ...object,

                            instance:
                                clone_instance(
                                    object.instance
                                )
                        })
                    )
            }
    }
}
export function substitute_instance(
    target: GraphQL_Instance,
    substitutions: Map<string, GraphQL_Instance>
): GraphQL_Instance {

    const replacement =
        substitutions.get(target.uid)

    if (
        replacement &&
        is_variable_instance(target)
    ) {
        return clone_instance(replacement)
    }

    switch (target.data_type) {

        case 'String':
        case 'Number':
        case 'Boolean':
            return target


        case 'Array':

            return {
                ...target,

                items:
                    target.items.map(
                        item =>
                            substitute_instance(
                                item,
                                substitutions
                            )
                    )
            }


        case 'Composite':

            return {
                ...target,

                objects:
                    target.objects.map(
                        object => ({
                            ...object,

                            instance:
                                substitute_instance(
                                    object.instance,
                                    substitutions
                                )
                        })
                    )
            }
    }
}

export function substitute(
    objective: Substitute_Objective
): Substitute_Result {

    const substitutions =
        new Map<
            string,
            GraphQL_Instance
        >(
            objective.inputs
                .substitutions
                .map(
                    substitution => [
                        substitution.variable_uid,
                        substitution.substitute
                    ]
                )
        )


    const trace:
        Substitution_Trace_Step[] = []


    const result =
        substitute_instance_with_trace(
            objective.inputs.target,
            substitutions,
            trace
        )


    return {
        objective_type:
            'Substitute',

        output: {
            result
        },

        trace
    }
}

function substitute_instance_with_trace(
    target: GraphQL_Instance,

    substitutions:
        Map<string, GraphQL_Instance>,

    trace:
        Substitution_Trace_Step[],

    path: string[] = []
): GraphQL_Instance {

    if (
        is_variable_instance(target)
    ) {

        const replacement =
            substitutions.get(
                target.uid
            )

        if (replacement) {

            trace.push({
                variable_uid:
                    target.uid,

                original:
                    clone_instance(
                        target
                    ),

                replacement:
                    clone_instance(
                        replacement
                    ),

                path: [
                    ...path
                ]
            })

            return clone_instance(
                replacement
            )
        }
    }


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
                            substitute_instance_with_trace(
                                item,
                                substitutions,
                                trace,
                                [
                                    ...path,
                                    `items.${index}`
                                ]
                            )
                    )
            }


        case 'Composite':

            return {
                ...target,

                objects:
                    target.objects.map(
                        (object, index) => ({
                            ...object,

                            instance:
                                substitute_instance_with_trace(
                                    object.instance,
                                    substitutions,
                                    trace,
                                    [
                                        ...path,
                                        `objects.${index}`
                                    ]
                                )
                        })
                    )
            }
    }
}