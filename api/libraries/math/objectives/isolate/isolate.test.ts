import { describe, expect, it, vi } from 'vitest'
import type { GraphQL_Atomic_Instance, GraphQL_Composite_Instance } from '@schematician/shared'
import { create_variable_instance } from '../../adapter/utils.js'
import { Equation_Schema, Number_Schema } from '../../object.js'
import type { Symbolic_Math_Engine } from '../factor/types.js'
import type { Isolate_Objective } from './types.js'
import { isolate } from './utils.js'

function number_instance(uid: string, value: number): GraphQL_Atomic_Instance {
    return {
        uid,
        schema_uid: Number_Schema.uid!,
        data_type: 'Number',
        value
    }
}

function equation(uid: string, left: GraphQL_Atomic_Instance, right: GraphQL_Atomic_Instance): GraphQL_Composite_Instance {
    return {
        uid,
        schema_uid: Equation_Schema.uid!,
        data_type: 'Composite',
        objects: [
            { element_relationship_uid: 'left', instance: left },
            { element_relationship_uid: 'right', instance: right }
        ]
    }
}

function objective(target: GraphQL_Composite_Instance): Isolate_Objective {
    return {
        type: 'Isolate',
        inputs: {
            equation: equation('input.equation', number_instance('zero', 0), number_instance('one', 1)),
            target
        }
    }
}

describe('Isolate objective', () => {
    it('delegates to the engine and returns cloned equation and target trace data', async () => {
        const target = create_variable_instance('variable.x', 'x')
        const result_equation = equation('result.equation', number_instance('x', 1), number_instance('two', 2))
        const engine: Symbolic_Math_Engine = {
            uid: 'test-engine',
            factor: vi.fn(),
            isolate: vi.fn().mockResolvedValue(result_equation)
        }
        const input = objective(target)

        const result = await isolate(input, engine)

        expect(engine.isolate).toHaveBeenCalledWith(input.inputs.equation, target)
        expect(result.output.result).toBe(result_equation)
        expect(result.trace).toMatchObject({
            engine: 'test-engine',
            operation: 'Isolate',
            input: input.inputs.equation,
            target,
            output: result_equation
        })
        expect(result.trace.input).not.toBe(input.inputs.equation)
        expect(result.trace.target).not.toBe(target)
        expect(result.trace.output).not.toBe(result_equation)
    })

    it('propagates engine failures', async () => {
        const engine: Symbolic_Math_Engine = {
            uid: 'test-engine',
            factor: vi.fn(),
            isolate: vi.fn().mockRejectedValue(new Error('no solution'))
        }

        await expect(
            isolate(objective(create_variable_instance('variable.x', 'x')), engine)
        ).rejects.toThrow('no solution')
    })
})
