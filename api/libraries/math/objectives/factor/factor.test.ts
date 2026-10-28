import { describe, expect, it, vi } from 'vitest'
import type { GraphQL_Atomic_Instance } from '@schematician/shared'
import { Number_Schema } from '../../object.js'
import type { Factor_Objective, Symbolic_Math_Engine } from './types.js'
import { factor } from './utils.js'

function number_instance(uid: string, value: number): GraphQL_Atomic_Instance {
    return {
        uid,
        schema_uid: Number_Schema.uid!,
        data_type: 'Number',
        value
    }
}

function objective(target: GraphQL_Atomic_Instance, domain?: 'Rational' | 'Real' | 'Complex'): Factor_Objective {
    return {
        type: 'Factor',
        inputs: domain === undefined
            ? { target }
            : { target, domain }
    }
}

describe('Factor objective', () => {
    it('delegates to the selected engine and returns a cloned trace', async () => {
        const input = number_instance('input', 6)
        const output = number_instance('output', 2)
        const engine: Symbolic_Math_Engine = {
            uid: 'test-engine',
            factor: vi.fn().mockResolvedValue(output),
            isolate: vi.fn()
        }

        const result = await factor(objective(input, 'Rational'), engine)

        expect(engine.factor).toHaveBeenCalledWith(input, { domain: 'Rational' })
        expect(result.output.result).toBe(output)
        expect(result.trace).toMatchObject({
            engine: 'test-engine',
            operation: 'Factor',
            domain: 'Rational',
            input,
            output
        })
        expect(result.trace.input).not.toBe(input)
        expect(result.trace.output).not.toBe(output)
    })

    it('passes an omitted domain through as undefined', async () => {
        const engine: Symbolic_Math_Engine = {
            uid: 'test-engine',
            factor: vi.fn().mockResolvedValue(number_instance('out', 1)),
            isolate: vi.fn()
        }

        await factor(objective(number_instance('in', 1)), engine)

        expect(engine.factor).toHaveBeenCalledWith(
            expect.anything(),
            { domain: undefined }
        )
    })

    it('propagates engine failures', async () => {
        const engine: Symbolic_Math_Engine = {
            uid: 'test-engine',
            factor: vi.fn().mockRejectedValue(new Error('service unavailable')),
            isolate: vi.fn()
        }

        await expect(
            factor(objective(number_instance('in', 1)), engine)
        ).rejects.toThrow('service unavailable')
    })
})
