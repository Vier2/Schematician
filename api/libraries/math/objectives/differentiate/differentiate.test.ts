import { describe, expect, it } from 'vitest'
import type { GraphQL_Atomic_Instance, GraphQL_Instance, Operation_Invocation } from '@schematician/shared'
import { Number_Schema } from '../../object.js'
import { Power_Operation } from '../../schema.js'
import type { Differentiate_Objective } from './types.js'
import { differentiate } from './utils.js'

function number_instance(uid: string, value: number): GraphQL_Atomic_Instance {
    return {
        uid,
        schema_uid: Number_Schema.uid!,
        data_type: 'Number',
        value
    }
}

function power_function(base: GraphQL_Instance, exponent: number): Operation_Invocation {
    return {
        uid: `power.${base.uid}.${exponent}`,
        operation: Power_Operation,
        arguments: [
            { input_uid: 'base', source: { type: 'Instance', instance: base } },
            { input_uid: 'exponent', source: { type: 'Instance', instance: number_instance(`exponent.${exponent}`, exponent) } }
        ]
    }
}

function objective(func: Operation_Invocation): Differentiate_Objective {
    return {
        type: 'Differentiate',
        inputs: {
            func,
            assignments: [number_instance('x.value', 2)]
        }
    }
}

describe('Differentiate objective (not implemented)', () => {
    it.fails('differentiates a constant to zero', () => {
        const constant = number_instance('constant', 5)
        const constant_function: Operation_Invocation = {
            uid: 'constant.function',
            operation: Power_Operation,
            arguments: [
                { input_uid: 'base', source: { type: 'Instance', instance: constant } },
                { input_uid: 'exponent', source: { type: 'Instance', instance: number_instance('zero', 0) } }
            ]
        }

        expect(differentiate(objective(constant_function))).toMatchObject({
            derivative: { type: 'Number', value: 0 }
        })
    })

    it.fails('applies the power rule to a variable raised to a positive integer', () => {
        const x = {
            uid: 'variable.x',
            schema_uid: 'math.variable',
            data_type: 'Composite' as const,
            objects: [{
                element_relationship_uid: 'name',
                instance: {
                    uid: 'variable.x.name',
                    schema_uid: 'math.variable.name',
                    data_type: 'String' as const,
                    value: 'x'
                }
            }]
        }

        expect(differentiate(objective(power_function(x, 2)))).toMatchObject({
            derivative: expect.anything()
        })
    })

    it.fails('defines edge behavior for a zero exponent and negative exponent', () => {
        const x = {
            uid: 'variable.x',
            schema_uid: 'math.variable',
            data_type: 'Composite' as const,
            objects: [{
                element_relationship_uid: 'name',
                instance: {
                    uid: 'variable.x.name',
                    schema_uid: 'math.variable.name',
                    data_type: 'String' as const,
                    value: 'x'
                }
            }]
        }

        const zero_power = differentiate(objective(power_function(x, 0)))
        const negative_power = differentiate(objective(power_function(x, -1)))
        expect(zero_power).toBeDefined()
        expect(negative_power).toBeDefined()
    })
})
