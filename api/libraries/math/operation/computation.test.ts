import { describe, expect, it } from 'vitest'
import type {
    Branch,
    GraphQL_Atomic_Instance,
    Operation_Invocation
} from '@schematician/shared'
import { Number_Schema } from '../object.js'
import { Addition_Operation } from './utils.js'
import { execute_branch } from '../schema.js'
import { create_execution_context } from '../objectives/evaluate/utils.js'

function number_instance(uid: string, value: number): GraphQL_Atomic_Instance {
    return {
        uid,
        schema_uid: Number_Schema.uid!,
        data_type: 'Number',
        value
    }
}

function boolean_instance(uid: string, value: boolean): GraphQL_Atomic_Instance {
    return {
        uid,
        schema_uid: 'math.boolean',
        data_type: 'Boolean',
        value
    }
}

function add_invocation(): Operation_Invocation {
    return {
        uid: 'branch.add',
        operation: Addition_Operation,
        arguments: [{
            input_uid: 'addends',
            source: {
                type: 'Collection',
                items: [
                    { type: 'Instance', instance: number_instance('two', 2) },
                    { type: 'Instance', instance: number_instance('three', 3) }
                ]
            }
        }]
    }
}

describe('computation branches', () => {
    it('selects the matching case, executes only its operations, and returns its source', () => {
        const invocation = add_invocation()
        const branch: Branch = {
            uid: 'branch.test',
            condition: { type: 'Instance', instance: boolean_instance('condition', true) },
            cases: [
                {
                    equals: true,
                    operations: [invocation],
                    output: {
                        type: 'Operation_Output',
                        operation_uid: invocation.uid,
                        output_uid: 'sum'
                    }
                },
                {
                    equals: false,
                    operations: [],
                    output: { type: 'Instance', instance: number_instance('fallback', 0) }
                }
            ]
        }
        const context = create_execution_context({})

        const result = execute_branch(branch, context)

        expect(result).toMatchObject({ data_type: 'Number', value: 5 })
        expect(context.operation_traces).toHaveLength(1)
    })

    it('rejects unmatched conditions, array conditions, and non-atomic conditions', () => {
        const context = create_execution_context({})
        const empty_branch: Branch = {
            uid: 'branch.empty',
            condition: { type: 'Instance', instance: boolean_instance('condition', true) },
            cases: []
        }

        expect(() => execute_branch(empty_branch, context)).toThrow(
            'No branch matched condition: true'
        )

        expect(() => execute_branch({
            ...empty_branch,
            condition: {
                type: 'Collection',
                items: [{ type: 'Instance', instance: boolean_instance('condition', true) }]
            }
        }, context)).toThrow('Branch condition cannot be an array.')

        expect(() => execute_branch({
            ...empty_branch,
            condition: { type: 'Instance', instance: {
                uid: 'composite.condition',
                schema_uid: 'math.expression',
                data_type: 'Composite',
                objects: []
            } }
        }, context)).toThrow('Instance composite.condition is not atomic.')
    })

    it.fails('rejects a selected case without an output source', () => {
        const branch: Branch = {
            uid: 'branch.missing.output',
            condition: { type: 'Instance', instance: boolean_instance('condition', true) },
            cases: [{ equals: true, operations: [] }]
        }

        expect(() => execute_branch(branch, create_execution_context({}))).toThrow(
            'Selected branch has no output source.'
        )
    })
})
