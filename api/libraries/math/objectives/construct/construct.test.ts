import { describe, expect, it } from 'vitest'
import type { GraphQL_Atomic_Instance, Operation_Invocation } from '@schematician/shared'
import { Number_Schema } from '../../object.js'
import { Power_Operation } from '../../schema.js'
import type { Construct_Objective } from './types.js'
import { Construct } from './utils.js'

function number_instance(uid: string, value: number): GraphQL_Atomic_Instance {
    return {
        uid,
        schema_uid: Number_Schema.uid!,
        data_type: 'Number',
        value
    }
}

function x_squared(): Operation_Invocation {
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

    return {
        uid: 'function.x_squared',
        operation: Power_Operation,
        arguments: [
            { input_uid: 'base', source: { type: 'Instance', instance: x } },
            { input_uid: 'exponent', source: { type: 'Instance', instance: number_instance('exponent.two', 2) } }
        ]
    }
}

function objective(assignments: GraphQL_Atomic_Instance[]): Construct_Objective {
    return {
        type: 'Construct',
        inputs: {
            func: x_squared(),
            assignments
        }
    }
}

describe('Construct objective (not implemented)', () => {
    it.fails('constructs the tangent point and line for x squared at x equals two', async () => {
        const result = await Construct(objective([
            number_instance('x.value', 2)
        ]))

        expect(result).toMatchObject({
            point: { x: 2, y: 4 },
            slope: 4,
            tangent: { slope: 4, intercept: -4 }
        })
    })

    it.fails('defines the behavior when the tangent slope is zero', async () => {
        const result = await Construct(objective([
            number_instance('x.value', 0)
        ]))

        expect(result).toMatchObject({
            point: { x: 0, y: 0 },
            slope: 0,
            tangent: { slope: 0, intercept: 0 }
        })
    })
})
