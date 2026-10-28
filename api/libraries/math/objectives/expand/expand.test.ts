import { describe, expect, it } from 'vitest'
import type { GraphQL_Atomic_Instance, GraphQL_Composite_Instance } from '@schematician/shared'
import { Number_Schema } from '../../object.js'
import { create_variable_instance, schematician_to_math_protocol } from '../../adapter/utils.js'
import { Operation_Application_Schema } from '../../operation/utils.js'
import { create_addition, create_multiplication, expand, get_operation_uid } from './utils.js'

function number_instance(uid: string, value: number): GraphQL_Atomic_Instance {
    return {
        uid,
        schema_uid: Number_Schema.uid!,
        data_type: 'Number',
        value
    }
}

describe('Expand objective', () => {
    it('distributes a factor over a sum and records the rule', () => {
        const x = create_variable_instance('variable.x', 'x')
        const sum = create_addition('sum.x_plus_3', [x, number_instance('three', 3)])
        const target = create_multiplication('product.2x_plus_3', [number_instance('two', 2), sum])

        const result = expand({
            type: 'Expand',
            inputs: { target }
        })

        expect(schematician_to_math_protocol(result.output.result)).toEqual({
            type: 'Operation',
            operation: 'Add',
            arguments: [
                {
                    type: 'Operation',
                    operation: 'Multiply',
                    arguments: [
                        { type: 'Number', value: 2 },
                        { type: 'Symbol', uid: x.uid, name: 'x' }
                    ]
                },
                {
                    type: 'Operation',
                    operation: 'Multiply',
                    arguments: [
                        { type: 'Number', value: 2 },
                        { type: 'Number', value: 3 }
                    ]
                }
            ]
        })
        expect(result.trace).toHaveLength(1)
        expect(result.trace[0]?.rule).toBe('Distributive Property')
    })

    it('recursively distributes nested sums and products', () => {
        const x = create_variable_instance('variable.x', 'x')
        const y = create_variable_instance('variable.y', 'y')
        const left = create_addition('sum.left', [x, number_instance('one', 1)])
        const right = create_addition('sum.right', [y, number_instance('two', 2)])
        const target = create_multiplication('product.nested', [left, right])

        const result = expand({ type: 'Expand', inputs: { target } })
        const protocol = schematician_to_math_protocol(result.output.result)

        expect(protocol.type).toBe('Operation')
        expect(protocol.type === 'Operation' && protocol.operation).toBe('Add')
        expect(result.trace).toHaveLength(1)
        expect(result.trace[0]?.result.uid).toContain('expanded')
    })

    it('leaves a product with no additive factors structurally unchanged', () => {
        const target = create_multiplication('product.no_sum', [
            number_instance('two', 2),
            number_instance('three', 3)
        ])

        const result = expand({ type: 'Expand', inputs: { target } })

        expect(schematician_to_math_protocol(result.output.result)).toEqual(
            schematician_to_math_protocol(target)
        )
        expect(result.trace).toEqual([])
    })

    it.fails('reduces a product by an empty sum to zero', () => {
        const empty_sum = create_addition('sum.empty', [])
        const target = create_multiplication('product.empty_sum', [
            number_instance('two', 2),
            empty_sum
        ])
        const result = expand({ type: 'Expand', inputs: { target } })

        expect(schematician_to_math_protocol(result.output.result)).toEqual({
            type: 'Number',
            value: 0
        })
    })
})

describe('operation application parsing', () => {
    it('returns null for non-applications or malformed applications', () => {
        expect(get_operation_uid(number_instance('number', 1))).toBeNull()

        const malformed: GraphQL_Composite_Instance = {
            uid: 'malformed.application',
            schema_uid: Operation_Application_Schema.uid!,
            data_type: 'Composite',
            objects: []
        }
        expect(get_operation_uid(malformed)).toBeNull()
    })
})
