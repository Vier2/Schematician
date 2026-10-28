import { describe, expect, it } from 'vitest'
import type {
    GraphQL_Atomic_Instance,
    Operation_Invocation,
    Value_Source
} from '@schematician/shared'
import { Addition_Operation } from '../../operation/utils.js'
import { Number_Schema } from '../../object.js'
import {
    create_execution_context,
    evaluate,
    resolve_value_source
} from './utils.js'

function number_instance(uid: string, value: number): GraphQL_Atomic_Instance {
    return {
        uid,
        schema_uid: Number_Schema.uid!,
        data_type: 'Number',
        value
    }
}

function addition_invocation(): Operation_Invocation {
    return {
        uid: 'test.addition',
        operation: Addition_Operation,
        arguments: [
            {
                input_uid: 'addends',
                source: {
                    type: 'Collection',
                    items: [
                        { type: 'Instance', instance: number_instance('two', 2) },
                        { type: 'Instance', instance: number_instance('three', 3) }
                    ]
                }
            }
        ]
    }
}

describe('Evaluate objective', () => {
    it('evaluates an invocation and returns a trace', () => {
        const result = evaluate({
            type: 'Evaluate',
            inputs: { target: addition_invocation() }
        })

        expect(result.objective_type).toBe('Evaluate')
        expect(result.output.result).toMatchObject({
            data_type: 'Number',
            value: 5
        })
        expect(result.trace.operations).toHaveLength(1)
        expect(result.trace.operations[0]?.operation_uid).toBe(Addition_Operation.uid)
    })

    it('rejects an operation with no declared outputs', () => {
        const operation = {
            ...Addition_Operation,
            outputs: []
        }

        expect(() => evaluate({
            type: 'Evaluate',
            inputs: {
                target: {
                    uid: 'test.no-output',
                    operation,
                    arguments: [
                        {
                            input_uid: 'addends',
                            source: { type: 'Collection', items: [] }
                        }
                    ]
                }
            }
        })).toThrow('Operation Addition has no output.')
    })
})

describe('value source resolution', () => {
    it('resolves direct instances, references, computation inputs, prior outputs, and branches', () => {
        const instance = number_instance('instance', 7)
        const context = create_execution_context(
            { x: instance },
            [instance]
        )
        context.operation_outputs.prior = { result: instance }
        context.branch_outputs.branch = instance

        const cases: Array<[Value_Source, unknown]> = [
            [{ type: 'Instance', instance }, instance],
            [{ type: 'Instance_Reference', instance_uid: 'instance' }, instance],
            [{ type: 'Computation_Input', input_uid: 'x' }, instance],
            [{ type: 'Operation_Output', operation_uid: 'prior', output_uid: 'result' }, instance],
            [{ type: 'Branch_Output', branch_uid: 'branch' }, instance]
        ]

        for (const [source, expected] of cases) {
            expect(resolve_value_source(source, context)).toBe(expected)
        }
    })

    it('resolves collections and rejects missing references and nested collections', () => {
        const instance = number_instance('instance', 7)
        const context = create_execution_context({}, [instance])

        expect(resolve_value_source({
            type: 'Collection',
            items: [
                { type: 'Instance', instance },
                { type: 'Instance_Reference', instance_uid: 'instance' }
            ]
        }, context)).toEqual([instance, instance])

        expect(() => resolve_value_source({
            type: 'Instance_Reference',
            instance_uid: 'missing'
        }, context)).toThrow('Instance not found: missing')

        expect(() => resolve_value_source({
            type: 'Collection',
            items: [{ type: 'Collection', items: [] }]
        }, context)).toThrow('Nested collections are not supported yet.')
    })

    it('rejects missing computation, operation, and branch outputs', () => {
        const context = create_execution_context({})

        expect(() => resolve_value_source({
            type: 'Computation_Input',
            input_uid: 'missing'
        }, context)).toThrow('Computation input not found: missing')

        expect(() => resolve_value_source({
            type: 'Operation_Output',
            operation_uid: 'missing',
            output_uid: 'result'
        }, context)).toThrow('Operation invocation output not found: missing')

        expect(() => resolve_value_source({
            type: 'Branch_Output',
            branch_uid: 'missing'
        }, context)).toThrow('Branch output not found: missing')
    })
})
