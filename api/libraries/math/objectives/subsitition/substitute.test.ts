import { describe, expect, it } from 'vitest'
import type {
    GraphQL_Atomic_Instance,
    GraphQL_Composite_Instance,
    GraphQL_Instance,
    GraphQL_Array_Instance
} from '@schematician/shared'
import { Equation_Schema, Number_Schema } from '../../object.js'
import { create_variable_instance } from '../../adapter/utils.js'
import { substitute, substitute_instance } from './utils.js'

function number_instance(uid: string, value: number): GraphQL_Atomic_Instance {
    return {
        uid,
        schema_uid: Number_Schema.uid!,
        data_type: 'Number',
        value
    }
}

function array_instance(uid: string, items: GraphQL_Instance[]): GraphQL_Array_Instance {
    return {
        uid,
        schema_uid: 'math.array',
        data_type: 'Array',
        items
    }
}

describe('Substitute objective', () => {
    it('replaces every matching variable recursively and records paths', () => {
        const x = create_variable_instance('variable.x', 'x')
        const target: GraphQL_Composite_Instance = {
            uid: 'equation.target',
            schema_uid: Equation_Schema.uid!,
            data_type: 'Composite',
            objects: [
                { element_relationship_uid: 'left', instance: x },
                {
                    element_relationship_uid: 'right',
                    instance: array_instance('right.items', [
                        x,
                        number_instance('number.4', 4)
                    ])
                }
            ]
        }

        const result = substitute({
            type: 'Substitute',
            inputs: {
                target,
                substitutions: [
                    { variable_uid: x.uid, substitute: number_instance('number.3', 3) }
                ]
            }
        })

        expect(result.output.result).not.toBe(target)
        expect(result.output.result.data_type).toBe('Composite')
        if (result.output.result.data_type !== 'Composite') {
            throw new Error('Expected a composite equation result.')
        }

        expect(result.output.result.objects[0]?.instance).toMatchObject({
            data_type: 'Number',
            value: 3
        })
        const right = result.output.result.objects[1]?.instance
        expect(right?.data_type).toBe('Array')
        if (!right || right.data_type !== 'Array') {
            throw new Error('Expected an array on the right side.')
        }
        expect(right.items[0]).toMatchObject({ data_type: 'Number', value: 3 })
        expect(result.trace).toHaveLength(2)
        expect(result.trace.map(step => step.path)).toEqual([
            ['objects.0'],
            ['objects.1', 'items.0']
        ])
        expect(x.data_type).toBe('Composite')
    })

    it('leaves unmatched instances unchanged in meaning and returns an empty trace', () => {
        const x = create_variable_instance('variable.x', 'x')
        const result = substitute({
            type: 'Substitute',
            inputs: {
                target: x,
                substitutions: [
                    { variable_uid: 'different.uid', substitute: number_instance('number.1', 1) }
                ]
            }
        })

        expect(result.output.result).toEqual(x)
        expect(result.output.result).not.toBe(x)
        expect(result.trace).toEqual([])
    })

    it('supports replacement with another expression', () => {
        const x = create_variable_instance('variable.x', 'x')
        const y = create_variable_instance('variable.y', 'y')
        const replacement: GraphQL_Composite_Instance = {
            uid: 'replacement.expression',
            schema_uid: Equation_Schema.uid!,
            data_type: 'Composite',
            objects: [
                { element_relationship_uid: 'left', instance: y },
                { element_relationship_uid: 'right', instance: number_instance('number.2', 2) }
            ]
        }

        const result = substitute({
            type: 'Substitute',
            inputs: {
                target: x,
                substitutions: [{ variable_uid: x.uid, substitute: replacement }]
            }
        })

        expect(result.output.result).toEqual(replacement)
        expect(result.output.result).not.toBe(replacement)
    })
})

describe('substitute_instance helper', () => {
    it('does not substitute a non-variable composite that happens to share a UID', () => {
        const x = create_variable_instance('same.uid', 'x')
        const non_variable: GraphQL_Composite_Instance = {
            uid: x.uid,
            schema_uid: Equation_Schema.uid!,
            data_type: 'Composite',
            objects: []
        }

        const result = substitute_instance(
            non_variable,
            new Map([[x.uid, number_instance('replacement', 9)]])
        )

        expect(result.schema_uid).toBe(Equation_Schema.uid)
        expect(result.data_type).toBe('Composite')
    })
})
